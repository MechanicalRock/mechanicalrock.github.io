---
layout: post
title: 7 steps to create a Serverless GPS solution
date: 2021-01-11
tags: cloudformation serverless appsync dynamodb
author: Shermayne Lee
image:
---

While being a dog lover, I love spending most of my free time outdoor with my dog. However, I always have difficulty calling him back when he is running outside and I hate when he is out of my sight. Therefore to solve a few challenges I faced when I am with him, I came out a serverless GPS monitoring solution to track his movement.

## Solution ?

<center><img src="/img/blog/serverless-GPS/archi.jpeg" /></center><br/>

## First Step: sGetting started with the physical devices

To me this is the hardest part because there are so many devices available in the market and I have no idea which is the right one for me to start with.

My rule of thumb is always getting something which is easier to start. For instance, get a physical device that is fully assembled instead of getting every single parts and try to figure out how to assemble them make a full working GPS device.

Of course if you have a vast experience in electronic devices and parts, feel free to start from scratch in building a GPS physical device.

In my solution, I have a Dragino-LGT-92 tracking device. It is a hand size LORAWAN device with real time GPS tracking and motion sensing capability. It is an open source GPS tracker base on ultra low power lora module.

## Second Step: Register the LORA tracking device

### What is LoRaWAN?

It is a Low Power Wide Area networking protocol designed to wireless connect device to the internet.
If you are interested to get to know more about LoRaWAN. Here is the resource for it. [LORAWAN](https://lora-alliance.org/about-lorawan)

In my case, I have used <b>The Thing Network (TTN)</b> to manage my lora device.

### What is The Thing Network?

The thing network is a global community building open source LoRaWAN network.

Here is the link for more information about The Thing Network.[TTN](https://www.thethingsnetwork.org/)

Basically I have a Lora tracking device that is connected to the internet wirelessly via The Thing Network platform.

Register the device !

<center><img src="/img/blog/serverless-GPS/registerDevice.png" /></center><br/>

<b>Pre-requisite:</b>

- You will need to create an account with The Thing Network (TTN) if you don’t already have one.
- You will need to have the device unique identifier (EUI) from the device
- The device will get activate via Over The Air Activation (OTAA)
- Select handler to handle the data that is in your region

<b>Create the application</b>
<b>Register the device within the application</b>

p.s. You could also format and decode the payload to the desired format in the console.

After the registration process, I have a tracking device that is connected to the internet and the data is being handled by The Thing Network (TTN).

## Third Step: Create dynamoDB Table as data store

You will neede to have an AWS account before commencing this step.

You have the options to create dynamoDB via AWS console , cli or CloudFormation

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

I am creating an HTTP endpoint for my lambda by using API Gateway .

This is an essential step where allow me to send data between The Thing Network and AWS.

This is the sample code and I am using typescript in this case.

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

This lambda will be invoked via HTTP endpoint. Hence, any data from The Thing Network (TTN) will get send into this lambda. I would like the data to store in dynamoDB.

Once I have the HTTP endpoint , I am ready for the integration between AWS and The Thing Network (TTN). s

## Fifth Step: Integration between The Thing Network (TTN) and AWS

Integration method available in The Thing Network (TTN):

In order to have it integrate with the http endpoint that I created in previous step, I will go with HTTP integration method here.

## Sixth Step: Create the application - React App

In order for me to check the data easily, I have created a simple react app with map to show the coordinates detected from the tracking device.

## Seventh Step: Connect the database with React App via AWS Appsync

Now I have almost everything ready, I will need the react app to be able to pull data from dynamodb database via API.

I have chosen AWS Appsync. AWS Appsync is a fully managed service that make it easy to develop GraphQL API.   I have a very simple schema as the application is relatively simple.

<b>Appsync Schema</b>

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

This is a schema for querying data from dynamoDB table.

In conclusion, that’s all you need to build a simple GPS tracking device. Most importantly is having a right device to get started. Once you have the device, you are all ready to get your hands dirty by registering the device in The Thing Network (TTN). Create a lambda and http endpoint that can integrate with The Thing Network (TTN). Create a dynamoDB table to store the data from tracking device and lastly a react app to read the data from the table. A
