.PHONY: install clean uninstall validate validate-installed help all

# Default target
all: install

# Install skills locally using Node.js CLI (interactive model selection)
install:
	@echo "Building CLI..."
	@npm run build
	@echo ""
	@echo "Installing skills locally..."
	@node dist/index.js local

# Validate all skills
validate:
	@echo "Validating all skills..."
	@node dist/index.js validate --all

# Validate installed skills
validate-installed:
	@echo "Validating installed skills..."
	@node dist/index.js validate --installed

# Uninstall all skills from all models
uninstall:
	@echo "Uninstalling all skills..."
	@node dist/index.js uninstall --all --confirm

# Clean generated model configuration directories
clean:
	@echo "Cleaning model configuration directories..."
	@rm -rf .github .claude .codex .gemini .cursor
	@echo "Clean complete!"

# Show available commands
help:
	@echo "Available commands:"
	@echo "  make install            - Install skills locally with interactive model selection (default)"
	@echo "  make validate           - Validate all skills in ./skills/"
	@echo "  make validate-installed - Validate installed skills"
	@echo "  make uninstall          - Uninstall all skills from all models"
	@echo "  make clean              - Remove all model configuration directories"
	@echo "  make help               - Show this help message"
	@echo ""
	@echo "Examples:"
	@echo "  node dist/index.js local --models copilot,claude    # Non-interactive with specific models"
	@echo "  node dist/index.js local --dry-run                  # Test without making changes"
