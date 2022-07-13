---
layout: post
title: React To Full Stack
date: 2022-07-19
tags: [react, mui, typescript, aws]
author: Dale Murugan
image: /img/fivetranslacklambdalogo.png
description: "Level-up from a React to a Full Stack developer. A definitive guide for junior developers"
---

![React To Full Stack](/img/fivetranslacklambdalogo.png)

<br/>

React is seeming to be the starting place for a lot of new developers, but what do you learn next? I know from personal experience that it can be daunting as a junior developer trying to decide what backend tech stack to go with. Should you use a SQL or NoSQL databse? Should you use REST or GraphQL? How do you manage authentication? Should you learn .Net or Node? Where do you host it the app? What even is Docker?

This article will save you the decision fatigue. Assuming that you know a bit of React (or any alternative frontend framework), you can follow this step-by-step guide to build and deploy a full stack application, using AWS serverless infrastructure.

---

<br>
## Overview
 We are going to create a backend for a todo app that I prepared earlier. The todo app is built in React with Typescript and styled with Material UI (MUI). We are not going through React, Typescript or MUI, as there are plenty of useful free resources on these topics online. Instead we are focusing on creating the backend infrasture and hosting the application.

Our backend will be on the clound, for this we are going to use AWS serverless infrastructure. With AWS serverless infrastructure, building your backend is a lot easier and faster. There's less overhead to worry about like managing servers, system patching etc. Serverless infrastructure is also highly scalable, you won't need to worry about adding extra resources as your app as your user base grows. AWS serverless also has a pay-for-value billing mode, which means you only pay for what you use. Additionally AWS has been and continues to be the largest cloud provider in the market, hence it's been tried and tested by billions. Also, you can be fancy and call yourself a 'Cloud Native Developer' like I do, big wins all round.

Let's start by defining some basic requirements for full stack CRUD (create, read, update, delete) app. Generally, a full stack CRUD application requires the following:

- Ability assign a domain to your app
- Ability to serve your application to users
- Ability to handle user authentication
- Somewhere to store your frontend application
- Ability handle authorisation for API calls made from within the app
- Ability to handle interactions between the react app and database
- A database to store information and retrieve information

**Basic Architecture Diagram**
![Basic Architecture diagram](/img/react-to-full-stack/react-to-full-stack-basic-architecture.png)

Each of these requirements have an infinite number of solutions, in comes AWS, your one stop shop with a cloud based service for every requirement.

- Ability to serve your application to users
- Ability to handle user authentication
- Somewhere to store your frontend application
- Ability handle authorisation for API calls made from within the app
- Ability to handle interactions between the react app and database
- A database to store information and retrieve information

**Architecture Diagram with AWS**
![Architecture diagram](/img/react-to-full-stack/react-to-full-stack-aws-architecture.png)

You will need an AWS account to complete follow this tutorial.

All of the AWS services integrate seamlessly providing a smooth development experience. We'll go through everything besides the frontend app, that I have already prepared you.

Here's how we'll go about this:

1. Clone and launch the Todo App locally
2. Create the Cognito user pool, this will handle authentication and authorisation
3. Create the DynamoDB database
4. Write the handlers for the lambda function and link it to DynamoDB
5. Configure a REST API in API Gateway, integrate it with the lambda function
6. Upload app to S3
7. Serve app from cloudfront distribution
8. Configure custom domain in Route 53

---

<br>
## Getting Started
<br>
### The Todo App

Clone the repo of the todo app. Using the todo app you will be be to able to create a todo, mark a todo as 'done', edit a todo, or delete a todo.

1. Clone this repo https://github.com/MechanicalRock/todo-app
2. Run npm i to install required packages
3. Run npm start to launch the application locally

You should hit see a login page. However, we haven't set up authentication as yet, so you won't be able to login. Which is our next step.

<br>
### Creating a Cognito User Pool
In the todo-app repo constants.ts (todo-app => src => constants). You will see a COGNITO_CONFIG object, we'll configure the to handle authentication in the next steps.

1. From the AWS search for Cognito
   ![](/img/react-to-full-stack/cognito-1.png)

