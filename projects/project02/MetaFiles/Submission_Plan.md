# Project 02 — Part 02 (Elastic Beanstalk) submission plan

Derived from **`project02-part02-EB.pdf`** plus concrete **config file** edits for this repo’s INI shape (`client/photoapp-config.ini.example` shows sections; real `photoapp-config.ini` is gitignored).

---

## Preconditions (before this part “counts”)

1. **Project 02 web service is complete** — working **Node/Express** PhotoApp (Part 01 programming).
2. **Gradescope — “Project 02 – web service”** — handout states your score should be **60/60** to **receive full credit** on the overall Project 02 story (Part 02 builds on Part 01).
3. **AWS + Lab 03** — IAM roles for EB per the handout (often named like `aws-elasticbeanstalk-service-role`, `aws-elasticbeanstalk-ec2-role`). **This repo’s Plane-2 lab account** standardizes on **`lab-project-*`** — see **`infra/bootstrap/LAB_PROJECT_IAM_CONTRACT.md`** and **`MetaFiles/5_18_IAM_Requirements.md`**. You still need **create / update / delete** scripts from Lab 03, **`eb`** / **`aws`** CLI usage as in the handout.
4. **Deployable EB bundle** — `app` (or equivalent) folder containing **all `.js` web service files** + **`photoapp-config.ini`**, plus **`package.json`** suitable for EB (handout references a Dropbox **`package.json`** for EB).
5. **Live Elastic Beanstalk environment** — deploy so you have a **CNAME**, e.g. `http://your-env….elasticbeanstalk.com`.
6. **Smoke test** — browser (or curl) to e.g. **`/users`** or **`/images`** on that URL returns expected JSON; optionally **`/image/1001`** if you have data.

**Handout limitation:** with their EB configuration, **uploads larger than 1MB may fail** — noted as an environment constraint, not a fix target for the assignment.

---

## Steps to submit

**Artifacts (only these two):**

- `photoapp-config.ini`
- `photoapp-client-config.ini`

**Gradescope:**

- Assignment: **“Project 02 - EB”**.
- **CLI example** from the handout (course-specific IDs — verify against your term):  
  `gs submit 1288073 8052817 photoapp-config.ini photoapp-client-config.ini`
- **Or:** drag-and-drop both files on the Gradescope site.

**At submit time:** the web service should **still be running on EB**; the PDF says to verify with something like **`/users`** if unsure. The autograder is expected to depend on a **reachable** service consistent with the submitted configs.

---

## Full points (conceptually)

| Scope | Meaning |
|--------|---------|
| **Part 02 (EB) only** | **10/10** on **“Project 02 - EB”** — correct **two INIs** + behavior the autograder expects (reachability / consistency with the deployed endpoint). PDF: **unlimited submissions**; goal **10/10**. |
| **Project 02 combined (PDF narrative)** | **100/100** across Gradescope if all parts are at max — includes **60/60 web service**, **30/30 client API** (Part 01 buckets), **plus 10/10** EB. |

---

## Config file edits

### `photoapp-config.ini` (server — copied into EB `app/` folder)

Deployed **with** the Node app. Must describe **AWS from EC2’s perspective**, not laptop or LocalStack.

| Area | Local / LocalStack (`photoapp-config.ini.example`) | For EB / submission |
|------|---------------------------------------------------|---------------------|
| **`[rds]` `endpoint`** | e.g. `mysql` (Docker hostname) | **RDS hostname** from AWS (e.g. `*.rds.amazonaws.com`). Reachable from EB **VPC / security groups**. |
| **`[rds]` `port_number`** | e.g. `3306` | Same unless non-default. |
| **`[rds]` `user_name` / `user_pwd` / `db_name`** | Dev values | **Real** DB user, password, database. |
| **`[s3]` `region_name`** | e.g. `us-east-1` | **Region of the bucket**. |
| **`[s3]` `bucket_name`** | e.g. `photoapp-local` | **Real** PhotoApp / course bucket. |
| **Credential blocks** (`[s3readwrite]`, `[s3readonly]`, etc.) | `test` keys for LocalStack | **Real credentials or IAM-based pattern** your Node `photoapp-core` **config loader** expects (instance profile vs explicit keys — follow your implementation). |

**Rule:** The submitted **`photoapp-config.ini`** must match what the **running EB app** actually uses: **one RDS**, **one bucket**, **one region story**, networking allows **EB → RDS**, **EB → S3**, **EB → Rekognition**. LocalStack placeholders are **not** EB-ready without replacement.

---

### `photoapp-client-config.ini` (client — Gradescope artifact)

**Required shape (handout):**

```ini
[client]
webservice=http://YOUR-ENV-CNAME.region.elasticbeanstalk.com
```

**Edits:**

1. Set **`webservice`** to the **EB CNAME** from **`eb status`** (or equivalent).
2. Use **`http://`** (PDF: not `https` for their setup).
3. **No trailing slash** after the host.

After editing, **run client / tests** against EB to confirm before upload.

---

## Cross-check before upload

| Check | Why |
|--------|-----|
| **`photoapp-client-config.ini`** `webservice` is the **deployed EB URL** | Autograder / probes likely hit that host. |
| **`photoapp-config.ini`** references the **same AWS account’s** RDS + S3 the EB app uses | Avoid “server up but wrong backend” failures. |
| Server INI uses **cloud** endpoints, not `mysql` / `test` keys | Matches production, not LocalStack dev. |

## Repo-native pre-submit smoke

After Terraform deploys EB and outputs `elastic_beanstalk_url`, run from
`projects/project02/`:

```bash
make eb-smoke EB_URL=http://YOUR-EB-CNAME.elasticbeanstalk.com
```

This checks `/healthz`, `/readyz`, `/ping`, `/users`, and `/images` with the
same cURL-only posture expected from the autograder. If `/readyz` fails, inspect
RDS/S3/credentials before submitting.

---

## After submission (handout housekeeping)

- **Pause RDS** and **delete the EB environment** with the delete script when finished with the course stack; later projects may not use this deployment.

---

## Reference paths in this repo

| File | Role |
|------|------|
| `client/photoapp-config.ini` | Real server config (gitignored); template in `client/photoapp-config.ini.example`. |
| `client/photoapp-client-config.ini` | Client base URL for `photoapp.py` / Streamlit GUI. |
| `project02-part02-EB.pdf` | Official Part 02 assignment text. |
