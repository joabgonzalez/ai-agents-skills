#!/bin/bash

set -e

PROJECT=""
DEST_PATH=""
REGISTRY_FILE="registry.yml"
SOURCE_PATH=$(pwd)

# Extracts skills from the frontmatter of AGENTS.md
extract_skills() {
  local agents_file="$1"
  awk '/^skills:/{flag=1;next}/^[a-z-]+:/{flag=0}flag && /^  -/{gsub(/^  - /, ""); print}' "$agents_file" | tr -d '\r'
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

# Update registry file with installation info
update_registry() {
  local install_type="$1"  # "local" or "external"
  local skills="$2"
  local project="$3"
  local dest_path="$4"
  local timestamp=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

  # Always remove and recreate registry for a clean state
  if [ -f "$REGISTRY_FILE" ]; then
    rm "$REGISTRY_FILE"
  fi
  cat > "$REGISTRY_FILE" << EOF
# AI Agents Installation Registry
# Auto-generated - DO NOT EDIT MANUALLY
version: "1.0"
installations:
EOF

  if [ "$install_type" = "local" ]; then
    cat >> "$REGISTRY_FILE" << EOF
  - type: "local"
    installed_at: "$timestamp"
    skills:
EOF
    echo "$skills" | tr ' ' '\n' | sort -u | while read -r skill; do
      [ -n "$skill" ] && echo "      - $skill" >> "$REGISTRY_FILE"
    done
  elif [ "$install_type" = "external" ]; then
    cat >> "$REGISTRY_FILE" << EOF
  - type: "external"
    project: "$project"
    path: "$dest_path"
    installed_at: "$timestamp"
    skills:
EOF
    echo "$skills" | tr ' ' '\n' | sort -u | while read -r skill; do
      [ -n "$skill" ] && echo "      - $skill" >> "$REGISTRY_FILE"
    done
  fi
}

# Parse arguments
MODE=""
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
    --local)
      MODE="local"
      shift
      ;;
    *)
      echo "Unknown parameter: $1"
      exit 1
      ;;
  esac
done

# Local installation: only update registry with minimal info
if [[ "$MODE" == "local" ]]; then
  if [ -f "AGENTS.md" ]; then
    skills=$(extract_skills "AGENTS.md")
    update_registry "local" "$skills"
    echo "✓ Local installation registry updated."
    exit 0
  else
    echo "AGENTS.md not found in root. Cannot update local registry."
    exit 1
  fi
fi

if [[ -z "$PROJECT" || -z "$DEST_PATH" ]]; then
  echo "Usage: $0 --project <project> --path <destination> | --local"
  exit 1
fi

echo "== Installing agent files for project '$PROJECT' at '$DEST_PATH' =="

# Meta-skills always included for self-management
META_SKILLS="skill-creation agent-creation prompt-creation reference-creation process-documentation critical-partner conventions a11y skill-sync"

# Copy the AGENTS.md
cp "agents/$PROJECT/AGENTS.md" "$DEST_PATH/AGENTS.md"

# Extract and copy required skills
mkdir -p "$DEST_PATH/skills"

# Copy all meta-skills first
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

# Copy instruction files for each model if the directories exist
if [ -d "$DEST_PATH/.github" ] && [ -f "scripts/templates/copilot-instructions.md" ]; then
  cp scripts/templates/copilot-instructions.md "$DEST_PATH/.github/copilot-instructions.md"
  echo "  - Copied copilot-instructions.md"
fi
if [ -d "$DEST_PATH/.claude" ] && [ -f "scripts/templates/claude-instructions.md" ]; then
  cp scripts/templates/claude-instructions.md "$DEST_PATH/.claude/instructions.md"
  echo "  - Copied claude-instructions.md"
fi
if [ -d "$DEST_PATH/.gemini" ] && [ -f "scripts/templates/gemini-instructions.md" ]; then
  cp scripts/templates/gemini-instructions.md "$DEST_PATH/.gemini/instructions.md"
  echo "  - Copied gemini-instructions.md"
fi
if [ -d "$DEST_PATH/.codex" ] && [ -f "scripts/templates/codex-instructions.md" ]; then
  cp scripts/templates/codex-instructions.md "$DEST_PATH/.codex/instructions.md"
  echo "  - Copied codex-instructions.md"
fi

# Copy static configuration files to root
if [ -f "scripts/templates/CLAUDE.md" ]; then
  cp scripts/templates/CLAUDE.md "$DEST_PATH/CLAUDE.md"
  echo "  - Copied CLAUDE.md (static config)"
fi
if [ -f "scripts/templates/GEMINI.md" ]; then
  cp scripts/templates/GEMINI.md "$DEST_PATH/GEMINI.md"
  echo "  - Copied GEMINI.md (static config)"
fi

# Update registry with installation info
echo "Updating installation registry..."
all_skills=$(echo "$META_SKILLS $COPIED_SKILLS" | tr ',' ' ' | tr ' ' '\n' | sort -u | tr '\n' ' ')
update_registry "external" "$all_skills" "$PROJECT" "$DEST_PATH"

echo ""
echo "✓ Installation complete and registry updated!"