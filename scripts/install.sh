#!/bin/bash

set -e

PROJECT=""
DEST_PATH=""
REGISTRY_FILE=".ai-agents.registry.yml"
SOURCE_PATH=$(pwd)

# Extracts skills from the frontmatter of AGENTS.md
extract_skills() {
  local agents_file="$1"
  awk '/^skills:/{flag=1;next}/^[a-z-]+:/{flag=0}flag && /^  -/{gsub(/^  - /, ""); print}' "$agents_file" | tr -d '\r'
}

# Detect installed models in destination path
detect_models() {
  local dest="$1"
  local models=()
  [ -d "$dest/.github" ] && models+=("copilot")
  [ -d "$dest/.claude" ] && models+=("claude")
  [ -d "$dest/.codex" ] && models+=("codex")
  [ -d "$dest/.gemini" ] && models+=("gemini")
  echo "${models[@]}"
}

# Update registry file with installation info
update_registry() {
  local install_type="$1"  # "local" or "external"
  local project="$2"
  local dest_path="$3"
  local skills="$4"
  local timestamp=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
  
  # Create registry if it doesn't exist
  if [ ! -f "$REGISTRY_FILE" ]; then
    cat > "$REGISTRY_FILE" << EOF
# AI Agents Installation Registry
# Auto-generated - DO NOT EDIT MANUALLY
version: "1.0"
installations:
EOF
  fi
  
  # Check if installation already exists in registry
  local search_pattern="type: \"$install_type\".*project: \"$project\""
  if grep -Pzo "$search_pattern" "$REGISTRY_FILE" >/dev/null 2>&1 || grep -A1 "type: \"$install_type\"" "$REGISTRY_FILE" | grep -q "project: \"$project\"" 2>/dev/null; then
    echo "  - Updating registry entry for $install_type/$project"
    # Remove old entry
    awk -v type="$install_type" -v proj="$project" '
      BEGIN { skip=0 }
      /^  - type:/ { 
        if (skip) skip=0
        getline; 
        if ($0 ~ "project: \""proj"\"" && prev ~ "type: \""type"\"") {
          skip=1; next
        } else {
          print prev; print $0
        }
        next
      }
      { if (!skip) print; prev=$0 }
    ' "$REGISTRY_FILE" > "${REGISTRY_FILE}.tmp" && mv "${REGISTRY_FILE}.tmp" "$REGISTRY_FILE"
  else
    echo "  - Adding new registry entry for $install_type/$project"
  fi
  
  # Append new entry
  cat >> "$REGISTRY_FILE" << EOF
  - type: "$install_type"
    project: "$project"
    path: "$dest_path"
    installed_at: "$timestamp"
    skills:
EOF
  
  # Add skills (deduplicate)
  echo "$skills" | tr ' ' '\n' | sort -u | while read -r skill; do
    [ -n "$skill" ] && echo "      - $skill" >> "$REGISTRY_FILE"
  done
}

# Extracts skills from the frontmatter of a SKILL.md file
extract_skill_dependencies() {
  local skill_file="$1"
  awk '/^skills:/{flag=1;next}/^[a-z-]+:/{flag=0}flag && /^  -/{gsub(/^  - /, ""); print}' "$skill_file" | tr -d '\r'
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

# Detect installed models in destination
echo "Detecting installed models..."
models=$(detect_models "$DEST_PATH")
if [ -z "$models" ]; then
  echo "  - No models detected"
else
  echo "  - Detected models: $models"
fi

# Update registry with installation info
echo "Updating installation registry..."
all_skills=$(echo "$META_SKILLS $COPIED_SKILLS" | tr ',' ' ' | tr ' ' '\n' | sort -u | tr '\n' ' ')
update_registry "external" "$PROJECT" "$DEST_PATH" "$all_skills"

echo ""
echo "✓ Installation complete and registry updated!"