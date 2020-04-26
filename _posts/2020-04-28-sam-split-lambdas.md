---
layout: post
title: How To Split Functions From Your SAM API Definition
date: 2020-04-28
tags: serverless aws lambda javascript
author: Matthew Tyler
image: /img/something.png
---

<center><img src="/img/something.png" /></center>
<br/>

# Introduction
A few people have asked whether it’s possible to split lambda functions from SAM templates when creating lambda-backed API Gateway’s. The answer to that question is a little bit complicated.

Are you defining lambda functions using the “aws::serverless::function” type, and are intending to use the ‘event’ property to hook these functions up? The answer in this case is unfortunately “no”. The macro transformation, which is called via the “Transform: AWS::Serverless-2016-10-31” directive at the top, does not work this way. It relies on being able to resolve the presence of both the API resource and the function resource from within the same template. It needs to do this to be able to modify the API resource with additional details about the lambda functions. Other function events operate in the same manner.

If either of these resources is missing it cannot do anything. CloudFormation cannot descend into the execution context of nested templates in order to make the necessary modifications. Nested templates simply do not work that way. In spite of how much easier SAM makes it to do Infrastructure-as-Code, in reality it is still limited by the underlying CloudFormation service. CDK has similar limitations.

However, this does not mean that defining lambda functions outside of the API resource context is completely impossible. So how do you do it?

The trick is to use OpenAPI documents to define the API. In doing so, it is possible to define the API in the parent stack, and reference lambda functions from correctly configured nested stacks.

Let’s run through a quick example (You can find the complete code example [here](https://github.com/matt-tyler/simple-node-api-split-lambda)).

First, define the lambda function in it's own template.

```yaml
AWSTemplateFormatVersion: '2010-09-09'
Transform: AWS::Serverless-2016-10-31
Resources:
  HelloWorld:
    Type: AWS::Serverless::Function
    Properties:
      CodeUri: src/
      Handler: app.lambdaHandler
      Runtime: nodejs12.x

Outputs:
  HelloWorldFunctionArn:
    Description: API Gateway endpoint URL for Prod stage for Hello World function
    Value: !GetAtt HelloWorld.Arn
```

You'll need to ensure you output any/all lambda function ARNs. You will need to pass the function ARNs to resources defined in the parent template. Let's look at that now.

```yaml
AWSTemplateFormatVersion: '2010-09-09'
Transform: AWS::Serverless-2016-10-31
Resources:
  LambdaTemplate:
    Type: AWS::Serverless::Application
    Properties:
      Location: ./template-function.yaml

  Api:
    Type: AWS::Serverless::HttpApi
    Properties:
      CorsConfiguration:
        AllowCredentials: true
        AllowHeaders: "*"
        AllowMethods:
          - GET
          - POST
          - DELETE
          - HEAD
        AllowOrigins:
          - https://*
      DefinitionBody:
        'Fn::Transform':
          Name: AWS::Include
          Parameters:
            Location: api.yaml

  HelloWorldLambdaPermission:
    Type: AWS::Lambda::Permission
    Properties:
      Action: lambda:InvokeFunction
      FunctionName: !GetAtt LambdaTemplate.Outputs.HelloWorldFunctionArn
      Principal: apigateway.amazonaws.com
      SourceArn: !Sub "arn:aws:execute-api:${AWS::Region}:${AWS::AccountId}:${Api}/*/GET/"

Outputs:
  Endpoint:
    Description: API Gateway endpoint URL for Prod stage for Hello World function
    Value:
      Fn::Sub: https://${Api}.execute-api.${AWS::Region}.amazonaws.com/
```

Note that we are using 'AWS::Serverless::Application' resource to reference the nested template. When using the 'sam package' command, sam will upload the template to an S3 bucket and rewrite the reference appropriately. When deploying the packaged template, the referenced template will be instantiated as a nested stack. As the nested template in this example is using a CloudFormation macro, you will need to ensure that you enable 'CAPABILITY_AUTO_EXPAND' when deploying the template.

Now let's inspect the 'Api' resource, of which the most important aspect is the 'DefinitionBody' property. This references our OpenAPI document which in turn references our lambda function. I've extracted the most important part.

```yaml
paths:
  /:
    get:
      operationId: HelloWorld
      x-amazon-apigateway-integration:
        $ref: '#/components/x-amazon-apigateway-integrations/helloWorld'
      responses:
        "200":
          description: "Hello World!"
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/Message"
        "400":
          description: "Bad Request Exception"
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/BadRequestException"
        "500":
          description: "Internal Server Error"
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/InternalServerErrorException"
components:
  x-amazon-apigateway-integrations:
    helloWorld:
      type: aws_proxy
      httpMethod: POST
      uri:
        Fn::Sub: "arn:aws:apigateway:${AWS::Region}:lambda:path/2015-03-31/functions/${LambdaTemplate.Outputs.HelloWorldFunctionArn}/invocations"
      passthroughBehavior: when_no_templates
      payloadFormatVersion: 2.0
```

Here we define the helloWorld operation, which references a lambda integration that is defined in the components section. When the template is instantiated, it constructs the 'uri' to reference the lambda function ARN that was output from the nested template. When the API resource is created, it is then able to 'wire up' to the lambda function.

There is one more thing that needs to be done; Permissions must be granted on the lambda function to allow it to be invoked by API Gateway. This can be done with following snippet.

```yaml
  HelloWorldLambdaPermission:
    Type: AWS::Lambda::Permission
    Properties:
      Action: lambda:InvokeFunction
      FunctionName: !GetAtt LambdaTemplate.Outputs.HelloWorldFunctionArn
      Principal: apigateway.amazonaws.com
      SourceArn: !Sub "arn:aws:execute-api:${AWS::Region}:${AWS::AccountId}:${Api}/*/GET/"
```

I imagine most of the folks trying to do this are probably trying to define all the lambdas for a particular resource in a particular template. E.g. if I was writing an application that enabled people to post comments to different message boards (like a forum), I may want to locate all the lambda functions for messages and message boards in separate templates.

Now it’s obviously a lot of additional work if you are not using OpenAPI currently to build your SAM-powered API’s. That said, if you aren’t using OpenAPI I would suggest reconsidering your position. APIs are fundamentally designed to be consumed by multiple clients; if you only ever intend your API to be consumed by one application you may not need an API. Publishing an OpenAPI specification for your API gives you and your clients a complete reference that can be used to generate various helpful assets; from documentation to complete SDK’s for various languages.

The negative in all this is that you cannot use the events property in the serverless function definition to define the API, which can be pretty convenient. On the other hand that doesn’t mean you have lost all the usefulness of the SAM template format. You can still use other useful elements of the definition such as easy function aliasing, canary deployments and the SAM template policy mechanism.

Seeking a source of serverless support? [Contact Mechanical Rock to Get Help!](https://www.mechanicalrock.io/lets-get-started)