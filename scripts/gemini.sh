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
  printf "\n  📦 Configuring Gemini...\n"
  mkdir -p .gemini
  cp AGENTS.md GEMINI.md
  skills=$(extract_skills "AGENTS.md")
  link_skills "$skills" ".gemini/skills" "$(pwd)/skills"
  printf "  ✅ Gemini configured successfully\n"
  exit 0
elif [[ "$MODE" == "external" ]]; then
  if [[ -z "$DEST_PATH" ]]; then
    echo "For external install, provide --path <destination>"
    exit 1
  fi
  printf "\n  📦 Configuring Gemini at %s...\n" "$DEST_PATH"
  mkdir -p "$DEST_PATH/.gemini"
  # Add source comment to AGENTS.md
  {
    echo "<!-- Generated from agents/$(basename $(dirname $DEST_PATH/AGENTS.md))/AGENTS.md -->"
    echo "<!-- To update, modify the source and re-run installation -->"
    echo ""
    cat "$DEST_PATH/AGENTS.md"
  } > "$DEST_PATH/GEMINI.md"
  skills=$(extract_skills "$DEST_PATH/GEMINI.md")
  link_skills "$skills" "$DEST_PATH/.gemini/skills" "$DEST_PATH/skills"
  printf "  ✅ Gemini configured successfully\n"
  exit 0
else
  echo "Usage: $0 --local | --external --path <destination>"
  exit 1
fi