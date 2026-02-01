.PHONY: setup clean sync uninstall help all

# Default target
all: setup

# Interactive setup for local or external installation
setup:
	@sh scripts/setup.sh

# Interactive uninstall for local or external projects
uninstall:
	@sh scripts/uninstall.sh

# Clean generated model configuration directories
clean:
	@echo "Cleaning model configuration directories..."
	@rm -rf .github .claude .codex .gemini
	@rm -f CLAUDE.md GEMINI.md
	@echo "Clean complete!"

# Sync skills to installed model directories (local installation only)
sync:
	@if [ -d ".github" ] || [ -d ".claude" ] || [ -d ".codex" ] || [ -d ".gemini" ]; then \
		echo "Syncing skills to model directories..."; \
		sh scripts/sync.sh; \
	else \
		echo "No model directories found. Run 'make setup' first."; \
		exit 1; \
	fi

# Show available commands
help:
	@echo "Available commands:"
	@echo "  make setup      - Run interactive installation setup"
	@echo "  make uninstall  - Run interactive uninstall wizard"
	@echo "  make clean      - Remove all model configuration directories"
	@echo "  make sync       - Sync skills to installed model directories"
	@echo "  make help       - Show this help message"