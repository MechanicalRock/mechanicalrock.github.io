---
layout: post
title: Rotation of Secrets with AWS Secrets Manager
date: 2020-02-03
tags: javascript tutorial aws secrets
author: Matthew Tyler
image: img/rotation/title.png
---

<center><img src="/img/rotation/title.png" /></center>
<br/>

# Introduction

A constant frustration of mine is sharing secret material between two services. A good deal of the time, this is to allow Service A to access Service B. Unfortunately, I've seen a lot instances of hardcoding credentials between both services. There are lot of things wrong with this.

> Chaos ensues if the secret ever needs to change

Secrets management is often a chore. If you aren't changing a secret often, you aren't practicing it, and therefore it will be difficult to do when you need to it. The last thing you want to do is trying to work out how to change a secret after it has been compromised.

> It's brittle

I've seen configuration files get 'lost' resulting in complete chaos to bring the services back up, because it wasn't clear where the secrets were being sourced from.

> Why all this manual handling in the first place?

Fundamentally, I don't even care what the secret is - I don't need to know and neither does anyone else. The only actors that need to know the secret is service A and service B. So why have metaphorical humans running around with slips of metaphorical paper with magic words on them?

Can't we cut out the middle-man? Let's learn how understanding secret rotation can help us.

# How Secrets Rotation Works

Secret rotation essentially works by keeping two values of a secret valid at any time. When a rotation is performed, we generate a new secret and deprecated the oldest version.

1. Initially we start with two valid secrets, the 'nth-1' value and the 'nth' value. These are typically marked with a label, denoting one as the 'current' (most recently generated) secret, and the other as 'previous'. Any requests for a secret will return the current value, but any requests that are sent using the previous secret should (in the best case) still work.

<center><img src="/img/rotation/step01.png" /></center>

2. At some point, a rotation is initiated. This results in the creation of the 'n+1' value. This then goes into a 'pending' state.

<center><img src="/img/rotation/step02.png" /></center>

3. The pending secret is transferred to the other system, e.g. where it needs to be set as a new password. If this works, currently three different passwords should work to access the system.
4. Usually the system would perform a test now to ensure the new secret works, before it removes any existing secrets.
5. Assuming the test passed, we can proceed to shuffle the secrets around. The 'nth+1' secret is now labeled as the 'current' secret, and the 'nth' secret is now labeled as previous. The 'nth-1' secret is now unlabeled, marking it as deprecated, and will be deleted at some point. The rotation has now completed.

<center><img src="/img/rotation/step03.png" /></center>

Most importantly, this is all automated so I never even need to know what the secret is - my services just need to be able to reference the address of the secret to fetch the value.

There are problems with this method for some systems. If you must absolutely use a one-user, one-password scenario because that is all the protected system supports, systems that have pulled an older secret will need to attempt to refresh the secret on an authorization failure. You can avoid this is if the system is capable of handling multiple users. AWS has pretty good documentation on a few common secrets rotation scenarios, and it is worth reading if you want to understand secrets rotation in more detail.

