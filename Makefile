# Makefile for bigjon.dev

SHELL := /bin/bash

.PHONY: help
help:
	@echo "bigjon.dev"
	@echo ""
	@echo "Available targets:"
	@echo "  setup     - Install dependencies"
	@echo "  dev       - Start the development server in the background (http://localhost:8080)"
	@echo "  shutdown  - Stop the development server"
	@echo "  build     - Build the site for production"
	@echo "  clean     - Clean the build directory"
	@echo "  test      - Run the build smoke test (pnpm test)"

.PHONY: setup
setup:
	pnpm install

.PHONY: dev
dev:
	pnpm start
	@echo "Website: http://localhost:8080 (stop it with make shutdown)"

.PHONY: shutdown
shutdown:
	pnpm eleventy:shutdown

.PHONY: build
build:
	pnpm build
	@echo "Build complete. Output is in the _site directory."

.PHONY: clean
clean:
	pnpm clean

.PHONY: test
test:
	pnpm test