2. Click 'Manage User Pools'
   ![](/img/react-to-full-stack/cognito-2.png)

3. In the top right corner click 'Create a user pool'
   ![](/img/react-to-full-stack/cognito-3.png)

4. Enter a name for your user pool then click 'Review Defaults'
   ![](/img/react-to-full-stack/cognito-4.png)

5. Click 'Add app client'
   ![](/img/react-to-full-stack/cognito-5.png)

6. Click 'Add an app client' - again
   ![](/img/react-to-full-stack/cognito-6.png)

7. Create a name for your app client, uncheck "Generate client secret", then scroll down and click 'Create app client'.
   ![](/img/react-to-full-stack/cognito-7.png)

8. Click 'Return to pool details'
   ![](/img/react-to-full-stack/cognito-8.png)

9. Click 'Create pool'
   ![](/img/react-to-full-stack/cognito-9.png)

10. Copy your 'Pool Id' and paste it in userPoolId:"" in the COGNITO_CONFIG object in constants.ts (todo-app > src >constants > constants.ts) of the project.
    ![](/img/react-to-full-stack/cognito-10.png)

Your region is stated before the underscore, in my case it is ap-southeast-2. Plug in both the region and userPoolId into the COGNITO_CONFIG object. At this point it should look something like this.

```javascript
export const COGNITO_CONFIG = {
  region: "ap-southeast-2",
  userPoolId: "ap-southeast-2_mmrMEg55o",
  userPoolWebClientId: "",
};
```

11. Navigate 'App Clients' using the side panel
    ![](/img/react-to-full-stack/cognito-11.png)

12. Copy the 'App client Id' and paste it into the userPoolWebClientId: value of the COGNITO_CONFIG object.
    ![](/img/react-to-full-stack/cognito-12.png)

    At this point your COGNITO_CONFIG object is configured and should look something like this.

```javascript
export const COGNITO_CONFIG = {
  region: "ap-southeast-2",
  userPoolId: "ap-southeast-2_mmrMEg55o",
  userPoolWebClientId: "6gjhe86c07bg688qhtvfqf8mdi",
};
```

13. Now we need to create a user, using the side panel navigate to 'Users and groups'
    ![](/img/react-to-full-stack/cognito-13.png)

14. Click 'Create user'.
    ![](/img/react-to-full-stack/cognito-14.png)

15. Uncheck 'Send an invitation to this new user?' and complete the rest of the information. then click 'Create user'
    ![](/img/react-to-full-stack/cognito-15.png)

\*You will notice the account status of the created user will be 'FORCE_CHANGE_PASSWORD'. Usually the user would need to sign into your application and reset their password. To keep this tutorial simple, I have coded in some magic on the frontend to avoid this step.

16. Once you've saved your COGNITO_CONFIG with the updated values, you can now launch the application by running the command npm start. Once you hit the login page, login with the username and password you just created.

You'll see this screen, ignore the error saying 'Sorry something went wrong'.
![](/img/react-to-full-stack/cognito-16.png)

That's cognito done! We'll touch briefly on it again when we're configuring API gateway later down the track. For now move on to configuring our database.

#### Discussion

