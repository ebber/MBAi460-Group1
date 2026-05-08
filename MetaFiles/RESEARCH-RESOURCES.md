# RESEARCH-RESOURCES — Context7 Directive

> **Status:** governing convention for documentation research in this repo. Established 2026-05-07. Same status as `DOC-FRESHNESS.md` and `Manifesto-AWS-Lab-Sanctum.md` — read it once, follow it always.

## TL;DR for agents

When you need authoritative documentation for **AWS services (EB, RDS, IAM, S3, Rekognition)**, **Terraform**, or **Docker**, **use Context7 first** — not WebSearch, not training-data recall.

The library IDs are pre-resolved below. Skip `resolve-library-id` for anything in the table; call `query-docs` directly with the listed ID.

---

## Why this directive exists

This repo deploys real infrastructure to AWS (currently RDS, S3, Rekognition; Elastic Beanstalk in flight for Project 02 Part 02). Stale or hallucinated AWS arguments cost iteration cycles, Gradescope submissions, and money. Context7 mitigates that by returning versioned snippets from authoritative source-of-truth docs.

Compared to the alternatives:

| Source | Pro | Con |
|---|---|---|
| **Context7** | Curated, version-aware, single round trip, authoritative | Limited catalog (no AWS-IAM-first-party today); query goes to a third-party API |
| Training-data recall | Free, instant | May be stale (CLI flags, resource args, IAM action names drift) |
| WebSearch + WebFetch | Catches anything | Two round trips, SEO noise, often returns blog mirrors over canonical docs |
| `gh`, repo files | Authoritative for repo + GitHub state | Not docs |

For AWS / Terraform / Docker questions, **the cost of NOT using Context7 is shipping wrong CLI flags or resource arguments to a real AWS account.** Use it.

---

## How to use

