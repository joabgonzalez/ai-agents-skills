#!/bin/bash

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

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

print_info "Found ${#MODELS[@]} installed model(s): ${MODELS[*]}"
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
  
  # Remove old skills directory
  if [ -d "$model_dir/skills" ]; then
    rm -rf "$model_dir/skills"
  fi
  
  # Copy current skills directory
  cp -R skills "$model_dir/skills"
  
  # Sync model-specific files
  case "$model" in
    copilot)
      # Update copilot-instructions.md
      if [ -f "scripts/templates/copilot-instructions.md" ]; then
        cp scripts/templates/copilot-instructions.md "$model_dir/copilot-instructions.md"
        print_info "  Synced copilot-instructions.md"
      fi
      ;;
    claude)
      # Update CLAUDE.md from AGENTS.md
      if [ -f "AGENTS.md" ]; then
        cp AGENTS.md CLAUDE.md
        print_info "  Synced agents: AGENTS.md → CLAUDE.md"
      fi
      ;;
    gemini)
      # Update GEMINI.md from AGENTS.md
      if [ -f "AGENTS.md" ]; then
        cp AGENTS.md GEMINI.md
        print_info "  Synced agents: AGENTS.md → GEMINI.md"
      fi
      ;;
  esac
  
  print_success "Synced skills and agents to $model_dir/"
}

# Sync all installed models
for model in "${MODELS[@]}"; do
  sync_model "$model"
done

printf "\n"
print_success "All models synced successfully!"
print_info "Skills and agents have been updated in all model directories."
