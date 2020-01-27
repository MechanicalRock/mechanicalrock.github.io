---
layout: post
title: Build & Deploy a Serverless Express API with OpenAPI
date: 2020-01-27
tags: javascript tutorial serverless aws
author: Matthew Tyler
image: img/serverless-express.png
---

<center><img src="/img/serverless-express.png" /></center>
<br/>

# Introduction

APIs are everywhere these days as the popularity of microservices continues to increase and cloud usage skyrockets. Everyone and their dog is building an API from the scrappiest start-up to the crustiest enterprise. Unfortunately I see a lot of wasted development effort spent on regression testing and hand-cranking client code by would-be API architects. Time, effort, money - all things that can be saved by crafting an API specification using a format like OpenAPI.

The code for this tutorial can be found [here](https://github.com/matt-tyler/simple-node-api-openapi).

# What is OpenAPI

OpenAPI is a description format for describing REST API's. You may know it by a previous name: Swagger. API specifications are written in yaml or json. There is an entire ecosystem of tools that allow you to parse  these specifications and perform various actions; all the way from producing documentation, to generating code in various languages that will allow you to talk to the API. The latter is the feature I personally find most useful; it removes the pain of needing to completely handroll client code code for a new API.

# OpenAPI Both Ways

I have generally noticed two approaches when it comes to defining an OpenAPI document.

1. An OpenAPI specification document is created separately from the code.

2. The author uses some middleware for their framework that generates the specification from code, typically using decorators on the route handlers. 

Either way works, and it comes down to personal opinion. I generally prefer to write the document out-of-band from the code. The reason I do this is because I feel that API specification should be driving the design of the application, and it can feel like more of afterthought if using adding it back in with decorators. However, it does require the author to make changes in two places when updating something that will affect the API. This is something that doesn't tend to happen as much when using framework middleware. For this example, I'll define the document seperately to the code, but feel free to make decisions that you feel are right for your own context.

# An OpenAPI document for our API

It's not too difficult to define an OpenAPI specification for the API we wrote in the previous installment. Most will start like the following:

```yaml
openapi: 3.0.0
info:
  title: simple-node-api
  description: A simple API for a guestbook application
  version: 2019-10-13
```

Not much to see here. Specify the version, and some metadata about the API.

Let's define some models next. We will define the responses from our API. These are the objects we expect to come back from our API endpoints.

```yaml
components:
  schemas:
    Message:
      type: object
      properties:
        message:
          type: string
        author:
          type: string
        date:
          type: string
          format: date-time
    MessageList:
      type: object
      properties:
        items: 
          type: array
          items:
            $ref: "#/components/schemas/Message"
        nextToken:
          type: string
          required:
            - items
```

These response objects are nested under the 'components' key, which we can reference from elsewhere in the document. If that doesn't make sense yet, it will later. 

Before we do that, you can similarly define response objects for errors e.g.

```yaml
    BadRequestException:
      type: object
      properties:
        message:
          type: string
        errorCode:
          type: string
    InternalServerErrorException:
      type: object
      properties:
        message:
          type: string
        errorCode:
          type: string
```

With that out of the way, it's time for the meaty bit: the path definitions. Our endpoint used to create comments will look something like this:

```yaml
paths:
  /:
    post:
      operationId: CreateMessage
      requestBody:
        content:
          text/plain:
            schema:
              type: string
        required: true
      responses:
        "201":
          description: "Successfully created a message."
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
```

The important part here is how we define requests and responses on the path. Here, we specify that the endpoint requires plain-text content within the message body. We also specify that this is non-optional, by stating 'required: true'. The list of valid responses is also defined, and we specify the schema for each response by referencing objects that were defined in the component block.

We can similarly specify the 'get' endpoint like thus:

```yaml
    get:
      operationId: ListMessages
      parameters:
        - name: maxItems
          in: query
          required: false
          schema:
            type: number
        - name: token
          in: query
          required: false
          schema:
            type: string
      responses:
        "200":
          description: "Successfully listed messages."
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/MessageList"
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
```

The 'get' endpoint is a little different because it doesn't specify a request body. It does define some parameters though. These parameters specify a few key details - the name of the parameter, it's place (e.g. whether in the body, header, or query string), whether it is required and the schema of the parameter. In this instance we've specified two query parameters.

We are pretty much done now. Here is the document in all it's glory.

```yaml
openapi: 3.0.0
info:
  title: simple-node-api
  description: A simple API for a guestbook application
  version: 2019-10-13
paths:
  /:
    post:
      operationId: CreateMessage
      requestBody:
        content:
          text/plain:
            schema:
              type: string
        required: true
      responses:
        "201":
          description: "Successfully created a message."
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
    get:
      operationId: ListMessages
      parameters:
        - name: maxItems
          in: query
          required: false
          schema:
            type: number
        - name: token
          in: query
          required: false
          schema:
            type: string
      responses:
        "200":
          description: "Successfully listed messages."
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/MessageList"
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
  schemas:
    Message:
      type: object
      properties:
        message:
          type: string
        author:
          type: string
        date:
          type: string
          format: date-time
    MessageList:
      type: object
      properties:
        items: 
          type: array
          items:
            $ref: "#/components/schemas/Message"
        nextToken:
          type: string
          required:
            - items
    BadRequestException:
      type: object
      properties:
        message:
          type: string
        errorCode:
          type: string
    InternalServerErrorException:
      type: object
      properties:
        message:
          type: string
        errorCode:
          type: string
```

# Adding the Document to SAM

The next thing we need to do is add this document to our SAM template. Here is what the final template will look like (I'll explain the changes after the template).

```yaml
AWSTemplateFormatVersion: '2010-09-09'
Transform: AWS::Serverless-2016-10-31
Description: >
  simple-node-api
  Sample SAM Template for simple-node-api
  
Globals:
  Function:
    Timeout: 3
    Tracing: Active

Resources:
  GuestBookApi:
    Type: AWS::Serverless::HttpApi
    Properties:
      DefinitionBody:
        'Fn::Transform':
          Name: AWS::Include
          Parameters:
            Location: api.yaml
  CommentsBucket:
    Type: AWS::S3::Bucket

  ExpressBackend:
    Type: AWS::Serverless::Function # More info about Function Resource: https://github.com/awslabs/serverless-application-model/blob/master/versions/2016-10-31.md#awsserverlessfunction
    Properties:
      CodeUri: guestbook/
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
          Type: HttpApi # More info about API Event Source: https://github.com/awslabs/serverless-application-model/blob/master/versions/2016-10-31.md#api
          Properties:
            Path: /
            Method: get
            ApiId: !Ref GuestBookApi
        Post:
          Type: HttpApi
          Properties:
            Path: /
            Method: post
            ApiId: !Ref GuestBookApi

Outputs:
  GuestBookApi:
    Description: API Gateway endpoint URL for Prod stage for Hello World function
    Value:
      Fn::Sub: https://${GuestBookApi}.execute-api.${AWS::Region}.amazonaws.com/
  ExpressBackendFunction:
    Description: Express Backend Lambda Function ARN
    Value: !Sub ExpressBackend.Arn
  ExpressBackendIamRole:
    Description: Implicit IAM Role created for Hello World function
    Value: !Sub ExpressBackendFunctionRole.Arn
```

We actually didn't need to change all that much.

We needed to explicitly add a new resource, `AWS::Serverless::HttpApi`. I say 'explicitly', because SAM actually creates one implicitly with the logical ID 'ServerlessHttpApi', if there isn't one specified in the template. If we want to use an OpenAPI document though, we need to specify one.

We use a common trick here to import our separately defined specification using the 'Fn::Transform' macro. Specifying this macro calls CloudFormation to fetch the file specified in the 'Location' key at execution time, and this is typically an S3 Bucket location. The SAM deploy process recognises that we have specified a local file will upload the file to an S3 bucket and rewrite the reference at deploy time.

Performing `sam deploy && sam build` should work successfully with no issues.

# Generating Client Code

Our next step is to generate client code from the specification. There are a lot tools out there to do this, but we will use the [OpenAPI generator](https://github.com/OpenAPITools/openapi-generator). Installation instructions are available [here](https://openapi-generator.tech/docs/installation.html).

We are going to take a bit of detour from javascript and use the typescript-axios generator as it seems to produce a slightly better client. Let's take it for a spin!

```bash
openapi-generator generate \
  -i api.yaml                         `# specify location of OpenAPI document` \
  -g typescript-axios                 `# specify which code generator to use` \
  -o ./client-ts                      `# output directory` \
  -p prependFormOrBodyParameters=true `# generator specific parameters` \
  -p supportsES6=true \
  -p npmName=guestbook-client \
  -p npmVersion=1.0.0
```

Assuming this worked, it should have output a bunch of files into the 'client-ts' directory. Admittedly, it looked a little a messy, so I made a couple of changes.

1. I moved all the typescript files under a new 'src' directory.
2. I modified the tsconfig file so that root directory pointed to the new 'src' directory -

```json
{
  "compilerOptions": {
    "declaration": true,
    "target": "es6",
    "module": "commonjs",
    "noImplicitAny": true,
    "outDir": "dist",
    "rootDir": "./src",
    "typeRoots": [
      "node_modules/@types"
    ]
  },
  "exclude": [
    "dist",
    "node_modules"
  ]
}
```

Now let's put the client through it's paces. I generally like to write my tests for my API using the autogenerated client - it's a good way to excercise both the API and the client at the same time. We'll need to install a testing framework to do so, though.

First, let's install some dependencies that we will need.

```bash
npm install -D @types/jest jest @babel/cli @babel/core @babel/plugin-proposal-class-properties @babel/preset-env @babel/preset-typescript
```

Then create a 'babel.config.js' file with the following contents.

```javascript
module.exports = {
    "plugins": [
        "@babel/proposal-class-properties",
    ],
    "presets": [
        [
            "@babel/env", {
                "targets": {
                    "node": "current",
                },
                "modules": "commonjs",
            },
        ],
        "@babel/typescript",
    ]
}
```

Next, create a jest.config.js file.

```javascript
module.exports = {
    globals: {},
    testEnvironment: "node",
    testRegex: "/tests/.*\.(test|integration|accept)\.(ts|tsx)$",
    moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],
}
```

Then modify the scripts key in your package.json file to include a 'test' key, and give it a value of 'jest'.

```javascript
  "scripts": {
    "build": "tsc --outDir dist/",
    "prepublishOnly": "npm run build",
    "test": "jest"
  },
```

This will allow you to run jest with `npm run test`. Now we need to add a tests directory and a test file.

```bash
mkdir -p tests
touch tests/api.test.ts
```

Now we can edit api.test.ts and insert the following contents.

```typescript
import { DefaultApi } from "../src/api";

describe("Test My API: Create 3 messages", () => {
    const api = new DefaultApi({
        // When creating the client, specify the endpoint of your API.
        basePath: "<ENDPOINT-OF-YOUR-API>"
    });

    // A set of messages to send to the API
    const messages = [
        "message 1",
        "message 2",
        "message 3"
    ];

    beforeEach(async (done) => {
        // Each execution will post a message to our endpoint
        for (const message of messages) {
            // A call to our API endpoint
            // note how most things are abstracted out
            await api.createMessage(message);
        }
        done();
    });

    it("should return messages", async (done) => {
        // Our call to list, at most, three recent messages from the API
        const { data } = await api.listMessages(3);
        // Obviously we expect to get three messages back
        expect(data.items.length).toBe(3);
        
        // This tests that we receive three messages that match the messages
        // we specified earlier
        expect(data.items).toEqual(
            expect.arrayContaining(
                messages.map(message => expect.objectContaining({
                    message,
                    author: expect.anything(),
                    date: expect.anything()
                }))
            ));
        done();
    });
})
```

That's a lot easier than rolling our own client, and it's pretty easy to see what is going on.

# Further Thoughts

1. Not all code generators are created equal.

    Sometimes the generated API isn't particularly nice to use. It's not unusual to generate a low level client, but then hand-roll a higher level client above it that exposes user-friendlier interface. This is quite common when generating code for multiple languages, as it can be very difficult to generate code that is idiomatic to every single language. Not every project has experts for every language on-hand.

2. The limits of our implementation have started to bite, and tests are the first casualty.

    As we did not implement a delete endpoint, we cannot write anything to delete comments we have made, and therefore we cannot revert the system back to a clean state without redeploying it. Maybe that's OK, and we are fine with deploying our API again - but then again maybe we aren't because it increases feedback time. This somewhat illustrates an advantage of a test-first approach, because this simple reality would have been caught earlier. There's a lot that is simplified for an API that acts on  resource and fulfils a set of endpoints to Create, Retrieve, Update, Delete, and List objects. 

3. Authentication is still an issue

    There is still no authentication. Whilst it's unlikely that someone will find our randomly generated test endpoints (or even waste their time attacking them), it's still not best-practice. Likewise, if were to implement a delete endpoint as mentioned above we would probably want to protect that endpoint. We will start looking into this next.

# Conclusion

We learned a bit about OpenAPI today, including how we can define our API and use it in our SAM templates. From there, we learned how to generate a client for our API using the openapi-generator-cli. We then used our generated client code to write some tests against our deployed endpoint.

Have you lost your swagger? Do you need an API intervention? [Contact Mechanical Rock to Get Started!](https://www.mechanicalrock.io/lets-get-started)