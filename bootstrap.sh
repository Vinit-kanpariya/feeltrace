#!/usr/bin/env bash
#
# Bootstrap a fresh clone of the SoluteLabs Harness (or any project that
# committed .githooks/) by activating those hooks for the local working tree.
#
# Why this exists: committing .githooks/ ships the hook scripts to every
# clone, but git does NOT auto-route hook execution there. `core.hooksPath`
# is per-clone config, not stored in the repo. A fresh clone runs `git
# commit` against the default `.git/hooks/` path -- empty -- and silently
# bypasses every protection until someone runs this.
#
# Run once after `git clone`:
#
#   bash bootstrap.sh
#
# Idempotent. Safe to re-run.

set -euo pipefail

if ! git rev-parse --git-dir >/dev/null 2>&1; then
  echo "ERROR: not inside a git repository" >&2
  exit 1
fi

ROOT="$(git rev-parse --show-toplevel)"

if [ ! -d "$ROOT/.githooks" ]; then
  echo "ERROR: $ROOT/.githooks not found. Wrong repo, or hooks not committed." >&2
  exit 1
fi

# Ensure every committed hook is executable (git tracks the +x bit on Unix
# but a Windows clone via Git for Windows may need this anyway).
chmod +x "$ROOT"/.githooks/* 2>/dev/null || true

current="$(git -C "$ROOT" config --get core.hooksPath || true)"
if [ "$current" = ".githooks" ]; then
  echo "OK: core.hooksPath already set to .githooks (no change)."
else
  git -C "$ROOT" config core.hooksPath .githooks
  echo "OK: set core.hooksPath -> .githooks"
fi

echo ""
echo "Active hooks:"
ls -1 "$ROOT/.githooks" | sed 's/^/  /'
