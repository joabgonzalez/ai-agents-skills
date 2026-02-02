#!/bin/bash

# Uninstall script for AI Agents framework
# Interactive interface for local and external uninstallation

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
MAGENTA='\033[0;35m'
BOLD='\033[1m'
RESET='\033[0m'

# Function to print colored messages
print_header() {
  printf "\n${RED}${BOLD}╔════════════════════════════════════════════════════════╗${RESET}\n"
  printf "${RED}${BOLD}║${RESET}  %-54s${RED}${BOLD}║${RESET}\n" "$1"
  printf "${RED}${BOLD}╚════════════════════════════════════════════════════════╝${RESET}\n\n"
}

print_info() {
  printf "${BLUE}ℹ${RESET}  %s\n" "$1"
}

print_success() {
  printf "${GREEN}✓${RESET}  %s\n" "$1"
}

print_error() {
  printf "${RED}✗${RESET}  %s\n" "$1"
}

print_warning() {
  printf "${YELLOW}⚠${RESET}  %s\n" "$1"
}

remove_model_configs() {
  local target_dir="$1"
  
  # Remove GitHub Copilot config
  if [ -f "$target_dir/.github/copilot-instructions.md" ]; then
    rm -rf "$target_dir/.github"
    print_success "Removed .github/"
  fi
  
  # Remove Claude config
  if [ -d "$target_dir/.claude" ]; then
    rm -rf "$target_dir/.claude"
    print_success "Removed .claude/"
  fi
  if [ -f "$target_dir/CLAUDE.md" ]; then
    rm -f "$target_dir/CLAUDE.md"
    print_success "Removed CLAUDE.md"
  fi
  
  # Remove Codex config
  if [ -d "$target_dir/.codex" ]; then
    rm -rf "$target_dir/.codex"
    print_success "Removed .codex/"
  fi
  
  # Remove Gemini config
  if [ -d "$target_dir/.gemini" ]; then
    rm -rf "$target_dir/.gemini"
    print_success "Removed .gemini/"
  fi
  if [ -f "$target_dir/GEMINI.md" ]; then
    rm -f "$target_dir/GEMINI.md"
    print_success "Removed GEMINI.md"
  fi
}

uninstall_local() {
  local mode="$1"
  
  print_header "Local Uninstall Summary"
  
  printf "  ${YELLOW}⚠${RESET} This will remove:\n"
  printf "      ${CYAN}→${RESET} .github/copilot-instructions.md\n"
  printf "      ${CYAN}→${RESET} .claude/ and CLAUDE.md\n"
  printf "      ${CYAN}→${RESET} .codex/\n"
  printf "      ${CYAN}→${RESET} .gemini/ and GEMINI.md\n"
  printf "\n"
  printf "  ${GREEN}✓${RESET} AGENTS.md, skills/, agents/, and prompts/ will remain intact\n"
  printf "\n"
  
  read -p "$(printf "${BOLD}Continue with uninstall?${RESET} (yes/no): ")" -r
  echo ""
  
  if [[ ! $REPLY =~ ^[Yy]es$ ]]; then
    print_info "Uninstall cancelled."
    exit 0
  fi
  
  print_info "Starting local uninstall..."
  echo ""
  
  remove_model_configs "."
  
  printf "\n"
  print_success "Local uninstall complete!"
  print_info "Model configurations have been removed."
  print_info "Source files (AGENTS.md, skills/, agents/, prompts/) remain intact."
}

uninstall_external() {
  local target_dir="$1"
  local mode="$2"
  
  if [ ! -d "$target_dir" ]; then
    print_error "Directory not found: $target_dir"
    exit 1
  fi
  
  print_header "External Uninstall Summary"
  
  printf "  ${BOLD}Target:${RESET} %s\n" "$target_dir"
  printf "  ${BOLD}Mode:${RESET} %s\n" "$mode"
  printf "\n"
  
  printf "  ${YELLOW}⚠${RESET} This will remove:\n"
  printf "      ${CYAN}→${RESET} .github/, .claude/, .codex/, .gemini/\n"
  printf "      ${CYAN}→${RESET} CLAUDE.md, GEMINI.md\n"
  
  if [ "$mode" = "hard" ]; then
    printf "      ${CYAN}→${RESET} AGENTS.md\n"
    printf "      ${CYAN}→${RESET} skills/\n"
  else
    printf "\n"
    printf "  ${GREEN}✓${RESET} AGENTS.md and skills/ will remain intact\n"
  fi
  
  printf "\n"
  
  read -p "$(printf "${BOLD}Continue with uninstall?${RESET} (yes/no): ")" -r
  echo ""
  
  if [[ ! $REPLY =~ ^[Yy]es$ ]]; then
    print_info "Uninstall cancelled."
    exit 0
  fi
  
  print_info "Starting external uninstall ($mode mode)..."
  echo ""
  
  remove_model_configs "$target_dir"
  
  if [ "$mode" = "hard" ]; then
    if [ -f "$target_dir/AGENTS.md" ]; then
      rm -f "$target_dir/AGENTS.md"
      print_success "Removed AGENTS.md"
    fi
    
    if [ -d "$target_dir/skills" ]; then
      rm -rf "$target_dir/skills"
      print_success "Removed skills/"
    fi
  fi
  
  printf "\n"
  print_success "External uninstall complete!"
  print_info "AI Agents have been removed from: $target_dir"
}

