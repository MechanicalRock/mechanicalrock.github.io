---
layout: post
title: Lake Formation
date: 2020-09-15
tags: aws cloudformation lakeformation glue data
image: img/../.jpg
author: Zainab Maleki, Simon Bracegirdle
---
<!-- <center><img src="/img/kinesis-analytics/realize-real-time-analytics.jpg" /></center><br/> -->

## Introduction

If you're building a data platform for your organisation, you may be wondering how to make data in one business area accessible to other areas. You want the technology to support the way your organisation works, or to even enable improvements in how you work.

For example, let’s say that you’re building an analytics solution and it may involve some dashboards. The dashboard aggregates data from data stores belonging to two other departments, as demonstrated in the diagram below:

__TODO Diagram here__

How can we solve this problem in the context of a data platform built on AWS? These data stores may be located in completely different AWS accounts and those accounts are owned by different teams.

As members of another department, how do we know what data is available in each of those stores, what the schema of that data is, and how do we get access to it?

If these sound like problems that’s relevant to you, then please keep reading! We'll go though the steps of building a cross-account resource sharing solution with AWS Lake Formation.

## Which AWS services can help?

One service that can help is AWS Glue – a managed service that enables crawling of data repositories to help assemble a data catalog, as well as providing tools for Extract, Transform and Load (ETL). But, one of the challenges with using AWS Glue is sharing the data catalog and the underlying repositories amongst AWS accounts.

It can be done using role-based access control with IAM roles and policies. However, it requires knowledge of the underlying storage mechanism (i.e. the S3 bucket name and path), which is a detail as a consumer we don’t necessarily want to know about.

This is where AWS Lake Formation can step in. AWS Lake Formation is another managed service that builds upon the capabilities of AWS Glue. What it offers is streamlined access management and easier cross-account sharing of resources.

https://docs.aws.amazon.com/lake-formation/latest/dg/sharing-catalog-resources.html

Lake Formation provides a simple granting mechanism that will be familiar to SQL experts. The target of these grants can be IAM identities, or it can be an AWS account or an entire AWS Organisation or OU. Once a resource is shared with the organisation or another account, Lake Formation integrates with AWS Resource Access Manager to automatically create a cross-account share. Lake Administrators in the target account will then see the shared catalog resources in their local data catalog.

## Scenario overview

If we recall, our goal is to share data across AWS accounts to enable a multi-data source analytics solution. Now that we have an idea of what services can be useful, let’s start to think about what our end to end technical solution looks like.

The source accounts will need:

- _Somewhere to store their data_ – We can store CSV files in an S3 Bucket
- _A way to catalog that data, so that the data is visible and schema is known_ – We can use a Glue Crawler to create tables in the Glue Catalog
- _A way to share that data to other AWS accounts_ – AWS Lake Formation grants, as we covered in the previous section

The consuming account will need:

- _A way to query the data in the source account_ – AWS Athena queries on the AWS Lake Formation resource links to the source account.

__TODO Diagram here__

## Setting up Lake Formation

To start with Lake Formation you will need to first assign a Lake Formation Administrator.  

__TODO Screenshot here__

LakeFormation administrator can either be an IAM user or SSO role. To Setup a SSO role as LakeFormation administrator you will need to deploy below CloudFormation code.

```yml
AWSTemplateFormatVersion: '2010-09-09'
Description: My data lake source

Resources:
  LakeformationSettings:
    Type: AWS::LakeFormation::DataLakeSettings
    Properties: 
      Admins: 
        - DataLakePrincipalIdentifier: arn:aws:iam::100000123000:role/aws-reserved/sso.amazonaws.com/AWSReservedSSO_AWSAdministratorAccess_56cabj890003333
```

To deploy the above CloudFormation stack, store the file as datalake.yml and run below command.

```sh
aws cloudformation create-stack --stack-name my-source-glue-stack --template-body file://datalake.yml --capabilities "CAPABILITY_NAMED_IAM"
```

The second step in setting up lake formation is to change the LakeFormation permission model from IAM to LakeFormation native grants. Unfortunately this setup is not available via CloudFormation. 

To enable LakeFormation Permissions go to settings, untick both “Use only IAM access control for new databases” and  “Use only IAM access control for new tables” and press save.

__TODO Screenshot here__

## Establish our source lake

In this blog post we are focusing on the cross-account sharing of Lake Formation, therefore the assumption is you have already ingested your data from the source into a s3 bucket.

Let’s get a starting point, which would be our source bucket and a Glue database for putting our catalog objects into. The following CloudFormation snippet will create those resources:

```yml
  MySourceDataStore:
    Type: AWS::S3::Bucket
    DeletionPolicy: Delete
    Properties:
      AccessControl: Private
      BucketName: !Sub 'my-source-data-store-${AWS::Region}-${AWS::AccountId}'
      BucketEncryption:
        ServerSideEncryptionConfiguration:
          - ServerSideEncryptionByDefault:
              SSEAlgorithm: AES256

  MySourceGlueDatabase:
    Type: AWS::Glue::Database
    Properties:
      CatalogId: !Ref AWS::AccountId
      DatabaseInput:
        Name: my-source-glue-database
        Description: String
```

Add the above code in your datalake.yml and run below update command.

```sh
aws cloudformation update-stack --stack-name my-source-glue-stack --template-body file://datalake.yml --capabilities "CAPABILITY_NAMED_IAM"
```

Let’s copy over some data into the bucket. To do that, download below CSV file and upload it into your bucket.

