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
  printf "\n  📦 Configuring Claude...\n"
  mkdir -p .claude
  cp AGENTS.md CLAUDE.md
  skills=$(extract_skills "AGENTS.md")
  link_skills "$skills" ".claude/skills" "$(pwd)/skills"
  # Copy claude-instructions.md to the target directory
  if [ -f scripts/templates/claude-instructions.md ]; then
    cp scripts/templates/claude-instructions.md .claude/instructions.md
    printf "  ⬇︎  Synced claude-instructions.md\n"
  fi
  printf "  ✓ Claude configured successfully\n"
  exit 0
elif [[ "$MODE" == "external" ]]; then
  if [[ -z "$DEST_PATH" ]]; then
    echo "For external install, provide --path <destination>"
    exit 1
  fi
  printf "\n  📦 Configuring Claude at %s...\n" "$DEST_PATH"
  mkdir -p "$DEST_PATH/.claude"
  # Add source comment to AGENTS.md
  {
    echo "<!-- Generated from agents/$(basename $(dirname $DEST_PATH/AGENTS.md))/AGENTS.md -->"
    echo "<!-- To update, modify the source and re-run installation -->"
    echo ""
    cat "$DEST_PATH/AGENTS.md"
  } > "$DEST_PATH/CLAUDE.md"
  skills=$(extract_skills "$DEST_PATH/CLAUDE.md")
  link_skills "$skills" "$DEST_PATH/.claude/skills" "$DEST_PATH/skills"
  # Copy claude-instructions.md to the target directory
  if [ -f scripts/templates/claude-instructions.md ]; then
    cp scripts/templates/claude-instructions.md "$DEST_PATH/.claude/instructions.md"
    printf "  ⬇︎  Synced claude-instructions.md\n"
  fi
  printf "  ✓ Claude configured successfully\n"
  exit 0
else
  echo "Usage: $0 --local | --external --path <destination>"
  exit 1
fi