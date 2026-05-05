# Project 02 Makefile — Approach 01-foundation.md § Phase 1 Task 1.5 + Phase 10.
#
# Targets are split into:
#   - Live now: install, test*, lint, clean, up, down
#   - Stubbed (placeholder until later sub-phases): submit-server, submit-client
#
# Run from MBAi460-Group1/projects/project02/.
# Prerequisites for `make up`: Docker Desktop running + client/photoapp-config.ini
# (copy from client/photoapp-config.ini.example and adjust).

SHELL := /bin/bash
SERVER_DIR := server
CLIENT_DIR := client

.PHONY: help install test test-unit test-integration test-contract test-smoke test-happy test-live lint format clean up down submit-server submit-client

help: ## List available targets
	@awk 'BEGIN {FS = ":.*?## "}; /^[a-zA-Z_-]+:.*?## / {printf "  \033[36m%-22s\033[0m %s\n", $$1, $$2}' $(MAKEFILE_LIST)

install: ## Install workspace deps from monorepo root (idempotent)
	cd ../.. && npm install

test: ## Run all server + client tests (server: jest; client: pytest when wired in Phase 3)
	cd $(SERVER_DIR) && npm test
	@if [ -f $(CLIENT_DIR)/pyproject.toml ]; then \
		cd $(CLIENT_DIR) && pytest -m "not live"; \
	else \
		echo "[skip] $(CLIENT_DIR)/pyproject.toml not yet present (Approach Phase 3)"; \
	fi

test-unit: ## Server unit tests
	cd $(SERVER_DIR) && npm run test:unit

test-integration: ## Server integration tests (LocalStack + ephemeral MySQL — Phase 10)
	cd $(SERVER_DIR) && npm run test:integration

test-contract: ## OpenAPI contract tests (Phase 9)
	cd $(SERVER_DIR) && npm run test:contract

test-smoke: ## Smoke tests
	cd $(SERVER_DIR) && npm run test:smoke

test-happy: ## Happy-path E2E tests
	cd $(SERVER_DIR) && npm run test:happy

test-live: ## Live AWS regression (gated on PHOTOAPP_RUN_LIVE_TESTS=1)
	cd $(SERVER_DIR) && npm run test:live

lint: ## ESLint + Prettier (server). Python lint lands when pyproject.toml does.
	cd $(SERVER_DIR) && npm run lint
	@if [ -f $(CLIENT_DIR)/pyproject.toml ]; then \
		cd $(CLIENT_DIR) && ruff check . && black --check . && mypy .; \
	else \
		echo "[skip] $(CLIENT_DIR)/pyproject.toml not yet present (Approach Phase 3)"; \
	fi

format: ## Auto-fix ESLint + Prettier (server)
	cd $(SERVER_DIR) && npm run lint:fix

clean: ## Remove node_modules + coverage artifacts (workspace-wide)
	cd ../.. && rm -rf node_modules projects/project01/Part03/node_modules projects/project02/server/node_modules lib/photoapp-server/node_modules
	rm -rf $(SERVER_DIR)/coverage

up: ## Start all services (mysql + localstack + server) via docker compose
	@if [ ! -f $(CLIENT_DIR)/photoapp-config.ini ]; then \
		echo "[make up] ERROR: client/photoapp-config.ini not found."; \
		echo "          Copy client/photoapp-config.ini.example and adjust for your env."; \
		exit 1; \
	fi
	docker compose up --build -d
	@echo ""
	@echo "[make up] bootstrapping LocalStack S3 bucket..."
	docker compose exec server bash /app/projects/project02/tools/bootstrap-localstack.sh || true
	@echo ""
	@echo "[make up] stack ready — server on http://localhost:8080"
	@echo "          healthz: curl http://localhost:8080/healthz"
	@echo "          readyz:  curl http://localhost:8080/readyz"
	@echo "          logs:    docker compose logs -f server"

up-logs: ## docker compose up + follow logs
	$(MAKE) up && docker compose logs -f

down: ## Stop and remove all compose containers + volumes
	docker compose down -v
	@echo "[make down] stack stopped and volumes removed"

submit-server: ## Build + submit server tarball — STUB until Approach Phase 13
	@echo "[stub] tools/package-submission.sh lands in Approach Phase 13 (Plan Thread F)."
	@exit 1

submit-client: ## Build + submit client tarball — STUB until Approach Phase 13
	@echo "[stub] mirrors 'submit-server' — wired in Approach Phase 13."
	@exit 1