__TODO Link to CSV file__

You can upload the file using AWS CLI or from the S3 console:

```sh
aws s3 sync . s3://my-source-bucket
```

Now, let’s add the crawler and give it permission to read the bucket and write to the catalog:

```yml
MySourceCrawlerRole:
    Type: AWS::IAM::Role
    Properties:
      AssumeRolePolicyDocument:
        Version: '2012-10-17'
        Statement:
          - Effect: 'Allow'
            Principal:
              Service:
                - 'glue.amazonaws.com'
            Action:
              - 'sts:AssumeRole'
      Path: '/'
      Policies:
        - PolicyName: 'root'
          PolicyDocument:
            Version: '2012-10-17'
            Statement:
              - Effect: Allow
                Action: 
                  - 'glue:*'
                Resource: '*'
              - Effect: Allow
                Action:
                  - 'logs:CreateLogGroup'
                  - 'logs:CreateLogStream'
                  - 'logs:PutLogEvents'
                  - 'logs:AssociateKmsKey'
                Resource: '*'
              - Effect: Allow
                Action: 's3:ListBucket'
                Resource: !GetAtt MySourceDataStore.Arn
              - Effect: Allow
                Action: 's3:GetObject'
                Resource: !Sub
                  - '${Bucket}/*'
                  - { Bucket: !GetAtt MySourceDataStore.Arn }

  MySourceCrawler:
    Type: AWS::Glue::Crawler
    Properties:
      Name: my-source-data-crawler
      Role: !GetAtt MySourceCrawlerRole.Arn
      DatabaseName: !Ref MySourceGlueDatabase
      Targets:
        S3Targets:
          - Path: !Ref MySourceDataStore
      SchemaChangePolicy:
        UpdateBehavior: 'UPDATE_IN_DATABASE'
        DeleteBehavior: 'LOG'

  SourceCrawlerLakeGrants:
    Type: AWS::LakeFormation::Permissions
    Properties:
      DataLakePrincipal:
        DataLakePrincipalIdentifier: !GetAtt MySourceCrawlerRole.Arn
      Permissions:
        - ALTER
        - DROP
        - CREATE_TABLE
      Resource:
        DatabaseResource:
          Name: !Ref MySourceGlueDatabase

  DatalakeLocation:
    Type: AWS::LakeFormation::Resource
    Properties: 
      ResourceArn: !GetAtt  MySourceDataStore.Arn
      RoleArn: !Sub arn:aws:iam::${AWS::AccountId}:role/aws-service-role/lakeformation.amazonaws.com/AWSServiceRoleForLakeFormationDataAccess
      UseServiceLinkedRole: true
```

Add the above resources to your datalake.yml file and run an update stack command.

```sh
aws cloudformation update-stack --stack-name my-source-glue-stack --template-body file://datalake.yml --capabilities "CAPABILITY_NAMED_IAM"
```

When you have deployed the crawler, you should be able to see and run it in the Glue Console. 

__TODO Screenshot here__

Click on run and wait for your crawler to be completed.

Once your crawler runs successfully, you can go to tables menu item and see your table being generated.

__TODO Screenshot here__

## Cross-account grant

Once you have your Glue database and tables created, you will be able to mange the database access via Lake Formation. 

To enable cross-account access, you will need to add a LakeFormation grant with specifying the consumer account number

```yml
 CrossAccountLakeGrants:
    Type: AWS::LakeFormation::Permissions
    Properties:
      DataLakePrincipal:
        DataLakePrincipalIdentifier: "300000000015" // Consumer account number
      Permissions:
        - SELECT
      PermissionsWithGrantOption:
        - SELECT
      Resource:
        TableResource:
          DatabaseName: !Ref MySourceGlueDatabase
          Name: !Sub 'my_source_data_store_ap_southeast_2_${AWS::AccountId}'
          # TableWildcard: [] // WhildCard is not available via cloudformation yet 
```

## Setting up permissions in the consumer account

Login into the consumer account and setup LakeFormation base settings:

1) Setup a LakeFormation administrator:

```yml
AWSTemplateFormatVersion: '2010-09-09'
Description: My consumer data lake setup

Resources:
  LakeformationSettings:
    Type: AWS::LakeFormation::DataLakeSettings
    Properties: 
      Admins: 
        - DataLakePrincipalIdentifier: arn:aws:iam::300000000015:role/aws-reserved/sso.amazonaws.com/AWSReservedSSO_AWSAdministratorAccess_56cabj890003333
```

2) Turn on LakeFormation grants:

__TODO Screenshot here__

Now you need to create a resource link to the database in the data lake account. Unfortunately this is not available via CloudFormation yet.
In LakeFormation console, click on databases -> create database button 

Choose a name for your link db and select the shared database from the list. If you have shared a single table instead of all tables, database name does not appear here. In that case you will need to create a resource link table.

https://docs.aws.amazon.com/lake-formation/latest/dg/create-resource-link-table.html

__TODO Screenshot here__

Next you need to grant access to your role to be able to select from the table

__TODO Screenshot here__


## Testing the access in the consumer account

Open Athena from the console. 

Note: If you have never used Athena in your account, you will need to create a s3 bucket and set it as your query result location in settings for Athena.

Once you open Athena console, you should be able to see your like database and table schema. Now all there is to do is to query the table and make sure it returns the result successfully. 

__TODO Screenshot here__

## Summary

e.g. What did we build? What did we learn? How would we summarise our view of Lake Formation?
