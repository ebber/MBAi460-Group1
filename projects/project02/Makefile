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

.PHONY: help install test test-unit test-integration test-contract test-smoke test-happy test-live lint format clean clean-workspace clean-dist up down docker-up docker-up-aws docker-up-localstack docker-down bootstrap-localstack submit-server submit-client submit-server-autograder submit-client-autograder

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

docker-up: docker-up-aws ## Default lane: AWS (alias for docker-up-aws)

docker-up-aws: ## Bring up server only; talks to real AWS RDS + S3 + Rekognition
	@if [ ! -f $(CLIENT_DIR)/photoapp-config.ini ]; then \
		echo "[docker-up-aws] ERROR: client/photoapp-config.ini not found."; \
		echo "                Provision it from your AWS-shaped photoapp-config.ini."; \
		exit 1; \
	fi
	@# AWS lane: omit AWS_ENDPOINT_URL so SDK uses real endpoints; PHOTOAPP_CONFIG_FILE
	@# defaults to photoapp-config.ini (the real-AWS file).
	AWS_ENDPOINT_URL= \
	  docker compose up server -d --build
	@echo ""
	@echo "[docker-up-aws] server on http://localhost:8080 → real AWS"
	@echo "                healthz: curl http://localhost:8080/healthz"
	@echo "                readyz:  curl http://localhost:8080/readyz"
	@echo "                logs:    docker compose logs -f server"

docker-up-localstack: ## Bring up server + mysql + localstack; talks to local mocks
	@if [ ! -f $(CLIENT_DIR)/photoapp-config.ini.example ]; then \
		echo "[docker-up-localstack] ERROR: client/photoapp-config.ini.example missing"; \
		exit 1; \
	fi
	PHOTOAPP_CONFIG_FILE=photoapp-config.ini.example \
	AWS_ENDPOINT_URL=http://localstack:4566 \
	AWS_ACCESS_KEY_ID=test \
	AWS_SECRET_ACCESS_KEY=test \
	  docker compose --profile localstack up -d --build
	@echo ""
	@echo "[docker-up-localstack] bootstrapping LocalStack S3 bucket..."
	$(MAKE) bootstrap-localstack
	@echo ""
	@echo "[docker-up-localstack] stack ready — server on http://localhost:8080 → LocalStack"
	@echo "                       logs: docker compose logs -f server"

bootstrap-localstack: ## Provision LocalStack S3 bucket + IAM (uses awslocal in localstack container)
	@if ! docker compose ps localstack --status running 2>/dev/null | grep -q localstack; then \
		echo "[bootstrap-localstack] ERROR: localstack container not running. Start with 'make docker-up-localstack' first."; \
		exit 1; \
	fi
	./tools/bootstrap-localstack.sh

docker-down: ## Stop and remove all containers + volumes (both lanes)
	docker compose --profile localstack down -v
	@echo "[docker-down] stack stopped and volumes removed"

# ── Backwards-compat aliases (operator muscle memory) ────────────────────────
up: docker-up-aws ## DEPRECATED alias for docker-up-aws (kept for muscle memory)

down: docker-down ## DEPRECATED alias for docker-down (kept for muscle memory)

up-logs: docker-up-aws ## docker-up-aws + follow logs
	docker compose logs -f server

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
