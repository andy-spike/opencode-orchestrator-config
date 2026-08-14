# OpenCode Orchestrator Configuration

This repository contains an OpenCode 2 configuration for a planner/executor workflow.

- `orchestrator` uses a stronger model to own product decisions, architecture, planning, delegation, coordination, and final verification.
- `executor` uses a cheaper model to implement bounded tasks, run checks, and report concrete evidence.
- `explore` is used for read-only repository discovery before implementation tasks are delegated.
- MCP credentials are read from environment variables and are not stored in this repository.

## Install

1. Install the OpenCode 2 beta. It runs as `opencode2`.

```bash
npm install -g @opencode-ai/cli@next
```

2. Clone this repository into `~/.config/opencode`.
3. Copy `.env.example` to `.env` and set the API keys for the Model Context Protocol (MCP) servers that you use.
4. Add this block to `~/.bashrc`:

```bash
if [ -r "$HOME/.config/opencode/.env" ]; then
  set -a
  source "$HOME/.config/opencode/.env"
  set +a
fi
```

5. Start a new terminal or reload Bash:

```bash
source ~/.bashrc
opencode2
```

The variables are then exported for OpenCode and other commands from that shell.

6. In the OpenCode Terminal User Interface (TUI), run `/connect`. Select **OpenCode Go** and complete the sign-in flow. OpenCode 2 stores this connection in its service database. It does not read an OpenCode Go connection from `.env`.

7. Run `/models` in the TUI. OpenCode Go models now appear. This configuration sets `opencode-go/deepseek-v4-pro` as the default model. It uses `opencode-go/deepseek-v4-flash` for the `explore`, `title`, and `executor` agents.

For a one-time environment variable load instead:

```bash
set -a
. ~/.config/opencode/.env
set +a
```

OpenCode supports `{env:VARIABLE_NAME}` interpolation in configuration values. The `.env` file is ignored by Git.

## Layout

- `opencode.json`: OpenCode 2 configuration. OpenCode 2 gets OpenCode Go model metadata from its provider catalog. Do not add incomplete `providers.opencode-go.models` entries.
- `agents/`: orchestrator and executor prompts.
- `AGENTS.md`: shared web research instructions.
- `.env.example`: names of required secrets without real values.
- `cli.json`: optional global Command Line Interface (CLI) and TUI preferences.

Generated dependencies and local secrets are intentionally excluded. OpenCode 2 watches configuration files and reloads changes automatically.

## Security

Never commit `.env`, API keys, bearer tokens, or other credentials. If a credential was previously committed or shared, revoke and rotate it.
