.PHONY: help build dev local sync list add remove validate clean test lint format install interactive test-add test-remove test-interactive test-local test-local-add

# Default target
all: build local

help:
	@echo "AI Agents Skills - Development Commands"
	@echo ""
	@echo "Available targets:"
	@echo "  make build        Build TypeScript project"
	@echo "  make dev          Run CLI in development mode (pass args with ARGS=...)"
	@echo ""
	@echo "Skill Management (Local Development):"
	@echo "  make local        Install full preset from AGENTS.md"
	@echo "  make interactive  Interactive menu to add/remove skills"
	@echo "  make add          Add skills (interactive or pass SKILL=name)"
	@echo "  make remove       Remove skills (interactive or pass SKILL=name)"
	@echo ""
	@echo "Testing (compiled CLI as 'npx', dry-run mode):"
	@echo "  make test-add         Test 'add' command (remote/npx mode)"
	@echo "  make test-local       Test 'local' command (preset install)"
	@echo "  make test-interactive Test interactive menu (add/remove)"
	@echo "  make test-local-add   Test local skill addition"
	@echo "  make test-remove      Test 'remove' command"
	@echo ""
	@echo "Other Commands:"
	@echo "  make sync         Sync models (interactive)"
	@echo "  make list         List all available skills"
	@echo "  make validate     Validate all skills"
	@echo "  make test         Run unit tests"
	@echo "  make lint         Run linter"
	@echo "  make format       Format code"
	@echo "  make clean        Clean build artifacts"
	@echo "  make install      Install dependencies"
	@echo ""
	@echo "Examples:"
	@echo "  make local                    # Install all skills from AGENTS.md"
	@echo "  make interactive              # Show menu to add/remove skills"
	@echo "  make add                      # Interactive skill selection"
	@echo "  make add SKILL=tailwind       # Add specific skill"
	@echo "  make remove SKILL=react       # Remove specific skill"
	@echo ""
	@echo "Testing (builds & runs compiled CLI, no actual changes):"
	@echo "  make test-add SKILL=react        # Test 'add' (remote/npx)"
	@echo "  make test-local-add SKILL=react  # Test local skill add"
	@echo "  make test-remove SKILL=react     # Test remove command"
	@echo "  make test-interactive            # Test interactive menu"

# Install dependencies
install:
	npm install

# Build the project
build:
	npm run build

# Development mode - run CLI with ts-node
dev:
	npm run dev -- $(ARGS)

# Local installation - install all skills to detected models
local:
	npm run dev -- local

# Interactive mode - add/remove skills
interactive:
	npm run dev -- local --interactive

# Sync models interactively
sync:
	npm run dev -- sync

# List all available skills
list:
	npm run dev -- list

# Add skills locally (for development)
add:
ifdef SKILL
	npm run dev -- local --skills $(SKILL)
else
	npm run dev -- local --interactive
endif

# Remove specific skill - works in both local development and installed projects
remove:
ifdef SKILL
	npm run dev -- remove --skills $(SKILL)
else
	npm run dev -- remove
endif

# Validate skills
validate:
	npm run dev -- validate --all

# Run tests
test:
	npm test

# Run linter
lint:
	npm run lint

# Format code
format:
	npm run format

# Clean build artifacts
clean:
	rm -rf dist/
	rm -rf node_modules/
	rm -rf .claude/skills/
	rm -rf .cursor/skills/
	rm -rf .github/skills/
	rm -rf .gemini/skills/
	rm -rf .codex/skills/
	@echo "✓ Cleaned build artifacts and installed skills"

# Test commands - runs compiled CLI (as if using npx) with --dry-run
# Tests the 'add' command (remote repository mode - as users would use it)
test-add: build
	@echo "🧪 Testing 'add' command (remote mode, as npx, dry-run)"
ifdef SKILL
	node dist/index.js add --skill $(SKILL) --dry-run
else
	node dist/index.js add --dry-run
endif

# Tests the 'local' command (full preset installation)
test-local: build
	@echo "🧪 Testing 'local' command (preset installation, dry-run)"
	node dist/index.js local --dry-run

# Tests the 'local --interactive' command (add/remove menu)
test-interactive: build
	@echo "🧪 Testing interactive mode (add/remove menu, dry-run)"
	node dist/index.js local --interactive --dry-run

# Tests adding skills in local mode
test-local-add: build
	@echo "🧪 Testing local skill addition (dry-run)"
ifdef SKILL
	node dist/index.js local --skills $(SKILL) --dry-run
else
	node dist/index.js local --interactive --dry-run
endif

# Tests the 'remove' command
test-remove: build
	@echo "🧪 Testing 'remove' command (dry-run)"
ifdef SKILL
	node dist/index.js remove --skills $(SKILL) --dry-run
else
	node dist/index.js remove --dry-run
endif

# Development workflow targets
.PHONY: check release

# Check everything before commit
check: lint test build
	@echo "✓ All checks passed!"

# Release new version (patch)
release:
	npm run release:patch
