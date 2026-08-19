# OpenCode Orchestrator Configuration

This repository contains a reusable OpenCode configuration for a planner/executor workflow.

- `orchestrator` uses a stronger model to own product decisions, architecture, planning, delegation, coordination, and final verification.
- `executor` uses a cheaper model to implement bounded tasks, run checks, and report concrete evidence.
- `explore` is used for read-only repository discovery before implementation tasks are delegated.
- MCP credentials are read from environment variables and are not stored in this repository.

## Install

1. Clone this repository into `~/.config/opencode`.
2. Copy `.env.example` to `.env` and set your own API keys.
3. Add this block to `~/.bashrc`:

```bash
if [ -r "$HOME/.config/opencode/.env" ]; then
  set -a
  source "$HOME/.config/opencode/.env"
  set +a
fi
```

4. Start a new terminal or reload Bash:

```bash
source ~/.bashrc
opencode
```

The variables are then exported automatically for OpenCode and other commands launched from that shell.

For a one-time manual load instead:

```bash
set -a
. ~/.config/opencode/.env
set +a
```

OpenCode supports `{env:VARIABLE_NAME}` interpolation in configuration values. The `.env` file is ignored by Git.

## Layout

- `opencode.json`: portable OpenCode configuration.
- `agents/`: orchestrator and executor prompts.
- `AGENTS.md`: shared web research instructions.
- `.env.example`: names of required secrets without real values.
- `tui.json`: optional local TUI preference. Change or remove it for your own setup.

Generated dependencies and local secrets are intentionally excluded. Restart OpenCode after changing configuration.

## Security

Never commit `.env`, API keys, bearer tokens, or other credentials. If a credential was previously committed or shared, revoke and rotate it.
