const readline = require("readline/promises");

async function ask(question) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  try {
    const answer = await rl.question(question);
    return String(answer || "").trim();
  } finally {
    rl.close();
  }
}

module.exports = { ask };
