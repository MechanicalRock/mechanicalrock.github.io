---
layout: post
title: Building a Serverless RPC API on AWS: REST vs RPC
date: 2021-12-25
tags: rest rpc grpc aws api
author: Matt Tyler
---

There are many different ways to design an API but do any amount of searching and you will find that in 2021 there are three that dominate the discussion 

- REST (REpresentational State Transfer),
- RPC (Remote Procedure Call), and, 
- GraphQL (Graph Query Language).

They have an awful lot in common; 
- There are many tools and frameworks that implement each,
- You can find various examples of software companies implementing new APIs in each today, and,
- JSON-over-HTTP is pretty commonly used for all three.

If you want examples of each type. A large number of AWS APIs are implement via RPC - DynamoDB being a good example of an RPC API. GitHub provides a fairly idiomatic REST API as well as a GraphQL API. Kubernetes makes fairly heavy use of RPC style APIs via GRPC.

I recently spent a lot of time building a set of APIs to perform some infrastructure related tasks. In this case I went with what I’ve typically done which has included:

- Designing the API using the OpenAPI document specification, and,
- Using the specific to generate code for both the client and backend, and,
- Using the server stubs to implement the API.

The tooling in the OpenAPI ecosystem can be fairly inconsistent in terms of quality among different languages. I generally found the typescript tooling to be fairly lacking, nor was it documented particularly well. Despite this my team and I was able to make it work and paper over any cracks.

But this did leave me wanting to explore what other options were out the in terms of designing, generating, and implementing APIs across different languages and frameworks.

My first port of call was to inspect ["Smithy"](https://awslabs.github.io/smithy/index.html). Smith is an AWS IDL, similar in some ways to OpenAPI, which AWS is using to generate code for the newer AWS SDK’s. The v3 Javascript SDK and v2 Go SDK both use Smithy to generate code. Personally I find it a lot easier to read - similar to protobuf definitions, but a tad more pleasing to the human eye.

```
namespace example.weather

service Weather {
    version: "2006-03-01",
    resources: [City],
    operations: [GetCurrentTime]
}

resource City {
    identifiers: { cityId: CityId },
    read: GetCity,
    list: ListCities,
    resources: [Forecast],
}
```

Whilst I ultimately determine that Smithy did not currently meet my needs, it found it useful in directing my attention to alternatives. As I spent a lot of my reading AWS service specifications, I did notice the bulk of them are RPC APIs and felt this warranted more of my attention. (If you are interested in Smithy definitions for AWS services, you can find some of them [here](https://github.com/aws/aws-sdk-js-v3/tree/main/codegen/sdk-codegen/aws-models).)

This eventually led me to the following site - [apisyouwonthate.com](apisyouwonthate.com) - which included this particular flow chart in the article ["Picking the right API Paradigm"](https://apisyouwonthate.com/blog/picking-the-right-api-paradigm).

![Choosing an API Paradigm](/img/fed-talk/s01e03/cover-ep3-740.png)

Slight GraphQL bashing aside, I noticed my APIs shared the following qualities

- Most communication is backend-to-backend
- Most interactions are internal e.g. not exposed directly to an end-user
- Mostly executing independent commands

The features that a REST API provides, such as compatibility with various additional features of HTTP (like caching) were simply not required - or only required in special circumstances. Therefore it probably made sense for at least some the APIs to be implemented in a RPC-ish manner. So with that knowledge in hand I decided it would make sense to experiment with some tooling in the RPC world.

As gRPC is the arguably the most popular RPC framework at the moment it was my first port of call. However, GRPC has a fairly hard requirement on HTTP2 and bidirectional streaming, which clashed with my secondary requirement of wanting to deploy this service via API Gateway and Lambda. I have no requirement for streaming support and wanted a simpler request-response model so the search began for something more suited for my needs.

I eventually came across a tweet from Fatih Arslan (creator of Vim-Go), which mentioned he had used an RPC framework by Twitch - called Twirp. It is similar to GRPC in that it uses protobuf, but it is capable of running via HTTP 1.1 with a request/response model and discards bidirectional streaming.

https://twitter.com/fatih/status/1399655049995993091

With that in hand I know had something concrete with which to begin my evaluation of building an RPC style API serverlessly. And while I'm at it, I'll introduce OpenTelemetry, and specifically how to use the AWS Distro for OpenTelemetry in your projects - because it's a pretty big step up from plain old Xray.

So join me in this blog series where I will -

- Define an RPC service via Twirp and Protobuf in Golang, and deploy it to AWS
- Generate validation handling code from the specification, and test this E2E
- Introduce the AWS Distro for OpenTelemetry (ADOT)
- Show how to construct a lambda container of the application, and add OpenTelemetry support.
- Show how to instrument this application using the AWS Distro for OpenTelemetry

Until next time!

---

Don't be shy, [get in touch with us!](https://www.mechanicalrock.io/lets-get-started)

![Mechanical Rock Logo](/img/mr-logo-dark-landscape.jpg)
