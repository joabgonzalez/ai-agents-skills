#!/bin/bash

set -e

# Extract skills from the frontmatter of AGENTS.md
extract_skills() {
  local agents_file="$1"
  awk '/^skills:/{flag=1;next}/^[a-z-]+:/{flag=0}flag && /^  -/{gsub(/^  - /, ""); print}' "$agents_file" | tr -d '\r'
}

# Create symbolic links for required skills
link_skills() {
  local skills_list="$1"
  local skills_dir="$2"
  local skills_base="$3"
  mkdir -p "$skills_dir"
  for skill in $skills_list; do
    [ -e "$skills_dir/$skill" ] && rm -rf "$skills_dir/$skill"
    ln -sf "$skills_base/$skill" "$skills_dir/$skill"
  done
}

# Parse command-line arguments
MODE=""
DEST_PATH=""

while [[ $# -gt 0 ]]; do
  case "$1" in
    --local|-l)
      MODE="local"
      shift
      ;;
    --external|-e)
      MODE="external"
      shift
      ;;
    --path)
      DEST_PATH="$2"
      shift 2
      ;;
    *)
      echo "Unknown parameter: $1"
      exit 1
      ;;
  esac
done

if [[ "$MODE" == "local" ]]; then
  printf "\n  📦 Configuring Gemini...\n"
  mkdir -p .gemini
  cp scripts/templates/GEMINI.md GEMINI.md
  skills=$(extract_skills "AGENTS.md")
  link_skills "$skills" ".gemini/skills" "$(pwd)/skills"
  # Copy gemini-instructions.md to the target directory
  if [ -f scripts/templates/gemini-instructions.md ]; then
    cp scripts/templates/gemini-instructions.md .gemini/instructions.md
    printf "  ⬇️  Synced gemini-instructions.md\n"
  fi
  printf "  ✓ Gemini configured successfully\n"
  exit 0
elif [[ "$MODE" == "external" ]]; then
  if [[ -z "$DEST_PATH" ]]; then
    echo "For external install, provide --path <destination>"
    exit 1
  fi
  printf "\n  📦 Configuring Gemini at %s...\n" "$DEST_PATH"
  mkdir -p "$DEST_PATH/.gemini"
  cp scripts/templates/GEMINI.md "$DEST_PATH/GEMINI.md"
  skills=$(extract_skills "$DEST_PATH/AGENTS.md")
  link_skills "$skills" "$DEST_PATH/.gemini/skills" "$DEST_PATH/skills"
  # Copy gemini-instructions.md to the target directory
  if [ -f scripts/templates/gemini-instructions.md ]; then
    cp scripts/templates/gemini-instructions.md "$DEST_PATH/.gemini/instructions.md"
    printf "  ⬇︎  Synced gemini-instructions.md\n"
  fi
  printf "  ✓ Gemini configured successfully\n"
  exit 0
else
  echo "Usage: $0 --local | --external --path <destination>"
  exit 1
fi