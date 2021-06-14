---
layout: post
title: Building a Serverless RPC API on AWS: A simple RPC service with help from Twitch
date: 2021-12-25
tags: rpc grpc twirp aws api protobuf
author: Matt Tyler
---

In the preceding installment, I discussed some of the popular API flavours, and settled on attempting to build an RPC style API. After a brief look around at some RPC frameworks (including GRPC) - I decided to go with [Twirp](https://github.com/twitchtv/twirp) by Twitch.

It has a fair amount in common with gRPC, e.g. the use of protobufs - but doesn’t have a dependence on bidirectional streaming or HTTP 2. This make it easier to use from a lambda function, and this is useful to me because it requires less infrastructure to run. To stand up a GRPC service, I would need to use Fargate and a host of additional VPC related components.

There are few things we will need to do:

- Install Go & AWS SAM.
- Install Protobuf
- Scaffold the repository
- Define our service
- Generate the code
- Implement our service
- Integrate with Lambda/API Gateway
- Deploy the service with AWS SAM

It probably goes without saying but you will need an AWS Account if you wish to deploy the sample service. The following article is available to help with this you require it -> [How do I create and activate a new AWS account?](https://aws.amazon.com/premiumsupport/knowledge-center/create-and-activate-aws-account/)

# Install Go

This steps involved will vary depending on your Operating System. For those on Linux or OSX, this will probably mean installing it via your package manager. For all my examples I will be using Go 1.16.x, but any version with Go Module support should be fine. Further Go installation instructions are available [here](https://golang.org/doc/install).

# Install AWS SAM

I'm going to deploy the service using AWS SAM out of pure convenience. To follow along you will need to download the AWS SAM CLI, for which you can find instructions [here](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/serverless-sam-cli-install.html). I recommend going through the "Getting Started" section to ensure SAM is able to interact with your AWS Account.

# Install Protobuf

You will need a compatible protobuf compiler in order to generate code from the protobuf IDL. You will need a version 3 compiler. The GRPC documentation details [how to install protoc](https://grpc.io/docs/protoc-installation/).

# Scaffold the Repository

---

Don't be shy, [get in touch with us!](https://www.mechanicalrock.io/lets-get-started)

![Mechanical Rock Logo](/img/mr-logo-dark-landscape.jpg)
