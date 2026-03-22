const User = require("../models/User");
const Organisation = require("../models/Organisation");
const { redisClient } = require("../config/redis");
const crypto = require("crypto");
const {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} = require("../utils/jwt");

// Refresh token TTL in Redis (7 days in seconds)
const REFRESH_TOKEN_TTL = 7 * 24 * 60 * 60;
const OAUTH_STATE_TTL = 10 * 60;

const getTrimmedEnv = (key) => String(process.env[key] || "").trim();

const getApiBaseUrl = () => getTrimmedEnv("API_BASE_URL") || `http://localhost:${process.env.PORT || 5000}/api`;
const getOAuthRedirectUrl = () => process.env.OAUTH_REDIRECT_URL || `${process.env.CLIENT_URL || "http://localhost:3000"}/auth/callback`;
const getGoogleCallbackUrl = () => getTrimmedEnv("GOOGLE_CALLBACK_URL") || `${getApiBaseUrl()}/auth/google/callback`;
const getGithubCallbackUrl = () => getTrimmedEnv("GITHUB_CALLBACK_URL") || `${getApiBaseUrl()}/auth/github/callback`;
const getGoogleClientId = () => getTrimmedEnv("GOOGLE_CLIENT_ID");
const getGoogleClientSecret = () => getTrimmedEnv("GOOGLE_CLIENT_SECRET");
const getGithubClientId = () => getTrimmedEnv("GITHUB_CLIENT_ID");
const getGithubClientSecret = () => getTrimmedEnv("GITHUB_CLIENT_SECRET");

const encodeUserParam = (user) => Buffer.from(JSON.stringify(user)).toString("base64url");

const redirectWithResult = (res, params) => {
  const callbackUrl = new URL(getOAuthRedirectUrl());
  Object.entries(params).forEach(([key, value]) => {
    callbackUrl.searchParams.set(key, String(value));
  });
  return res.redirect(callbackUrl.toString());
};

const createStateToken = async (provider) => {
  const state = crypto.randomBytes(18).toString("hex");
  await redisClient.set(`oauth:state:${state}`, provider, { EX: OAUTH_STATE_TTL });
  return state;
};

const validateStateToken = async (state, expectedProvider) => {
  if (!state) return false;
  const key = `oauth:state:${state}`;
  const storedProvider = await redisClient.get(key);
  if (!storedProvider || storedProvider !== expectedProvider) {
    return false;
  }
  await redisClient.del(key);
  return true;
};

const issueAuthTokens = async (user) => {
  const tokenPayload = { id: user._id, email: user.email, role: user.role };
  const accessToken = generateAccessToken(tokenPayload);
  const refreshToken = generateRefreshToken(tokenPayload);
  await redisClient.set(`refresh:${user._id}`, refreshToken, { EX: REFRESH_TOKEN_TTL });
  return { accessToken, refreshToken };
};

const findOrCreateOAuthUser = async ({ name, email, avatar }) => {
  const normalizedEmail = String(email || "").trim().toLowerCase();
  if (!normalizedEmail) {
    throw new Error("OAuth provider did not return an email");
  }

  let user = await User.findOne({ email: normalizedEmail });
  if (!user) {
    user = await User.create({
      name: String(name || normalizedEmail.split("@")[0] || "InnoDeploy User").trim(),
      email: normalizedEmail,
      passwordHash: crypto.randomBytes(24).toString("hex"),
      avatar: avatar || null,
      role: "developer",
      organisationId: null,
    });
    return user;
  }

  if (avatar && user.avatar !== avatar) {
    user.avatar = avatar;
    await user.save();
  }

  return user;
};

const exchangeGoogleCodeForProfile = async (code) => {
  const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: getGoogleClientId(),
      client_secret: getGoogleClientSecret(),
      redirect_uri: getGoogleCallbackUrl(),
      grant_type: "authorization_code",
    }),
  });

  if (!tokenResponse.ok) {
    const details = await tokenResponse.text();
    throw new Error(`Google token exchange failed (${tokenResponse.status}): ${details}`);
  }

  const tokenData = await tokenResponse.json();
  const userInfoResponse = await fetch("https://openidconnect.googleapis.com/v1/userinfo", {
    headers: { Authorization: `Bearer ${tokenData.access_token}` },
  });

  if (!userInfoResponse.ok) {
    const details = await userInfoResponse.text();
    throw new Error(`Failed to fetch Google profile (${userInfoResponse.status}): ${details}`);
  }

  const profile = await userInfoResponse.json();
  return {
    name: profile.name,
    email: profile.email,
    avatar: profile.picture,
  };
};

