#!/bin/bash

set -e

# Function to extract skills from the frontmatter of AGENTS.md
extract_skills() {
  local agents_file="$1"
  awk '/^skills:/{flag=1;next}/^[a-z-]+:/{flag=0}flag && /^  -/{gsub(/^  - /, ""); print}' "$agents_file" | tr -d '\r'
}

# Function to create symbolic links for skills
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

# Function to create copilot-instructions.md
create_copilot_instructions() {
  local target_dir="$1"
  cp scripts/templates/copilot-instructions.md "$target_dir/copilot-instructions.md"
}

# Parse arguments
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
  printf "\n  📦 Configuring GitHub Copilot...\n"
  mkdir -p .github/skills
  skills=$(extract_skills "AGENTS.md")
  link_skills "$skills" ".github/skills" "$(pwd)/skills"
  create_copilot_instructions ".github"
  printf "  ✅ GitHub Copilot configured successfully\n"
  exit 0
elif [[ "$MODE" == "external" ]]; then
  if [[ -z "$DEST_PATH" ]]; then
    echo "For external install, provide --path <destination>"
    exit 1
  fi
  printf "\n  📦 Configuring GitHub Copilot at %s...\n" "$DEST_PATH"
  mkdir -p "$DEST_PATH/.github"
  skills=$(extract_skills "$DEST_PATH/AGENTS.md")
  link_skills "$skills" "$DEST_PATH/.github/skills" "$DEST_PATH/skills"
  create_copilot_instructions "$DEST_PATH/.github"
  printf "  ✅ GitHub Copilot configured successfully\n"
  exit 0
else
  echo "Usage: $0 --local | --external --path <destination>"
  exit 1
fi