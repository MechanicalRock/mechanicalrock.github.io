---
layout: post
title: Realtime application with "@aws_subscribe" directive.
description: Realtime communication between a web app and a GraphQL API
date: 2022-05-14
author: Nadia Reyhani
image: img/blog/protobuf-ts/protobuf-ts.jpg
tags: ["AWS Appsync", "Graphql", "tutorial", "subscription", "Real-time data", "aws directive"]
---

![aws-appsync](/img/blog/appsync-subscription/aws-appsync.png)

### An Introduction

In a [Client-Server](https://en.wikipedia.org/wiki/Client%E2%80%93server_model) Architecture, a client is a piece of software that accesses a specific service or a resource made available by a server through the HTTP protocol in the form of a URL and receives a response. A server On the other hand is a type of computer that receives the request, stores or processes it, and sends response information to the client through the HTTP/HTTPS protocol.

API that stands for `Application Programming Interface` is a software intermediary that allows two applications to talk to each other. APIs provide a standardized way for two applications to send data back and forth.
There are many approaches to building an API including the REST APIs. A REST API is an architectural concept for network-based software. When using a REST API to fetch information, you’ll always get back a complete dataset. For example, if you wanted to request information from two sources, you’d need to perform two REST API requests.

##### What is GraphQL?

GraphQL is a query language for your API, a specification, and a set of tools that operates over a single endpoint using HTTP.

GraphQL gives the client the power to ask for exactly what they need and get back predictable results. Making updates to data is made simple with graphql mutations, allowing developers to describe how the data should change.

##### The Core Difference Between REST APIs and GraphQL

GraphQL follows the same set of constraints as REST APIs, but it shifts control over what data is returned (or mutated) to the client.
Over the last few years, REST has been used to make new APIs, while the focus of GraphQL has been to optimize for performance and flexibility.

##### What is AWS AppSync?

AWS AppSync, I translate it to "API Gateway for GraphQL". It provides a scalable GraphQL interface that allows you to connect your GraphQL schema to multiple data sources like Amazon DynamoDB, AWS Lambda, and HTTP APIs etc.

#### What is a real-time web application?

A traditional application that is not updated in realtime, requires the user to request again to get the latest data. In this model, when user sends the initial request to the server, they have to reload websites/application to see the latest data.

In contrast, a real-time web application updates immediately when new information is available without having to reload or request new data for the page. This is accomplished through a constant two way communication channel that remains open throughout the life of the user session. This constant connection allows the application server to send messages to the client. Applications that use real-time data, needs a mechanism where the server can push an updated response.

In this tutorial, you’ll learn how to bring a realtime functionality into your app by implementing GraphQL subscriptions and AWS directives in your Appsync schema. The goal is to implement a graphql subscription simply with "@aws_subscribe" directive.

Note that, this article doesn't specify a data source because the data source could be anything, a Lambda, Amazon DynamoDB, or Amazon OpenSearch Service. Also, I assume you have already set up your infrastructure if you don't still know how to do that, I would highly recommend to have a read through [This amazing article from Shermayne Lee](https://mechanicalrock.github.io/2020/05/04/putting-the-serverless-in-graphQL-with-AppSync.html).

#### What is GraphQL Subscription?

GraphQL usually supports a set of operations (queries and mutations) which forms the data interaction between the client and the server. The client sends a query or mutation and gets a response back from the server.

As we said earlier, there are use-cases when our application client expects real-time data from the server. One way to achieve this is by using WebSockets, which establish a two-way interactive communication session between the user’s browser and a server. Subscriptions are another more efficient way to send data from the server to the client. Those are very similar to queries, but instead of immediately returning a single answer, a result is sent every time a particular event happens on the server without the client needing to resend that request.

## How AppSync Subscription Works

![aws-appsync-subscriptions](/img/blog/appsync-subscription/aws-appsync-realtime-collaboration.png)

Subscriptions in AWS AppSync are invoked as a response to one or multiple mutation(s) and the mutation response is sent to subscribers. This means that you can make any data source in AWS AppSync real time by specifying a GraphQL schema directive on a mutation.

Now that we know the basics, let's see what are the steps to simply implement a subscription for a real-time interaction in our application. Given we have the following GraphQL schema and Mutation in your Backend Application:

```gql
schema {
  mutation: Mutation
  subscription: Subscription
}

type Mutation {
  addOrder(orderInput: OrderInput!): Order!
  updateOrderStatus(orderId: ID!, orderStatus: OrderStatus!): Order!
}

input orderInput {
  orderItems: [OrderItems!]!
  status: OrderStatus!
  createdAt: String!
}

type Order {
  id: String!
  orderItems: [OrderItems!]!
  status: OrderStatus!
  createdAt: String!
}

type OrderItems {
  item: String!
  quantity: Int!
}

enum OrderStatus {
  IN_PROGRESS
  CONFIRMED
  READY
  CANCELLED
}
```

corresponding GraphGL mutation on Frontend:

```
export const UPDATE_ORDER_STATUS = gql`
  mutation UpdateOrderStatus(orderId: ID!, orderStatus: OrderStatus!) {
    updateOrderStatus(orderId: $orderId, orderStatus: $orderStatus) {
      id
      orderItems {
        item
        quantity
      }
      OrderStatus
      createdAt
    }
  }
`;

```

As the schema shows, we have a mutation which updates the status of an order in a data source like our database of choice. We want our UI to get the live status of the order, each time an event updates the status.

To enable subscription on any type and to make these fields real time, you can simply create a subscription type in your GraphQL schema and just mention the `@aws_subscribe` directive for subscription you want to receive the changes.That will allow the client to receive a real-time update on order.

#### Step1:

Update your Schema.gql with:

```
type Subscription {
    getOrderStatus($orderId: ID!): Order @aws_subscribe(mutations: ["updateOrderStatus"])
```

#### Step2:

Define the subscription in your Frontend:

```
export const GET_ORDER_STATUS = gql`
  subscription GetOrderStatus($orderId: ID) {
    getOrderStatus(orderId: $orderId) {
      id
      orderItems {
        item
        quantity
      }
      OrderStatus
      createdAt
    }
  }
`;
```

#### Step3:

In your UI component,use `useSubscription` Hook to execute a subscription from React. The following example component uses the subscription we defined earlier to render the most recent order status. Whenever the GraphQL server pushes a new status to the client, the component re-renders with the updated order.

```
---- LatestOrderStatus.tsx file

import { ApolloError } from 'apollo-client';
import React from 'react';
import {  useSubscription } from '@apollo/react-hooks';

const LatestOrderStatus = ({ orderId: string }) =>  {
  const { data, loading } = useSubscription(
    GET_ORDER_STATUS,
    { variables: { orderId },
    onSubscriptionData: order => {
      // Add your code here for whatever is going to happen when subscriber gets the new order data.
    }
     }
  );
  return <h4> You order status is: {!loading && data.getOrderStatus.status}</h4>;
}

export default LatestOrderStatus;

```

Yes, as simple as this we could implement a real time communication between our client and the server. However, there are few lessons I have learned when I tried to implement a subscription for one of our recent projects.

## Troubleshooting

1- The subscription response must be optional. AppSync allows us to successfully define the schema with a required subscription response, but when we hook the the subscription to our frontend client, it throw an error that subscription responses must be optional.

This will result to failure and error in subscription:

```
type Subscription {
    getOrderStatus($orderId: ID!): Order! @aws_subscribe(mutations: ["updateOrderStatus"])
}
```

2- A subscription response contains only the predicted fields which are returned by the mutation, all the other fields will be null. For instance, if we have a mutation which returns the `orderStatus` only and not the entire order object:

```
type Mutation {
  updateOrderStatus(orderId: ID!, orderStatus: OrderStatus!): OrderStatus!
}
```

The following subscription will send `null` for all requested data except `OrderStatus`.

```
export const GET_ORDER_STATUS = gql`
  subscription GetOrderStatus($orderId: ID) {
    getOrderStatus(orderId: $orderId) {
      id
      orderItems {
        item
        quantity
      }
      OrderStatus
      createdAt
    }
  }
`;
```

data:

```
result:{
    data:{
      getOrderStatus:{
        OrderStatus: 'IN_PROGRESS',
        orderItems: null, // orderItems is null because it was not requested in the mutation
        createdAt: null   // createdAt is null because it was not requested in the mutation
      }
    }
  }

```

3- Subscription arguments are indeed filters that specify when the server should notify the client.

The way we have defined our subscription means that the client is interested in updates on order status when a specific orderId argument is passed through.

However, if you want to enable the client to subscribe to a single order `OR` all orders, you can make this argument optional by removing the exclamation point (!) from the subscription prototype.

```
type Subscription {
    getOrderStatus($orderId: ID): Order @aws_subscribe(mutations: ["updateOrderStatus"])
}
```

Additionally, if you want clients to explicitly subscribe to all status updates for all orders, you should remove the argument as follows:

```
type Subscription {
    getOrderStatus: Order
    @aws_subscribe(mutations: ["updateOrderStatus"])
}
```

Simply,if you want to know about all orders that are created, you could do the following:

```
type Subscription {
    getNewOrder: Order
        @aws_subscribe(mutations: ["addOrder"])
}
```

The golden point here to consider is that, if the filtering field is not specified in the mutation response, the subscription is not fired! If we define the addOrder mutation as below ( createdAt filed has intentionally been removed from mutation response):

```
export const ADD_ORDER = gql`
  mutation addOrder(orderInput: OrderInput!) {
    addOrder(orderInput: $orderInput) {
      id
      orderItems {
        item
        quantity
      }
      OrderStatus
    }
  }
`;

```

and trying to filter the subscription on createdAt filed:

```
export const ADD_ORDER_SUBSCRIPTION = gql`
  subscription AddOrder($createdAt: string!) {
    getNewOrder(createdAt: $createdAt) {
      id
      orderItems {
        item
        quantity
      }
      OrderStatus
      createdAt
    }
  }
`;

```

In this case the subscription doesn't get fired because the mutation is not requesting `createdAt` which is used for filtering in the subscription data.

## Conclusion

We explained what AWS AppSync and GraphQL are and explored their relationship. Followed by steps on how to implement real time session between client and the server with AWS `@aws_Subscribe` directive within AppSync. And finally wrapped it up with troubleshooting, that saves you the hours of frustration and debugging!

Hopefully, by reading this article gave your enough knowledge on how subscriptions work and how simply you can implement it for your application. However AWS has a very helpful documentations for [AppSync](https://docs.aws.amazon.com/appsync/latest/devguide/what-is-appsync.html) and [Appsync Subscriptions](https://docs.aws.amazon.com/appsync/latest/devguide/aws-appsync-real-time-data.html).

If you want to read more about front-end development here at Mechanical Rock I would highly recommend checking out the awesome serries of [FED Talk articles](https://mechanicalrock.github.io/2021/04/27/fed-talk-s01e01-getting-started.html) which can help you build amazing React applications hosted in the cloud.

If you need help to build an awesome product, then we can always help, so get in touch
https://www.mechanicalrock.io/our-expertise/cloud-native-solutions