# Clear screen for better UX
clear

# Welcome banner
printf "${RED}${BOLD}"
printf "  ╔══════════════════════════════════════════════╗\n"
printf "  ║                                              ║\n"
printf "  ║           AI AGENTS UNINSTALLER              ║\n"
printf "  ║                                              ║\n"
printf "  ╚══════════════════════════════════════════════╝\n"
printf "${RESET}\n"

# Ask for uninstall type
while true; do
  print_header "Select Uninstall Type"
  printf "  ${BOLD}[L]${RESET} Local Uninstall\n"
  printf "      ${CYAN}→${RESET} Remove model configs from current workspace\n"
  printf "      ${CYAN}→${RESET} Keeps AGENTS.md, skills/, agents/, prompts/\n"
  printf "\n"
  printf "  ${BOLD}[E]${RESET} External Uninstall\n"
  printf "      ${CYAN}→${RESET} Remove from external project\n"
  printf "      ${CYAN}→${RESET} Choose between soft and hard modes\n"
  printf "\n"
  read -p "$(printf "${BOLD}Select option${RESET} [L/e]: ")" uninstall_type
  uninstall_type=${uninstall_type:-L}

  if [[ "$uninstall_type" =~ ^[Ll]$ ]]; then
    print_success "Local uninstall selected"
    uninstall_local
    exit 0
  elif [[ "$uninstall_type" =~ ^[Ee]$ ]]; then
    print_success "External uninstall selected"
    break
  else
    print_error "Invalid option. Please select L or E."
  fi
done

# External uninstall - ask for path
while true; do
  print_header "Specify Target Directory"
  printf "  ${BOLD}Enter the path${RESET} to the project to uninstall from:\n"
  printf "  ${CYAN}Example:${RESET} /Users/username/projects/my-project\n"
  printf "\n"
  read -p "$(printf "${BOLD}Path:${RESET} ")" target_path
  
  if [ -z "$target_path" ]; then
    print_error "Path cannot be empty."
    continue
  fi
  
  if [ ! -d "$target_path" ]; then
    print_error "Directory not found: $target_path"
    read -p "$(printf "${BOLD}Try again?${RESET} (yes/no): ")" retry
    if [[ ! $retry =~ ^[Yy]es$ ]]; then
      print_info "Uninstall cancelled."
      exit 0
    fi
    continue
  fi
  
  print_success "Target directory: $target_path"
  break
done

# External uninstall - ask for mode
while true; do
  print_header "Select Uninstall Mode"
  printf "  ${BOLD}[S]${RESET} Soft Mode (default)\n"
  printf "      ${CYAN}→${RESET} Remove model configs only\n"
  printf "      ${CYAN}→${RESET} Keep AGENTS.md and skills/\n"
  printf "\n"
  printf "  ${BOLD}[H]${RESET} Hard Mode\n"
  printf "      ${CYAN}→${RESET} Remove model configs + AGENTS.md + skills/\n"
  printf "      ${CYAN}→${RESET} Complete removal of AI Agents\n"
  printf "\n"
  read -p "$(printf "${BOLD}Select option${RESET} [S/h]: ")" mode_choice
  mode_choice=${mode_choice:-S}

  if [[ "$mode_choice" =~ ^[Ss]$ ]]; then
    mode="soft"
    print_success "Soft mode selected"
    break
  elif [[ "$mode_choice" =~ ^[Hh]$ ]]; then
    mode="hard"
    print_success "Hard mode selected"
    print_warning "This will permanently delete AGENTS.md and skills/"
    break
  else
    print_error "Invalid option. Please select S or H."
  fi
done

uninstall_external "$target_path" "$mode"
