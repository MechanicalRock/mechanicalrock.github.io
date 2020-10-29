---
layout: post
title: DataOps with AWS and Snowflake
date: 2020-10-27
tags: devops, dataops, aws, snowflake, ci, cd, flyway
author: Zainab Maleki
image: img/blog/dataops/dataOps.jpg
---

<center><img src="/img/blog/dataops/dataOps.jpg" /></center><br/>

DevOps practices have been known, utilised and perfected over the past few years to allow speed and agility in the development life cycles. While all the advancements have happened in development lands, data domains have not kept pace. DataOps is a concept that allows applying DevOps practices to data life cycles to not only achieve speed and agility but also to deliver trusted and high-quality data.
Like DevOps, DataOps minimises manual interventions by codifying data related changes and deployment through automated CI/CD tools.
<br/>
In this blog post, I will show you how to create your Snowflake DataOps pipeline using AWS developer tools and Flyway.

<div style="background-color: #fff3cd ; border-color: #ffeeba; color: #856404; border-radius: .25rem; padding: .75rem 1.25rem;"><strong>Warning!</strong><br/>This is very hands-on blog post. Get ready to get your hands dirty &#128525;</div> <br/>

## Let's get Started:

To get started you will need to follow below steps:

# Step 1:
Download below repository as a zip folder. Once downloaded unzip it and cd into the folder<br/>
<a href="https://github.com/MechanicalRock/snowflake-dataops">Snowflake Dataops Repository</a>

This repo uses below services to implement an automated deployment cycle to Snowflake. All the pipeline and related infrastructure are created through code using AWS cloudformation.

* CodeCommit
* CodeBuild
* CodePipeline
* Cloudformation
* Flyway

# Step 2:
Create a RSA public and private key. Type below two commands in your command line
```
openssl genrsa 2048 | openssl pkcs8 -topk8 -inform PEM -out keys/rsa_key.p8 -nocrypt
openssl rsa -in keys/rsa_key.p8 -pubout -out keys/rsa_key.pub
```

# Step 3:
Create a snowflake service user and assign RSA public key to it
Note: Remove/exclude the header and footer of the private key
```
create user pipeline_sys_user;
alter user pipeline_sys_user set rsa_public_key_2='MIIBIjANBgkqh...';
```
# Step 4:
Store the password in aws secrets manager as plain text and name it "snowflake/pipeline_sys_user/secret"


# Step 5:
Open aws_seed.yaml file and update line number 404 with the arn to your secret manager password
```
  - <The arn to the secrets manager that holds Snowflake Password>
```

# Step 6:
Create other Snowflake resources including: SnowflakeMigrationDatabaseName, SnowflakeWarehouse and SnowflakeRole
```
CREATE DATABASE pipeline_db_migration_plan;

CREATE ROLE pipeline_role;
GRANT ROLE pipeline_role TO USER pipeline_sys_user;
GRANT ALL ON DATABASE pipeline_db_migration_plan TO ROLE pipeline_role;
CREATE WAREHOUSE pipeline_warehouse;
GRANT USAGE ON WAREHOUSE pipeline_warehouse TO ROLE pipeline_role;
GRANT ALL ON SCHEMA public TO ROLE pipeline_role;

// Ideally you only want to grant permissions that your pipeline requires. Granting SYSADMIN is not encouraged
grant role SYSADMIN to role pipeline_role;

```
# Step 7:
Update both parameter files pipeline/aws_seed-cli-parameters.json and aws_seed.json to match resources you created in snowflake

```
 "SnowflakeUsername": "pipeline_sys_user",
 "SnowflakeMigrationDatabaseName": "pipeline_db_migration_plan",
 "SnowflakeWarehouse": "pipeline_warehouse",
 "SnowflakeRole": "pipeline_role",
```

```
  {
    "ParameterKey": "SnowflakeUsername",
    "ParameterValue": "pipeline_sys_user"
  },
  {
    "ParameterKey": "SnowflakeWarehouse",
    "ParameterValue": "pipeline_warehouse"
  },
  {
    "ParameterKey": "SnowflakeMigrationDatabaseName",
    "ParameterValue": "pipeline_db_migration_plan"
  },
  {
    "ParameterKey": "SnowflakeRole",
    "ParameterValue": "pipeline_role"
  }
```

# Step 8:
Deploy




# References:
1. [Seeds of Inception - Seeding your Account with an Inception Pipeline](https://mechanicalrock.github.io/2018/03/01/inception-pipelines-pt1.html)
2. [Seeds of Inception - Sprouting some website goodness](https://mechanicalrock.github.io/2018/04/01/inception-pipelines-pt2.html)
3. [Seeds of Inception - Sharing the website goodness](https://mechanicalrock.github.io/2018/05/18/inception-pipelines-pt3.html)
4. [Seeds of Inception - Seeding a forest](https://mechanicalrock.github.io/2018/06/25/inception-pipelines-pt4.html)
5. [Seeds of Inception - Access all accounts](https://mechanicalrock.github.io/2018/07/31/inception-pipelines-pt5.html)
6. [Seeds of Inception - Initiating the Seeding](https://mechanicalrock.github.io//2018/08/27/inception-pipelines-pt6)
7. [Seeds of Inception - Global CloudTrail](https://mechanicalrock.github.io/2019/07/09/inception-pipelines-pt7.html)
