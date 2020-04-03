---
layout: post
title: What does AWS AppSync do ?
date: 2020-04-03
tags: AWS AppSync Cloudformation
author: Shermayne Lee
---

# Overview

AWS AppSync and GraphQL have gained popularity in recent years. However it can be confusing and difficult to start for developer new to the term.

GraphQL is an open source query language that was developed to allow communication between your application and server.

AWS AppSync is a managed GraphQL platform by AWS for serverless implementation. AWS AppSync serves as a connector between client and AWS resources. It can translate graphQL request from client , get the data from AWS Resources and pass the data to client.

# Introduction to AppSync

AWS Appsync is the service that helps your application development process simple by providing the ability to create flexible API. It can be the center hub that connects all you data sources securely.

AWS AppSync is desgined mainly for the use of GraphQL API and one of the main benefits of appsync is letting your application to get exactly data you need. Additionaly for mobile and web application, it provides ability to access data locally when devies go offline and synchronize application data in real time when devices are back online.

# Quick Start

The nice thing about using AWS services is we can create resources with CloudFormation template. It allows you to create and provision AWS resources predictably and repeatedly.

### Step 1: Create AWS AppSync API

We will build an API for a coffee ordering application that store all the order in the databse.

The following example is written in YAML format.

```yml
Resources:
	CoffeeShopAppSyncApi:
		Type: AWS::AppSync::GraphQLApi
		Properties:
			Name: CoffeeShopAppSyncApi
			AuthenticationType: API_Key

	CoffeeShopAppSyncApiKey:
		Type: AWS::AppSync::ApiKey
		Properties:
			ApiId: !GetAtt CoffeeShopAppSyncApi.ApiId
      Description: API key for graphQL Api

```

There are two resources in the template.

Firstly, it is creating the resource for AppSyncAPI. There are few methods available for authentication type. We will use API_KEY in this case, however AWS_IAM, AMAZON_COGNITO_USER_POOLS, or OPENID_CONNECT are other alternatives .

In this case , we are using API key to protect the API , so we will need to create API key.

### Step 2: Create the Schema

Now we have the API ready, we will need to create appsync schema for the api

```yml
	CoffeeShopAppSyncSchema:
		Type: AWS::AppSync::GraphQLSchema
		Properties:
		ApiId: !GetAtt CoffeeShopAppSyncApi.ApiId
    Definition : |

			input orderInput {
			 id: String
			 coffee: String
			 size: String
			}

			type Order {
			 id: String
			 coffee: String
			 size: String
			}

			type Mutation {
			createOrder(input: orderInput): Order
			}

			type Query{
			getOrder(id: String): Order
			}

			schema {
			query: Query
			mutation: Mutation
      }

```

The schema that we created serves the purpose of ensuring the data from client matches with the schema before mapping to the resolver.

As from the schema, we are creating a mutation for create order which expect the input argument matches the type defined in orderInput and result return matches the type defined in Order.

### Step 3: Create the Datasource

The type of datasources supported by appsync are AMAZON_DYNAMODB, AMAZON_ELASTICSEARCH, AWS_LAMBDA, HTTP or RELATIONAL_DATABASE. We will use DynamoDb as our datasource.

```yml
CoffeeShopDynamoDB:
	Type: AWS::DynamoDB::Table
	Properties:
		TableName: 'CoffeeShopTable'
		AttributeDefinitions:
			- AttributeName: 'id'
			  AttributeType: 'S'
			- AttributeName: 'resourceId'
			  AttributeType: 'S'
		KeySchema:
			- AttributeName: 'id'
			  KeyType: 'HASH'
			- AttributeName: 'resourceId'
			  KeyType: 'RANGE'
		ProvisionedThroughput:
			ReadCapacityUnits: 3
			WriteCapacityUnits: 1
		Projection:
      ProjectionType: 'ALL'

CoffeeShopDynamoDBDataSource:
	Type: AWS::AppSync::DataSource
	Properties:
		ApiId :  !GetAtt CoffeeShopAppSyncApi.ApiId
		Name: CoffeeShopDynamoDBDataSource
		Description: Contain order data from coffee shop
		Type: “AMAZON_DYNAMODB”
		ServiceRoleArn: arn:aws:iam::xxxxxxxxxxxx:role/xxxxxxxxx
		DynamoDBConfig:
			TableName: CoffeeShopTable
      AwsRegion: ap-southeash-2

```

From the template, we are provisioning new dynamoDB table for the API. It has the attribute id as hash key and resourceId as range key for the table.

We are connecting the appsync datasource with the newly created dynamoDB table by specifying the table name. You can connect to an existing datasource if you already have one.

### Step 4: Create the Resolver

Adding resolver for mutation , query or subscription automatically coverts arguments that match the schema into databse operation.

```yml
CreateOrderResolver:
	Type: AWS:: AppSync::Resolver
	Properties:
    ApiId: !GetAtt CoffeeShopAppSyncApi.ApiId
    TypeName: Mutation
    FieldName: createOrder
    DataSourceName: !GetAtt CoffeeShopDynamoDBDataSource.Name
    RequestMappingTemplate: |
      {
        "version" : "2017-02-28",
        "operation" : "PutItem",
        "key" : {
          "id": { "S" : "${ctx.args.orderInput.id}" },
          "resourceId": { "S": "COFFEE" }
        },
      }
    ResponseMappingTemplate: |
        $util.toJson($context.result)

GetOrderResolver:
	Type: AWS:: AppSync::Resolver
	Properties:
    ApiId: !GetAtt CoffeeShopAppSyncApi.ApiId
    TypeName: Query
    FieldName: getOrder
    DataSourceName: !GetAtt CoffeeShopDynamoDBDataSource.Name
    RequestMappingTemplate: |
      {
          "version": "2017-02-28",
          "operation": "GetItem",
          "key": {
            "id": { "S": "${ctx.args.id}" },
            "resourceId": { "S": "COFFEE" }
          }
        }
    ResponseMappingTemplate: |
        $util.toJson($context.result)
```

# Conclusion

We had a brief introduction on how you can provision AWS AppSync with DynamoDb as the data source by using cloudformation.

My takeaway for AWS AppSync is , it is a good starting point for developer who want to start building an API for your application that speed and real time data are crucial.

Give it a try and let us know your thought! Tweet at us
[@mechanicalrock\_](https://twitter.com/mechanicalrock_) with your thoughts!

If you are struggling to start , we can help you ! Please contact us at
[Contact Mechanical Rock to Get Started!](https://www.mechanicalrock.io/lets-get-started)
