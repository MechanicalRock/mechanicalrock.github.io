---
layout: postv2
hidden: true
inject_optimize_tag: true
canonical_url: https://mechanicalrock.github.io/2023/01/25/snowflake-snowpro-core-cert.html
font: serif
title: "Snowflake SnowPro Core Certification notes"
description: ""
date: 2023-01-25
highlight: monokai
image: /img/skeleton-loaders/banner.jpg
author: Zainab Maleki
tags: [snowflake, snowpro, core, certification, cheatsheet, exam, notes]
---

# Snowflake SnowPro Core Certification cheat sheet

After working with Snowflake for almost four years I have finally bowed down to studying for the Snowflake certification and passed my exam this morning. Before I started going through a set of practice tests, I thought the exam would be fairly easy given I have four years experience working with Snowflake. However, a little into my first online practice test, I realized the practical experience of using Snowflake, plus intuition and luck would probably only get me less than 50%. You will need to study a lot, especially for things that you don't normally use or would Google! Unfortunately Googling is not an option during the test, and therefore, this cheat sheet might come in handy if you are studying for the Snowflake Certification.

## General exam covered areas

If you are fresh and planning to start your study, skimming through the Snowflake documentation is a great start. This documentation gives you a good understanding of the generic topics covered in the exam. From memory, the following headings came up in my exam this morning:

