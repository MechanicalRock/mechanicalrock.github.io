---
layout: post
title:  "Seeds of Inception - Part 2"
date:   2018-04-01
tags: aws continuous deployment cdn spa cloudfront
author: Pete Yandell
image: img/inception-pipelines/seed_germination.png
---

**Part 2 sprouting some website goodness** - A practical example for DevOps on AWS

![sprouting some website goodness]({{ site.url }}/img/inception-pipelines/seed_germination_2.png)

## What's The Problem

If you've read my [first post]({{ site.baseurl }}{% post_url 2018-03-01-inception-pipelines-pt1 %}) (and you have, haven't you), you either thought "that's absolute crap, why would I bother" or "hey, that's pretty neat, but what can I do with it". If you were the former, then avert your eyes because this post is targeted firmly at the latter.

In this post I will be covering how to extend an [Inception Pipeline](https://github.com/MechanicalRock/InceptionPipeline/tree/master) to do something useful. In this instance, it is creating the infrastructure to host a single page application. On the projects I'm currently involved with, this is always the first piece of infrastructure we need (well, after first inceptioning up the pipeline).

## What Technologies Are We Going To Use

* [AWS Certificate Manager](https://aws.amazon.com/certificate-manager/)
* [CloudFront](https://aws.amazon.com/cloudfront/)
* [Route 53](https://aws.amazon.com/route53/)
* [S3](https://aws.amazon.com/s3/)

## What Are The Prerequisites

The obvious first prerequisite is an existing [Inception Pipeline]({{ site.baseurl }}{% post_url 2018-03-01-inception-pipelines-pt1 %}). So, if you don't have one, jump across to the original post and create yourself one.

The next prerequisite is to manually create a couple of AWS resources:

1. The first one to create is an [AWS Certificate Manager](https://aws.amazon.com/certificate-manager/) managed SSL certificate in the `us-east-1` region. This is the only region that CloudFront will look for the certificate. So, unless you're creating the stack in `us-east-1`, you're going to need to create it yourself. This also gives you the option to verify the certificate by email or DNS (email is the only option when it is created via CloudFormation). You can find out more [here](https://docs.aws.amazon.com/acm/latest/userguide/gs-acm-request.html).
1. The second manual step is to ensure you have a Route 53 Hosted Zone. All that you need is the `HostedZoneId` as it is a parameter to the CloudFormation template discussed below.

An optional step, at least until September 2017, is to create a [DNS CAA record](https://blog.qualys.com/ssllabs/2017/03/13/caa-mandated-by-cabrowser-forum). Having the `CAA` record helps if you are attempting to get a good grade on services like [SSL Labs](https://www.ssllabs.com/).

Incidentally, using the CloudFormation template discussed in this post will get you an 'A' grade.

## How It All Works

What this template does for you:

* Creates an S3 bucket for holding the website files. These files do not need to be publicly accessible. In fact, we hide them away in the S3 Bucket Policy so that only CloudFront can serve them.
* Creates an S3 bucket to hold the CloudFront access logs.
* Creates a CloudFront distribution that sits in front of the S3 website bucket.
  * Creates a CloudFront origin access identity so that no-one can access the S3 bucket outside of CloudFront
  * Redirects `403` and `404` errors to the `index.html` page. This is needed for single page applications (like AngularJS/Angular) that create browser friendly URLs that do not map to S3 files. The high-level flow is the S3 gives `403`, CloudFront serves the `index.html` which kicks off the SPA that reads the URI and starts serving the right content.
  * Send access logs to an S3 bucket.
  * Uses an existing SSL certificate, and makes sure everything is accessing it via HTTPS
* Creates a DNS 'A' record in the specified Route 53 hosted zone. This hides the CloudFront domain behind your friendly domain name.

## Where Do I Get The Seed Files

The files are on the Part 2 branch in the [GitHub repository](https://github.com/MechanicalRock/InceptionPipeline/tree/post/part-2).

### What Are The Files

|File|Description|
|----|-----------|
|aws_infrastructure.yml|The magnum opus; the CloudFormation template that makes it all work|
|aws_infrastructure.json|These are the parameters used by the CloudFormation template during execution|
|aws_seed.yml|Gets a new CloudFormation deployment action snippet as described below which executes the `aws_infrastructure.yml` template.|

## Taking It For A Spin

Getting started is super simple and easy.

1. Add the following parameter to your `aws_seed.json` file. Obviously, you need to replace the value with the CloudFormation stack name of your choosing:

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
6. Commit the changes and push to CodeCommit.

If you sit and watch the pipeline execution, you'll notice its starts executing, realises there is a structural change and then restarts execution from the top. In my not-so-humble opinion, this is one of the best features of an Inception Pipeline; it just manages itself effortlessly.

## Wrapping Up

In this post I covered how you can extend an Inception Pipeline to do something useful. And in the next post, we'll take this idea one step further...
