---
layout: post
title: 7 Steps to Create a Serverless Tracking Solution
date: 2021-01-11
tags: cloudformation serverless appsync dynamodb
author: Shermayne Lee
image:
---

While being a dog lover, I love spending most of my free time outdoors with my dog. However, I always have difficulty calling him back when he runs outside, and I hate when he is out of my sight. Therefore to solve a few challenges I faced when I am with him, I came out with a serverless GPS monitoring solution to track his movement.

## Solution ?

<center><img src="/img/blog/serverless-GPS/map.png" /></center><br/>

<center><img src="/img/blog/serverless-GPS/archi.jpeg" /></center><br/>

## First Step: Getting started with the physical devices

In my opinion, this could be the most challenging part because there are so many devices available in the market, and I have no idea which is the right one for my solution.

My rule of thumb is always getting something more comfortable to start. For instance, get a physical device that is fully assembled instead of getting every separate part and try to figure out how to build it.

Of course, if you have a vast experience and interest in devices and parts, feel free to start from scratch in building a tracking device.

My focus in this post is on sharing my experience building a serverless tracking solution on the cloud.

In my solution, I have a Dragino-LGT-92 tracking device. It is a handheld LORAWAN device with real-time GPS tracking and motion sensing capability. It is an open-source GPS tracker base on ultra-low-power Lora module.

## Second Step: Register the LORA tracking device

After I bought a LoRaWAN tracking device, I need a platform to manage my device and connect the device to the internet.

Before I start, let's understand a few terms I will frequently use in this post.

### What is LoRaWAN?

It is a Low Power Wide Area networking protocol designed to connect devices to the internet wirelessly.
Suppose you are interested in getting to know more about LoRaWAN. Here is the resource for it. [LORAWAN](https://lora-alliance.org/about-lorawan)

I need a platform to manage the device. In my case, I have used The Thing Network (TTN) to manage my Lora device.

### What is The Thing Network?

The thing network is a global community building open source LoRaWAN network.

Here is the link for more information about The Thing Network.[TTN](https://www.thethingsnetwork.org/)

I have a Lora tracking device ready to connect to the internet wirelessly via The Thing Network platform.

#### Register the device !

<center><img src="/img/blog/serverless-GPS/registerDevice.png" /></center><br/>

**Before you start**

- You will need to create an account with The Thing Network (TTN) if you don’t already have one.
- You will need to have the device unique identifier (EUI) from the device
- The device will get activated via Over The Air Activation (OTAA)
- Select handler to handle the data that is in my region
- You could also format and decode the payload to the desired format in the console.

**Create the application**

<center><img src="/img/blog/serverless-GPS/addApp.png" /></center><br/>

**Register the device within the application**

<center><img src="/img/blog/serverless-GPS/register-device.png" /></center><br/>

[Full tutorial to register a device](https://www.thethingsnetwork.org/docs/devices/registration.html)

After the registration process, I have a tracking device that is connected to the internet and the data is being handled by The Thing Network (TTN).

## Third Step: Create dynamoDB Table as data store

[Amazon DynamoDB](https://docs.aws.amazon.com/dynamodb/) is fully managed NoSQL database service that support key-value and document data structure.

You have the options to create dynamoDB via AWS console , CLI or CloudFormation

If you would like to create a table via cloudformation:

```yaml
Uplink:
  Type: AWS::DynamoDB::Table
  Properties:
    TableName: "UpLinkTrackerFromLambda"
    BillingMode: PAY_PER_REQUEST
    StreamSpecification:
      StreamViewType: "NEW_IMAGE"
    AttributeDefinitions:
      - AttributeName: "id"
        AttributeType: "S"
      - AttributeName: "creationTime"
        AttributeType: "S"
    KeySchema:
      - AttributeName: "id"
        KeyType: "HASH"
      - AttributeName: "creationTime"
        KeyType: "RANGE"
```

## Fourth step: Create a lambda and API Gateway to ingest data from The Thing Network

[AWS Lambda](https://aws.amazon.com/lambda/) is a serverless computing platform that lets you run code without provisioning or managing servers.

I created a simple microservices using API Gateway and lambda.

It is an essential step where allows me to send data between The Thing Network and AWS.

Here is the sample code for lambda written in typescript

```js
export const saveItemToDynamoDb = async (
  tableName: string,
  dynamoDBAttributes: unknown,
  dynamoDB: DynamoDB
) => {
  const attributes: PutItemInputAttributeMap = DynamoDB.Converter.marshall(
    dynamoDBAttributes
  );

  const parameter: PutItemInput = {
    TableName: tableName,
    Item: attributes,
  };

  try {
    const savedItem = await dynamoDB.putItem(parameter).promise();
    const response = DynamoDB.Converter.unmarshall(savedItem.Attributes);
    return response;
  } catch (error) {
    console.log("There is an error on putting object into table", error);
  }
};
```

The HTTP endpoint will invoke this lambda. Hence, any data from The Thing Network (TTN) will get send into this lambda.
Those data will be stored in dynamoDB that I created in the previous step.

Once I have the HTTP endpoint, I am ready to integrate AWS and The Thing Network (TTN).

## Fifth Step: Integration between The Thing Network (TTN) and AWS

Integration method available in The Thing Network (TTN):

<center><img src="/img/blog/serverless-GPS/integrationMethod.png" /></center><br/>

In order to have it integrate with the http endpoint that I created in previous step, I will go with HTTP integration method here.

## Sixth Step: Create the application - React App

**Before I start**

- You will need to know how to [Create a React App](https://create-react-app.dev/docs/getting-started/)

  To check the data quickly, I have created a simple React application with a simple map to show the tracking device's coordinates.

## Seventh Step: Connect the database with React App via AWS Appsync

Now I have almost everything ready, and I will need the React application to pull data from the dynamoDB via API.

I have chosen [AWS Appsync](https://aws.amazon.com/appsync/). AWS Appsync is a fully managed service that makes it easy to develop GraphQL API. I have a straightforward schema as the application is relatively simple.

**Appsync Schema**

```yaml
Type: AWS::AppSync::GraphQLSchema
Properties:
  ApiId: !GetAtt ServerlessTrackerAppsyncApi.ApiId
  Definition: |
    type Uplink {
      dev_id: String
      payload_fields: Payload
    }
    type Payload {
      Latitude: Float
      Longitude: Float
      ALARM_status: String
    }
    type Query {
      getUplinkData(dev_id: String, time: String): [Uplink]
    }
    schema {
      query: Query
    }
```

## Wrapping Up

In conclusion, those are the seven steps that I used to build a simple GPS tracking device.

I hope this blog post has inspired you to think about how you can apply serverless technology to your problem.

Thanks for reading. If you would like to know more about serverlesss, [contact with us](https://mechanicalrock.io/lets-get-started).
