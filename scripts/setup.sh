#!/bin/bash

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
MAGENTA='\033[0;35m'
BOLD='\033[1m'
RESET='\033[0m'

print_header() {
  printf "\n${CYAN}${BOLD}╔════════════════════════════════════════════════════════╗${RESET}\n"
  printf "${CYAN}${BOLD}║${RESET}  %-54s${CYAN}${BOLD}║${RESET}\n" "$1"
  printf "${CYAN}${BOLD}╚════════════════════════════════════════════════════════╝${RESET}\n\n"
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

# Function to run the model script and handle errors
run_model_script() {
  script="$1"
  params="$2"
  model_name="$3"
  
  printf "${BLUE}ℹ${RESET}  Installing ${BOLD}%s${RESET}...\n" "$model_name"
  
  if [ -x "$script" ]; then
    eval "$script $params"
    if [ $? -ne 0 ]; then
      print_error "${model_name} installation failed."
      exit 2
    else
      print_success "${model_name} installed successfully."
    fi
  else
    print_error "$script not found or not executable."
    exit 2
  fi
}

# Clear screen for better UX
clear

# Welcome banner
printf "${MAGENTA}${BOLD}"
printf "  ╔═════════════════════════════════════════════════════╗\n"
printf "  ║                                                     ║\n"
printf "  ║           AI AGENTS INSTALLATION SETUP              ║\n"
printf "  ║                                                     ║\n"
printf "  ╚═════════════════════════════════════════════════════╝\n"
printf "${RESET}\n"

# Ask for installation type
while true; do
  print_header "Select Installation Type"
  printf "  ${BOLD}[L]${RESET} Local: Install in this workspace\n"
  printf "  ${BOLD}[E]${RESET} External: Install in another project\n"
  printf "\n"
  read -p "$(printf "${BOLD}Select option${RESET} [L/e]: ")" install_type
  install_type=${install_type:-L}

  if [[ "$install_type" =~ ^[Ll]$ ]]; then
    param="--local"
    print_success "Local installation selected."
    break
  elif [[ "$install_type" =~ ^[Ee]$ ]]; then
    param="--external"
    print_success "External installation selected."
    
    # List and select project by number
    print_header "Select Project"
    print_info "Available agents:"
    echo
    projects=()
    i=1
    for d in agents/*/ ; do
      proj=$(basename "$d")
      projects+=("$proj")
      printf "  ${BOLD}[%d]${RESET} ${CYAN}%s${RESET}\n" "$i" "$proj"
      i=$((i+1))
    done
    printf "\n"
    read -p "$(printf "${BOLD}Select project number${RESET}: ")" proj_num
    while ! [[ "$proj_num" =~ ^[0-9]+$ ]] || [ "$proj_num" -lt 1 ] || [ "$proj_num" -gt "${#projects[@]}" ]; do
      print_error "Invalid selection. Enter a number between 1 and ${#projects[@]}."
      read -p "$(printf "${BOLD}Select project number${RESET}: ")" proj_num
    done
    project_name="${projects[$((proj_num-1))]}"
    printf "${GREEN}✓${RESET}  Selected: ${BOLD}%s${RESET}\n" "$project_name"
    
    # Get destination path
    print_header "Destination Path"
    read -p "$(printf "${BOLD}Enter destination path${RESET}: ")" dest_path
    while [[ ! -d "$dest_path" ]]; do
      print_error "Path does not exist. Please enter a valid path."
      read -p "$(printf "${BOLD}Enter destination path${RESET}: ")" dest_path
    done
    printf "${GREEN}✓${RESET}  Destination: ${BOLD}%s${RESET}\n" "$dest_path"
    
    # Confirmation
    printf "\n"
    printf "${BLUE}ℹ${RESET}  Ready to install ${BOLD}%s${RESET} to ${BOLD}%s${RESET}\n" "$project_name" "$dest_path"
    read -p "$(printf "${YELLOW}Proceed?${RESET} [Y/n]: ")" confirm
    confirm=${confirm:-Y}
    if [[ ! "$confirm" =~ ^[Yy]$ ]]; then
      print_warning "Installation cancelled."
      exit 0
    fi
    
    # Run install.sh once to prepare AGENTS.md and skills
    print_info "Preparing agent and skills..."
    bash scripts/install.sh --project "$project_name" --path "$dest_path"
    print_success "Agent and skills prepared."
    
    # Set param for model scripts (only --external --path, no --project)
    param="--external --path $dest_path"
    break
  else
    print_error "Invalid option. Please select L or E."
  fi
done

# Ask for model support
while true; do
  print_header "Select AI Model(s)"
  printf "  ${BOLD}[A]${RESET} All Models ${CYAN}(recommended)${RESET}\n"
  printf "      ${CYAN}→${RESET} GitHub Copilot, Claude, Codex, Gemini\n"
  printf "\n"
  printf "  ${BOLD}[1]${RESET} GitHub Copilot\n"
  printf "  ${BOLD}[2]${RESET} Claude\n"
  printf "  ${BOLD}[3]${RESET} Codex (OpenAI)\n"
  printf "  ${BOLD}[4]${RESET} Gemini\n"
  printf "\n"
  read -p "$(printf "${BOLD}Select option${RESET} [A/1/2/3/4]: ")" model_option
  model_option=${model_option:-A}

  case "$model_option" in
    [Aa])
      print_success "Installing all models."
      echo
      run_model_script "scripts/copilot.sh" "$param" "GitHub Copilot"
      run_model_script "scripts/claude.sh" "$param" "Claude"
      run_model_script "scripts/codex.sh" "$param" "Codex"
      run_model_script "scripts/gemini.sh" "$param" "Gemini"
      break
      ;;
    1)
      run_model_script "scripts/copilot.sh" "$param" "GitHub Copilot"
      break
      ;;
    2)
      run_model_script "scripts/claude.sh" "$param" "Claude"
      break
      ;;
    3)
      run_model_script "scripts/codex.sh" "$param" "Codex"
      break
      ;;
    4)
      run_model_script "scripts/gemini.sh" "$param" "Gemini"
      break
      ;;
    *)
      print_error "Invalid option. Please select A, 1, 2, 3, or 4."
      ;;
  esac
done


printf "\n"
print_header "Installation Complete!"
print_success "All selected models have been configured."
print_info "You can now use your AI agents with the selected models."
printf "\n"