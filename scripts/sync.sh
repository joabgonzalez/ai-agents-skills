#!/bin/bash

set -e

REGISTRY_FILE="registry.yml"

 # Output colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No color

print_header() {
  printf "${BLUE}╔═══════════════════════════════════╗${NC}\n"
  printf "${BLUE}║${NC}        ${YELLOW}Skills Sync Utility${NC}        ${BLUE}║${NC}\n"
  printf "${BLUE}╚═══════════════════════════════════╝${NC}\n"
  printf "\n"
}

print_success() {
  printf "${GREEN}✓${NC} %s\n" "$1"
}

print_error() {
  printf "${RED}✗${NC} %s\n" "$1"
}

print_info() {
  printf "${BLUE}ℹ${NC} %s\n" "$1"
}

print_header

# Check if this is a local installation
if [ ! -d "skills" ]; then
  print_error "Error: skills/ directory not found. This script must be run from the project root."
  exit 1
fi

# Detect which model directories are installed
MODELS=()
[ -d ".github" ] && MODELS+=("copilot")
[ -d ".claude" ] && MODELS+=("claude")
[ -d ".codex" ] && MODELS+=("codex")
[ -d ".gemini" ] && MODELS+=("gemini")

if [ ${#MODELS[@]} -eq 0 ]; then
  print_error "No model directories found. Run 'make setup' first."
  exit 1
fi

  print_info "Found ${#MODELS[@]} installed model(s): ${MODELS[*]}."
printf "\n"

# Function to sync skills for a specific model
sync_model() {
  local model=$1
  local model_dir=""
  
  case "$model" in
    copilot) model_dir=".github" ;;
    claude) model_dir=".claude" ;;
    codex) model_dir=".codex" ;;
    gemini) model_dir=".gemini" ;;
  esac
  
  print_info "Syncing skills and agents for $model..."
  
  # Extract skills from AGENTS.md
  local skills=$(awk '/^skills:/{flag=1;next}/^[a-z-]+:/{flag=0}flag && /^  -/{gsub(/^  - /, ""); print}' "AGENTS.md" | tr -d '\r')

  # Create skills directory if it does not exist
  mkdir -p "$model_dir/skills"

  # Get currently linked skills in the model directory
  local current_symlinks=()
  if [ -d "$model_dir/skills" ]; then
    while IFS= read -r entry; do
      [ -z "$entry" ] && continue
      current_symlinks+=("$entry")
    done <<< "$(ls -1 "$model_dir/skills" 2>/dev/null || true)"
  fi

  # Remove symlinks for skills that are no longer in AGENTS.md
  for link in "${current_symlinks[@]}"; do
    found=0
    for skill in $skills; do
      if [ "$link" = "$skill" ]; then
        found=1
        break
      fi
    done
    if [ $found -eq 0 ]; then
      rm -rf "$model_dir/skills/$link"
      print_info "Removed obsolete symlink: $model_dir/skills/$link"
    fi
  done

  # Create or update symlinks for declared skills
  for skill in $skills; do
    if [ -d "skills/$skill" ]; then
      ln -snf "$(pwd)/skills/$skill" "$model_dir/skills/$skill"
      print_info "Linked skill: $skill -> $model_dir/skills/$skill"
    fi
  done

  print_success "Synced skills and agents to $model_dir/."
}

# Sync all installed models
for model in "${MODELS[@]}"; do
  sync_model "$model"
done

printf "\n"
print_success "Local sync completed."

