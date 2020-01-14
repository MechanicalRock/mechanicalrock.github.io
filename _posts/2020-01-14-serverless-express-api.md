---
layout: post
title: Build & Deploy a Serverless Express API to AWS
date: 2020-01-14
tags: javascript tutorial serverless sam
author: Matthew Tyler
image: img/serverless-express.png
---

<center><img src="/img/serverless-express.png" /></center>
<br/>

# Introduction

Released in 2015, AWS API Gateway allows developers to build and publish APIs that can be consumed by clients over public internet and virtual private cloud networks. At Re:Invent 2019, AWS announced a significant addition to the service that they have called "HTTP APIs". The HTTP API is a direct response to customers who wanted to build simple HTTP backed API's, who did not need the complete feature set of API Gateway. The new HTTP API service is perfect for hosting Lamba backend applications that are written in popular HTTP Frameworks like Express, Flask, .NET etc. This wouldn't be my first choice when building a new application, and isn't how we typically build applications at Mechanical Rock - but it's certainly going to be useful for a particular set of developers, so why not take a look?

# How is this different from the existing API Gateway

This existing API Gateway has A LOT of features. Someone who wants to build an application that proxies requests to a lambda-hosted web framework probably won't need most of those features. By removing those features, we get a simpler service to work with, at improved performance and reduced cost. AWS estimates those migrating to HTTP API's from API Gateway can expect a 70% cost reduction and faster response times.

# Let's create a hello world app with SAM!

Let's build a very simple guestbook API using Express. The guestbook will be used to record a comment, the name of the person who made the comment, and the time the comment was made. We will add an additional endpoint that can retrieve all the comments that have been made, starting with the latest comment. We will use S3 to store the comments. Note that while I could use an RDBMS or NoSQL database for this, as I only have a requirement for a pageable list this is overkill. If I needed to retrieve comments by an ID or some other attribute, then I would start looking at storage solutions with flexible options for retrieving data. (note: this makes deleting the API a bit of a pain - because unless the comments bucket is empty the stack will fail to delete. Keep in mind that you will need to delete the bucket independently of the stack when you remove this application from your account).

We will build this all using the AWS Serverless Application Model (SAM).

