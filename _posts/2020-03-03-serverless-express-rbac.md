---
layout: post
title: Role Based Access Control By Example
date: 2020-03-03
tags: javascript tutorial serverless aws
author: Matthew Tyler
image: img/serverless-express.png
---

<center><img src="/img/serverless-express.png" /></center>
<br/>

# Introduction

We added a JWT Authorizer to our API in the last installment. A user that wanted to submit comments would therefore need to authenticate with an Identity Provider (IdP) first. At the end of that piece we also discussed some of the limitations inherent within our implementation, and touched briefly on claims/scopes. Claims/Scopes are a part of the OAuth2 specification that define the properties of the token we passed to our API. It's time to have a bigger discussion about them, and how they relate to various forms of access control, like role-based-access-control (RBAC) and attribute-based-access-control (ABAC).

Code for this tutorial can be found [here](https://github.com/matt-tyler/simple-node-api-rbac).

# Claims and Scope - Practically.

A better way to describe these is to consider a practical example. Scopes were originally conceived as a way for the user to offer consent to a third-party. The canonical example everyone uses is LinkedIn, but that's a little worn out, so let's use a bank as an example.

Imagine a company (completely indepedent of the bank) launches a new web service. This service aims to analyze your spending history of your savings account and produce detailed reports and suggestions to help you save money. To do this they require you to give over your username and password for your banking account, as this will need login in to your account to scrape the information.

This is bad because they have access to credentials which are not limited to the job that they are intending to perform, and also because there is no way for the user to consent to the specific activities they want to perform. 

OAuth2 solves these both these problems. With OAuth2, registering with the service would result in a redirect to the bank's authorization page. The bank would list the permissions that the service is requesting (e.g.; read statements), allowing the user to explicitly consent to the delegation of permissions. If they accept, credentials would be issued that would allow the service to request informtion about the users bank statements.

OAuth2 works well in this case. However, the restrictions of permissions leads people to incorrectly assume that all that is required for access control is the scopes and claims which is not strictly true. A typically token issued by a bank (like the one in the example) might look like this;

```json
{
  "iss": "http://auth.bank.com",
  "sub": "my-user@bank.com",
  "aud": "76616b84-ad91-4718-8672-fc7d4c0975ae",
  "scopes": [
    "mybank.com/statements.read"
  ],
  "exp": "...",
  "nbf" "...",
}
```

Note the 'mybank.com/read.statements' scope, which we could assume to mean 'the token allows the user to read statements'. But whose statements are they allowed to read? Their own? everyone? Someone else? The OAuth specification does not detail this! Does this mean we need to explicitly create scopes for every scenario? How large would that make the token? And does that mean that the token issuing server now needs knowledge of every single permission and user in the system? Is this practical?

Sometime it is, and sometime it isn't. I think it is a fair assertion that some kind of additional form of policy evaluation logic is needed in most cases.

# Policy Evaluation

There are quite a few different policy evaluation mechanisms out there, though they often follow a fairly basic pattern. Most use some kind of declaritive language that works on subjects, actions, and objects/resources, and indicates whether a user is allowed to do something.

- Subject

  The subject is the actor that is attemtping to do something; in most cases, this is a user or some system identity.

  In AWS, this is usually the identity of the caller for a typical IAM permission, or the identity in the principal statement for a resource based policy.

- Action

  This is the 'something' that the subject is attempting to do. This could be reading or writing, or some other kind of method.

  This is (not surprisingly) the action property in a typical IAM policy.

- Object

  The object is what is being acted upon; e.g. we are creating a 'message', we reading 'statements'. In terms of a typical HTTP API this is the resource.

  In AWS this refers to the resource section in a policy statement.

- Effect

  Indicates whether a matching policy results in 'Allow' or 'Deny'. Different systems result in difference precedence e.g. Does a 'Deny' result in overriding a matching 'Allow' case? Are all permission default-deny or default-allow?

  This is obviously the 'Effect' clause in an IAM policy statement and AWS has chosen to implement default-deny with deny override.

There are obviously extensions to this, and AWS has implemented many of them via the condition statements, but this is the basic language that is required to begin implementing some form of access control policy that goes beyond what is available in OAuth2 scopes.

# But How?

https://twitter.com/ben11kehoe/status/1221485404362366976

AWS has been adding a lot of features to use OAuth directly with API Gateway, skipping Cognito Identity Pools and AWS IAM. I think this is regressive. A lot of useful functionality is coming out of it, but we should hope to get that IAM-side instead.

In a perfect world this would all be handled by some native mechanism that is present in the cloud provider, as alluded to by Ben Kehoe's statement. There exists various mechanisms in AWS to do parts of the process but they do not currently all align to solve the whole problem. Fundamentally, some mechanism is required to enable us to practically use the IAM policy evaluation engine upon the principals, attributes and resources that WE define, and not just the ones available natively in the platform.

Cognito does a good job of handling user registration and various token related tasks, but it does not currently propogate the information necessary to perform these kinds of policy decisions. This is a future that is probably coming, as illustrated by new ABAC mechanisms introduced via tags, and exemplified by propagating session tags in AWS SSO.

We could see a world where a user would log in via Cognito and receive access to an IAM role via a pair of credentials. These credentials would be bound to session-tags that were created by the platform, that would include information about the users precise identity, which could then be used to scale-back their permissions e.g. prevent them from reading certain rows from dynamodb via the leadingkey condition, or restrict reading of S3 files to specific prefix. Likewise, requested scopes or group membership within user pools (or other third party directories) could propogate other information to session tags to enable further flexibility within access policies. 

This would keep the policy definition and evaluation mechanism inside the platform/infrastructure level, and outside of the application domain.

Unfortunately this isn't supported yet via Cognito and API Gateway. HTTP API is even more restrictive, only allowing the use of a JWT, so we are even further away from native IAM controls. So until the time comes that the feature set of HTTP API authorizers increases, and until a robust session tag mechanism appears in cognito, we will need to take a [code-wise, cloud-foolish](https://forrestbrazeal.com/2020/01/05/code-wise-cloud-foolish-avoiding-bad-technology-choices/
) approach and implement our own mechanism for defining and evaluating access policies.

