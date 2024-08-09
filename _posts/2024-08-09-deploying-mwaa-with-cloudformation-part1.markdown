---
layout: postv2
title: "Deploying MWAA with CloudFormation Part 1"
description: "Experience and hurdles of deploying Amazon Workflows for Apache Airflow (MWAA) with Cloud Formation"
date: 2024-08-12
highlight: monokai
image: /img/mwaa/airflow_mwaa.png
author: Maciej Tarsa
tags:
  [
    aws mwaa,
    apache airflow,
    Orchestration,
    aws,
    aws cloudformation
  ]
---
AWS MWAA, or AWS Management Workflows for Apache Airflow, is an AWS managed service for deploying Apache Airflow. Generally - a relatively straightforward service. Not the cheapest option, but makes a lot of the management and provisioning easier.

We recently deployed MWAA with Cloud Formation for one of our clients to help orchestrate DBT, Snowflake, and other services. This blog post is a summary of our experience in deploying MWAA with public network access and some of the tips and tricks we learned along the way. In Part 2 we will discuss additional aspects related to private networking setup.

To access the CloudFormation template and instructions on how to deploy it, check out [our GitHub repo for this project](https://github.com/maciejtarsa/demo-aws-mwaa-public-network).

## Deployment ##

MWAA requires the follwing resources before deployment:
- existing VPC with 2 public and 2 private subnets
- versioned S3 Bucket which will store your dags and other files
- Security Group which will be assigned to your MWAA environment
- IAM execution role - this will determine what permissions your environment has

Once these are in place, an MWAA environment is a single resource which deploys all that’s needed to run Apache Airflow into an AWS managed service account - all you see in your AWS account is an environment under MWAA service.

Getting this basic setup is easy to achieve. It may take a bit of time though - deploying an MWAA environment takes 20-30 minutes. Any subsequent updates to that environment (even just changing the maximum number of workers), will require additional time. Depending on what is being changed, this could be anything from 10 to 30 minutes.

## MWAA Resource Tagging ##

We managed resource tags at a template level, tags were automatically applied to all resources within the template by specifying them when deploying. For example running something like:

```bash
aws cloudformation create-stack --stack-name my-stack \
--template-body file://template.yml --profile $AWS_PROFILE \
--tags \
 Key=Project,Value=Personal \
 Key=Stage,Value=Dev
```

By creating a CloudFormation stack in this way, tags `Project` and `Stage` would get applied to all resources within the CloudFormation stack. But - not for the MWAA resource. This does not work for resource type `AWS::MWAA::Environment`. However, tags would get applied to MWAA if they are directly specified for the MWAA resource, for example:

```yaml
Resources:
AirflowEnvironment:
    Type: AWS::MWAA::Environment
    …
    Tags: 
        Project: Personal
        Stage: Dev
```

This works - though boilerplate - as now we need to both pass the tags at stack level and provide them in the CloudFormation template for this specific resource - leading to potential duplication and having to update them in 2 places.

But - there’s more…

MWAA Environment resource spins up an MWAA environment, but also a few additional resources. Depending on your configuration, you might have:
- up to 5 CloudWatch Log Groups, 1 each for DAG Processing, Scheduler, Task, Web Server, Worker
- 1 or 2 VPC endpoints - 1 for database (always) and 1 for webserver (in private networking mode)

These resources will not have tags applied.

What are the options? One is to go to the AWS Management Console and apply them with ClickOps; another to do it via CLI, but in both cases we are drifting from source control.

Lambda to the rescue - we used a Lambda function to tag these resources post MWAA creation. AWS is aware of this issue with tagging - we logged a feature request with their support team - so it might get better in the future.

As we work a lot with Terraform, we tested how this tagging works with Terraform. If you define your default tags as part of the provider, they will get applied to the MWAA environment - so this looks to be a CloudFormation specific problem. Unfortunately, those additional resources mentioned earlier do not get tagged with Terraform either - so you’ll end up with VPC Endpoints and CloudWatch Log Groups that are not tagged.

## Lambda Custom Resource ##

In order to call the Lambda we created as part of the CloudFormation deployment, we needed to use custom resources. But there are some aspects of custom resources which make them tricky to work with.

If you’re going to call a Lambda from a custom resource, you need to be very careful about how you handle incoming requests and you MUST send a response in a very specific format. If you don’t - your CloudFormation will stall until it times out, timeout is 60 minutes by default - lower that straight away! This can also easily happen if you’re not catching your errors effectively. This could get you stuck pretty easily.

Code snippet below shows an example of how we can handle the response in Lambda, whether successful or not.
```python
def handler(event, context):
    "Lambda handler function"
    try:
        # logic to handle the request
        _cfnresponse.send(event, context, _cfnresponse.SUCCESS, {})
    except Exception as e:
        _cfnresponse.send(event, context, _cfnresponse.FAILED, {"Message": str(e)})
```

There is an excellent blog post on the Mechanical Rock website about [the pain of using custom resources in CloudFormation](https://blog.mechanicalrock.io/2021/12/20/cdk-cr.html), which proposes an alternative solution with CDK.

But if avoiding CloudFormation is not an option, bear the above tips in mind.

## Conclusion ##

MWAA can be a great addition to provide managed orchestration of your workloads without much fuss of managing your own resources. It can help you move away from having to manually run tasks and integrates well with other services, both inside and outside of AWS. However, it does at times feel like a lesser cared for service by AWS and it would be great to see some of the hurdles mentioned in this post removed in the future. Stay tuned for Part 2 in which we will discuss additional aspects related to private networking setup.

If you have any questions or would like to discuss MWAA further, please feel free to reach out to <a href="https://www.mechanicalrock.io/lets-get-started">Mechanical Rock</a>.
