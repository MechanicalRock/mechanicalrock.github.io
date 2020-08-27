---
layout: post
title: Automating Near-Realtime Kinesis Data Analytics
date: 2020-09-01
tags: aws kinesis realtime analytics cloudformation
image: img/../.jpg
author: Marcelo Aravena
---
<center><img src="/img/kinesis-analytics/picture.png" /></center><br/>

Building data streams for a data-pipeline in the cloud can be complex and expensive to run at scale, let alone implementing an efficient and manageable development process.. Today we will go through how to streamline your development and deployment of AWS Kinesis Analytics applications with DevOps best practices.  We will walk through how to build and deploy an application by using an automated CI/CD process end to end, all around a serverless infrastructure, so taking away the need to manage server workloads and administration, we just focus on our application code development with what data processing we want to apply. 

- Real-time analytics allows businesses to get insights and act on data immediately or soon after the data enters their system, allowing you run high performance data streaming which elastically scales to keep up with the volume of data being ingested. 
- Real time applicaton analytics answer queries within seconds. ... For example; real-time big data analytics uses data in financial databases to help make informed(data backed) trading decisions

## Kinesis Analytics Application Example: Stock Trades, simulating a stream of stock trades
The example application will be ingesting stock trades/pricing into a kinesis data stream which an Amazon Kinesis Data Analytics application will use a source to perform calculations near-realtime.  We will be using a python script to simulate the generation and streaming of data which will randomly generate stock trade prices every second during the trading hours into a kinesis data stream endpoint.  The data processing application will be using Apache Flink as the Kinesis Analytics Runtime option.  


## AWS Cloud Technology Stack and Environment
Amazon Kinesis Data Analytics is serverless, there are no servers to manage and no minumum fee or setup costs, just the resources the application uses when its running. It runs your streaming applications without requiring you to provision or manage any infrastructure. Amazon Kinesis Data Analytics automatically scales the infrastructure up and down as required to run your applications with low latency.

Everything is written and defined as code. Cloudformation being the Infrastructure as Code tool, along with GitHub, Codepipeline and CodeBuild to make up the CI/CD components.  The Kinesis Analytics Apache Flink Java application will then be compiled with the jar artifact published to an s3 bucket which is where Kinesis Analytics launches the Flink Java application from. Any updates to the applications pushed to the Github repo will trigger a new build and publish to S3, which Kinesis analytics will apply as an update to your streaming data-pipeline. 

The Java Flink application calls environment variables such as inputStreamName, outputStreamName, AWS Region and other kinesis properties, which are defined in the kinesis analytics cloudformation template(Under Environment Properties).  This is so that any changes that we meed to make to the environment, we dont need to re-build the Java application source, we just update the cloudformation template which the application makes reference of. 

## Performance, Throughput and Scaling capabilities of AWS Services used
### Kinesis Data Streams 
Max size of Payload = 1MB
- 1 Shard = 1MB/s Input, 1000 Puts/Sec. 2MB/s Output.
- 2 Shards = 2 MB/s Input, 2000 Puts/Sec. 4MB/s Output.

### Kinesis Firehose Delivery Stream:
- Autoscales the input from producers, no need to workout shards or throughput
- Buffering configurable by Kinesis Firehose.  Buffer Size and Buffer time(How long you want to keep the buffer in before persisting it)
- Transformations can be performed with Kinesis Firehose and Lambda before persisting to your data store/lake/warehouse. This method is good if your transformations are simple or you have small scale data-processing requirements which would be overkill for Kinesis Analytics (Apache Flink or SQL).

### Kinesis Analytics
Kinesis Analytics is a serverless way to analyze streaming data with on the fly ETL and data processing operations near real-time! Giving your data pipelines the legs it needs without having to worry about how many legs you need to provide it while also reducing the complexity that most other data pipelines come with. 

When taking the serverless journey with kinesis analytics, like many other serverless or managed service products on AWS you should have a good idea on your data throughput, storage and performance requirements to help you manage costs and scaling.  Kinesis Data Anaylytics provisions capacity as Kinesis Processing Units (KPU), where 1 KPU is equal to 1vCPU and 4GB Memory/RAM. For Apache flink applications where 1 KPU is used, you will get 50GB of storage to run your application which includes the use of checkpoints(having backups of the application) and temporary scratch storage you may want to build into your streaming ETL/Data Processing application.  Here is the pricing structure of Kinesis Data Analytics.  To calclulate your costs, you can refer to the AWS page: https://aws.amazon.com/kinesis/data-analytics/pricing/?nc=sn&loc=3

## Kinesis Analytics CI/CD Process

<center><img src="/img/kinesis-analytics/KinesisAnalytics-CICD.png" /></center><br/>

Application Source and Infrastructure as Code Repository templates for your reference can be found at: https://https://github.com/MechanicalRock/kinesis-analytics


## AWS Kinesis Analytics Architecture

<center><img src="/img/kinesis-analytics/KinesisAnalyticsArch.png" /></center><br/>
