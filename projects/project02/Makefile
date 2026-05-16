# Project 02 Makefile.
#
# Run from MBAi460-Group1/projects/project02/.
#
# Two Docker lanes (see README.md for details):
#   make docker-up-aws         server only → real AWS RDS + S3 + Rekognition
#   make docker-up-localstack  server + mysql + localstack → offline mocks
#   make docker-down           tear down whichever is running
#
# Test gate:
#   bash tools/phase1-smoke.sh

SHELL := /bin/bash
SERVER_DIR := server
CLIENT_DIR := client

.PHONY: help install test test-unit test-integration test-contract test-smoke test-happy test-live lint format clean clean-workspace eb-preflight eb-bundle eb-bundle-example eb-smoke docker-up docker-up-aws docker-up-localstack docker-down bootstrap-localstack

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

eb-preflight: ## Check local EB deploy inputs (no secrets printed; no cloud mutation)
	./tools/eb-preflight.sh

eb-bundle: ## Stage EB bundle with real gitignored client/photoapp-config.ini
	@if [ ! -f $(CLIENT_DIR)/photoapp-config.ini ]; then \
		echo "[eb-bundle] ERROR: $(CLIENT_DIR)/photoapp-config.ini not found."; \
		echo "            Provision it from your AWS-shaped config before staging a deployable EB bundle."; \
		exit 1; \
	fi
	./tools/stage-eb-bundle.sh \
	  --config-file $(CLIENT_DIR)/photoapp-config.ini \
	  --output-dir build/eb \
	  --bundle-name project02-photoapp-dev

eb-bundle-example: ## Stage EB bundle with LocalStack example config (dry-run only)
	./tools/stage-eb-bundle.sh \
	  --config-file $(CLIENT_DIR)/photoapp-config.ini.example \
	  --output-dir build/eb \
	  --bundle-name project02-photoapp-example

eb-smoke: ## Smoke-test deployed EB URL; usage: make eb-smoke EB_URL=http://...
	@if [ -z "$${EB_URL:-}" ]; then \
		echo "[eb-smoke] ERROR: set EB_URL=http://your-env.elasticbeanstalk.com"; \
		exit 1; \
	fi
	../../labs/lab03-production-grade/bin/smoke-eb-url.sh \
	  --base-url "$${EB_URL}" \
	  --path /healthz \
	  --path /readyz \
	  --path /ping \
	  --path /users \
	  --path /images \
	  --expect /healthz=200 \
	  --expect /readyz=200 \
	  --expect /ping=200 \
	  --expect /users=200 \
	  --expect /images=200 \
	  --retry-count 3 \
	  --timeout 10

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

# Removed in Phase 1.5 Group E:
#   up, down, up-logs (deprecated aliases for docker-up-aws / docker-down)
# Removed in Phase 1.5 Group B:
#   submit-server, submit-client, submit-server-autograder,
#   submit-client-autograder, clean-dist (submission packaging targets;
#   the underlying scripts now live read-only under
#   submission artifacts/tools/ for historical reference).
# See tools/DEPRECATED.md for the full removal/archive history.
