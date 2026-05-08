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

.PHONY: help install test test-unit test-integration test-contract test-smoke test-happy test-live lint format clean clean-workspace clean-dist up down submit-server submit-client submit-server-autograder submit-client-autograder

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

clean: ## Remove Project 02 server node_modules + coverage artifacts
	rm -rf $(SERVER_DIR)/node_modules
	rm -rf $(SERVER_DIR)/coverage

clean-workspace: ## Remove root + Project 02 server node_modules (does not touch Project 01)
	cd ../.. && rm -rf node_modules projects/project02/server/node_modules
	rm -rf $(SERVER_DIR)/coverage

clean-dist: ## Prune dist/ to the most recent server + client submission (keeps the 4 most recent of each type by default)
	@# Each iteration of submit-* creates ~5MB of dist + tarball. After a long
	@# debugging arc (the Project 02 90/90 arc accumulated 1.5GB across 60+ items)
	@# the disk-cost adds up. This target keeps the most recent N=2 server +
	@# N=2 client submission dirs + their tarballs; deletes everything else.
	@# Override N via KEEP_N=4 make clean-dist if you want more headroom.
	@KEEP_N=$${KEEP_N:-2}; \
	cd dist 2>/dev/null && { \
	  echo "==> Pruning dist/ — keeping most recent $$KEEP_N of each (server + client)"; \
	  for prefix in p02-server-submission p02-client-submission; do \
	    KEEP_TS=$$(ls -1d $${prefix}-*Z 2>/dev/null | sort -r | head -n "$$KEEP_N" | sed 's|.*-||;s|Z$$||'); \
	    [ -z "$$KEEP_TS" ] && continue; \
	    KEEP_PATTERN=$$(echo "$$KEEP_TS" | tr '\n' '|' | sed 's/|$$//'); \
	    for item in $${prefix}-*; do \
	      ts=$$(echo "$$item" | sed -E "s/^$${prefix}-([0-9TZ]+).*/\1/" | sed 's/Z$$//'); \
	      if echo "$$KEEP_TS" | grep -qFx "$$ts"; then \
	        echo "  keep:   $$item"; \
	      else \
	        echo "  delete: $$item"; \
	        rm -rf "$$item"; \
	      fi; \
	    done; \
	  done; \
	  echo ""; \
	  echo "==> dist/ size after prune: $$(du -sh . | cut -f1)"; \
	} || echo "  (dist/ does not exist; nothing to clean)"

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

submit-server: ## Build the Project 02 server submission package (preserves `kind` extension)
	./tools/package-submission.sh

submit-client: ## Build the Project 02 client submission package (preserves `kind` extension)
	./tools/package-client-submission.sh

# Autograder-mode build targets — strip Project-extension features that
# conflict with Gradescope's canonical assignment template (currently:
# the `kind` column on `assets`). The toggle is intent-based: any future
# Gradescope-specific transformation should be gated behind the same
# P02_AUTOGRADER_BUILD=1 env var so all "make this dist autograder-safe"
# behavior is one switch. See tools/package-submission.sh § Step 14
# for the full diagnostic chain that revealed the strip is needed.
submit-server-autograder: ## Build server package in autograder-safe mode (strips `kind` column)
	P02_AUTOGRADER_BUILD=1 ./tools/package-submission.sh

submit-client-autograder: ## Build client package in autograder-safe mode (strips `kind` column)
	P02_AUTOGRADER_BUILD=1 ./tools/package-client-submission.sh