const exchangeGithubCodeForProfile = async (code) => {
  const tokenResponse = await fetch("https://github.com/login/oauth/access_token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Accept: "application/json",
      "User-Agent": "InnoDeploy",
    },
    body: new URLSearchParams({
      code,
      client_id: getGithubClientId(),
      client_secret: getGithubClientSecret(),
      redirect_uri: getGithubCallbackUrl(),
    }),
  });

  if (!tokenResponse.ok) {
    throw new Error("GitHub token exchange failed");
  }

  const tokenData = await tokenResponse.json();
  const accessToken = tokenData.access_token;
  if (!accessToken) {
    throw new Error("GitHub access token missing");
  }

  const profileResponse = await fetch("https://api.github.com/user", {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: "application/vnd.github+json",
      "User-Agent": "InnoDeploy",
    },
  });

  if (!profileResponse.ok) {
    throw new Error("Failed to fetch GitHub profile");
  }

  const profile = await profileResponse.json();

  const emailsResponse = await fetch("https://api.github.com/user/emails", {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: "application/vnd.github+json",
      "User-Agent": "InnoDeploy",
    },
  });

  if (!emailsResponse.ok) {
    throw new Error("Failed to fetch GitHub emails");
  }

  const emails = await emailsResponse.json();
  const primary = emails.find((item) => item.primary && item.verified) || emails.find((item) => item.verified) || emails[0];
  return {
    name: profile.name || profile.login,
    email: primary?.email,
    avatar: profile.avatar_url || null,
  };
};

// ── Register ──────────────────────────────────────────────
const register = async (req, res, next) => {
  try {
    const { name, email, password, organisationName } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email and password are required" });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: "Email already registered" });
    }

    // Create organisation if name provided
    let organisation = null;
    if (organisationName) {
      const slug = organisationName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");

      organisation = await Organisation.create({
        name: organisationName,
        slug,
        plan: "free",
        members: [],
      });
    }

    // Create user (password is hashed via pre-save hook)
    const user = await User.create({
      name,
      email,
      passwordHash: password,
      role: organisation ? "owner" : "developer",
      organisationId: organisation ? organisation._id : null,
    });

    // Add user as owner member of the organisation
    if (organisation) {
      organisation.members.push({ userId: user._id, role: "owner" });
      await organisation.save();
    }

    // Generate tokens
    const tokenPayload = { id: user._id, email: user.email, role: user.role };
    const accessToken = generateAccessToken(tokenPayload);
    const refreshToken = generateRefreshToken(tokenPayload);

    // Store refresh token in Redis
    await redisClient.set(`refresh:${user._id}`, refreshToken, { EX: REFRESH_TOKEN_TTL });

    res.status(201).json({
      message: "User registered successfully",
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
      accessToken,
      refreshToken,
    });
  } catch (error) {
    next(error);
  }
};

// ── Login ─────────────────────────────────────────────────
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    // Fetch user with password field included
    const user = await User.findOne({ email }).select("+passwordHash");
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const tokenPayload = { id: user._id, email: user.email, role: user.role };
    const accessToken = generateAccessToken(tokenPayload);
    const refreshToken = generateRefreshToken(tokenPayload);

    // Store refresh token in Redis
    await redisClient.set(`refresh:${user._id}`, refreshToken, { EX: REFRESH_TOKEN_TTL });

    res.json({
      message: "Login successful",
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
      accessToken,
      refreshToken,
    });
  } catch (error) {
    next(error);
  }
};

// ── Refresh Token ─────────────────────────────────────────
const refresh = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({ message: "Refresh token is required" });
    }

    // Verify the refresh token
    let decoded;
    try {
      decoded = verifyRefreshToken(refreshToken);
    } catch {
      return res.status(401).json({ message: "Invalid refresh token" });
    }

    // Check that token matches the one stored in Redis
    const storedToken = await redisClient.get(`refresh:${decoded.id}`);
    if (!storedToken || storedToken !== refreshToken) {
      return res.status(401).json({ message: "Refresh token revoked or expired" });
    }

    // Issue new token pair
    const tokenPayload = { id: decoded.id, email: decoded.email, role: decoded.role };
    const newAccessToken = generateAccessToken(tokenPayload);
    const newRefreshToken = generateRefreshToken(tokenPayload);

    await redisClient.set(`refresh:${decoded.id}`, newRefreshToken, { EX: REFRESH_TOKEN_TTL });

    res.json({ accessToken: newAccessToken, refreshToken: newRefreshToken });
  } catch (error) {
    next(error);
  }
};

