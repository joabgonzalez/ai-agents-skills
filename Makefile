.PHONY: all build install add remove sync list test lint lint-md lint-md-fix format release

# Default: install skills from local ./skills/ (interactive)
all: add

# Build TypeScript
build:
	npm run build

# Install dependencies
install:
	npm install

# Interactive commands — run via dev (no build step required)
add:
	npm run dev -- add --local

remove:
	npm run dev -- remove

sync:
	npm run dev -- sync

list:
	npm run dev -- list

# Skill validation tests
test:
	npm test

# Code quality
lint:
	@echo "Linting code..."
	npm run lint
	@echo "Linting markdown files..."
	npm run lint:md
	@echo "Linting complete."

lint-fix:
	@echo "Fixing lint issues in code..."
	npm run lint:fix
	@echo "Fixing lint issues in markdown files..."
	npm run lint:md:fix
	@echo "Lint fixing complete."

format:
	npm run format

# Release
release:
	npm run release:patch
