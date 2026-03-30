# InnoDeploy CLI (Local Package)

This package provides the `innodeploy` command for interacting with the InnoDeploy backend.

## Install from this repo

```bash
cd cli
npm install
npm link
```

Then run:

```bash
innodeploy --help
```

## Configure API base URL

By default, the CLI targets `http://localhost:5000/api`.

Override with:

- `--api <url>` on any command
- or `INNODEPLOY_API_URL` environment variable

Examples:

```bash
innodeploy --api http://localhost:5000/api login
innodeploy projects list
innodeploy deploy my-project --env production
```