[Rotating Secrets - One User, One Password](https://docs.aws.amazon.com/secretsmanager/latest/userguide/rotating-secrets-one-user-one-password.html)
[Rotating Secrets - Switch Between Existing Users](https://docs.aws.amazon.com/secretsmanager/latest/userguide/rotating-secrets-two-users.html)
[Rotating Secrets - Passwords Only](https://docs.aws.amazon.com/secretsmanager/latest/userguide/rotating-secrets-one-user-multiple-passwords.html)

At any rate - key to all of this is ensuring that whatever is using the secret understands when it is about to expire, or it is capable of recognizing they are using an invalid credential and will attempt to refresh it.

With that in mind, we are going to look at using AWS Secrets Manager to perform secrets rotation.

# What is AWS Secrets Manager

AWS Secrets Manager is a secrets management service (obviously) that is primarily intended to help developers secure access to services. If you are familiar with something like HashiCorp Vault, this should be familiar territory. You can store secrets in it and then access them at run-time. Like all services on AWS, it has great integration with IAM and CloudTrail, and therefore it is easy to audit access to secret material. It's also capable of rotating secrets and distributing the rotated key material to services that need them - which is pretty cool. It has out of the box support for this for a tonne of managed databases services on AWS (like RDS), which means no more set-and-forget admin passwords that get lost, or worse - compromised. You can also define custom secrets rotation which brings us to the whole point of this article!

# A Motivating Example

I wasn't all too long ago we were building out a CloudFormation template that would act as an 'enterprise' ready, one-click method to deploy single-page-applications built with frameworks like react and angular. This involved ensuring that a lot of authentications flows were handled server-side, and that web content would be protected as well. No login - no content. This involved a fair amount of thought, and involved a collection of Lambda @ Edge functions with CloudFront to provide the neccesary redirect functionality. 

We also wanted to exchange a JWT from a third party identity provider for a signed cookie, in order to protect access to the content behind CloudFront. [This is actually standard functionality in CloudFormation](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/private-content-signed-cookies.html) but we had a few issues with how it all works;

1. It clashed with a requirement to provide deep-linking functionality

    Users would commonly receive links to specific paths in an application - e.g. orders in an ordering system. We would therefore need to accept some information about the original request, i.e. the path, and send it back in a cookie along along with the instruction to redirect to the login page if the user was unauthorized. This allows the client application to redirect the user to a specific path upon login. We would need to perform some additional work via Lambda @ Edge, but we found that using CloudFront signed cookies would prevent this as the request would be 403 rejected before triggering the Lambda. We were therefore prevented from inspecting the request.

2. The way CloudFront keys are generated (atm) kind of sucks

    To use CloudFront signing, you must generate a set of keys in IAM. This must be done via the Console, and can only be done by the root user of the account. There is no way to rotate these keys other than manually, and you get one set of keys for all distributions in your account.

My solution to get around this is to generate my own keys using AWS Secrets Manager on tighter rotation schedule, and implement my own signing/validation flows in Lambda @ Edge. The following diagram illustrates roughly what needs to happen.

<center><img src="/img/rotation/cf-flow.png" /></center>

The critical piece of the puzzle is having a secret and rotating it, and then retrieving it, so this is what I'll cover now. 

# Building a CloudFormation Template

Everyone knows that life on earth began with a CloudFormation template, so this is where we start.

Let's walk through some of the resources in the template.

```yaml
  SigningKey:
    Type: AWS::SecretsManager::Secret
    Properties:
      Description: Signing key
      GenerateSecretString:
        PasswordLength: 4096
```

Our first resource declares the secret itself. We are using 'GenerateSecretString' to ensure a random string of 4096 characters long is generated on instantiation. You can also specify a starting value, but as said previously I don't want to know or care about what the exact value of the secret is. Under the hood, 'GenerateSecretString' uses the 'get-random-password' API call of the AWS Secrets Manager service. We will use it later when writing custom rotation logic.

Speaking of rotation logic, let's define a Lambda function which will house it.

```yaml
  SigningKeyRotationLambda:
    Type: AWS::Serverless::Function
    Properties:
      Runtime: nodejs12.x
      Handler: app.lambdaHandler
      CodeUri: ./src
      Policies:
        - arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole
        - arn:aws:iam::aws:policy/AWSXrayWriteOnlyAccess
        - Statement:
            - Effect: Allow
              Action:
                - secretsmanager:DescribeSecret
                - secretsmanager:GetSecretValue
                - secretsmanager:PutSecretValue
                - secretsmanager:UpdateSecretVersionStage
              Resource: !Ref SigningKey
            - Effect: Allow
              Action: secretsmanager:GetRandomPassword
              Resource: '*'

  SigningKeyRotationLambdaPermission:
    Type: AWS::Lambda::Permission
    Properties:
      FunctionName: !GetAtt SigningKeyRotationLambda.Arn
      Action: lambda:InvokeFunction
      Principal: secretsmanager.amazonaws.com
```

Here we define our Lambda function, of particular note is the permissions and policies we need to apply. The Lambda function includes the basic execution role, and x-ray write access, which are managed policies that I always include to ensure the function can log and trace correctly. We also include a statement that allows us to make the API calls that are required to perform a successful rotation. Finally, we need to provide a resource policy to allow the AWS Secrets Manager service to invoke our Lambda function when a rotation is needed.

The last piece of the puzzle is the rotation schedule.

```yaml
  SigningKeyRotationSchedule:
    Type: AWS::SecretsManager::RotationSchedule
    Properties:
      RotationLambdaARN: !GetAtt SigningKeyRotationLambda.Arn
      RotationRules:
        AutomaticallyAfterDays: 1
      SecretId: !Ref SigningKey
```

The rotation schedule specifies with secret to rotate, with what Lambda function, on what schedule. Of note, one rotation function is capable of rotating various secrets. Secrets can be rotated between 1 and 1000 days.

# Building a Rotation Function

Let's construct our own rotation function. I've essentially translated a python example available [here](https://github.com/aws-samples/aws-secrets-manager-rotation-lambdas/blob/master/SecretsManagerRotationTemplate/lambda_function.py) into javascript. This wasn't a case of 'rewrite-in-rust' syndrome so much as it was going through motions to learn how everything works.

Let's take a look at the entry point of our function.

```javascript
const SecretsManager = require('aws-sdk/clients/secretsmanager');

module.exports.lambdaHandler = async (event) => {
    const {
        SecretId: arn,
        ClientRequestToken: token,
        Step: step
    } = event;

    const client = new SecretsManager();

    const metadata = await client.describeSecret({ SecretId: arn}).promise();
    if (!metadata.RotationEnabled){
        throw new Error(`Secret ${arn} is not enabled for rotation`);
    }

    const { VersionIdsToStages: versions } = metadata;
    if (!Object.keys(versions).includes(token)) {
        throw new Error(`Secret Version ${token} has no stage for rotation of secret ${arn}`)
    } else if (versions[token].includes('AWSCURRENT')) {
        return;
    } else if (!versions[token].includes('AWSPENDING')) {
        throw new Error(`Secret version ${token} not set as AWSPENDING for rotation of secret ${arn}.`)
    }

    switch(step) {
        case "createSecret":
            return await createSecret(client, arn, token);
        case "setSecret":
            return await setSecret(client, arn, token);
        case "testSecret":
            return await testSecret(client, arn, token);
        case "finishSecret":
            return await finishSecret(client, arn, token);
        default:
            throw new Error("Invalid step parameter")
    }
}
```

It all looks pretty standard.

1. Import the service client and strip appropriate values out of the event payload.
2. Pull back some data about the secret to ensure it exists and has rotation enabled.
3. The next steps are to do with validating the secret is an appropriate state
    1. If the secret has no version matching the token on the input event, chances are this rotation function somehow got invoked on the wrong secret, or the version has been deprecated. Throw an error and exit, else carry on.
    2. If the invoking token is the current secret version, we don't need to do anything, so return early.
    3. If the invoking secret is not in a pending state, throw an error.
4. After that bit of validation, we dispatch to a bunch of different handler functions.

The only API exposed to users is function to start a rotation; AWS Secrets Manager is responsible for orchestrating all of the events that are nessecary to create and rotate in a new secret. This leaves the user to define a set of handlers that idempotently handle each step of the rotation process, without needing to do the hard work of ensuring they are all called in the correct order and that they are resillient to failure.

I will detail what those handler functions entail now. Let's start with createSecret.

```javascript
async function createSecret(client, arn, token) {
    await client.getSecretValue({
        SecretId: arn, VersionStage: 'AWSCURRENT'
    }).promise();

    try {
        await client.getSecretValue({
            SecretId: arn, VersionStage: 'AWSPENDING', VersionId: token
        }).promise();
    } catch (e) {
        if (e.code === 'ResourceNotFoundException') {
            const { RandomPassword: passwd } = await client.getRandomPassword({
                PasswordLength: 4096
            }).promise();

            await client.putSecretValue({
                SecretId: arn,
                ClientRequestToken: token,
                SecretString: passwd,
                VersionStages=['AWSPENDING']
            }).promise();
        } else {
            throw e;
        }
    }
}
```

The point of this function is to generate a new secret in the pending state. It works by;

1. Ensuring that a secret already exists in the 'current' state. Otherwise, bubble the error back up.
2. It will then check if the secret we are generating already exists or not.
    1. If it does - no work needs to be done and we can return.
    2. If it doesn't exist, we generate a new secret using get-random-password (like the template did) and then create a new version of the secret with this value.

Two of our handlers remain unimplemented because they are not useful in my particular scenario.

```javascript
async function setSecret(client, arn, token) {
    throw new Error("Not Implemented");
}

async function testSecret(client, arn, token) {
    throw new Error("Not Implemented")
}
```

If I were to interact with a service like a MySQL database, I would need to update the password using it's own API's, because there is no other way for the database to fetch the credential by itself. I do not have this limitation because I can fetch the secret at run-time. As such, I do not need to implement either of these functions.

The last thing to implement is the finalizer.

```javascript
async function finishSecret(client, arn, token) {
    const currentVersion = await getCurrentVersion(client, arn);
    if (currentVersion === token) {
        console.log(`finishSecret: Version ${currentVersion} already marked as AWSCURRENT for ${arn}`);
        return;
    }

    await client.updateSecretVersionStage({
        SecretId: arn,
        VersionStage: 'AWSCURRENT',
        MoveToVersionId: token,
        RemoveFromVersionId: currentVersion
    }).promise();
```

This retrieve the current version of the secret and returns early if the version identified by the token is already marked as current. Otherwise, it moves the 'AWSCURRENT' label from the previous version to the new secret, thereby marking it as current. After this has completed the secret has been rotated successfully.

# Kicking the Tyres

A completed example is available in the respository [here](https://github.com/matt-tyler/secret-rotation-example) as a SAM template. Let's try it out - you will need to install the aws-cli and aws-sam-cli, and clone the repo to follow on.

Running `sam build && sam deploy --guided` with correct credentials will allow you to deploy the solution.

Once the solution has been deployed, extract the ARN of the secret from the template output and use it where appropriate in the following calls.

```bash
aws secretsmanager get-secret-value --secret-id <MY-SECRET-ARN>
```

The output will look like the following. I've shortened the secret string for brevity.

```json
{
    "ARN": "<MY-SECRET-ARN",
    "Name": "SigningKey-x3rtLzzwfTEG",
    "VersionId": "6f1d2cec-63f3-41ae-b5d2-3dcc47de9fee",
    "SecretString": "3sZ>@W5RkXeje_>w;vMm$u ... 9V~Z3\"RF`o)uF%<IU/R2c72J/",
    "VersionStages": [
        "AWSCURRENT"
    ],
    "CreatedDate": 1579063309.458
}
```

Now trigger a rotation with;

```bash
aws secretsmanager rotate-secret --secret-id <MY-SECRET-ARN>
```

This will return some details about the rotation.

```json
{
    "ARN": "<MY-SECRET-ARN>",
    "Name": "SigningKey-x3rtLzzwfTEG",
    "VersionId": "4d06b199-9475-45fc-8276-5a3b0db9c783"
}
```

Issuing a get-value call will now return the latest secret (left as an excercise to the reader).

Try issuing a few additional rotation calls, and the trying listing all the secret versions:

```bash
aws secretsmanager list-secret-version-ids --secret-id <MY-SECRET-ARN> --include-deprecated
```

You'll get an output similar to:

```json
{
    "Versions": [
        {
            "VersionId": "6f1d2cec-63f3-41ae-b5d2-3dcc47de9fee",
            "LastAccessedDate": 1579046400.0,
            "CreatedDate": 1579063309.458
        },
        {
            "VersionId": "15485d4e-1778-4012-80af-bfd847f88085",
            "LastAccessedDate": 1579046400.0,
            "CreatedDate": 1579065954.424
        },
        {
            "VersionId": "4d06b199-9475-45fc-8276-5a3b0db9c783",
            "VersionStages": [
                "AWSPREVIOUS"
            ],
            "LastAccessedDate": 1579046400.0,
            "CreatedDate": 1579066187.498
        },
        {
            "VersionId": "0f1cf242-90c1-4ec5-b60e-c8beb4f4148d",
            "VersionStages": [
                "AWSCURRENT",
                "AWSPENDING"
            ],
            "LastAccessedDate": 1579046400.0,
            "CreatedDate": 1579066282.353
        }
    ],
    "ARN": "<MY-SECRET-ARN>",
    "Name": "SigningKey-x3rtLzzwfTEG"
}
```

We can see here, that the latest secret is marked with 'AWSCURRENT' and 'AWSPENDING', whilst the previous secret is marked with 'AWSPREVIOUS'. All other secrets are unlabelled and will be eventually be deleted by AWS Secrets Manager.

# Thoughts on Client Usage

Fetching secrets is pretty easy; issuing a get-secret-value call from any SDK will fetch the most current secret. The problem comes when the secret rotates.

In my example, eventually the signing key will change, and the signed-cookie will become invalid, throwing a 403. Now - all this will do is redirect the user to sign-in again, which will issue a new cookie signed with the new signature. 

If we decide we don't want to do that - we could include additional data in the cookie indicating what version of the secret is in use. If this doesn't match the current secret, we can pull back the previous version, check the IDs, validate with the old secret if appropriate, and return an appropriate response. If the versions clash, the user can be redirected to authenticate.

In my examples, I'm referring to using Lambda functions. These will be recycled every 15-30 minutes, so even if I cache the secrets, all my running Lambda functions will pull the new secret well within the time it takes for it to get rotated into a previous state. If you are using long-lived compute, like containers or virtual machines, you will need to set up some way to pull the latest version of the secret. This is usually via some schedule that is more aggressive than the rotation schedule i.e. If you rotating the secret every 24 hours, you way want your application to request a secret every 6 hours.

# Conclusion

By now you should have a rough idea how secrets rotation works, and how to implement a simple rotation function using AWS Secrets Manager. I really do hope you have realised how useful the practice is over the alternatives, and going forward, it will become 'the way' to do things. 

Because seriously... every time I see an application secret on a post-it note or stored in plain-text somewhere I die a little inside.

Want to get all secret squirrel? Contact Mechanical Rock to Get Started!](https://www.mechanicalrock.io/lets-get-started)

