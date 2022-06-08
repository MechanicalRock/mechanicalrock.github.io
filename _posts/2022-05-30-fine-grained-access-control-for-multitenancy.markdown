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

Architecting multi-tenant cloud native software can be quite challenging due to the broad scope of technical know-how required to execute such an undertaking.This article is an attempt to produce a distilled "how-to" guide for those who may find themselves bogged down while building multi-tenant applications. You can clone the repo containing the reference code from this [link](https://github.com/MechanicalRock/Multitenancy-AuthorizationAuthentication).

This article begins by introducing lambda authorisers and the use of JWTs for user authorisation. If you are already familiar with lambda authorisers and JWTs you can skip ahead to a multi-tenancy example implementation of by clicking [here](#Multi-Tenancy-Example).

## Some Need To Knows

### Authentication vs Authorisation

For new developers, it is not immediately obvious that there is a difference between the terms authentication and authorisation. Although related, these terms actually refer to two different concepts. Authentication verifies a user's identity whereas authorisation verifies what a user is allowed to access once they have been authenticated. In short, authentication is about who is allowed in and authorisation is about what they are allowed to access once they are in. This article will focus on how `API Gateway` uses lambda, `Lamdba Authoriser`, for user authorisation.

### JWT

JWT is an open standard that is widely used to securely share authentication information (claims) between client and server. The standard is defined in the RFC7519 specification developed by the Internet Engineering Taskforce (IETF).

Valid JWTs contains three sections that are encoded as base64url strings separated by dot characters as shown below.

```
1. Header
2. Payload
3. Signature

<Header>.<Payload>.<Signature>
```

##### Header

The header consists of two parts, a key id `kid` and the algorithm `alg` used to sign the token.

```
{
  "kid": "abcdefghijklmnopqrsexample=",
 "alg": "RS256"
 }

```

##### Payload

The payload contains information about the user as well as other information necessary for token verification/authorisation. Collectively, The information contained in the payload is usually referred to as `token claims`. When a token is verified for authorisation it is this information that must be checked/validated.

```
{
  "sub": "aaaaaaaa-bbbb-cccc-dddd-example",
  "aud": "xxxxxxxxxxxxexample",
  "email_verified": true,
  "token_use": "id",
  "auth_time": 1500009400,
  "iss": "https://cognito-idp.ap-southeast-2.amazonaws.com/ap-southeast-2_example",
  "cognito:username": "anaya",
  "exp": 1500013000,
  "given_name": "Anaya",
  "iat": 1500009400,
  "email": "anaya@example.com"
}
```

##### Signature

The signature section is a security feature that makes it virtually impossible for bad actors to tamper with tokens. This section is the hashed and encrypted combination of both the the header and the payload sections. During token authorisation, the hash is decrypted and compared with the hash of the header and payload sections. If the two do not match, the token is considered invalid and thus unauthorized.

### Cognito JWTs

AWS has adopted and adapted the RFC7519 standard for use with the Cognito service.
When a user authenticates with cognito, three JWTs are issued:

- `id token`
- `access token`
- `refresh token`

One or all of these tokens can be passed to a custom lambda function for authorisation purposes. In this article we'll look at all three tokens and how they relate to user authorisation.

The tokens created by cognito can be used to grant access to server-side resources such as API Gateway resource paths, data stored in DynamoDb and/or S3 buckets.

### ID Token

An ID token is a JWT that contains claims related to the identity of the authenticated user i.e email, phone number and custom attributes. When used to authenticate users of a web app, the signature of the token must be verified before the claims stored in the token can be trusted.

### Access Token

An access token is a JWT that contains claims related to the authenticated user's groups and scopes. Access tokens are similar to id tokens with very few exceptions. For example ID tokens allow the use of custom attributes whereas access tokens do not. To get a full understanding of what access tokens are and how they differ from id tokens refer to the the following resources.

- [using access tokens](https://docs.aws.amazon.com/cognito/latest/developerguide/amazon-cognito-user-pools-using-the-access-token.html)

- [using id tokens](https://docs.aws.amazon.com/cognito/latest/developerguide/amazon-cognito-user-pools-using-the-id-token.html)

### Refresh Token

A refresh token is used to retrieve new access tokens. Refresh tokens have a default expiration of 30 days after a user signs into the designated userpool. This can be manually configured while creating an app for the userpool.

When a refresh token expires, the user must re-authenticate by signing in again.

## Lambda Authorizer

There are two types of Lambda Authorizers, `REQUEST` based and `TOKEN` based. This write up focuses on the latter.

A token based lambda authorizer receives the caller's identity in the form of a bearer token included in the request's header section while a request based lambda authorizer receives the caller's identity in a combination of headers and query string parameters.

When a request is received by an API gateway instance that is configured to use a `TOKEN` lambda authorizer for authorisation purposes, the `bearer token` contained in the request header is forwarded to the lambda authorizer for verification. The forwarded payload is a JSON object that assumes a structure similar to the one shown in the `Input Sample` code block shown below .

###### Lambda Authorizer Input Sample

```
{
    "type":"TOKEN",
    "authorizationToken":"{caller-supplied-token}",
    "methodArn":"arn:aws:execute-api:{regionId}:{accountId}:{apiId}/{stage}/{httpVerb}/[{resource}/[{child-resources}]]"
}
```

###### Lambda Authorizer Output Sample

Once the token is verified, the Lambda Authorizer should return an output that assumes a structure such as the one provided below.

```
{
  "principalId": "yyyyyyyy", // The principal user identification associated with the token sent by the client.
  "policyDocument": {
    "Version": "2012-10-17",
    "Statement": [
      {
        "Action": "execute-api:Invoke",
        "Effect": "<Allow|Deny>",
        "Resource": "<aws resource>"
      }
    ]
  },
  "context": {
    "key": "value",
  },
  "usageIdentifierKey": "{api-key}"
}
```

- The principalId is the user id associated with the token sent by the client.
- If the API uses a usage plan and the apiKeySource is set to AUTHORIZER, the lambda authorizer output must include the usage
  plan's API keys as the `usageIdentifierKey` property value- The principalId is the user id associated with the token sent by the client.
- If the API uses a usage plan and the apiKeySource is set to AUTHORIZER, the lambda authorizer output must include the usage plan's API keys as the `usageIdentifierKey` property value

### Verifying Tokens

Token verification is done in 3 steps.

1. Verify structure of token
2. Verify signature
3. Verify the claims

#### Verify Structure Of Token

Confirm that the token contains three dot separated base64url strings. If the token does not conform to this structure then it is invalid.
The first string is a header string followed by a payload string and then finally the signature string as shown below.

```
<Header>.<Payload>.<Signature>
```

#### Verify Signature

##### 1. Decode Token

    To validate the JWT signature, the token must first be decoded.

##### 2. Compare Local Key ID (kid) to Public Key ID

&nbsp;&nbsp;&nbsp;&nbsp;
i) Download and store your JWT's corresponding `JWK` (JSON Web Key) using the following url

&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
`https://cognito-idp.{region}.amazonaws.com/{userPoolId}/.well-known/jwks.json`

&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
substitute region and userPoolId with your user pool's region and user pool ID respectively

&nbsp;&nbsp;&nbsp;&nbsp;
ii) Search the downloaded `jwks.json` for a `kid` that matches the `kid` of your `JWT`

###### Sample jwks.json

```
        {
            "keys": [{
                "kid": "1234example=",
                "alg": "RS256",
                "kty": "RSA",
                "e": "AQAB",
                "n": "1234567890",
                "use": "sig"
            }, {
                "kid": "5678example=",
                "alg": "RS256",
                "kty": "RSA",
                "e": "AQAB",
                "n": "987654321",
                "use": "sig"
            }]
        }
```

##### 3. Compare Signature Of The issuer To The Signature Of The Tokens

The signature of the issuer is derived from the JWK with a kid that matches the kid of the JWT.
Each `JWK` contains an `n` parameter that contains the `modulus value` of the `RSA public key`.
This is the value that'll be used to derive the `issuer's signature`.
The JWK will need to be `converted to PEM format` before that can happen.

#### Verify The Claims

1. Verify that the token is not expired.

2. The aud claim in an ID token and the client_id claim in an access token should match the app client ID that was created in the Amazon Cognito user pool.

3. The issuer (iss) claim should match your user pool. For example, a user pool created in the us-east-1 Region will have the following iss value:`https://cognito-idp.us-east-1.amazonaws.com/<userpoolID>`

4. Check the `token_use` claim.

If you are only accepting the access token in your web API operations, its value must be access.

If you are only using the ID token, its value must be id.

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

Context objects can be modified to include custom parameters that can then be accessed during run time. With this in mind, it should be relatively straight forward to use the application's Lambda Authorizer to forward the retrieved `tenantID` as a custom parameter within the JSON output of the lambda authorizer.

When downstream lambdas are invoked they cam access the context object as a key within the event object. Take for example the following sample lambda event object.

`Remember to remove calls to console.log() if you are logging sensitive information `

```
{
  resourceId: 'xxxxxxxx',
  authorizer: {
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

When the Lambda Authorizer is invoked it is expected to return a JSON object that not only includes a context object that contains the `tenantID` parameter but also a resource policy as detailed [here](#lambda-authorizer-output-sample). The policy should allow/deny access to the API and dynamoDB table depending on the outcome of the Lambda Authorizer's token claims verification.

All Allow-Policies generated will allow the authenticated user to only access data that has a partition key which matches their tenant id. This is achieved by making use of DynamoDB's `dynamodb:LeadingKeys` condition key for fine grained access control.
In essence, the `dynamodb:LeadingKeys` condition key is a mechanism for row level access control within DynamodDB tables. Employing the use of this mechanism guarantees a reliable and secure multitenant environment as well as the added benefit of a simplified data persistence layer.

![image](/img/blog/multitenancy/dynamdbFineGrainedAccess.png)

#### Lambda Authorizer Resource Policies

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
