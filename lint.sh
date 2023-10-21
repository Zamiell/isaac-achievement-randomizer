#!/bin/bash

set -euo pipefail # Exit on errors and undefined variables.

# Get the directory of this script:
# https://stackoverflow.com/questions/59895/getting-the-source-directory-of-a-bash-script-from-within
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"

# Get the name of the repository:
# https://stackoverflow.com/questions/23162299/how-to-get-the-last-part-of-dirname-in-bash/23162553
REPO_NAME="$(basename "$DIR")"

SECONDS=0

cd "$DIR"

# Use Prettier to check formatting.
# "--log-level=warn" makes it only output errors.
npx prettier --log-level=warn --check .

# Use ESLint to lint the TypeScript.
# "--max-warnings 0" makes warnings fail in CI, since we set all ESLint errors to warnings.
npx eslint --max-warnings 0 .

# Check for unused exports.
# "--error" makes it return an error code of 1 if unused exports are found.
npx ts-prune --error

# Use `isaac-xml-validator` to validate XML files.
# (Skip this step if Python is not currently installed for whatever reason.)
if command -v python &> /dev/null; then
  pip install isaac-xml-validator --upgrade --quiet
  isaac-xml-validator --quiet
fi

# Spell check every file using CSpell.
# "--no-progress" and "--no-summary" make it only output errors.
npx cspell --no-progress --no-summary .

# Check for unused CSpell words.
npx cspell-check-unused-words

# @template-customization-start

# Check for base file updates.
npx isaacscript check

# Check for Windows-style line endings.
WINDOWS_FILES=$(
  grep \
  --recursive \
  --files-with-matches \
  --binary \
  --perl-regexp \
  --exclude-dir='.git' \
  --exclude-dir='.yarn' \
  --exclude-dir='node_modules' \
  --exclude='*.fnt' \
  --exclude='*.jpg' \
  --exclude='*.png' \
  --exclude='*.pyc' \
  --exclude='*.stb' \
  --exclude='*.ttf' \
  --exclude='*.wav' \
  --exclude='yarn.lock' \
  --exclude-dir='rooms' \
  '\r$' .
) || true
if [[ $WINDOWS_FILES ]]; then
  echo "Files with Windows line-endings were found:"
  echo "$WINDOWS_FILES"
  exit 1
fi

# @template-customization-end

echo "Successfully linted $REPO_NAME in $SECONDS seconds."