1. **Skip `resolve-library-id` for anything in the table below** — those IDs are pre-resolved and pinned. Call `query-docs` directly.
2. **Resolve only when the topic isn't pre-resolved**, then add the result to the table in the same PR.
3. **Write specific queries** — full sentences, not keywords. Good: *"How do I add `--service-role` and `--instance-profile` flags to `eb create` in a bash script?"* Bad: *"eb create roles"*.
4. **Cap at 3 calls per question** (Context7's own guidance). If 3 doesn't get you there, fall back to WebFetch on the canonical docs URL.
5. **Never include credentials, internal AWS account IDs, customer data, or proprietary code in queries.** Queries go to the Context7 API.

---

## Pre-resolved library IDs

### AWS Elastic Beanstalk

| Library ID | Snippets | Benchmark | Use for |
|---|---:|---:|---|
| **`/websites/aws_amazon_elasticbeanstalk_dg`** | 4,530 | 82.10 | Primary — Developer Guide. `eb` CLI, `.ebextensions`, platform configs, environment management, deployment policies. |
| `/websites/aws_amazon_elasticbeanstalk` | 16,309 | — | Backup. Larger but no benchmark; use only if the DG doesn't have what you need. |

### AWS RDS

| Library ID | Snippets | Benchmark | Use for |
|---|---:|---:|---|
| **`/websites/aws_amazon_amazonrds`** | 38,144 | 76.25 | Primary. Snapshots, parameter groups, stop/start, backup retention, engine-specific tuning. |

**Avoid:**
- `/websites/aws_amazon_es_es_amazonrds` — Spanish edition.
- `/terraform-aws-modules/terraform-aws-rds` — a Terraform module, not RDS docs (use the AWS Provider library for HCL).

### AWS IAM

There is **no first-party "AWS IAM Documentation" library in Context7 today.** Combine the following; cross-check with WebFetch against `docs.aws.amazon.com/IAM/...` if a snippet looks suspect.

| Library ID | Snippets | Benchmark | Use for |
|---|---:|---:|---|
| **`/fogsecurity/aws-iam`** | 63 | 45.60 | IAM action lists, ARN formats, tagging best practices. |
| **`/udondan/iam-floyd`** | 866 | — | Policy generator with worked examples — useful for crafting policy documents. |
| `/websites/aws_amazon` | 480,821 | 71.50 | Broad AWS umbrella. Fall back here for IAM topics not covered above. |
| `/iann0036/iam-dataset` | 274 | — | Structured IAM data across AWS / Azure / GCP — deep reference. |

For **IAM-as-Terraform** (creating roles / policies in HCL), use `/hashicorp/terraform-provider-aws` (resources `aws_iam_role`, `aws_iam_role_policy_attachment`, `aws_iam_policy`, `aws_iam_instance_profile`).

### Docker

| Library ID | Snippets | Benchmark | Use for |
|---|---:|---:|---|
| **`/websites/docker`** | 7,998 | 88.67 | Primary. Highest benchmark. Dockerfile syntax, build, run, networking, volumes, multi-stage. |
| `/docker/docs` | 6,202 | 84.62 | Solid alternative; equivalent quality. |
| `/docker/compose` | 138 | 71.50 | Use specifically for `docker-compose.yml` syntax / Compose CLI. |
| `/websites/docker_reference` | 4,265 | 82.27 | Docker API + CLI + driver + spec reference — depth source. |

### Terraform

| Library ID | Snippets | Benchmark | Versions | Use for |
|---|---:|---:|---|---|
| **`/hashicorp/terraform-provider-aws`** | 9,042 | 79.89 | v5.100 → v6.33 | **Every AWS resource in HCL.** Includes `aws_elastic_beanstalk_application`, `aws_elastic_beanstalk_environment`, `aws_db_instance`, `aws_iam_role`, etc. |
| **`/websites/developer_hashicorp_terraform`** | 24,626 | 78.88 | — | HCL syntax, modules, state, providers, CLI, expressions, meta-arguments. |
| `/hashicorp/terraform` | 110 | 65.99 | v1.8 → v1.14 | Core binary docs only. |
| `/websites/developer_hashicorp_terraform_cloud-docs` | 5,822 | 67.27 | — | HCP Terraform — remote state, runs, workspaces, policy. |

---

## When NOT to use Context7

These are NOT in Context7 — don't waste a call. Use the alternative listed.

| Topic | Use instead |
|---|---|
| Course-specific content (Hummel's PDFs, Gradescope quirks, MBAi 460 conventions) | The PDFs in `projects/<X>/` and `labs/<Y>/`; this repo's `MetaFiles/`. |
| This repo's own conventions, file paths, history | `CONTRIBUTING.md`, `MetaFiles/`, `git log`, `git blame`. |
| Recent CVEs / security advisories | WebSearch. |
| GitHub-specific UI / API behavior | `gh` CLI; GitHub's own docs via WebFetch if `gh` isn't enough. |
| AWS service announcements post-docs-cutoff | WebFetch `aws.amazon.com/blogs/...` or `aws.amazon.com/about-aws/whats-new/...`. |
| Lab-side agent workspace state | The lab repo (`mbai460-client/claude-workspace/`), not Context7. |

---

## Maintenance

- **Re-resolve quarterly or after any failed retrieval.** Library IDs and benchmarks change as Context7's catalog evolves.
- **When introducing a new docs-heavy dependency** (a new AWS service, a new framework, a new IaC tool): add its pre-resolved Context7 ID here in the same PR that introduces the dependency.
- **When Context7 fails for a topic** (no library, low-quality snippets, drift): record the gap below under *Known gaps* with the date so future agents don't redo the same dead-end research.

### Known gaps

- **2026-05-07** — No first-party "AWS IAM Documentation" library exists in Context7 (only third-party / community). Use the combo listed above + WebFetch as the official-source backstop.

---

## Provenance

Authored 2026-05-07 during Project 02 Part 02 (EB deployment) ramp-up. Source library IDs verified against Context7's `resolve-library-id` API on the same date — see chat transcript for the resolution evidence.
