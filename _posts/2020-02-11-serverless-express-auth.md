---
layout: post
title: How to Protect a Serverless Express API with OpenID Connect
date: 2020-02-11
tags: javascript tutorial serverless sam
author: Matthew Tyler
image: img/serverless-express.png
---

<center><img src="/img/serverless-express.png" /></center>
<br/>

# Introduction

In a previous installment we mentioned that our endpoints were not protected by authentication. The time has come to change that. HTTP API's have a cool little feature: JWT authorizers. JWT's are commonly used for securing API endpoints, and many times I've written a custom authorizer to validate JWTs. It's therefore quite the time-saver to have this feature available, out-of-the-box.

As long as you have access to an identity provider that vends JWTs using one of the OAuth2 flows, you should be good to go. I'm going to use Amazon Cognito, but it should not be too difficult to use another provider. All examples here will use the implicit flow which is appropriate for a single-page application talking to a REST API. Other flows may be more appropriate for different situations.

The completed code can be found [here](https://github.com/matt-tyler/simple-node-api-auth). Feel free to clone the repository and follow along. I'll let you know when to deploy the various bits.

# Step One: Provision an Auth Provider

```yaml
AWSTemplateFormatVersion: '2010-09-09'
Transform: AWS::Serverless-2016-10-31
Parameters:
  Email:
    Type: String
Resources:
  UserPool:
    Type: AWS::Cognito::UserPool
    Properties:
      AdminCreateUserConfig:
        AllowAdminCreateUserOnly: true
      AutoVerifiedAttributes:
        - email
      UsernameAttributes:
        - email

  UserPoolDomain:
    Type: AWS::Cognito::UserPoolDomain
    Properties:
      Domain: !Ref Client
      UserPoolId: !Ref UserPool

  Client:
    Type: AWS::Cognito::UserPoolClient
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
      CallbackURLs:
        - http://localhost
      DefaultRedirectURI: http://localhost
      AllowedOAuthFlowsUserPoolClient: true
      SupportedIdentityProviders:
        - COGNITO

  CommentWriterGroup:
    Type: AWS::Cognito::UserPoolGroup
    Properties: 
      Description: Comment Writer
      GroupName: Writer
      Precedence: 0
      UserPoolId: !Ref UserPool

  User:
    Type: AWS::Cognito::UserPoolUser
    Properties:
      UserPoolId: !Ref UserPool
      Username: !Ref Email
      DesiredDeliveryMediums:
        - EMAIL
      UserAttributes:
        - Name: email
          Value: !Ref Email

  AttachUserToGroup:
    Type: AWS::Cognito::UserPoolUserToGroupAttachment
    Properties: 
      GroupName: !Ref CommentWriterGroup
      Username: !Ref User
      UserPoolId: !Ref UserPool

Outputs:
  iss:
    Value: !Sub 'https://cognito-idp.${AWS::Region}.amazonaws.com/${UserPool}'
  OpenIDConnectUrl:
    Value: !Sub 'https://cognito-idp.${AWS::Region}.amazonaws.com/${UserPool}/.well-known/jwks.json'
  AudClientId:
    Value: !Ref Client
  LoginURL:
    Value: !Sub 'https://${Client}.auth.${AWS::Region}.amazoncognito.com/login?response_type=token&client_id=${Client}&redirect_uri=http://localhost&scope=openid+profile'
```

This will generate the necessary infrastructure that will allow you to exchange a username and password for a JWT token. When instantiating the template, make sure to use a valid email address that you own as a password will be sent to it. There are a few other things that are worthy of note here.

- 'Iss' or 'Issuer'

This refers to the authorization server that verified the user and issued the tokens that indicate the users authorization.

- 'Aud' or Audience/ClientId

This references who the tokens are intended for.

If you are protecting an API with a token, it is normal to check that these fields match some expected value; this functionality will be performed later by the HTTP API JWT authorizer.

I also created a user and a group for that user to belong to. This won't be particularly relevant in this tutorial but will be important in a later installment.

You can use the stack output 'LoginURL' to browse to in order to complete a login flow. After login, the browser will redirect to a localhost address with the token in the URL. You will need to extract this token to use in subsequent steps when issuing API calls via the command line. We will come back to this after a short detour. 

As this is a pretty simple template, you can deploy it without a build step; eg, `sam deploy -t template-cognito.yaml --guided`. You will be prompted to fill in the relevant parameters.

# Step Two: Enable JWT authorization on the HTTP API

Adding authorization is actually pretty simple. An authorizer is defined on the 'Auth' field of the HttpApi resource e.g.

```yaml
  GuestBookApi:
    Type: AWS::Serverless::HttpApi
    Properties:
      DefinitionBody:
        'Fn::Transform':
          Name: AWS::Include
          Parameters:
            Location: api.yaml
      Auth:
        Authorizers:
          OpenIdAuthorizer:
            IdentitySource: $request.header.Authorization
            JwtConfiguration:
              audience:
                - !Ref Aud
              issuer: !Ref Issuer
            OpenIdConnectUrl: !Sub '${Issuer}/.well-known/jwks.json'
        DefaultAuthorizer: OpenIdAuthorizer
```

Two types are supported - 'OpenIdAuthorizer' and 'OAuth2Authorizer' - but as far as I can tell the only difference from the developer perspective is the presence of the 'OpenIdConnectUrl' property, which I've specified in the above example (this URL is where the public key of the authorization server can be found - it used to verify the signature on the authorization token that was received when we logged in). It also needs the location of the identity source, which in most cases is going to be the 'Authorization' header, as well as the issuer and audience fields (which were specified when we created the Cognito UserPool earlier.)

Finally, we need to specify which authorizers apply to which endpoints;

```yaml
  ExpressBackend:
    Type: AWS::Serverless::Function
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
          Type: HttpApi
          Properties:
            Path: /
            Method: get
            ApiId: !Ref GuestBookApi
            Auth:
              Authorizer: NONE
        Post:
          Type: HttpApi
          Properties:
            Path: /
            Method: post
            ApiId: !Ref GuestBookApi
            Auth:
              Authorizer: OpenIdAuthorizer
```

As can be seen above, I've allowed anybody to call the 'GET' endpoint by specifying 'Auth.Authorizer=None', but have selected the 'OpenIdAuthorizer' for the 'POST' endpoint. This will allow users to fetch comments without needing to authenticate. If they want to post a comment though, they will need to login.

As before, you can deploy this via `sam build && sam deploy --guided`.

# Making Authenticated Requests

Back in the first tutorial we used a script to make requests via curl. If you were to run this script against the API now, you will find that the POST requests will now fail. We'll need to make a few adjustments to the script.

```bash
#!/bin/zsh

# Your API endpoint address is available from the output of your deployment
ENDPOINT=<YOUR ENDPOINT>
# The token will need to be retrieved via login
TOKEN=<YOUR TOKEN>

# this should return nothing e.g. {"Items":[]}
curl $ENDPOINT

# now send some data
for i in {1..10}; do
    curl -XPOST -H "Content-Type: text/plain" -H "Authorization: $TOKEN" -d "Message: $i" $ENDPOINT
done
```

The main difference here is that we need to set the value of 'TOKEN' and provide it in the authorization header. Those familiar with OAuth2/OIDC will notice the 'Bearer' prefix is missing in the authorization header. For some reason or another, the spec has not been correctly followed for JWT Authorizers so it must be omitted from the header. Hopefully the service team will get around to fixing this soon.

You will need to retrieve a token from the login endpoint. You can get the address of the endpoint from the stack output of the cognito stack template. Login with the email address you used in the template, and the password that should have been sent to your email address. You will probably be prompted to change the password, at which point you will be able to login correctly. You will be redirected to localhost which will be a 404 error, but you can copy the address out the bar to retrieve the token. The URL will look like this;

```
http://localhost/#id_token=eyJra...BGuc32w&access_token=eyJra...Hn4w&expires_in=3600&token_type=Bearer
```

The long string in the 'id_token' is what should be provided to the API endpoint in the authorization header to get things working. Note that typically, one would use the access token, but it does not include an 'aud' field which is required for the current crop of JWT Authorizers. Unfortunately, scopes are only included in the access token. Therefore you cannot use scopes to restrict access via Cognito issued tokens on HTTP API endpoints. Hopefully AWS will fix this soon as well, but for now we'll deal with the id token and ignore scopes.

# Fixing the Auto-generated Client

Usually, one would add a set of 'securitySchemes' to the swagger document which would reference the correct authentication method (OpenID in our case). However, this only works when the server address is know; we don't know in our case because I'm not issuing my own domain name and certificate. And at any rate, putting this information in the OpenAPI document probably wouldn't help because tokens aren't using the correct 'Bearer' prefix anyway. If we aren't following the spec, we can't expect the third-party tools to work. 

This doesn't mean we can't work around it though. In this case, we just need to override Axios to include our Authorization header.

Assuming you have stored the token as an environment variable, the following excerpt would work.

```typescript
import { DefaultApi } from "../src/api";
import axios from "axios";

describe("Test My API: Create 3 messages", () => {
    const instance = axios.create({
        headers: {
            Authorization: process.env['TOKEN']
        }
    })

    const api = new DefaultApi({},
        process.env['ENDPOINT'],
        instance
    );

    const messages = [
        "message 1",
        "message 2",
        "message 3"
    ];

    # ...
```

Note that you would not do this for tests normally, because you would need a way to acquire the token automatically as opposed to a manual login. Using a Client ID and secret would be more acceptable for this kind of machine-to-machine flow. If you were to create CLI tool around the auto-generated client, it would be acceptable to open up a browser session and intercept the returned token, storing it in the environment for later use. This is more or less what some cloud providers do for their own CLI tools.

# A Note on Role-Based-Access-Control

There are many ways to provide differing levels of access to different users. The two most common are Attribute-Based-Access-Control and Role-Based-Access-Control. In practice they are reasonably similar, so I'll stick to describing role-based-access-control. Applications often find themselves requiring different role and these typically might include; 

- a read-only role; users might use this who need data from the application for purely informative or audit reasons,
- an editor role; for users who interact regularly with the system and need to input data, and
- an admin role; to manage the system.

The roles typically need differing levels of permissions, but it can be quite confusing as to how this fits into OpenID and OAuth2. Neither specification really calls out how to do this; it's left as an exercise to the reader. Unfortunately, the presence of the 'scope' field often confuses the matter - as this often 'seems' like a way to provide some form of role/attribute based convention.

The reality is that scopes aren't really meant for this. Scopes are meant to indicate to the user the maximum level of access that the application is requesting permission to use on behalf of the user, and allow the user the opportunity to reject this request. They are not meant to provide the level of fine-grained access control that most developers are attempting to provide. If you find that confusing, allow me to clear it up with an example.

1. Doug is wanting to perform some operations on a storage bucket in his account. This requires Doug to aquire a token, so Doug logs in via a Web Interface.
2. The client application fetches a token on behalf of Doug, specifying that Doug will require read/write access to buckets - this might be represented by the scope 'buckets.com/bucket.ReadWrite'
3. Doug gets his token with the correct scope.

This is where it gets tricky. Note that nowhere did we specify what bucket we would be writing into, or even whether it was in Doug's account. Even if we did, should the authorization server be aware of the existence of multiple buckets and narrow down the scope? Does the authorization server need to know about all the other services that 'bucket.com' might provide? Is this even practical? Most of the time, I've found the answer is 'no' - it's better to use a course-grained scope that indicates a certain level of 'intent' for what the token is going to be used for, and allow the service, post-authorization, to evaluate a particular action via some policy.

This means, that for a flow that is using OpenID/OAuth2, I would typically run through the following actions;

1. Allow the user to login, requesting scopes that offer a certain amount of profile information (eg profile, email etc), as well as a scope indicating that I wish to access group/role information for the particular user.
2. From this, I expect to get an id token (with some information about the user), and an access token which I can send on to resource server (in most cases, some other API).
3. I provide the access token to the API which validates the token. At this point, I'm authorized to call the API, but the API is responsible for additional resource protection.
4. The API will see that I have the 'roles' scope, therefore indicating that I have allowed the API permissions to request my roles/group entitlements. It will therefore get a list of all my roles/groups.
5. A policy engine, like Casbin, or Open-Policy-Agent, will use my list of roles, as well as knowledge of other attributes of the request (eg, specific resource, and action) to evaluate whether I'm actually allowed to do what I'm intending to do.

This type of workflow is quite common, and you can see it somewhat implemented in more complicated Cognito flows than what I have presented here. In the next installment, we will look at practical example of implementing this kind of policy authorization in a manageable way. 

# Conclusion

Thanks for coming along through the weird and wonderful world of adding authorization to an endpoint. I'll have to admit, I didn't expect to see quite as many 'clashes' between the official specification and that of API Gateway's HTTP API JWT Authorizers. I wouldn't go as far as to say it's unusable, but I think it's worth keeping in mind the specific issues you are likely to encounter when using it. Hopefully the article has given you some ideas as to how work around the current limitations, if you do decide to use it. Next time we'll looking into implementing role-based-access-controls in our Serverless Express API.

APIs not respecting your authoritah? [We can help.](https://www.mechanicalrock.io/lets-get-started)