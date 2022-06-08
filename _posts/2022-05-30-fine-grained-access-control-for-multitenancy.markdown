---
layout: post
title: Fine Grained Access Control for Multi-tenancy
description: Architecting multi-tenant backend applications
date: 2022-05-30
author: Leon Ticharwa
image: /img/blog/multitenancy/multitenant.png
tags: ['multitenant', 'typescript', 'tutorial', 'dynamodb', 'lambda', 'api gateway', 'authorisation', 'authentication', 'apiGateway', 'jwt', 'json web token', 'cognito']
---

![header](/img/blog/multitenancy/multitenant.png)

## Introduction

Let's face it, architecting a multi-tenant cloud native backend can be quite challenging due to the broad scope of technical know-how required to execute such an undertaking. I wrote this article as an attempt to produce a distilled "how-to" guide for those who may find themselves bogged down whilst trying to implement multi-tenancy with AWS.This article assumes you have a basic understanding of Lambda Authorisers, Cognito and JWTs. If not, refer to the source code's documentation.

#### Source Code

You can clone the repo containing the source code from this [link](https://github.com/MechanicalRock/Multitenancy-AuthorizationAuthentication).

### Multi-Tenancy Example

Consider a scenario where we'd like to build an e-commerce web application. To keep things simple let's contextualize the scenario so that we only have one micro service that uses a multi tenant dynamoDb table to store/retrieve customer shopping carts. The persistence layer will consist of 4 lambdas that perform `DELETE`, `PUT`, `QUERY` and `UPDATE` actions. An architectural diagram for this scenario has been provided below.

![Multi-tenancy Architecture ](/img/blog/multitenancy/architecture.png)

1. Users authenticate with a username and password, the web app passes these to amazon cognito for validation.
2. If the supplied credentials (username and password) are valid, cognito creates a session and subsequently issues three (3) JWTs. The aforementioned tokens are id token, access token and a refresh token. The authenticated user can now send requests to api gateway along with with the id token in the headers section.
3. API gateway sends the received id token to a lambda function called an authoriser.
4. The authoriser function verifies the claims attached to the id token.
5. The authoriser returns a policy and context.
6. API Gateway evaluates the policy and forwards the request to a lambda function along with the authoriser generated context.
7. The lambda function writes/reads data to/from the database using the `tenantId`
8. A response is returned by the lambda function.

### Tenant Isolation

#### Tenant ID

To create a secure `multi-tenant` environment we require `tenant resource isolation`. In essence, `tenant A` should not be able to access the resources of `tenant B` and vice versa. We can achieve resource isolation by assigning a unique identifier, `tenantID`, to each user/customer. The `tenantID` is a composite string that is generated and then attached to the calling user as a `custom attribute` during registration.

After successful authentication the `tenantID` custom attribute becomes available as a parameter within the `ID token` as a parameter with the following key `custom:tenantID`. It is important to note that access tokens do not carry any of the user's custom attributes, only id tokens have this capability. This application only uses id tokens for authentication/authorisation purposes.

#### Lambda Context Objects

In order to make use of the idea of a `tenantID` it is important to realise that there needs to be some way of retrieving the correct `tenantID` parameter and propagating it to the running lambda function's execution scope. This is where the idea of Lambda context objects comes into play.

Context objects can be modified to include custom parameters that can then be accessed during run time. With this in mind, it should be relatively straight forward to use the application's Lambda Authoriser to forward the retrieved `tenantID` as a custom parameter within the JSON output of the lambda Authoriser.

When downstream lambdas are invoked they cam access the context object as a key within the event object. Take for example the following sample lambda event object.

`Remember to remove calls to console.log() if you are logging sensitive information `

```
{
  resourceId: 'xxxxxxxx',
  Authoriser: {
    firstName: 'Anakin',
    lastName: 'Skywalker',
    org: 'galactic empire',
    tenantId: 'sith-inc-100',
    principalId: 'xxxx-xxx-xxxx-xx-xxxxx',
    integrationLatency: 0
  },
  resourcePath: '/cart/{itemId}',
  httpMethod: 'PATCH',
  extendedRequestId: 'xxxxxxxxxx',
  requestTime: '20/May/2022:08:09:57 +0000',
  path: '/multiTenantStack/cart/1653034194717',
  accountId: 'xxxxxxxxx',
  protocol: 'HTTP/1.1',
  stage: 'multiTenantStack',
  domainPrefix: 'htieqffa0l',
  requestTimeEpoch: 1653034197210,
  requestId: 'xxx-f7f3-4641-xxx-xxxxx,
  identity: {
    cognitoIdentityPoolId: null,
    accountId: null,
    cognitoIdentityId: null,
    caller: null,
    sourceIp: 'xxx.xxx.xx.xxx',
    principalOrgId: null,
    accessKey: null,
    cognitoAuthenticationType: null,
    cognitoAuthenticationProvider: null,
    userArn: null,
    userAgent: 'axios/0.21.4',
    user: null
  },
  domainName: 'apiId.execute-api.ap-southeast-2.amazonaws.com',
  apiId: 'apiId'
}
```

#### Multi-tenant DynamoDB Table

In the context of dynamoDb, the tenant ID will essentially be the partition key that'll be used to group together/ partition customer data. When a customer needs to write/retrieve data to/from the purchase history database they'll use their unique tenant ID to only access data that belongs to them. In essence the tenant ID can be thought of as being analogous to a key that can only open a single door.

The table provided below is a representation of how the data stored in the purchase history will be partitioned. The parameter `tenantId` is used as the `partition key` while the `itemId` parameter is used as the `sort key`.

|     tenantID     | itemID      |  price   | qty | description |
| :--------------: | :---------- | :------: | :-: | :---------: |
| `Customer1-xcv9` | `timestamp` | `number` | `1` |  `string`   |
| `Customer2-dgf1` | `timestamp` | `number` | `2` |  `string`   |
| `Customer1-xcv9` | `timestamp` | `number` | `2` |  `string`   |
| `Customer2-dgf1` | `timestamp` | `number` | `2` |  `string`   |

### Fine Grained Access Control

When the Lambda Authoriser is invoked it is expected to return a JSON object that not only includes a context object that contains the `tenantID` parameter but also a resource policy as detailed [here](#lambda-Authoriser-output-sample). The policy should allow/deny access to the API and dynamoDB table depending on the outcome of the Lambda Authoriser's token claims verification.

All Allow-Policies generated will allow the authenticated user to only access data that has a partition key which matches their tenant id. This is achieved by making use of DynamoDB's `dynamodb:LeadingKeys` condition key for fine grained access control.
In essence, the `dynamodb:LeadingKeys` condition key is a mechanism for row level access control within DynamodDB tables. Employing the use of this mechanism guarantees a reliable and secure multitenant environment as well as the added benefit of a simplified data persistence layer.

![image](/img/blog/multitenancy/dynamdbFineGrainedAccess.png)

#### Lambda Authoriser Resource Policies

###### Token Verification Failed

```
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Deny",
            "Action": "*",
            "Resource": "*"
        },
    ]
}
```

###### Token Verification Passed

```
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": "execute-api:Invoke",
            "Resource": executeApiArn,
        },
        {

          Effect: 'Allow',
          Action: ['dynamodb:UpdateItem', 'dynamodb:PutItem', 'dynamodb:DeleteItem', 'dynamodb:Query'],
          Resource: this.cartTable,
          Condition: {
            'ForAllValues:StringLike': {
              'dynamodb:LeadingKeys': tenantId,
            },
          },
        },
    ]
}
```

#### Wrapping Up.

Congratulations, you have reached the end of the tutorial. If you have any questions or if you think we can help speed up your development journey, please don't hesitate to get in touch with us here at [Mechanical Rock](<(https://www.mechanicalrock.io/lets-get-started/)>).
