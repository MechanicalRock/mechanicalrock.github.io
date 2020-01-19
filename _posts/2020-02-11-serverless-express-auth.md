---
layout: post
title: Build & Deploy a Serverless Express API to AWS
date: 2020-02-11
tags: javascript tutorial serverless sam
author: Matthew Tyler
image: img/serverless-express.png
---

<center><img src="/img/serverless-express.png" /></center>
<br/>

# Introduction

# Step One: Provision an Auth Provider


```yaml

Resources:
  UserPool:
    Type: AWS::Cognito::UserPool
    Properties:
      AllowAdminCreateUserConfig:
        AllowAdminCreateUserOnly: true
        AliasAttributes:
          - email
        AutoVerifiedAttributes:
          - email
        UserNameAttributes:
          - email

  Client:
    Type: AWS::Cognito::UserPoolAppClient
    Properties:
      AllowedOAuthFlows:
        - implicit
      AllowedOAuthScopes:
        - email
        - openid
        - profile
      SupportedIdentityProviders:
        - COGNITO
      UserPoolId: !Ref UserPool
Outputs:

  iss:
    Value: !Sub 'https://cognito-idp.${AWS::Region}.amazonaws.com/${UserPool}.'
  OpenIDConnectUrl:
    Value: !Sub 'https://cognito-idp.${AWS::Region}.amazonaws.com/${UserPool}/.well-known/jwks.json'
  Aud_ClientId:
    Value: !Ref Client

```

https://docs.aws.amazon.com/cognito/latest/developerguide/login-endpoint.html

make changes to the API to add authentication on every endpoint

curl login endpoint - extract token
decode token