// ── Logout ────────────────────────────────────────────────
const logout = async (req, res, next) => {
  try {
    const userId = req.user?.id;

    if (userId) {
      // Remove refresh token from Redis
      await redisClient.del(`refresh:${userId}`);
    }

    res.json({ message: "Logged out successfully" });
  } catch (error) {
    next(error);
  }
};

const startGoogleOAuth = async (req, res, next) => {
  try {
    const googleClientId = getGoogleClientId();
    const googleClientSecret = getGoogleClientSecret();
    if (!googleClientId || !googleClientSecret) {
      return redirectWithResult(res, {
        error: "google_oauth_not_configured",
        reason: "Missing GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET",
      });
    }

    const state = await createStateToken("google");
    const googleAuthUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");
    googleAuthUrl.searchParams.set("client_id", googleClientId);
    googleAuthUrl.searchParams.set("redirect_uri", getGoogleCallbackUrl());
    googleAuthUrl.searchParams.set("response_type", "code");
    googleAuthUrl.searchParams.set("scope", "openid email profile");
    googleAuthUrl.searchParams.set("state", state);
    googleAuthUrl.searchParams.set("prompt", "select_account");
    res.redirect(googleAuthUrl.toString());
  } catch (error) {
    next(error);
  }
};

const googleOAuthCallback = async (req, res, next) => {
  try {
    const { code, state, error, error_description: errorDescription } = req.query;
    if (error) {
      return redirectWithResult(res, {
        error: "google_oauth_provider_error",
        reason: String(errorDescription || error),
      });
    }

    if (!code) {
      return redirectWithResult(res, { error: "google_oauth_missing_code" });
    }

    const isStateValid = await validateStateToken(state, "google");
    if (!isStateValid) {
      return redirectWithResult(res, { error: "google_oauth_invalid_state" });
    }

    const profile = await exchangeGoogleCodeForProfile(String(code));
    const user = await findOrCreateOAuthUser(profile);
    const { accessToken, refreshToken } = await issueAuthTokens(user);

    return redirectWithResult(res, {
      accessToken,
      refreshToken,
      user: encodeUserParam({ id: String(user._id), name: user.name, email: user.email, role: user.role }),
    });
  } catch (error) {
    console.error("Google OAuth callback failed:", error?.message || error);
    return redirectWithResult(res, {
      error: "google_oauth_failed",
      reason: String(error?.message || "Unknown Google OAuth error"),
    });
  }
};

const startGithubOAuth = async (req, res, next) => {
  try {
    const githubClientId = getGithubClientId();
    const githubClientSecret = getGithubClientSecret();
    if (!githubClientId || !githubClientSecret) {
      return redirectWithResult(res, {
        error: "github_oauth_not_configured",
        reason: "Missing GITHUB_CLIENT_ID or GITHUB_CLIENT_SECRET",
      });
    }

    const state = await createStateToken("github");
    const githubAuthUrl = new URL("https://github.com/login/oauth/authorize");
    githubAuthUrl.searchParams.set("client_id", githubClientId);
    githubAuthUrl.searchParams.set("redirect_uri", getGithubCallbackUrl());
    githubAuthUrl.searchParams.set("scope", "read:user user:email");
    githubAuthUrl.searchParams.set("state", state);
    res.redirect(githubAuthUrl.toString());
  } catch (error) {
    next(error);
  }
};

const githubOAuthCallback = async (req, res, next) => {
  try {
    const { code, state, error, error_description: errorDescription } = req.query;
    if (error) {
      return redirectWithResult(res, {
        error: "github_oauth_provider_error",
        reason: String(errorDescription || error),
      });
    }

    if (!code) {
      return redirectWithResult(res, { error: "github_oauth_missing_code" });
    }

    const isStateValid = await validateStateToken(state, "github");
    if (!isStateValid) {
      return redirectWithResult(res, { error: "github_oauth_invalid_state" });
    }

    const profile = await exchangeGithubCodeForProfile(String(code));
    const user = await findOrCreateOAuthUser(profile);
    const { accessToken, refreshToken } = await issueAuthTokens(user);

    return redirectWithResult(res, {
      accessToken,
      refreshToken,
      user: encodeUserParam({ id: String(user._id), name: user.name, email: user.email, role: user.role }),
    });
  } catch (error) {
    console.error("GitHub OAuth callback failed:", error?.message || error);
    return redirectWithResult(res, {
      error: "github_oauth_failed",
      reason: String(error?.message || "Unknown GitHub OAuth error"),
    });
  }
};

module.exports = {
  register,
  login,
  refresh,
  logout,
  startGoogleOAuth,
  googleOAuthCallback,
  startGithubOAuth,
  githubOAuthCallback,
};
