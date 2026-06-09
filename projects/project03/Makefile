TF_DIR := infra/envs/dev
AWS_PROFILE ?= Claude-Conjurer

# Point AWS at the real lab creds. The repo-documented MBAi460-Group1/secrets/
# path does not exist post-restructure; the live creds are in claude-workspace/secrets/.
LAB_ROOT := $(abspath $(CURDIR)/../../..)
export AWS_SHARED_CREDENTIALS_FILE := $(LAB_ROOT)/claude-workspace/secrets/aws-credentials
export AWS_CONFIG_FILE := $(LAB_ROOT)/claude-workspace/secrets/aws-config

.PHONY: help preflight test test-api db-init init validate plan apply output-url config submit destroy

help: ## List Project 03 Part 01 operator targets
	@awk 'BEGIN {FS = ":.*?## "}; /^[a-zA-Z0-9_-]+:.*?## / {printf "  \033[36m%-18s\033[0m %s\n", $$1, $$2}' $(MAKEFILE_LIST)

preflight: ## Local + AWS identity checks (no cloud mutation)
	@bash tools/preflight.sh

test: ## Tier-A contract tests + terraform validate (validate needs: make init)
	@bash infra/__tests__/project03-modules.test.sh
	@if [ -d "$(TF_DIR)/.terraform" ]; then $(MAKE) validate; else echo "[test] skip terraform validate (run: make init)"; fi

test-api: ## Live cURL smoke against POST /auth (after apply)
	@bash tools/test-api.sh

db-init: ## (re)apply authsvc schema via Docker run-sql (idempotent)
	cd $(LAB_ROOT)/MBAi460-Group1 && utils/run-sql projects/project03/create-authsvc.sql

init: ## terraform init
	cd $(TF_DIR) && terraform init

validate: ## terraform validate
	cd $(TF_DIR) && terraform validate

plan: ## terraform plan
	cd $(TF_DIR) && terraform plan -var="aws_profile=$(AWS_PROFILE)"

apply: ## terraform apply (Lambda + layers + API Gateway)
	cd $(TF_DIR) && terraform apply -var="aws_profile=$(AWS_PROFILE)"

output-url: ## Print the API invoke URL
	@cd $(TF_DIR) && terraform output -raw invoke_url

config: ## Write authsvc-config.ini + authsvc-client-config.ini from live infra
	@bash infra/scripts/write-authsvc-config.sh
	@bash infra/scripts/write-authsvc-client-config.sh

submit: ## Gradescope submit via instructor Docker image
	@bash scripts/submit-gradescope.sh

destroy: ## Tear down Project 03 resources (Lambda/API/layers/role — NOT backbone RDS)
	cd $(TF_DIR) && terraform destroy -var="aws_profile=$(AWS_PROFILE)"
