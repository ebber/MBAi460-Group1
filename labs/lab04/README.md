# Lab 04 — Serverless (Lambda + API Gateway)

## Deploy (Terraform)

```bash
cd labs/lab04/infra/envs/dev
terraform init
terraform apply -var="aws_profile=YOUR_PROFILE"
```

Requires Plane-2 IAM (`lab-project04-*` roles + `LabProjectPermissionsBoundary`). See `projects/project02/MetaFiles/5_18_IAM_Requirements.md`.

## Outputs → Gradescope

```bash
make -C labs/lab04 config    # writes lab04-client-config.ini
make -C labs/lab04 submit    # Docker: /gradescope/gs submit ...
```

## API (after apply)

- `PUT /analysis` — image JSON (`name`, `bytes` base64)
- `GET /weather/{country}/{city}` — Open Meteo weather

`terraform output -raw invoke_url` → `[client] webservice` in INI (no trailing slash).
