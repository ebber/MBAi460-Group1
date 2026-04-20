# Project 01 – Part 01: AWS setup (from `project01-part01.pdf`)

**Sanctum / execution guide (assignment + lab practices):** see `Steps-for-initial-AWS-Lab-setup-while-completing-the-assignment.md`, `Manifesto-AWS-Lab-Sanctum.md`, and `Billing-guardrails-300-USD.md`.

This summary was derived from the full handout (26 pages), covering Part 01 only (through database access control and Gradescope submission for Part 01).

## Goal

By the end of Part 01 you have a **consistent AWS footprint in `us-east-2`** that supports the PhotoApp foundation: **CLI access** via a dedicated IAM user, a **public, ACL-enabled S3 bucket** for images (with a verified manual upload path), a **publicly reachable RDS MySQL instance** on the free tier (correct storage/backup/auth settings and **inbound MySQL open to the internet** for this project), a **`photoapp` database** on that server with the prescribed **`users` and `assets` schema**, the three **seed users** inserted, and the two **application MySQL accounts** (`photoapp-read-only`, `photoapp-read-write`) created with the **exact usernames, passwords, and grants** specified for grading. You **fill `photoapp-config.ini`** with your **RDS endpoint** (other TODOs can remain) and **submit to Gradescope** for “Project 01, part01 – AWS,” aiming for **10/10**. Afterward you may **stop the RDS instance** (or use CLI start/stop) to limit cost.

## Steps

1. **Set up AWS CLI (Step 1)**  
   - In IAM, create a user **`mycli`** with permissions suitable for CLI use (per console walkthrough in the handout).  
   - Create an **access key** for CLI use and record access/secret keys.  
   - Install **AWS CLI v2** ([install guide](https://docs.aws.amazon.com/cli/latest/userguide/install-cliv2.html)).  
   - Run **`aws configure`**: enter keys, region **`us-east-2`**, output **`json`**.  
   - Verify: **`aws --version`**, create a test bucket with **`aws s3 mb s3://nu-mbai460-your-name-with-some-id`**, confirm with **`aws s3 ls`** (or the console).  
   - Keep **all resources in `us-east-2`** for the rest of the project.

2. **Create the PhotoApp S3 bucket (Step 2)**  
   - Create a bucket whose name **starts with `photoapp`**, then your name and a unique suffix (CLI or console).  
   - In **Permissions**, edit **Block public access** so **public access is allowed** (uncheck block-all), save.  
   - Under **Object Ownership**, **enable ACLs** (Bucket owner preferred / legacy ACL behavior as directed), save.  
   - Set the **bucket ACL** so the bucket is **public** as shown; **Permission overview** should indicate **public** access.

3. **Manually upload photos (Step 3)**  
   - Create a folder **`test/`** in the bucket (console adds the trailing `/`).  
   - Upload one or more **JPEG** images into `test/`.  
   - For **each object**, edit **ACL** and grant **Read** to **Everyone (public)** (uploads do not inherit bucket public ACL).  
   - Confirm in a browser: `http://<bucket>.s3.us-east-2.amazonaws.com/` and `http://<bucket>.s3.us-east-2.amazonaws.com/test/<filename>.jpg`.

4. **Set up RDS MySQL (Step 4)**  
   - RDS → **Create database**: **Standard create**, engine **MySQL**, template **Free tier**.  
   - Set **DB instance identifier** (your MySQL server name), **master username** (e.g. `admin`), and a **strong master password**.  
   - **Allocated storage**: **minimum**; **disable storage autoscaling**.  
   - **Public access**: **Yes** (publicly accessible).  
   - **Database authentication**: **Password and IAM**.  
   - Under **Additional configuration**, **uncheck automated backups** (cost saving for the assignment).  
   - **Create database**; wait until status is **Available**; note the **endpoint** hostname; confirm **Publicly accessible** is Yes.  
   - Open the instance’s **VPC security group** → **Inbound rules** → **Edit** → **Add rule**: type **MySQL/Aurora**, source **Anywhere-IPv4**, save.  
   - Edit **`test-mysql.py`**: set **`admin` password** and **RDS endpoint** (lines called out in handout); run from Docker **`projects/project01`** (or equivalent); confirm **`SHOW DATABASES`** output.  
   - Optional cost control: **Stop temporarily** under Actions during long breaks, or use **`aws rds stop-db-instance` / `start-db-instance`** with your DB instance identifier.

5. **Create the `photoapp` database (Step 5)**  
   - Install/use a client (**MySQL Workbench**, **VS Code** MySQL extensions, or **Adminer** via Docker as in the handout); connect to the **RDS endpoint** with **admin** credentials, default schema **`sys`**.  
   - Run **`select now();`** to verify SQL execution.  
   - Execute the full script from **`create-photoapp.sql`** (or the handout’s fragments in order): `USE sys`; drop/create **`photoapp`**; `USE photoapp`; drop/create **`users`** and **`assets`** with the specified columns, keys, **`AUTO_INCREMENT`** starting at **80001** (users) and **1001** (assets); run the three **`INSERT INTO users`** statements (password hashes and names as given).  
   - Verify with **`USE photoapp; SELECT * FROM users;`**. If anything is wrong, re-run the provided SQL to recreate the DB.

6. **Control database access (Step 6)**  
   - Execute the SQL that **`DROP USER IF EXISTS`** for **`photoapp-read-only`** and **`photoapp-read-write`**, **`CREATE USER`** with passwords **`abc123!!`** and **`def456!!`** exactly, **`GRANT`** as specified (read-only: **SELECT, SHOW VIEW** on `photoapp.*`; read-write: **SELECT, SHOW VIEW, INSERT, UPDATE, DELETE, DROP, CREATE, ALTER** on `photoapp.*`), then **`FLUSH PRIVILEGES`**.  
   - Test **separate connections**: as **`photoapp-read-only`** / **`abc123!!`** against schema **`photoapp`**, run **`SELECT * FROM users`**. Repeat for **`photoapp-read-write`** / **`def456!!`**.

7. **Grading and submission (end of Part 01)**  
   - Edit **`photoapp-config.ini`**: under **`[rds]`**, set **`endpoint`** to your RDS endpoint (format like `nu-mbai460-???-???.us-east-2.rds.amazonaws.com`). Other **`TODO`** entries may stay for now.  
   - Submit the file to Gradescope (**Project 01, part01 – AWS**), e.g. Docker: `/gradescope/gs submit 1288073 7941405 *.ini` (or drag-drop if not using Docker).  
   - Confirm autograder **10/10**; fix and resubmit if needed (unlimited submissions for Part 01).  
   - After success, optionally **stop RDS** again to reduce charges.

**Note:** Part 02 (Python client API) is separate; Part 01 ends after submission above.