- [Secure Data Sharing](https://docs.snowflake.com/en/user-guide/data-sharing-intro.html)
  - sharing secure elements
  - the types of objects that can and cannot be shared 
- File uploads, downloads and unload data from Snowflake
  - [put and list commands](https://docs.snowflake.com/en/user-guide/data-load-local-file-system-stage.html)
  - [download files from stage](https://docs.snowflake.com/en/sql-reference/sql/get.html)
  - [unloading data from Snowflake table](https://docs.snowflake.com/en/user-guide/intro-summary-unloading.html)
- [Roles and grants](https://docs.snowflake.com/en/user-guide/security-access-control-overview.html#role-hierarchy-and-privilege-inheritance)
  - Snowflake System roles
  - custom roles
  - what grant is required for a given object
- [Handling unstructured files](https://docs.snowflake.com/en/user-guide/data-load-prepare.html)
  - encryption methods
  - accepted file types
  - compression types
- [Micro-partition & Clustering](https://docs.snowflake.com/en/user-guide/tables-clustering-micropartitions.html)
  - what is a good use case for clustering
  - clustering depth
  - syntax of adding and dropping a clustering key
  - How does micro partitioning ranges effect clustering depth
- [Query profile](https://docs.snowflake.com/en/user-guide/ui-query-profile.html)
  - what information it gives us
  - storage information on query profile
  - debugging an issue using query profile
- [Directory tables](https://docs.snowflake.com/en/user-guide/data-load-dirtables.html)
- [Network policy](https://docs.snowflake.com/en/user-guide/network-policies.html)
  - user network policy and how to bypass it
  - account network policy and which role can create it
- Snowflake out of the box views
  - [ACCESS_HISTORY](https://docs.snowflake.com/en/sql-reference/account-usage/access_history.html)
  - [LOGIN_HISTORY](https://docs.snowflake.com/en/sql-reference/account-usage/login_history.html)
  - [QUERY_HISTORY](https://docs.snowflake.com/en/sql-reference/account-usage/query_history.html)
  - [TABLE_STORAGE_HISTORY](https://docs.snowflake.com/en/sql-reference/info-schema/table_storage_metrics.html)
- [Differences between account usage views vs information schema views](https://docs.snowflake.com/en/sql-reference/account-usage.html#differences-between-account-usage-and-information-schema)

## Practice exam materials

Once you have skimmed through the above documentation discussed before, I would suggest going through the practice tests as fast as you can. These practice tests are great and will help you prepare for the exam. I highly recommend starting with Udemy practice tests and taking notes as you go until you are able to get 90%+ in each. If you have additional time, go through a couple of the testprep practice runs to supplement your understanding and help cover gaps in the Udemy practice test. This should be plenty of practice to help you pass the exam.

**Udemy** -> (<https://www.udemy.com/course/snowflake-snowpro-core-certification-exam-practice-sets/>)
There was a lot of questions in the exam that was similar to Udemy practice questions.

**TestPrep** -> (<https://www.testpreptraining.com/snowflake-snowpro-core-certification>)
TestPrep generally has very complex practice tests but I definitely saw some questions in the exam that was exactly like testprep questions

## Practice exam notes

When I started going through the practice exams, I struggled with the following headings the most and took notes. I hope these notes come in handy for you too:

### Snowflake built-in functions for handling staged files

**GET_ABSOLOUTE_PATH** -> Retrieves the absolute path of a staged file using the stage name and path of the file relative to its location in the stage as inputs.

**GET_STAGE_LOCATION** -> Retrieves the URL for an external or internal named stage using the stage name as the input.

**BUILD_SCOPED_FILE_URL** -> Generates a scoped Snowflake-hosted URL to a staged file using the stage name and relative file path as inputs. A scoped URL is encoded and permits access to a specified file for a limited period of time.

**GET_PRESIGNED_URL** -> Generates the pre-signed URL to a staged file using the stage name and relative file path as inputs.

**BUILD_STAGE_FILE_URL**-> Generates a Snowflake-hosted file URL to a staged file using the stage name and relative file path as inputs. A file URL permits prolonged access to a specified file. That is, the file URL does not expire.

**GET_RELATIVE_PATH** -> Extracts the path of a staged file relative to its location in the stage using the stage name and absolute file path in cloud storage as inputs.

### Differences between Snowflake functions of various types

**TABLE FUNCTIONS** -> A table function returns a set of rows for each input row. The returned set can contain zero, one, or more rows. Each row can contain one or more columns.

**SYSTEM FUNCTIONS** -> Snowflake provides the following types of system functions:

- Control functions that allow you to execute actions in the system (e.g. aborting a query).
- Information functions that return information about the system (e.g. calculating the clustering depth of a table).
- Information functions that return information about queries (e.g. information about EXPLAIN plans).
Many of these system functions have the prefix SYSTEM$ (e.g. SYSTEM\$TYPEOF).

**WINDOW FUNCTIONS** -> A window function operates on a group (“window”) of related rows. Each time a window function is called, it is passed a row (the current row in the window) and the window of rows that contain the current row. The window function returns one output row for each input row. The output depends on the individual row passed to the function and the values of the other rows in the window passed to the function.

**SCALAR FUNCTIONS** -> A scalar function is a function that returns one value per invocation; in most cases, you can think of this as returning one value per row. This contrasts with Aggregate Functions, which return one value per group of rows.

**UDF FUNCTIONS** -> With user-defined functions (UDFs), you can extend the system to perform operations that are not available through the built-in, system-defined functions provided by Snowflake.

**AGGREGATE FUNCTIONS** -> An aggregate function takes multiple rows (actually, zero, one, or more rows) as input and produces a single output. In contrast, scalar functions take one row as input and produce one row (one value) as output.

### Snowflake built-in views and tables

**AUTOMATIC_CLUSTERING_HISTORY** table -> Snowflake Information Schema:
view the billing for Automatic Clustering

**AUTOMATIC_CLUSTERING_HISTORY** view -> Account Usage:
view the billing for Automatic Clustering

**REPLICATION_USAGE_HISTORY** table -> INFORMATION_SCHEMA:
The table function REPLICATION_USAGE_HISTORY in Snowflake Information Schema can be used to query the replication history for a specified database within a specified date range. The information returned by the function includes the database name, credits consumed and bytes transferred for replication.

**REPLICATION_USAGE_HISTORY** view -> Account Usage:
can be used to query the replication history for a specified database. The returned results include the database name, credits consumed, and bytes transferred for replication. Usage data is retained for 365 days (1 year).

**QUERY_HISTORY** view -> Account Usage:
Can be used to query Snowflake query history by various dimensions (time range, session, user, warehouse, etc.) within the last 365 days (1 year).
The warehouse performance can also be evaluated by querying the Account Usage QUERY_HISTORY view.

**ACCESS_HISTORY** view -> Account Usage:
Access History in Snowflake refers to when the user query reads column data and when the SQL statement performs a data write operation, such as INSERT, UPDATE, and DELETE, along with variations of the COPY command, from the source data object to the target data object

**COPY_HISTORY** view -> Account Usage:
This Account Usage view can be used to query Snowflake data loading history for the last 365 days. The view displays load activity for both COPY INTO [table] statements and continuous data loading using Snowpipe. The view avoids the 10,000 row limitation of the LOAD_HISTORY View.

**LOAD_HISTORY** view -> INFORMATION_SCHEMA:
The status of COPY INTO command can be checked from querying the INFORMATION_SCHEMA.LOAD_HISTORY view

**MASKING_POLICIES** view -> Account Usage:
This Account Usage view provides the Column-level Security masking policies in your account.
Each row in this view corresponds to a different masking policy.

**TABLE_STORAGE_METRICS** view -> INFORMATION_SCHEMA:
This view displays table-level storage utilization information, which is used to calculate the storage billing for each table in the account, including tables that have been dropped, but are still incurring storage costs.

**TABLE_STORAGE_METRICS** view -> Account Usage:
This view displays table-level storage utilization information, which is used to calculate the storage billing for each table in the account, including tables that have been dropped, but are still incurring storage costs.

**POLICIES_REFERENCES** view -> Account Usage:
Returns a row for each object that has the specified policy assigned to the object or returns a row for each policy assigned to the specified object.

**POLICIES_REFERENCES** table -> INFORMATION_SCHEMA:
Returns a row for each object that has the specified policy assigned to the object or returns a row for each policy assigned to the specified object.

**AUTO_REFRESH_REGISTRATION_HISTORY** -> table function:
can be used to query the history of data files registered in the metadata of specified objects and the credits billed for these operations. The table function returns the billing history within a specified date range for your entire Snowflake account. This function returns billing activity within the last 14 days.

**STAGE_DIRECTORY_FILE_REGISTRATION_HISTORY** -> table function:
can be used to query information about the metadata history for a directory table, including: - Files added or removed automatically as part of a metadata refresh. - Any errors found when refreshing the metadata.

### Size specific notes

- The VARIANT data type imposes a 16 MB size limit on individual rows
- A micro-partition can contain between 50 MB to 500 MB of uncompressed data
- Recommended compressed size of data files for optimal bulk data loads is 100 to 250 MB

### Retention specific notes

- Snowflake keeps the batch load history (from Stage) using COPY statement for 64 days.
- Snowpipe load history is 14 days
- Maximum retention period for permanent tables, schemas and databases is 90 days in Enterprise edition or higher
- In Enterprise edition or higher For transient databases, schemas, and tables, the retention period default is set to 1 day but can be changed to 0. The same is also true for temporary tables
- Cache query result retention period is 24 hours. However, each time the persisted result for a query is reused, Snowflake resets the 24-hour retention period for the result up to a maximum of 31 days from the date and time that the query was first executed. After 31 days, the result is purged, and the next time the query is submitted, a new result is generated and persisted.
- Snowflake Query history page allows you to view the details of all the queries executed in the last 14 days
- All Snowflake-managed keys are automatically rotated by Snowflake when they are more than 30 days old

### Scaling policies on multi-cluster warehouses

- There are two different scaling policies, one is the Standard policy, and one is the Economy policy.
- There are two ways to set up a multi-cluster warehouse: in maximized mode, or auto-scaling mode. With maximized mode, you simply set your minimum equal to your maximum, and those values are something greater than one.

### Secure data sharing

Secure Data Sharing enables sharing selected objects in a database in your account with other Snowflake accounts. The following Snowflake database objects can be shared:

Tables
External tables
Secure views
Secure materialized views
Secure UDFs

Snowflake enables the sharing of databases through shares created by data providers and “imported” by data consumers.

### Replication and cloning

Temporary tables, stages, tasks, streams, pipes, and external tables are not currently supported for replication.

Databases and Schemas can be cloned. External Table and Internal (Snowflake) stages do not get cloned.

Database and share replication are available in all editions, including the Standard edition. Replication of all other objects is only available for Business Critical Edition (or higher).

### Snowflake sampling methods

SYSTEM | BLOCK sampling is often faster than BERNOULLI | ROW sampling. Also, BERNOULLI | ROW method is good for Smaller Tables, and SYSTEM | BLOCK method is for Larger Tables.

### Snowflake architecture

Snowflake's unique architecture consists of three key layers:
 • Database Storage
 • Query Processing
 • Cloud Services

## Some sample questions

- **What are javascript stored procedure delimiters?**
Single quotes ' or double dollar signs \$\$.
- **What are the output fields of directory table result?**
relative_path, size, last_modified, md5, file_url and etag
- **How do you reference a sql variable?**
Using a $ sign
- **How do you get the current version of the driver in SQL command?**
SELECT CURRENT_CLIENT() SQL function
- **What SQL ANSI constrains does Snowflake Enforce?**
Snowflake supports defining and maintaining constraints like Primary, Foreign Key, Unique and NOT NULL, BUT does not enforce them except for NOT NULL constraints, which are always enforced.
- **How many days does Snowflake keeps transiant tables in fail safe?**
Zero
- **What's the retention period of transient tables in time travel?**
1 day
- **Which role can set MINS_TO_BYPASS_NETWORK_POLICY property?**
No one, you have to contact Snowflake support
- **What are shareable objects?**
Tables, External tables, Secure views, Secure materialized views, Secure UDFs
- **What is the maximum number of tags you are allowed to assign to an object?**
50
- **What grants do you need to add search optimization?**
GRANT ADD SEARCH OPTIMIZATION ON SCHEMA X TO ROLE Y
- **What’s the maximum size limit when uploading a file through snowflake wizard?**
Should be smaller than 50 MB
- **What's the minimum timeout you can set for Snowflake Session policy?**
The min timeout I can set is 5 minutes
- **You are uploading local file 100GB and its taking more than 24 hrs, what happens at the 24th hour?**
Maximum allowed duration of 24 hours, it could be aborted without any portion of the file being committed
- **What is the benefit of managed schema access?**
In regular schemas, the owner of an object (i.e. the role that has the OWNERSHIP privilege on the object) can grant further privileges on their objects to other roles. In managed schemas, the schema owner manages all privilege grants, including future grants, on objects in the schema. Object owners retain the OWNERSHIP privileges on the objects; however, only the schema owner can manage privilege grants on the objects.
- **Snowflake partner portal is accessible via which role?**
ACCOUNTADMIN role

Don't be shy, [get in touch with us!](https://www.mechanicalrock.io/lets-get-started)

![Mechanical Rock Logo](/img/mr-logo-dark-landscape.jpg)
