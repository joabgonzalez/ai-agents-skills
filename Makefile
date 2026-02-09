.PHONY: help build dev local sync list add remove validate clean test lint format install

# Default target
all: build local

help:
	@echo "AI Agents Skills - Development Commands"
	@echo ""
	@echo "Available targets:"
	@echo "  make build        Build TypeScript project"
	@echo "  make dev          Run CLI in development mode (pass args with ARGS=...)"
	@echo "  make local        Install skills locally to all models"
	@echo "  make sync         Sync models (interactive)"
	@echo "  make list         List all available skills"
	@echo "  make add          Add skills (pass SKILL=name)"
	@echo "  make remove       Remove skills (pass SKILL=name)"
	@echo "  make validate     Validate all skills"
	@echo "  make test         Run tests"
	@echo "  make lint         Run linter"
	@echo "  make format       Format code"
	@echo "  make clean        Clean build artifacts"
	@echo "  make install      Install dependencies"
	@echo ""
	@echo "Examples:"
	@echo "  make local"
	@echo "  make add SKILL=typescript"
	@echo "  make dev ARGS='list --verbose'"

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

# Sync models interactively
sync:
	npm run dev -- sync

# List all available skills
list:
	npm run dev -- list

# Add specific skill
add:
ifdef SKILL
	npm run dev -- add --skill $(SKILL)
else
	@echo "Error: Please specify SKILL=name"
	@echo "Example: make add SKILL=typescript"
endif

# Remove specific skill
remove:
ifdef SKILL
	npm run dev -- remove --skills $(SKILL)
else
	@echo "Error: Please specify SKILL=name"
	@echo "Example: make remove SKILL=typescript"
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

# Development workflow targets
.PHONY: check release

# Check everything before commit
check: lint test build
	@echo "✓ All checks passed!"

# Release new version (patch)
release:
	npm run release:patch
