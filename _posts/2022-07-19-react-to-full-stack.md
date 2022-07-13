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
BRIEF SUMMARY OF COGNITO

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

<br>
### Create a DynamoDB database
BRIEF SUMMARY OF DYNAMODB

## References

<br>
If you have any questions or need assistance setting up your own notification system, feel free to [get in touch](https://www.mechanicalrock.io/lets-get-started/)
