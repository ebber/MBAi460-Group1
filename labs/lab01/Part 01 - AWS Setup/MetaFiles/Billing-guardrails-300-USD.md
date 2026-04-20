# Billing guardrails: ~$300/month lab ceiling

**Purpose:** give everyone who uses the shared lab account a **visible, agreed cap** and **alerts** before spend surprises. **$300** is a **policy choice** for this lab; adjust in Billing → Budgets if the orchestrator changes the limit.

**Reality check:** AWS Billing can lag; budgets operate on **estimated** and **actual** cost with delays. A budget is **not** a hard kill-switch on all services unless you add custom automation. Still, **budgets + email (or SNS)** are the right first layer.

## Prerequisites

1. Sign in as an identity that can open **Billing and Cost Management** (often the **root** user or an admin with billing access the first time).
2. If prompted, **enable IAM user access to Billing** (root → Account → `IAM User and Role Access to Billing`).

## Option 1 — AWS Console (recommended first time)

1. Open **AWS Billing and Cost Management** → **Budgets** → **Create budget**.
2. Choose **Cost budget** (or **Monthly cost budget** wizard depending on UI).
3. **Period**: Monthly. **Budget amount**: **300** USD (fixed).
4. **Scope**: leave broad (“All services”) unless you want a second budget later for RDS only.
5. Under **Alert thresholds**, add notifications at **50%**, **80%**, and **100%** (and optionally **Forecasted** 100% if offered).
6. **Notification**: email address(es) for Erik and anyone financially responsible.
7. **Create**.

**Optional second budget:** a **$50** “early warning” budget on **RDS** or **EC2** if those appear later—useful when you add non-free-tier resources.

## Option 2 — AWS CLI (`aws budgets`)

Requires permissions like `aws budgets` and your **12-digit account ID**.

1. Discover account id:

   ```bash
   aws sts get-caller-identity --query Account --output text
   ```

2. Create JSON files (edit emails and account id):

**`budget-300.json`** (cost budget, monthly fixed 300):

```json
{
  "BudgetName": "lab-monthly-300-usd",
  "BudgetLimit": { "Amount": "300", "Unit": "USD" },
  "TimeUnit": "MONTHLY",
  "BudgetType": "COST",
  "CostFilters": {},
  "CostTypes": {
    "IncludeTax": true,
    "IncludeSubscription": true,
    "UseBlended": false,
    "UseAmortized": false
  }
}
```

**`notifications-with-subscribers.json`** — must be a **JSON array** (one object per threshold). Replace the email address.

```json
[
  {
    "Notification": {
      "NotificationType": "ACTUAL",
      "ComparisonOperator": "GREATER_THAN",
      "Threshold": 50,
      "ThresholdType": "PERCENTAGE"
    },
    "Subscribers": [
      { "SubscriptionType": "EMAIL", "Address": "you@example.com" }
    ]
  },
  {
    "Notification": {
      "NotificationType": "ACTUAL",
      "ComparisonOperator": "GREATER_THAN",
      "Threshold": 80,
      "ThresholdType": "PERCENTAGE"
    },
    "Subscribers": [
      { "SubscriptionType": "EMAIL", "Address": "you@example.com" }
    ]
  },
  {
    "Notification": {
      "NotificationType": "ACTUAL",
      "ComparisonOperator": "GREATER_THAN",
      "Threshold": 100,
      "ThresholdType": "PERCENTAGE"
    },
    "Subscribers": [
      { "SubscriptionType": "EMAIL", "Address": "you@example.com" }
    ]
  }
]
```

If `create-budget` rejects `budget-300.json` for missing **`TimePeriod`**, add a window per the current [AWS CLI budget example](https://docs.aws.amazon.com/cli/latest/reference/budgets/create-budget.html) (`TimePeriod.Start` / `TimePeriod.End` as Unix timestamps), or create the budget once in the **console** and skip CLI for the first budget.

3. Create (replace `ACCOUNT_ID`):

   ```bash
   aws budgets create-budget \
     --account-id ACCOUNT_ID \
     --budget file://budget-300.json \
     --notifications-with-subscribers file://notifications-with-subscribers.json
   ```

Store these JSON files under **`MetaFiles/`** or **`secrets/`** depending on whether they embed personal emails; if in doubt, **do not commit** email-heavy files—keep CLI recipes in MetaFiles and **omit** addresses from git.

## Ongoing monitoring habits

- **Billing → Cost Explorer**: monthly check; filter **Service** = RDS, S3, EC2, **Data transfer**.
- **Billing → Bills**: after heavy lab days, scan for **unexpected regions** (should be **`us-east-2`** only for this project).
- **Free Tier** usage table (if account still qualifies): watch for **RDS hours** and **public IPv4** charges called out in the course handout.

## If you hit the ceiling

1. **Stop** RDS and any nonessential resources.
2. **Rotate** anything that might have been abused (unlikely in class, but good hygiene).
3. **Raise** or **reshape** the budget after Erik approves—document the new number in this file or the orchestrator log.
