---
layout: post
title:  "Seeds of Inception - Part 2"
date:   2018-04-01
categories: aws continuous deployment cdn SPA cloudfront 
author: Pete Yandell
image: img/inception-pipelines/seed_germination.png
---

**Part 2 srouting some website goodness** - A practical example for DevOps on AWS

[TODO - Insert pretty picture here](http://example.com)

## What's the Problem


## What Technologies Are We Going To Use

* [AWS Certificate Manager](https://aws.amazon.com/certificate-manager/)
* [CloudFront](https://aws.amazon.com/cloudfront/)
* [Route 53](https://aws.amazon.com/route53/)
* [S3](https://aws.amazon.com/s3/)

## What Are The Prerequisites

The obvious first prerequisite is to have an existing [Inception Pipeline](https://mechanicalrock.github.io//aws/continuous/deployment/2018/03/01/inception-pipelines-pt1). So if you don't, jump across to the original post and create yourself one.

The next prerequisite is to manually create a couple of AWS resources:

1. The first one to create is an ACM SSL certificate in the `us-east-1` region. This is the only region that CloudFront will look for the certificate. So unless you're creating the stack in `us-east-1`, then you're going to need to create it yourself. You will also have the option to verify the certificate by email or DNS (email is the only option when it is created via CloudFormation).
1. The second manual step is to ensure you have a Route 53 Hosted Zone. All that you need is the HostedZoneId as it is a parameter to the CloudFormation template discussed below.

An optional step, at least until September 2017, is to create a [DNS CAA record](https://blog.qualys.com/ssllabs/2017/03/13/caa-mandated-by-cabrowser-forum). Having the `CAA` record helps if you are attempting to get a good grade on services like [SSL Labs](https://www.ssllabs.com/).

Incidentaly, using the CloudFormation template discussed in this post will get you an 'A' grade.

## How It All Works

What this template does for you is:

* Creates an S3 bucket for holding the website files. These files do not need to be publically sccessible. In fact, we hide them away so that only CloudFront can serve them.
* Creates an S3 bucket to hold the CloudFront access logs.
* Creates a CloudFront distribution that sits in front of the S3 website bucket.
  * Creates a CloudFront origin access identity so that no-one can access the S3 bucket outside of CloudFront
  * Redirects `403` and `404` errors to the `index.html` page. This is needed for single page applications (like AngularJS/Angular) that create browser friendly URLs that do not map to S3 files. The high-level flow is the S3 gives `403`, CloudFront serves the `index.html` which kicks off the SPA that reads the URI and starts serving the right content.
  * Send access logs to an S3 bucket.
  * Uses an existing SSL certificate, and makes sure everything is accessing it via HTTPS
* Creates a DNS 'A' record in the specified Route 53 hosted zone. This hides the CloudFront domain behind your friendly domain name.

## Where Do I Get The Seed Files

TODO - Show you the files!

### What Are The Files

|File|Description|
|----|-----------|
|aws_infrastructure.yml|The magnum opus; the CloudFormation template that makes it all work|
|aws_infrastructure.json|These are the parameters used by the CloudFormation template during execution|
|aws_seed.yml|Gets a new CloudFormation deployment action snippet as described below which executes the `aws_infrastructure.yml` template.|

## Taking It For A Spin

Getting started is super simple and easy. 

1. Add the following parameter to your `aws_seed.json` file. Obviously you need to replace the value with the CloudFormation stack name of your choosing:

    ```json
    "StageAdministerInfrastructureStackName": "@@StageAdministerInfrastructureStackName@@"
    ```

2. Add the following snippet to the `Parameters` section of your `aws_seed.yml`:

    ```yaml
    StageAdministerInfrastructureStackName:
      Type: String
      Description: The name of the stack that administers the website infrastructure
    ```

3. Add the following snippet under the `AdministerPipeline` stage in the CodePipeline resource in `aws_seed.yml`:

    ```yaml
    - Name: 'AdministerInfrastructure'
      Actions:
        - Name: 'AdministerWebsiteInfrastructure'
          ActionTypeId:
            Category: Deploy
            Owner: AWS
            Provider: CloudFormation
            Version: '1'
          Configuration:
            ActionMode: REPLACE_ON_FAILURE
            RoleArn: !GetAtt [CloudFormationDeployActionRole, Arn]
            StackName: !Ref StageAdministerInfrastructureStackName
            TemplateConfiguration: !Join ['', [!Ref RepositoryName, 'Source', '::aws_infrastructure.json']]
            TemplatePath: !Join ['', [!Ref RepositoryName, 'Source', '::aws_infrastructure.yml']]
          InputArtifacts:
            - Name: !Join ['', [!Ref RepositoryName, 'Source']]
          RunOrder: '10'
    ```

4. Copy the `aws_infrastructure.yml` and `aws_infrastructure.json` into the same folder as `aws_seed.yml`
5. Replace the parameter values in `aws_infrastructure.json` with appropriate values.

## Wrapping Up

## My misc stuff

An all-in-one infrastructure template for hosting a static website
Runs as its own stage within the same account
Used as the basis of the next article
Great for all the SPAs out there that don't need a full blown server
Bits and pieces are skattered across the web on 'how to'; but are usually console driven.
Bit of a learning/teaching moment for me to make sure I actually know WTF I'm talking about.
Secured S3 access behind CF
Al(most) fully infra-as-code
need to do in two parts:
1. request the certificate (wait for email and then manually approve)
2. apply the rest of the template

Need to manually add in the 'CAA' DNS record ()
Run the various website security checks against the site to see how it stacks up!


extending the pipeline to do something useful
showing how the pipeline can be extended
cover off a task that most projects need for hosting an SPA