# Function to sync skills for external project
sync_external_project() {
  local project_name=$1
  local dest_path=$2
  
  print_info "Syncing external project: $project_name to $dest_path."
  
  # 1. Sync skills directory to external root (remove skills not declared in AGENTS.md)
  # Extract declared skills from the external project's AGENTS.md
  local declared_skills=$(awk '/^skills:/{flag=1;next}/^[a-z-]+:/{flag=0}flag && /^  -/{gsub(/^  - /, ""); print}' "$dest_path/AGENTS.md" | tr -d '\r')

  # Create skills/ if it does not exist
  mkdir -p "$dest_path/skills"

  # Remove skills from the external root that are no longer in AGENTS.md
  for skill_dir in "$dest_path/skills"/*; do
    [ -d "$skill_dir" ] || continue
    skill_name=$(basename "$skill_dir")
    found=0
    for skill in $declared_skills; do
      if [ "$skill_name" = "$skill" ]; then
        found=1
        break
      fi
    done
    if [ $found -eq 0 ]; then
      rm -rf "$skill_dir"
      print_info "Removed obsolete skill from external root: $skill_dir"
    fi
  done

  # Copy required skills (update or add)
  for skill in $declared_skills; do
    if [ -d "skills/$skill" ]; then
      rsync -a --delete "skills/$skill/" "$dest_path/skills/$skill/"
      print_info "Updated/copied skill: $skill -> $dest_path/skills/$skill"
    fi
  done

  print_info "Synced skills/ to external root."
  
  # 2. Sync AGENTS.md from agents/<project>/
  if [ -f "agents/$project_name/AGENTS.md" ]; then
    cp "agents/$project_name/AGENTS.md" "$dest_path/AGENTS.md"
    print_info "Synced AGENTS.md for $project_name."
  fi
  
  # 3. Extract skills from project AGENTS.md
  local skills=$(awk '/^skills:/{flag=1;next}/^[a-z-]+:/{flag=0}flag && /^  -/{gsub(/^  - /, ""); print}' "$dest_path/AGENTS.md" | tr -d '\r')
  
  # 4. Update individual skill symlinks in each model directory
  local ext_models=()
  [ -d "$dest_path/.github" ] && ext_models+=("copilot")
  [ -d "$dest_path/.claude" ] && ext_models+=("claude")
  [ -d "$dest_path/.codex" ] && ext_models+=("codex")
  [ -d "$dest_path/.gemini" ] && ext_models+=("gemini")
  
  if [ ${#ext_models[@]} -gt 0 ]; then
    for model in "${ext_models[@]}"; do
      local model_dir=""
      case "$model" in
        copilot) model_dir="$dest_path/.github" ;;
        claude) model_dir="$dest_path/.claude" ;;
        codex) model_dir="$dest_path/.codex" ;;
        gemini) model_dir="$dest_path/.gemini" ;;
      esac
      
      # Remove and recreate skills directory with symlinks
      if [ -d "$model_dir/skills" ]; then
        rm -rf "$model_dir/skills"
      fi
      mkdir -p "$model_dir/skills"
      
      # Create individual symlinks for each skill
      for skill in $skills; do
        if [ -d "$dest_path/skills/$skill" ]; then
          ln -sf "$dest_path/skills/$skill" "$model_dir/skills/$skill"
        fi
      done
      
      # Sync model-specific files
      case "$model" in
        copilot)
          if [ -f "scripts/templates/copilot-instructions.md" ]; then
            cp scripts/templates/copilot-instructions.md "$model_dir/copilot-instructions.md"
          fi
          ;;
        claude)
          if [ -f "$dest_path/AGENTS.md" ]; then
            cp "$dest_path/AGENTS.md" "$dest_path/CLAUDE.md"
          fi
          if [ -f "scripts/templates/claude-instructions.md" ]; then
            cp scripts/templates/claude-instructions.md "$model_dir/instructions.md"
          fi
          ;;
        gemini)
          if [ -f "$dest_path/AGENTS.md" ]; then
            cp "$dest_path/AGENTS.md" "$dest_path/GEMINI.md"
          fi
          if [ -f "scripts/templates/gemini-instructions.md" ]; then
            cp scripts/templates/gemini-instructions.md "$model_dir/instructions.md"
          fi
          ;;
        codex)
          if [ -f "scripts/templates/codex-instructions.md" ]; then
            cp scripts/templates/codex-instructions.md "$model_dir/instructions.md"
          fi
          ;;
      esac
    done
    print_info "Updated ${#ext_models[@]} model directory(ies)."
  fi
  
  print_success "External project synced: $dest_path."
}

# Sync external projects if registry exists
if [ -f "$REGISTRY_FILE" ]; then
  print_info "Registry found. Syncing installations..."
  printf "\n"
  
  # Parse installations from registry
  project_count=0
  current_path=$(pwd)
  
  # Read registry line by line
  while IFS= read -r line; do
    # Detect installation type
    if [[ $line =~ type:[[:space:]]*\"([^\"]+)\" ]]; then
      install_type="${BASH_REMATCH[1]}"
    fi
    
    # Detect project name
    if [[ $line =~ project:[[:space:]]*\"([^\"]+)\" ]]; then
      project_name="${BASH_REMATCH[1]}"
    fi
    
    # Detect path and trigger sync
    if [[ $line =~ path:[[:space:]]*\"([^\"]+)\" ]]; then
      dest_path="${BASH_REMATCH[1]}"
      
      # Skip local installation (already synced above)
      if [ "$install_type" = "local" ]; then
        continue
      fi
      
      # Skip if destination doesn't exist
      if [ ! -d "$dest_path" ]; then
        print_error "Destination not found: $dest_path (skipping)"
        continue
      fi
      
      project_count=$((project_count + 1))
      sync_external_project "$project_name" "$dest_path"
      printf "\n"
    fi
  done < "$REGISTRY_FILE"
  
  if [ $project_count -gt 0 ]; then
    print_success "Synced $project_count external installation(s)!"
  fi
else
  print_info "No registry found. Only local sync performed."
fi

printf "\n"
print_success "All syncs completed."
print_info "Skills and agents have been updated in all locations."