To make matters worse, HTTP API Gateway JWT authorizers must have an Aud claim on the token, which cognito access tokens do not include. Scopes are also not included on Cognito ID tokens. As far as I can tell, this means that you can't use the scope check feature on JWT authorizers if you are using Cognito. You can get around this using cognito user pool groups, which is what I will demonstrate going forward.

# Policy Evaluation Engines

There are a few policy evaluation engines available, but I'm only familiar with two of them.

- [Open Policy Agent](https://www.openpolicyagent.org/)

  Open Policy Agent is a project that is currently under incubation status with the Cloud Native Computing Foundation. It is written in Go.

- [Casbin](https://casbin.org/)

  Casbin is a open source project that has been around for a few years. It was originally written in Go, but now supports multiple different languages and policy storage backends.

I've used Casbin in production services written in Javascript and Go, so due to familiarity I will use Casbin for our examples. It's possible to do some very funky things in Casbin using either ABAC or RBAC-style policy controls (or a mix of both), but I'll stick to a fairly simple/common RBAC model.

Using Casbin and Cognito, we will enhance our existing guestbook application;

1. We will create cognito 'groups' that will indicate whether a user can
  - read comments, (reader)
  - write comments, (writer)
  - delete comments (deleter)

2. We will write a policy that determines
  - What groups map to what roles in the policy engine
  - What the roles in the policy engine are allowed to do

I will include some examples demonstrating the results of the policy evaluation.

# Implementing RBAC with Casbin

Let's start by defining our policy and model. The model determines how the actors in the policy interact, and the policy is the list of valid statements. It is much easier to understand with an example, so let's start by looking at the casbin policy.

```toml
[request_definition]
r = sub, obj, act

[policy_definition]
p = sub, obj, act

[role_definition]
g = _, _

[policy_effect]
e = some(where (p.eft == allow))

[matchers]
m = g(r.sub, p.sub) && keyMatch2(r.obj, p.obj) && r.act == p.act
```

This takes a fair amount of explaining. I'll go over each block one-by-one.

- request_definition

  The 'request_definition' describes that there are going to be three actors in any request; the subject, the object and the action.

- policy_definition

  The 'policy_definition' describes how we can construct policies. Any inbound request will be later 'matched' against the policy to determine the policy effect.

- role_definition

This is the most confusing aspect of the model, but essentially says that there is one role definition 'g', and that roles can contain other roles. This can be used to establish role-inheritance and heirarchy e.g. writer contains the permission to write, plus all the permissions that were granted to the reader role.

- policy_effect

  The 'policy_effect' determines whether we allow or deny a matching request. This statement is saying that we have 'default deny', but one matching statement will result in 'allow' - so if we had a statement later that had a 'deny' action, it would overridden by the 'allow'. (I don't actually like this but I figure we'll keep things simple).

- matchers

  The section defines how the matching logic works, and is specific to casbin. It states that 
  - the subject in the request must belong to a group/role, and,
  - the object in the request match via a glob,
  - and the actions defined in the request,

  Must match those specified in the policy document.

The documentation explains how to build all sorts of different models for different situations. Understanding the model documents is difficult and I personally find that the policy documents are far easier to grok.

```
p, role:reader, /messages, read
p, role:writer, /messages, write
p, role:deleter, /messages, delete

g, role:deleter, role:writer
g, role:writer, role:reader
```

At the top we have defined the roles along with their related unique permissions. The section at the bottom is used to define the heirarchy. Here we stated that the deleter role includes the permissions granted by the writer, which in turn is granted the permissions assigned to the reader.

The next step is to wire this all up in Express. As a first step, I tried to locate all the policy related logic in a single file.

```javascript
const casbin = require('casbin');

const enforcerPromise = casbin.newEnforcer(
    // I have inlined the model and policy as a string literal.
    // I have not repeated it here because it is already above.
    casbin.newModel(model),
    new casbin.StringAdapter(policy));

async function enforce(sub, obj, act) {
    const e = await enforcerPromise;
    return await e.enforce(sub, obj, act);
}

async function addRolesToUser(sub, roles) {
    const e = await enforcerPromise;
    await Promise.all(roles.map(role => e.addRoleForUser(sub, `role:${role}`)));
}

module.exports.enforce = enforce;
module.exports.addRolesToUser = addRolesToUser;
```

We initialize a casbin enforcer, and then export two functions. The first of these functions is for policy evaluation against the request. The second is to load the users groups/roles into casbin, so that policy evaluation can function correctly.

The next step is too hook into the express system via middleware.

```javascript
// ...
const rbac = require('./rbac');
const jwt = require('jsonwebtoken')

// ...

const methodToAction = {
    GET: 'read',
    PUT: 'write',
    POST: 'write',
    DELETE: 'delete'
}

app.use((req, res, next) => {
    const token = req.headers['authorization'];
    const decoded = jwt.decode(token, { json: true });
    const { sub } = decoded;
    const groups = decoded['cognito:groups'] || [];
    const { path: obj } = req;
    const act = methodToAction[req.method];
    console.log({ sub, obj, act});
    console.log(sub, groups);
    rbac.addRolesToUser(sub, groups).then(() => {
        rbac.enforce(sub, obj, act)
            .then(pass => {
                if (pass) {
                    next()
                } else {
                    res.status(403).json({ message: 'Forbidden' });
                }
            })
    })
    .catch(err => {
        console.log(err);
        throw err;
    });
});
```

Now every time a request is sent, the following happens;

1. The token is copied from the header.
2. The token is decoded, and subject and groups claim from the header is extracted.
3. The user and their groups are registered with Casbin.
4. The object is extracted from the path, and the action determined from the method.
5. The subject, object, and action of the request are evaluated against the policy.
6. Either it evaluates successfully against the policy and the request continues, or a 400 client error is returned.

Cognito requires a little bit of additional configuration. The template is available in the repository, but let's call out some new additions.

```yaml
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

  CommentReaderGroup:
    Type: AWS::Cognito::UserPoolGroup
    Properties: 
      Description: Comment Reader
      GroupName: reader
      Precedence: 0
      UserPoolId: !Ref UserPool

  CommentDeleterGroup:
    Type: AWS::Cognito::UserPoolGroup
    Properties: 
      Description: Comment Deleter
      GroupName: deleter
      Precedence: 0
      UserPoolId: !Ref UserPool

  AttachUserToWriterGroup:
    Type: AWS::Cognito::UserPoolUserToGroupAttachment
    Properties: 
      GroupName: !Ref CommentWriterGroup
      Username: !Ref User
      UserPoolId: !Ref UserPool

  AttachUserToReaderGroup:
    Type: AWS::Cognito::UserPoolUserToGroupAttachment
    Properties: 
      GroupName: !Ref CommentReaderGroup
      Username: !Ref User
      UserPoolId: !Ref UserPool

  AttachUserToDeleterGroup:
    Type: AWS::Cognito::UserPoolUserToGroupAttachment
    Properties: 
      GroupName: !Ref CommentDeleterGroup
      Username: !Ref User
      UserPoolId: !Ref UserPool
```

Most of this involves the addition of some groups that match the roles referenced in the policy; reader, writer and deleter. I've added the generated user to all of these groups. As I've said previously, make sure to use an email address you own when instantiating the cognito template, as it will send a password to your email address.

To get everything going, download the repository, and deploy the `cognito-template.yaml` file. Use the outputs from this stack as inputs to the SAM template that defines the API, by invoking `sam build && sam deploy --guided`. The outputs of the SAM template contains a login URL that can be used to access the login page. From this, you can login and acquire the ID token from the callback URL.

Fill in the ENDPOINT variable using the address of your API, and use the id_token from the login callback URL for the TOKEN variable.

```bash
ENDPOINT=''

TOKEN=''

curl -H "Authorization: $TOKEN" $ENDPOINT https://aofawfjzw7.execute-api.ap-southeast-2.amazonaws.com

curl -XPOST -H "Content-Type: text/plain" -H "Authorization: $TOKEN" -d "Message: My Message" $ENDPOINT
```

You'll find that both calls will succeed, as we have given the user identified by the token permissions to read, write and delete.

Now we'll remove our user from the groups. To do this go to Cognito in the AWS Console. Select 'User Pools' and click on the one that we created. From here, select users, and click on the only user. The groups will be displayed at the top. Click the 'x's to remove all the groups from the user.

Try to run the above script again. It still succeeded, why?

Well, we are still sending a verified token that contains all the users groups, and we did not regenerate this token after we removed the groups. It will eventually expire, but until then it will still confer the priviledges associated with the user. You could instead query the users groups from cognito directly on every request, but this will add additional latency. Like most things, it's a trade-off. Try logging in again and issuing the requests with a new token. You'll find it still works.

Try adding different combinations of groups, hit the API, and see what happens!

# Summary

We had a brief discussion around the limitations of scopes, and raised a scenario to explain what is not covered by the specification. We then briefly introduced ABAC and RBAC styles of access policy, and introduced the possibility of better implementation within AWS Cognito in future. We then considered policy authorization, and discussed some popular access policy evaluation libraries. Of these libraries, we chose to use Casbin to demonstrate how to build a policy model. We use casbin to add a middleware to our guestbook express application, which evaluated whether a user had access to specific resources based on their membership of cognito groups.

Feeling RBAC'ed into a corner? [Mechanical Rock can help!](https://www.mechanicalrock.io/lets-get-started)