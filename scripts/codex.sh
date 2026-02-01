#!/bin/bash

set -e

# Function to extract skills from the frontmatter of AGENTS.md
extract_skills() {
  local agents_file="$1"
  grep -A 10 '^skills:' "$agents_file" | grep '-' | sed 's/- *//g' | tr -d '\r'
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
  printf "\n  📦 Configuring Codex...\n"
  mkdir -p .codex/skills
  skills=$(extract_skills "AGENTS.md")
  link_skills "$skills" ".codex/skills" "$(pwd)/skills"
  printf "  ✅ Codex configured successfully\n"
  exit 0
elif [[ "$MODE" == "external" ]]; then
  if [[ -z "$DEST_PATH" ]]; then
    echo "For external install, provide --path <destination>"
    exit 1
  fi
  printf "\n  📦 Configuring Codex at %s...\n" "$DEST_PATH"
  mkdir -p "$DEST_PATH/.codex/skills"
  skills=$(extract_skills "$DEST_PATH/AGENTS.md")
  link_skills "$skills" "$DEST_PATH/.codex/skills" "$DEST_PATH/skills"
  printf "  ✅ Codex configured successfully\n"
  exit 0
else
  echo "Usage: $0 --local | --external --path <destination>"
  exit 1
fi