#!/bin/bash

set -e

PROJECT=""
DEST_PATH=""

# Extracts skills from the frontmatter of AGENTS.md
extract_skills() {
  local agents_file="$1"
  grep -A 10 '^skills:' "$agents_file" | grep '-' | sed 's/- *//g' | tr -d '\r'
}

# Extracts skills from the frontmatter of a SKILL.md file
extract_skill_dependencies() {
  local skill_file="$1"
  grep -A 10 '^skills:' "$skill_file" | grep '-' | sed 's/- *//g' | tr -d '\r'
}

# Global variable to track copied skills
COPIED_SKILLS=""

# Recursively copy a skill and its dependencies
copy_skill_and_dependencies() {
  local skill="$1"
  local dest="$2"

  # If already copied, skip
  if [[ ",$COPIED_SKILLS," == *",$skill,"* ]]; then
    return
  fi

  if [ -d "skills/$skill" ]; then
    if [ ! -d "$dest/skills/$skill" ]; then
      echo "  - Copying skill: $skill"
      cp -R "skills/$skill" "$dest/skills/"
    else
      echo "  - Skill already exists: $skill (skipping)"
    fi
    COPIED_SKILLS="$COPIED_SKILLS,$skill"
    # Check for dependencies in SKILL.md
    local skill_md="skills/$skill/SKILL.md"
    if [ -f "$skill_md" ]; then
      local dependencies=$(extract_skill_dependencies "$skill_md")
      for dep in $dependencies; do
        copy_skill_and_dependencies "$dep" "$dest"
      done
    fi
  else
    echo "  - Warning: Skill '$skill' not found in skills/. Skipping."
  fi
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --project)
      PROJECT="$2"
      shift 2
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

if [[ -z "$PROJECT" || -z "$DEST_PATH" ]]; then
  echo "Usage: $0 --project <project> --path <destination>"
  exit 1
fi

echo "== Installing agent files for project '$PROJECT' at '$DEST_PATH' =="

# Define meta-skills that should always be copied (self-management capabilities)
META_SKILLS="skill-creation agent-creation prompt-creation process-documentation critical-partner conventions a11y skill-sync"

# Copy the AGENTS.md
cp "agents/$PROJECT/AGENTS.md" "$DEST_PATH/AGENTS.md"

# Extract and copy required skills
mkdir -p "$DEST_PATH/skills"

# First, copy all meta-skills (always included for self-management)
echo "Installing meta-skills for project self-management..."
for skill in $META_SKILLS; do
  copy_skill_and_dependencies "$skill" "$DEST_PATH"
done

# Then, copy project-specific skills from AGENTS.md
echo "Installing project-specific skills..."
skills=$(extract_skills "agents/$PROJECT/AGENTS.md")
for skill in $skills; do
  copy_skill_and_dependencies "$skill" "$DEST_PATH"
done

echo "Agent and required skills installed in $DEST_PATH"