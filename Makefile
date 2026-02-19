.PHONY: all build install add remove sync list lint format release

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

# Code quality
lint:
	npm run lint

format:
	npm run format

# Release
release:
	npm run release:patch
