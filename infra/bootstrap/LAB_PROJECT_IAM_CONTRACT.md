# Lab project IAM contract (MBAi460 shared lab)

**Status:** Active for Plane-2 bootstrap (`infra/bootstrap/plane2-iam-delegation`).  
**Audience:** Humans and agents deploying any **lab project** (Project02 EB, future Lambdas, etc.) under **`Claude-ConjurerPlane2IAMDelegation`** + **`LabProjectPermissionsBoundary`**.

---

## 1. Why this exists

Scoped delegation policies match **IAM entity names** with **ARN patterns**. The lab encodes that as a **single naming prefix** so `iam:PassRole`, role mutation, and the permissions boundary stay aligned without per-project policy edits.

---

## 2. Mandatory prefix

For **all new** project-scoped runtime IAM created or managed by the Plane-2 operator:

| Entity | Naming rule |
|--------|-------------|
| IAM **roles** | Name **must** start with **`lab-project-`** |
| IAM **instance profiles** | Name **must** start with **`lab-project-`** |
| **Customer-managed** IAM policies | Name **must** start with **`lab-project-`** |

**Examples (Elastic Beanstalk):**

- Service role: **`lab-project-eb-service-role`**
- EC2 / instance profile (often same basename): **`lab-project-eb-ec2-role`**

Do **not** introduce additional prefix variants (`photoapp-*`, `project02-*` alone, etc.) for resources governed by this contract unless **`ClaudeConjurerPlane2IAMDelegation`** is intentionally revised.

---

## 3. Permissions boundary

Every **`lab-project-*`** IAM **role** the operator creates **must** be created with managed permissions boundary:

**`LabProjectPermissionsBoundary`**

That boundary caps **effective** permissions for runtime identities (explicit **Deny** for IAM, org/account/billing/SSO, CloudTrail, Config, GuardDuty, Security Hub, and related planes). Attaching a wide AWS managed policy to the role does **not** override the boundary.

---

## 4. PassRole and trust

**`iam:PassRole`** (for the Plane-2 operator) is allowed only when:

- **Resource:** `arn:<partition>:iam::<account-id>:role/lab-project-*`
- **`iam:PassedToService`** is one of: **`elasticbeanstalk.amazonaws.com`**, **`ec2.amazonaws.com`**, **`lambda.amazonaws.com`**

So **EB / EC2 / Lambda** flows must use **`lab-project-*`** role ARNs—not legacy wizard defaults such as `aws-elasticbeanstalk-service-role`—unless an **admin** path outside this contract is documented and approved.

---

## 5. Relationship to course materials

Course PDFs and AWS account wizards often default to names like **`aws-elasticbeanstalk-service-role`** and **`aws-elasticbeanstalk-ec2-role`**. Those are **not** wrong for the generic assignment text; they are **not** the naming contract for **this** repo’s Plane-2–enabled lab account. In docs and Terraform here, prefer **`lab-project-*`** so behavior matches policy.

---

## 6. Bootstrap and verification

| Item | Location |
|------|----------|
| Terraform (policies + user attachment) | `infra/bootstrap/plane2-iam-delegation/` |
| Path A optional EB runtime IAM | `infra/bootstrap/plane2-iam-delegation/eb_lab_roles.tf` (set `create_lab_project_eb_roles = true`) |
| Post-apply negative tests | `infra/bootstrap/plane2-iam-delegation/scripts/post-apply-negative-tests.sh` |
| Project02 IAM requirements (EB-focused detail) | `projects/project02/MetaFiles/5_18_IAM_Requirements.md` |

### Path A vs Path B (single ownership)

| Path | Who owns the EB roles | Project02 setting |
|------|-----------------------|-------------------|
| **A (recommended)** | This bootstrap state, behind `create_lab_project_eb_roles = true` | `eb_create_iam_roles = false`, names from bootstrap outputs |
| **B (alternative)** | The Project02 `elastic-beanstalk` module, `create_iam_roles = true` | bootstrap stays `create_lab_project_eb_roles = false` |

Only one path may own these role names at a time. Mixing both produces a "two owners" failure mode (Terraform fights itself or one side imports the other's resources). Document any deviation as an exception (see Section 7).

**Operator identity:** **`Claude-Conjurer`** (or configured `conjurer_user_name`) receives **`ClaudeConjurerPlane2IAMDelegation`**; it does **not** wear **`LabProjectPermissionsBoundary`**—effective caller permissions are **PowerUserAccess + delegation** (and any other attachments).

---

## 7. Exceptions

Exceptions (e.g. legacy roles, imported names without `lab-project-`) must be:

1. Recorded in the relevant **`MetaFiles/`** doc or ticket, and  
2. Owned by an **admin** identity or separate policy—not assumed to work under **`ClaudeConjurerPlane2IAMDelegation`**.

---

## Revision

When changing naming, PassRole services, or the boundary, update **this file**, **`plane2-iam-delegation`** Terraform, **`5_18_IAM_Requirements.md`**, and **`Hosting_Plan.md`** together so agents have one coherent story.
