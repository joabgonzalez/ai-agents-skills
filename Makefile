.PHONY: all build install add remove sync list test lint lint-md lint-md-fix format release security-setup security website-install website-dev website-build website-preview

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
	npm run dev -- remove --local

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
	npm run release

# One-time developer setup: install uv (required for mcp-scan)
security-setup:
	@command -v uv >/dev/null 2>&1 || curl -LsSf https://astral.sh/uv/install.sh | sh
	@echo "Setup complete. Run 'npx snyk auth' to authenticate."

# Website (Astro SSG)
website-install:
	(cd ./website; npm install)

website-dev:
	(cd ./website; npm run dev)

website-build:
	(cd ./website; npm run build)

website-preview:
	(cd ./website; npm run preview)

# Security scanning (dependencies + skill content)
security:
	@echo "Running security checks..."
	npm run security:snyk:deps
	npm run security:snyk:skills
	@echo "Security checks complete."
