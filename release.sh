#!/bin/bash
set -e -o pipefail

# Stash any uncommitted changes
git stash --include-untracked

# Consume changesets
bunx @changesets/cli version
version=$(jq .version packages/core/package.json | tr -d '"')
git add .
git commit -m "Release: v$version"
# Push changes
git push origin

# Build packages, then pack them
bun run build
(cd packages/core && bun pm pack --destination dist)
(cd packages/cli && bun pm pack --destination dist)

# Publish packages
gh release create "v$version" \
  --title "Release v$version" \
  --generate-notes \
  packages/*/dist/n8n-compose-*.tgz

# Restore stashed changes
git stash pop || true
