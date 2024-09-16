---
layout: postv2
title: "Deploying MWAA with CloudFormation Part 2"
description: "Experience and hurdles of deploying Amazon Workflows for Apache Airflow (MWAA) with CloudFormation"
date: 2024-09-16
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
AWS MWAA, or AWS Management Workflows for Apache Airflow, is an AWS managed service for deploying Apache Airflow. We recently deployed MWAA with CloudFormation for one of our clients to help orchestrate DBT, Snowflake, and other services.  In Part 1 ([Deploying MWAA with CloudFormation Part 1](https://blog.mechanicalrock.io/2024/08/12/deploying-mwaa-with-cloudformation-part1.html)), we talked about deploying MWAA with Public network access mode. In this post, we will discuss additional aspects worth keeping in mind when deploying MWAA in Private network access mode.

To access the CloudFormation template and instructions on how to deploy it, check out [our GitHub repo for this project](https://github.com/maciejtarsa/demo-aws-mwaa-private-network).

## Additional requirements and constraints ##

The client wanted the solution as secure as possible. While Public network access mode provides a lot of security out of the box, anyone with the URL for the MWAA web service can access that service’s page - even if they cannot authenticate into it. A way to avoid it, is to use Private network access mode. With that option, AWS creates a web server in the AWS service account and provides a VPC service endpoint that you can connect to.

As a result, you’ll need a mechanism for accessing that VPC service endpoint. The options are: 
- AWS Client VPN
- Linux Bastion Host
- Load Balancer

We decided to go with a Load Balancer. Our new setup required:
- additional Security Group
- Target Group
- HTTPS Listener
- Application Load Balancer
- ACM Certificate
- Route53 domain and record

We were able to use an existing ACM Certificate and add a Route53 record to an existing domain, but the code in the repo contains a simplified version using an IAM Certificate and works without needing a new domain

A very specific constraint we came across was that the role used for deploying the CloudFormation did not have permission to create VPC endpoints. In order to overcome this we expanded our Lambda to create those VPC endpoints for us.

## VPC Endpoints ##

By default, MWAA gets deployed with service managed VPC endpoints - that means MWAA will automatically create the VPC endpoints as needed. However, in our client's account the VPC endpoints were all centrally managed by another team. As an alternative - we used customer managed VPC endpoints - We had to create the required VPC endpoints ourselves. This could have been done via ClickOps or with AWS CLI but we wanted something automated. As a result - we expanded the Lambda previously used for adding tags to also create those VPC endpoints.

The Lambda was still called by a Custom Resource within the CloudFormation. As we used our Lambda to both create VPC endpoints and then delete them when the CloudFormation template is deleted, initially the endpoints were getting deleted each time the stack was updated.

Because a new custom resource was being created first - the Lambda was not creating the VPC endpoints - they existed already. But then a call to delete the old one resulted in the VPC endpoints being deleted and breaking the deployment altogether. We managed to remediate this by passing `PhysicalResourceId` as one of the parameters to the Lambda.

Code snippet below shows an example of how `PhysicalResourceId` can be passed between Lambda calls:
```python
def handler(event, context):
    "Lambda handler function"
    try:
        # we either extract the resource_id or create a new one
        resource_id = event.get("PhysicalResourceId", str(uuid4()))
        # logic to handle the request
        _cfnresponse.send(event, context, _cfnresponse.SUCCESS, {}, resource_id)
    except Exception as e:
        _cfnresponse.send(event, context, _cfnresponse.FAILED, {"Message": str(e)}, resource_id)
```
With this setup - the first call to Lambda creates a UUID which will be the resource id of the Custom Resouce. That id gets returned with any responses - any further requests to this Lambda will include that id and as a result the resource won't get replaced. For more detailed explanation, we will refer to one of Mechanical Rock's previous blog posts [which talks about the pain of Custom Resources](https://blog.mechanicalrock.io/2021/12/20/cdk-cr.html).

## Python Wheels ##

When using MWAA in Private network access mode, MWAA resources will not have any internet access when spinning up. That means if you need to install any dependencies via `requirements.txt` or in your startup scripts - you will need to provide Python wheels for those dependencies in your `plugins.zip` file. 

In our deployment, we encountered an interesting dependency conflict. We needed to use `dbt-snowflake` to connect to Snowflake, but we were using `astronomer-cosmos` to build our dbt dependency trees from dbt manifests. These two packages were conflicting when we tried installing them via `requirements.txt`. A solution was to install `dbt-snowflake` in the startup script and astronomer-cosmos in `requirements.txt`.

This made it slightly more complicated for the Python wheels - as we needed to combine them into a single plugins file. We achieved this by having a task in the Git Pipeline to build and combine the wheels and then push that file to S3.

A sample of how to do this in CLI can be found below:
```bash
mkdir -p wheels
pip3.11 download -r requirements/requirements-wheels.txt -d wheels/
pip3.11 download -r startup/requirements-startup-wheels.txt -d wheels/
mkdir -p plugins
zip -j plugins/plugins.zip wheels/*
rm -r wheels
```

With wheels in plugins file, you will need to point your `requirements.txt` in the direction of that file, e.g.:
```bash
--find-links /usr/local/airflow/plugins
--no-index

astronomer-cosmos
```

Please note, when adding new dependencies it is a good idea to first test them using [aws-mwaa-local-runner](https://github.com/aws/aws-mwaa-local-runner). It can stop you from getting your environment stuck due to dependency conflicts.

## Count of Worker Metric ##

MWAA sends logs and metrics to CloudWatch, which is useful as they’re all in a single service. There are a ton of useful metrics already in place, however there is at least one that we wanted but couldn't find - the count of additional workers. When creating an MWAA environment you can define your minimum number of workers (at least 1) and the maximum (25). When the workloads in your DAGs increase, additional workers are added. When you’re running your environment you want to see how the scale-ups and scale-downs are performing.

There’s no direct metric for that. AWS support suggested another metric that can be manipulated to get that value though. This is not particularly easy to find - there are some online posts that mention it, but it is not part of the official documentation. `CPUUtilisation` of the `AdditionalWorker` used with `Sample count` statistics for a one-minute period will produce the count of Fargate containers running. This will only work with these very specific settings.

Unfortunately, we’ve noticed that this solution is not consistent. When you set the time period of your dashboard to anything of 1 day or more - the displayed number is no longer correct. It would be nice to have this as an additional metric out of the box in the future.

## Conclusion ##

While deploying MWAA in Public network access mode is good enough for trying it out, in a corporate environment it’s generally best practice to use Private network access mode. Unfortunately, it does mean having to deploy a few extra resources and leads you to jump through a few extra hoops.

If you have any questions or would like to discuss MWAA further, please feel free to reach out to <a href="https://www.mechanicalrock.io/lets-get-started">Mechanical Rock</a>.