Fivetran uses [SHA-256 HMAC algorithm](https://en.wikipedia.org/wiki/HMAC) to sign the webhook payload using a a specified secret(`FiveTranSigningKeySecret`). This signature is calculated based on the payload body. To verify the signature, we generate our own signature to verify that the payload is from Fivetran and that the payload body is unmodified.
The signature is located in the payload header as `event.headers['X-Fivetran-Signature-256']`, we then use the [crypto.timingSafeEqual](https://nodejs.org/api/crypto.html#cryptotimingsafeequala-b) function to prevent [timing attacks](https://en.wikipedia.org/wiki/Timing_attack) and verifiy the signature.

```javascript
import * as crypto from "crypto";

const generated_key = signKey(fiveTranSigningKey, event.body);

fiveTranSigningVerification(
  generated_key,
  event.headers["X-Fivetran-Signature-256"]
);

function fiveTranSigningVerification(
  generatedKey: string,
  fiveTranKey: string
) {
  if (
    crypto.timingSafeEqual(Buffer.from(generatedKey), Buffer.from(fiveTranKey))
  ) {
    console.log("Valid Signature");
  } else throw new Error(`Invalid Signature`);
}
```

<br>

### Creating FiveTran Webhook

Currently, webhooks can only be created using the Fivetran API, for more infomation on Fivetran webhooks, see the getting started [documentation](https://fivetran.com/docs/rest-api/getting-started)

In [Postman](https://app.getpostman.com/run-collection/ec3ad55bac7f5f22ef91), to apply webhook notifications across your account, set URL to:

```javascript
POST https://api.fivetran.com/v1/webhooks/account
```

Set Authorisation to Basis Auth:

```javascript
username = APIKey
password = API Key Secret
```

<br>
Make sure to copy in your ```your_aws_api_gateway_endpoint``` and ```FiveTranSigningKeySecret``` from previous steps.

**Payload body:**

```javascript
{
  "url": "your_aws_api_gateway_endpoint",
  "events": [
    "sync_end",
    "dbt_run_failed"
  ],
  "active": true,
  "secret": "FiveTranSigningKeySecret"
}
```

![](/img/fivetran_postman_sc_1.png)

<br>
**Expected response:**
```javascript
{
    "id": "connectorId",
    "type": "account",
    "url": "your_aws_api_gateway_endpoint",
    "events": [
        "sync_end",
        "dbt_run_failed"
    ],
    "active": true,
    "secret": "******",
    "created_at": "2022-06-09T08:24:32.537Z",
    "created_by": "some_value"
}
```

<br>

When a Fivetran sync ends in failure, or a dbt transformation fails, Fivetran will post to our webhook, which then in turn will send a message to our slack webhook.

<br>
<img src="/img/slack_fivetranmessage.png" alt="drawing" width="400"/>
<br>

---

**Example Payload body from Fivetran:**

**syncEnd**

```javascript
{
      event: 'sync_end',
      created: '2021-08-18T11:38:34.386Z',
      connector_type: 'asana',
      connector_id: 'some_id',
      destination_group_id: 'some_id',
      data: {
        status: 'FAILURE'
      }
}
```

**dbt_run_failed**

```javascript
{
      event: 'dbt_run_failed',
      created: '2022-06-01T07:41:30.389Z',
      destination_group_id: 'some_id',
      data: {
        result: {
          description: 'Steps: successful 0, failed 1',
          stepResults: [
            {
              step: {
                name: 'run dbt',
                command: 'dbt run'
              },
              endTime: '2022-06-01T07:41:26.478Z',
              success: false,
              startTime: '2022-06-01T07:41:08.979Z',
              commandResult: {
                error: '',
                output: "dbt Run failed: placeholder text",
                exitCode: 1
              },
              failedModelRuns: 3,
              successfulModelRuns: 0
            }
          ]
        },
        endTime: '2022-06-01T07:41:28.949Z',
        dbtJobId: 'some_id',
        startTime: '2022-06-01T07:40:38.917Z',
        dbtJobName: 'at8_30',
        startupDetails: {
          type: 'manual',
          userId: 'some_id'
        }
      }
    }
```

<br>

## Conclusion

You now have live notifications into your Slack channel on when a error occurs in your Fivetran account! Much better than just a email notification. You can additionally tie this into your exisiting incident managment system!

<br>

### Examples

[https://github.com/JMiocevich/Fivetran-Slack-Notifications](https://github.com/JMiocevich/Fivetran-Slack-Notifications)
<br/>

---

<br/>

## References

[https://fivetran.com/docs/functions/aws-lambda/sample-functions](https://fivetran.com/docs/functions/aws-lambda/sample-functions)

[https://fivetran.com/docs/rest-api/webhooks](https://fivetran.com/docs/rest-api/webhooks)

<br>
If you have any questions or need assistance setting up your own notification system, feel free to [get in touch](https://www.mechanicalrock.io/lets-get-started/)
