TF_DIR := infra/envs/dev

.PHONY: init validate plan apply output-url config destroy submit

submit:
	@bash scripts/submit-gradescope.sh

# Interactive shell in instructor image (from repo root: ./docker/run)
docker-shell:
	@echo "Run from MBAi460-Group1 repo root: ../../docker/run"

init:
	cd $(TF_DIR) && terraform init

validate:
	cd $(TF_DIR) && terraform validate

plan:
	cd $(TF_DIR) && terraform plan

apply:
	cd $(TF_DIR) && terraform apply

output-url:
	@cd $(TF_DIR) && terraform output -raw invoke_url

config:
	@bash infra/scripts/write-client-config.sh

destroy:
	cd $(TF_DIR) && terraform destroy