The complete (finished) example is available [here](https://github.com/matt-tyler/simple-node-api).

# Setting up your environment for AWS development

Before we get started we will need to install a few tools to do this. We will need to install the aws-cli, aws-sam-cli, and configure our AWS profile. If you have already done this you can skip this section

!!! install docker for local invoke

1. Install the aws-cli tools if you have not already.

   Documentation on how to install the aws-cli is available (here)[https://docs.aws.amazon.com/cli/latest/userguide/install-cliv1.html]. Details instructions for particular platforms are provided at the end of the page.

2. Then install the aws-sam-cli.

   You can find instructions on how to do this for all major platforms (here)[https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/serverless-sam-cli-install.html]

3. Configure your profile to point to your AWS account.

    You will need to do this to ensure that the SAM tooling can make API calls on your behalf to your AWS environment. For test purposes using your personal profile is usually fine.

    (This)[https://medium.com/blechatech/how-to-setup-aws-credentials-for-new-code-cc80c44cc67] article does a reasonable job of explaining what is required, as does the [official documentation](https://github.com/aws/aws-cli) for the AWS CLI.

    The way I typically test to see whether things are working is to create an S3 bucket in my account - I will then issue an `aws s3 ls` call. If the bucket I made is returned in the call, I know that everything is set up correctly.

4. Ensure you have nodejs 12 installed.

# Let's scaffold out a SAM Application

1. First create a directory to that will contain the project.

    ```bash
    mkdir -p projects && cd projects
    ```

2. Now we can initialize the project using the AWS SAM CLI.

    ```bash
    sam init --no-interactive \
        --runtime nodejs12.x \
        --dependency-manager npm \
        --output-dir . \
        --name simple-node-api \
        --app-template hello-world
    ```

This will generate the following structure:

```
.
├── README.md
├── events
│   └── event.json
├── hello-world
│   ├── app.js
│   ├── package.json
│   └── tests
│       └── unit
│           └── test-handler.js
└── template.yaml
```

Now we can start working on our implementation!

# Get Express JS working inside the handler

Our code for the application is stored inside `hello-world/app.js`. At the moment, it is pretty slim, so so change it to the below.

```javascript
const serverless = require('serverless-http');
const express = require('express');

const app = new express();

app.get('/', (req, res) => {
    res.send('Hello World')
});

module.exports.lambdaHandler = serverless(app);
```

This is about as simple as it can get. We'll add the logic for our guestbook application in a minute - we'll first get this deployed and ensure it works as is first with our 'hello world' response.

# Make a Simple SAM Template

A sample is provided under `template.yaml`. It is mostly fine, but we will need to make a few changes. Use the following modified template instead.

```yaml
AWSTemplateFormatVersion: '2010-09-09'
Transform: AWS::Serverless-2016-10-31
Description: >
  simple-node-api
  Sample SAM Template for simple-node-api

Globals:
  Function:
    Timeout: 3

Resources:
  ExpressBackend:
    Type: AWS::Serverless::Function
    Properties:
      CodeUri: hello-world/
      Handler: app.lambdaHandler
      Runtime: nodejs12.x
      Events:
        HelloWorld:
          Type: HttpApi
          Properties:
            Path: /{proxy+}
            Method: get

Outputs:
  HelloWorldApi:
    Description: API Gateway endpoint URL for Prod stage for Hello World function
    Value:
      Fn::Sub: https://${ServerlessHttpApi}.execute-api.${AWS::Region}.amazonaws.com/
  ExpressBackendFunction:
    Description: Express Backend Lambda Function ARN
    Value: !Sub ExpressBackend.Arn
  ExpressBackendIamRole:
    Description: Implicit IAM Role created for Hello World function
    Value: !Sub ExpressBackendFunctionRole.Arn

```

We don't really need to change much. All that needed to be done was 
- modifying the event type to `HttpApi`
- change the path to `/{proxy}+`. This will ensure all get requests are passed to the lambda request, regardless of their path.
- Change the output to reference `${ServerlessHttpApi}` instead of `${ServerlessRestApi}`

# Build, Test, & Deploy the App

Firstly, we execute `sam build` from our base directory. This should result in the following output from the sam-cli.

```bash
Building resource 'ExpressBackend'
Running NodejsNpmBuilder:NpmPack
Running NodejsNpmBuilder:CopyNpmrc
Running NodejsNpmBuilder:CopySource
Running NodejsNpmBuilder:NpmInstall
Running NodejsNpmBuilder:CleanUpNpmrc

Build Succeeded

Built Artifacts  : .aws-sam/build
Built Template   : .aws-sam/build/template.yaml

Commands you can use next
=========================
[*] Invoke Function: sam local invoke
[*] Deploy: sam deploy --guided
```

Assuming that you have docker installed, you can use `sam local invoke` as a quick test. If you do, your output will look like this;

```bash
▶ sam local invoke
Invoking app.lambdaHandler (nodejs12.x)

Fetching lambci/lambda:nodejs12.x Docker container image......
Mounting /Users/matt.tyler/projects/simple-node-api/simple-node-api/.aws-sam/build/ExpressBackend as /var/task:ro,delegated inside runtime container
START RequestId: 6bb44d66-e096-124b-5ce9-5f1f1fea88f9 Version: $LATEST
2020-01-02T06:00:30.213Z        6bb44d66-e096-124b-5ce9-5f1f1fea88f9    ERROR   (node:17) [DEP0066] DeprecationWarning: OutgoingMessage.prototype._headers is deprecated
END RequestId: 6bb44d66-e096-124b-5ce9-5f1f1fea88f9
REPORT RequestId: 6bb44d66-e096-124b-5ce9-5f1f1fea88f9  Init Duration: 473.40 ms        Duration: 10.32 ms  Billed Duration: 100 ms  Memory Size: 128 MB     Max Memory Used: 50 MB

{"statusCode":200,"headers":{"x-powered-by":"Express","content-type":"text/html; charset=utf-8","content-length":"11","etag":"W/\"b-Ck1VqNd45QIvq3AZd8XYQLvEhtA\""},"isBase64Encoded":false,"body":"Hello World"}
```

We can see the 'hello world' response inside the JSON payload that was returned from our lambda function.

Now let's deploy the application - to do this we will perform a guided deploy. Upon completion of a guided deploy, a configuration file will be created that allows future deploys to use our previous responses.
```
sam deploy --guided
```

Answer the questions as appropriate - the command will output the following -

```
▶ sam deploy --guided

Configuring SAM deploy
======================

        Looking for samconfig.toml :  Found
        Reading default arguments  :  Success

        Setting default arguments for 'sam deploy'
        =========================================
        Stack Name [simple-node-api]: 
        AWS Region [ap-southeast-2]: 
        #Shows you resources changes to be deployed and require a 'Y' to initiate deploy
        Confirm changes before deploy [Y/n]: 
        #SAM needs permission to be able to create roles to connect to the resources in your template
        Allow SAM CLI IAM role creation [Y/n]: 
        Save arguments to samconfig.toml [Y/n]: 

        Looking for resources needed for deployment: Found!

                Managed S3 bucket: <aws-sam-cli-managed-default-samclisourcebucket-HASH>
                A different default S3 bucket can be set in samconfig.toml

        Saved arguments to config file
        Running 'sam deploy' for future deployments will use the parameters saved above.
        The above parameters can be changed by modifying samconfig.toml
        Learn more about samconfig.toml syntax at 
        https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/serverless-sam-cli-config.html

        Deploying with following values
        ===============================
        Stack name                 : simple-node-api
        Region                     : ap-southeast-2
        Confirm changeset          : True
        Deployment s3 bucket       : <aws-sam-cli-managed-default-samclisourcebucket-HASH>
        Capabilities               : ["CAPABILITY_IAM"]
        Parameter overrides        : {}

Initiating deployment
=====================
Uploading to simple-node-api/0948bb837790c8b67731569145c3b9f1  860364 / 860364.0  (100.00%)
Uploading to simple-node-api/6dd8e36f41145e6820661afcc04594a4.template  1068 / 1068.0  (100.00%)

Waiting for changeset to be created..

CloudFormation stack changeset
---------------------------------------------------------------------------------------------------------
Operation                           LogicalResourceId                   ResourceType                      
---------------------------------------------------------------------------------------------------------
+ Add                               ExpressBackendHelloWorldPermissio   AWS::Lambda::Permission           
                                    n                                                                     
+ Add                               ExpressBackendRole                  AWS::IAM::Role                    
+ Add                               ExpressBackend                      AWS::Lambda::Function             
+ Add                               ServerlessHttpApiApiGatewayDefaul   AWS::ApiGatewayV2::Stage          
                                    tStage                                                                
+ Add                               ServerlessHttpApi                   AWS::ApiGatewayV2::Api            
---------------------------------------------------------------------------------------------------------

Changeset created successfully. arn:aws:cloudformation:ap-southeast-2:<ACCOUNT_ID>:changeSet/samcli-deploy1577946076/01b8938e-9205-4489-b1a2-0599a8ebfc41


Previewing CloudFormation changeset before deployment
======================================================
Deploy this changeset? [y/N]: y

2020-01-02 14:21:49 - Waiting for stack create/update to complete

CloudFormation events from changeset
---------------------------------------------------------------------------------------------------------
ResourceStatus             ResourceType               LogicalResourceId          ResourceStatusReason     
---------------------------------------------------------------------------------------------------------
CREATE_IN_PROGRESS         AWS::IAM::Role             ExpressBackendRole         -                        
CREATE_IN_PROGRESS         AWS::IAM::Role             ExpressBackendRole         Resource creation        
                                                                                 Initiated                
CREATE_COMPLETE            AWS::IAM::Role             ExpressBackendRole         -                        
CREATE_IN_PROGRESS         AWS::Lambda::Function      ExpressBackend             -                        
CREATE_IN_PROGRESS         AWS::Lambda::Function      ExpressBackend             Resource creation        
                                                                                 Initiated                
CREATE_COMPLETE            AWS::Lambda::Function      ExpressBackend             -                        
CREATE_IN_PROGRESS         AWS::ApiGatewayV2::Api     ServerlessHttpApi          -                        
CREATE_COMPLETE            AWS::ApiGatewayV2::Api     ServerlessHttpApi          -                        
CREATE_IN_PROGRESS         AWS::ApiGatewayV2::Api     ServerlessHttpApi          Resource creation        
                                                                                 Initiated                
CREATE_IN_PROGRESS         AWS::Lambda::Permission    ExpressBackendHelloWorld   Resource creation        
                                                      Permission                 Initiated                
CREATE_IN_PROGRESS         AWS::ApiGatewayV2::Stage   ServerlessHttpApiApiGate   -                        
                                                      wayDefaultStage                                     
CREATE_IN_PROGRESS         AWS::Lambda::Permission    ExpressBackendHelloWorld   -                        
                                                      Permission                                          
CREATE_IN_PROGRESS         AWS::ApiGatewayV2::Stage   ServerlessHttpApiApiGate   Resource creation        
                                                      wayDefaultStage            Initiated                
CREATE_COMPLETE            AWS::ApiGatewayV2::Stage   ServerlessHttpApiApiGate   -                        
                                                      wayDefaultStage                                     
CREATE_COMPLETE            AWS::Lambda::Permission    ExpressBackendHelloWorld   -                        
                                                      Permission                                          
CREATE_COMPLETE            AWS::CloudFormation::Sta   simple-node-api            -                        
                           ck                                                                             
---------------------------------------------------------------------------------------------------------

Stack simple-node-api outputs:
---------------------------------------------------------------------------------------------------------
OutputKey-Description                                OutputValue                                        
---------------------------------------------------------------------------------------------------------
ExpressBackendFunction - Express Backend Lambda      ExpressBackend.Arn                                 
Function ARN                                                                                            
ExpressBackendIamRole - Implicit IAM Role created    ExpressBackendFunctionRole.Arn                     
for Hello World function                                                                                
HelloWorldApi - API Gateway endpoint URL for Prod    https://cukqdke1jj.execute-api.ap-                 
stage for Hello World function                       southeast-2.amazonaws.com/                         
---------------------------------------------------------------------------------------------------------

Successfully created/updated stack - simple-node-api in ap-southeast-2
```

The command will additionally create a `samconfig.toml` which remembers the settings you applied during the guided deploy.

Initiating a curl command will at the API Gateway endpoint in your outputs section should retrieve the 'hello world' message from your cloud deployed endpoint!

Note: You can use the aws-cli to tear it down with the following command at any time.

```bash
aws cloudformation delete-stack --stack-name simple-node-api
```

# Implementing the API Methods

Now let's start adding some API endpoints. The first thing we need to do is ensure we have an S3 bucket to store the comments in. Let's start by adding an S3 bucket resource to our template, and adding a policy to enable our lambda function to read and write from the bucket. Lastly, we need to expand the events section to include a `post` event. Our Resources section will now include the following.

```yaml
Resources:
  CommentsBucket:
    Type: AWS::S3::Bucket

  ExpressBackend:
    Type: AWS::Serverless::Function 
    Properties:
      CodeUri: hello-world/
      Handler: app.lambdaHandler
      Runtime: nodejs12.x
      Environment:
        Variables:
          BUCKET: !Ref CommentsBucket
      Policies:
        - S3CrudPolicy:
            BucketName: !Ref CommentsBucket
      Events:
        Get:
          Type: HttpApi
          Properties:
            Path: /{proxy+}
            Method: get
        Post:
          Type: HttpApi
          Properties:
            Path: /{proxy+}
            Method: post
```

Now we need to implement the logic for our application.

I'm importing the following libraries:

```javascript
const serverless = require('serverless-http');
const express = require('express');
const s3 = require('aws-sdk/clients/s3');
const v5 = require('uuid/v5');
const env = require('env-var');
const bodyParser = require('body-parser');
```

First I'll add some basic middleware to handle errors thrown from our handlers. Normally I'd be a little more specific, but for now I'll log the error and return a 500 response.

```javascript
app.use('/', (err, _, res, _) => {
    console.log(err);
    res.status(500).json({ message: 'Internal Server Error'});
});
```

We'll create a function to return a new s3 client. If the bucket isn't present as an environment variable, we will throw an error.

```javascript
function newS3Client() {
    // You can use the 'params' argument to the client to set default variables
    // for requests. In this example, all API calls will default the value of
    // the 'Bucket' parameter to the value stored in the BUCKET environment
    // variable.
    return new s3({ params: { Bucket: env.get('BUCKET').required() } });
}
```

I've also created a function to return an author. At the moment it will just return 'anonymous', but we will modify this to add identity in a later post.

```javascript
function getAuthor() {
    return 'anonymous';
}
```

Writing a message is fairly straight-forward.

1. I generate a namespace UUID using the author and the URL UUID namespace.
2. I generate a new UUID based on the message content and namespace UUID I just generated. This is to help reduce the odds of a key collision.
3. I generate an ISO date string, which will (obviously) be used as the date and time the message was submitted.
4. I generate the 9's complement from the datetime. This is an implementation detail used to ensure that when I try to retrieve the messages later, they will be returned in order from newest-to-oldest.

By default, any calls made to list objects in an S3 bucket will are returned in lexographic order. In practical terms, this will return earlier dates first. By converting the date to 9's complement, the order will be reversed, and newer comments will be earlier in the order.

```javascript
async function writeMessage(s3, message, author) {
    const namespace = v5(author, v5.URL);
    const id = v5(message, namespace);
    const date = new Date();
    const Key = `${ninesComplement(date)}/${id}`;
    const body = { message, date: date.toISOString(), author };
    await s3.put_object({ Key, Body: JSON.stringify(body) });
    return body;
}
```

Reading messages out is also relatively simple. This code will list out 'maxItems' worth of objects, continuing to iterate based on the continuation token. The contents of each object is then retrieved and returned along with the next continuation token if there are more results available. The tokens are used to paginate the results. Note that I did have to base64 encode/decode the token to ensure query arguments were not mangled by express' query argument parsing (though this is not an unusual thing to do).

```javascript
async function getMessages(client, maxItems, token) {
    const { Contents, NextContinuationToken } = await client.listObjectsV2({
        MaxKeys: maxItems,
        ContinuationToken: token || 
            new Buffer(token, 'base64').toString('ascii')
    }).promise();

    const res = await Promise.all(Contents
        .map(({ Key }) => client.getObject({ Key }).promise()));

    return {
        Items: res.map(({ Body }) => JSON.parse(Body)),
        NextToken: NextContinuationToken || 
            new Buffer(NextContinuationToken, 'ascii').toString('base64')
    }
}
```

You can learn more about pagination in serverless applications from Serverless Hero Yan Cui, who wrote this excellent post: ["Guys, we're doing pagination wrong..."](https://hackernoon.com/guys-were-doing-pagination-wrong-f6c18a91b232)

After doing another round of `sam build && sam deploy`, let's curl our new API.

```bash
# Your API endpoint address is available from the output of your deployment
ENDPOINT=<ENDPOINT>

# this should return nothing e.g. {"Items":[]}
curl $ENDPOINT

# now send some data
for i in {1..10}; do
    curl -XPOST -H "Content-Type: text/plain" -d "Message: $i" $ENDPOINT
done
```

If we curl the endpoint we should recieve the following
```json
{
  "Items": [
    {
      "message": "Message: 10",
      "date": "2020-01-06T01:17:05.691Z",
      "author": "anonymous"
    },
    {
      "message": "Message: 9",
      "date": "2020-01-06T01:17:05.288Z",
      "author": "anonymous"
    },
    {
      "message": "Message: 8",
      "date": "2020-01-06T01:17:04.876Z",
      "author": "anonymous"
    },
    {
      "message": "Message: 7",
      "date": "2020-01-06T01:17:04.475Z",
      "author": "anonymous"
    },
    {
      "message": "Message: 6",
      "date": "2020-01-06T01:17:04.070Z",
      "author": "anonymous"
    },
    {
      "message": "Message: 5",
      "date": "2020-01-06T01:17:03.656Z",
      "author": "anonymous"
    },
    {
      "message": "Message: 4",
      "date": "2020-01-06T01:17:02.156Z",
      "author": "anonymous"
    },
    {
      "message": "Message: 3",
      "date": "2020-01-06T01:17:01.679Z",
      "author": "anonymous"
    },
    {
      "message": "Message: 2",
      "date": "2020-01-06T01:17:00.576Z",
      "author": "anonymous"
    },
    {
      "message": "Message: 1",
      "date": "2020-01-06T01:16:59.034Z",
      "author": "anonymous"
    }
  ]
}
```

Paging through the result set is possible by using the maxItems query parameter. If we set it to 1 e.g. `curl "$ENDPOINT?maxItems=1"`, we will receive the first item and a token to retrieve more data.

```json
{
  "Items": [
    {
      "message": "Message: 10",
      "date": "2020-01-06T01:17:05.691Z",
      "author": "anonymous"
    }
  ],
  "NextToken": "1mSTs9j4zPH1Dw7LkIZOXfUOpfd/vijAKI5gVyyeW0KjJ2BQqoxKgH3c2cyYQd74GYuEn0xQyKapxfmXVCd6yzT7cDUfA2pdExAWszRdL8EmEATzr4WMxeZQ5QtHJHpz7rN7q+8wIuE4mbwyYHCsBXf8ELJVmeRut"
}
```

Now using the value of NextToken, we can retrieve the next value using `curl "$ENDPOINT?maxItems=1&token=MU5ZVjBnR0Nza2g1cXF4Nm5HSDZoUU5IaFg4bjk4R0Z1Uzc2TkFlQWY3blI0S0xDak5DQVZ6cG5aZy92aEQxMHFUeUJJd1A5cC8xRnNFME9Hakw2VnJlczBRWVdnaWVpTm8vTnhLREhvMUlZQ2UwSCtVVHd6SXVCL0NFSlJ5OE15bktHUjNFa0QwNnNybUlqeW9RekdrMUwvTDR0NHUyTlQ="

```json
{
  "Items": [
    {
      "message": "Message: 9",
      "date": "2020-01-06T01:17:05.288Z",
      "author": "anonymous"
    },
  ],
  "NextToken": "1XqRKzDWBlYIFrJLHMoTCTIHAjURZIAOz/Rq6EDIAihbhVcrXxV6Wzi5/WsNUvPeN1fCMVLUXgERX3w6zgQ7554S97HcGWZ+/iO2lkPj1JvGKTOd48u1qTdcywMCcmflcBR3oqd+aNROdH9nMa8KBIQHPSAfFy/SK"
}
```

# What next?

We now have a basic API working but there are still issues that remain.

1. Our API is public, and all users are anonymous.

   We haven't put in any authorization/authentication controls, which we would probably want to do in order to tie comments to a particular user. Adding an extra step to authenticate before-hand will likely reduce the number of potential calls to the API.

2. We are not doing any validation of the incoming message.

    There is a potential for the API to be used in an injection attacked. For example, a malicious javascript payload could be sent to the service and this could be executed by a browser upon retrieving a message. Whilst the client should ultimately be responsible for protecting against this, it would not be a bad idea to add some level of detection/sanitisation on the server side to make this less likely.

3. The API is not particularly usable.

    Sure, we've curl'ed some endpoints to show everything kinda works, but we would typically call the API from a frontend. This isn't very easy to do at the moment - we should generate some code that we can call from the client to consume the API.

4. We have not accounted for observability

    We are currently not logging anything, or tracing calls to other services, or keeping track of metrics. We should add structured logging, trace calls with X-Ray, and create CloudWatch metrics, in order to make this a production-ready service.

I intend to address these points in future articles.

In closing, I hope this gives you a good starting point to building serverless applications. The new HTTP features in API Gateway are a good way to get start if you are already familiar with an in existing framework like Express and Flask. Hopefully this has also given you insight into the great SAM tooling that is available from AWS as well.

Starting out with Serverless? [Contact Mechanical Rock to Get Started!](https://www.mechanicalrock.io/lets-get-started)