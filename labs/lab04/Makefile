TF_DIR := infra/envs/dev
AWS_PROFILE ?= Claude-Conjurer

.PHONY: help preflight test test-api init validate plan apply output-url config destroy submit

help: ## List Lab 04 operator targets
	@awk 'BEGIN {FS = ":.*?## "}; /^[a-zA-Z0-9_-]+:.*?## / {printf "  \033[36m%-18s\033[0m %s\n", $$1, $$2}' $(MAKEFILE_LIST)

preflight: ## Local + optional AWS checks (no cloud mutation)
	@bash tools/preflight.sh --aws-profile "$(AWS_PROFILE)"

test: ## Run in-repo contract tests + terraform validate (needs: make init)
	@bash infra/__tests__/lab04-modules.test.sh
	@bash tools/__tests__/preflight.test.sh
	@bash tools/__tests__/test-api.test.sh
	@if [ -d "$(TF_DIR)/.terraform" ]; then \
	  $(MAKE) validate; \
	else \
	  echo "[test] skip terraform validate (run: make init)"; \
	fi

test-api: ## cURL smoke against live API (after apply)
	@bash tools/test-api.sh

init: ## terraform init
	cd $(TF_DIR) && terraform init

validate: ## terraform validate
	cd $(TF_DIR) && terraform validate

plan: ## terraform plan
	cd $(TF_DIR) && terraform plan -var="aws_profile=$(AWS_PROFILE)"

apply: ## terraform apply (creates Lambda + API Gateway)
	cd $(TF_DIR) && terraform apply -var="aws_profile=$(AWS_PROFILE)"

output-url: ## Print invoke URL for Gradescope INI
	@cd $(TF_DIR) && terraform output -raw invoke_url

config: ## Write lab04-client-config.ini from terraform output
	@bash infra/scripts/write-client-config.sh

destroy: ## Tear down Lab 04 AWS resources (cost cleanup)
	cd $(TF_DIR) && terraform destroy -var="aws_profile=$(AWS_PROFILE)"

submit: ## Gradescope submit via instructor Docker image
	@bash scripts/submit-gradescope.sh

docker-shell: ## Instructor Docker shell (run ./docker/run from repo root)
	@echo "Run from MBAi460-Group1 repo root: ./docker/run"
