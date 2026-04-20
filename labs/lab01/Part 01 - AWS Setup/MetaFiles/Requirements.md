# Part 01 – Technical requirements (success criteria)

Criteria below reflect what must be true for the lab handout and Gradescope Part 01 autograder. They are written as verifiable outcomes.

## Region and account

- All created AWS resources for this project that are region-scoped use **`us-east-2`** only (no mixed regions).
- AWS CLI default region (from `aws configure`) is **`us-east-2`**; default output is **`json`**.

## IAM and CLI

- IAM user **`mycli`** exists with CLI-oriented access as described in the assignment.
- A valid **access key** exists for **`mycli`** and local **`aws`** commands succeed (e.g. **`aws s3 ls`** after configuration).

## S3 (PhotoApp bucket)

- Bucket name **begins with `photoapp`** and is **globally unique**, in **`us-east-2`**.
- **Block Public Access** is configured so **public access to the bucket is allowed** (per handout).
- **ACLs are enabled** on the bucket (object ownership / ACL settings as required).
- Bucket-level permissions/ACL yield **public** access as required by the handout’s “Permission overview.”
- Prefix **`test/`** exists with at least one **`.jpg`** object; each test object has **public read** via **object ACL** (Everyone read), not only bucket-level settings.
- Objects are reachable via the **public URL** pattern  
  `https://<bucket>.s3.us-east-2.amazonaws.com/test/<filename>.jpg`  
  (handout uses `http`; either way, anonymous read works in a browser).

## RDS MySQL server

- RDS instance is **MySQL**, **Standard create**, **Free tier** template as specified.
- **DB instance identifier** and **master user** (`admin` in examples) and **strong master password** are set; password is usable from clients and from **`test-mysql.py`**.
- **Allocated storage** is at the **minimum** allowed; **storage autoscaling is disabled**.
- Instance is **publicly accessible**; after creation, the console shows **Publicly accessible: Yes** and a resolvable **endpoint** hostname.
- **Database authentication** includes **password and IAM** (not password-only).
- **Automated backups** are **disabled** (unchecked) for the assignment configuration.
- **VPC security group** attached to the instance has an **inbound** rule: **MySQL/Aurora** from **0.0.0.0/0** (Anywhere-IPv4), in addition to any default rules—so the server is reachable from the student environment and Gradescope.
- **`test-mysql.py`** connects with **`user='admin'`**, correct **`passwd`**, **`host=<endpoint>`**, **`port=3306`**, **`database='sys'`**, runs **`SHOW DATABASES`**, and completes without connection errors.

## Database `photoapp` (schema and data)

- Database **`photoapp`** exists; creation path used **`USE sys`**, **`DROP DATABASE IF EXISTS photoapp`**, **`CREATE DATABASE photoapp`** as in provided SQL.
- Table **`users`** exists under **`photoapp`** with columns **`userid`**, **`username`**, **`pwdhash`**, **`givenname`**, **`familyname`**, **`PRIMARY KEY (userid)`**, **`UNIQUE (username)`**, **`AUTO_INCREMENT`** starting at **80001** after `ALTER TABLE`.
- Table **`assets`** exists with **`assetid`**, **`userid`**, **`localname`**, **`bucketkey`**, **`PRIMARY KEY (assetid)`**, **`FOREIGN KEY (userid) REFERENCES users(userid)`**, **`UNIQUE (bucketkey)`**, **`AUTO_INCREMENT`** starting at **1001**.
- Naming follows the handout’s **lowercase** convention for database, tables, and columns.
- Exactly the **three** seed rows exist for **`p_sarkar`**, **`e_ricci`**, and **`l_chen`** (handout SQL spelling) with the **given bcrypt `pwdhash` strings** and names as in **`create-photoapp.sql`** / handout.
- **`SELECT * FROM users`** in **`photoapp`** returns three rows consistent with the inserts.

## MySQL application users (least privilege)

- MySQL logins **`photoapp-read-only`** and **`photoapp-read-write`** exist with passwords exactly **`abc123!!`** and **`def456!!`** (do not change for grading).
- **`photoapp-read-only`** has **`SELECT`**, **`SHOW VIEW`** on **`photoapp.*`** only (no write DDL/DML on application data beyond read).
- **`photoapp-read-write`** has **`SELECT`**, **`SHOW VIEW`**, **`INSERT`**, **`UPDATE`**, **`DELETE`**, **`DROP`**, **`CREATE`**, **`ALTER`** on **`photoapp.*`** as in the handout.
- **`FLUSH PRIVILEGES`** was run after grants.
- Verified manually: connect as **`photoapp-read-only`** to schema **`photoapp`** and run **`SELECT * FROM users`** successfully; connect as **`photoapp-read-write`** with the same test.

## Configuration file and Gradescope

- File **`photoapp-config.ini`** exists in the required shape with at least:
  - **`[rds]`**: **`endpoint`** set to the live RDS endpoint (not `TODO`); **`port_number = 3306`**; **`region_name = us-east-2`**; **`user_name = photoapp-read-only`**; **`user_pwd = abc123!!`**; **`db_name = photoapp`**.
  - **`[s3]`**, **`[s3readonly]`**, **`[s3readwrite]`** sections present; remaining **`TODO`** values are acceptable for Part 01 per handout (“ignore the other TODO references for now”).
- Gradescope assignment **“Project 01, part01 – AWS”** receives this file; autograder returns **10/10** (submission is not “fire and forget”—output is checked).

## Operational hygiene (recommended, not always auto-graded)

- RDS is **stopped** when not needed for extended periods (console **Stop temporarily** or CLI **`stop-db-instance`**) to reduce cost, with awareness that **start** is required before Part 02 work.
- Master credentials and access keys are **not committed to public git** (course policy and general security).
