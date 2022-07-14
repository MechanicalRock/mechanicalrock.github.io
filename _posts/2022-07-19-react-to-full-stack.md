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

1. Search for DynamoDB using the search bar.
   ![](/img/react-to-full-stack/dynamodb-1.png)

2. Using the side panel click 'Tables'
   ![](/img/react-to-full-stack/dynamodb-2.png)

3. On the top right hand corner of the screen, click 'Create table'.
   ![](/img/react-to-full-stack/dynamodb-3.png)

4. We are going to configure a partition key as "id" which will be a string value and the sort key as "createdAt" which will also be a string value. In our case the partition key will be a unique identifier for each todo, while the sort key will help with arranging the todos in order when we query the database. Scroll to the bottom and click 'Create table'.
   ![](/img/react-to-full-stack/dynamodb-4.png)

That's it for provisioning our database.

<br>
### Create a lambda function

BRIEF SUMMARY OF LAMBDA

1. Search for Lambda using the search bar, select it from the drop down.
   ![](/img/react-to-full-stack/lambda-1.png)

2. On the top right hand side of your screen, click 'Create function'.
   ![](/img/react-to-full-stack/lambda-2.png)

3. Ensure you have selected 'Author from scratch', enter a name for your function, leave the default settings as is then click 'Create function'
   ![](/img/react-to-full-stack/lambda-3.png)

4. Once your function has been created, scroll down to view the 'Code source'.
   ![](/img/react-to-full-stack/lambda-4.png)

5. Erase the code from index.js. We're going to replace with some code I prepared earlier.
   ![](/img/react-to-full-stack/lambda-5.png)

The following function takes 4 different types of methods, GET, PUT, POST and DELETE.

- The first GET method is scanning the table for all the todos, it has endpoint /todos and does not take any arguments.
- The second GET method is querying the table for a specific todo, it has endpoint /todo and takes two arguments which is the todo item's primary key. As stated previously, the primary key is composed of the parition (id) and the sort key (createdAt).
- The third method is a POST method, this actually creates a todo. it has endpoint /todo and takes all todo attributes as arguments. These being: 'id', 'createdAt', 'body', and 'done'. As you can see the function automatically assigns a date-time stamp to the 'createdAt' field when the todo is created. The 'id' field also assigned a unique value is using the awsRequestId value. Attributes 'body' and 'done' are passed in from the frontend in the fetch request.
- The fourth method is a PUT method, this updates a todo, it has a an endpoint of /todo and takes in all attributes of the todo as arguments.
- The fifth and final method is a DELETE method, this deletes a todo, it has an endpoint of /todo and it requires the primary key of the todo as arguments to be deleted.

```javascript
const AWS = require("aws-sdk");

const dynamo = new AWS.DynamoDB.DocumentClient();

const MY_DYNAMODB_TABLE = "Enter-Your-DynamoDB-Table-Name-Here";

exports.handler = async (event, context) => {
  let body;
  let statusCode = 200;
  const headers = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
  };

  try {
    switch (true) {
      //Get all todos
      case event.httpMethod === "GET" && event.path === "/todos":
        body = await dynamo.scan({ TableName: MY_DYNAMODB_TABLE }).promise();
        break;

      //Get todo by id
      case event.httpMethod === "GET" && event.path === "/todo":
        body = await dynamo
          .get({
            TableName: MY_DYNAMODB_TABLE,
            Key: {
              id: JSON.parse(event.body).id,
              createdAt: JSON.parse(event.body).createdAt,
            },
          })
          .promise();
        break;

      //Create a new todo
      case event.httpMethod === "POST" && event.path === "/todo":
        await dynamo
          .put({
            TableName: MY_DYNAMODB_TABLE,
            Item: {
              id: context.awsRequestId,
              body: JSON.parse(event.body).body,
              createdAt: new Date().toISOString(),
              done: JSON.parse(event.body).done,
            },
          })
          .promise();
        body = `Todo created`;
        break;

      //Edit an existing todo
      case event.httpMethod === "PUT" && event.path === "/todo":
        await dynamo
          .put({
            TableName: MY_DYNAMODB_TABLE,
            Item: {
              id: JSON.parse(event.body).id,
              body: JSON.parse(event.body).body,
              createdAt: JSON.parse(event.body).createdAt,
              done: JSON.parse(event.body).done,
            },
          })
          .promise();
        body = `Changed Todo`;
        break;

      //Delete a todo
      case event.httpMethod === "DELETE" && event.path === "/todo":
        await dynamo
          .delete({
            TableName: MY_DYNAMODB_TABLE,
            Key: {
              id: JSON.parse(event.body).id,
              createdAt: JSON.parse(event.body).createdAt,
            },
          })
          .promise();
        body = `Deleted`;
        break;
      //If request doesn't meet any of the above methods & path combindations, then return 'unsupported path' with path name.
      default:
        throw new Error(`Unsupported path: "${event.path}"`);
    }
  } catch (err) {
    //Return any caught errors
    statusCode = 400;
    body = err.message;
  } finally {
    body = JSON.stringify(body);
  }

  return {
    statusCode,
    body,
    headers,
  };
};
```

6. Now copy the code snippet above and past it into the index.js of your lambda function. Enter your the name of your DynamoDB table we previously created where it says "Enter-Your-DynamoDB-Table-Name-Here" value, then click 'Deploy'.
   ![](/img/react-to-full-stack/lambda-6.png)

7. We now have to give the lambda permission to access the DynamoDB table. Select 'Configuration'.
   ![](/img/react-to-full-stack/lambda-7.png)

8. Using the side panal select 'Permissions'.
   ![](/img/react-to-full-stack/lambda-8.png)

9. Under 'Execution role' click the 'Role name'.
   ![](/img/react-to-full-stack/lambda-9.png)

10. You will be redirected to the Identity and Access Management (IAM) page for the lambda role.
    ![](/img/react-to-full-stack/lambda-10.png)

11. On the center right hand side of the page click the 'Add permissions' drop down then click 'Attach policies'.
    ![](/img/react-to-full-stack/lambda-11.png)

12. You will then be brought to this screen, in the search bar type 'dynamodb' then hit enter.
    ![](/img/react-to-full-stack/lambda-12.png)

13. 'AmazonDynamoDBFullAccess' is the policy gives our lambda function full CRUD access to our DynamoDB table. Check the box next to the policy then click 'Attach policies'.
    ![](/img/react-to-full-stack/lambda-13.png)

That's the lambda done! Now time to configure API gateway.

<br>
### Create a REST API with API Gateway

BRIEF SUMMARY OF API GATEWAY

1. Search for API gateway in search bar, click it from the drop down.
   ![](/img/react-to-full-stack/api-1.png)

2. On the top right corner of your screen click 'Create API'.
   ![](/img/react-to-full-stack/api-2.png)

3. Scroll down to REST API and click 'Build'
   ![](/img/react-to-full-stack/api-3.png)

4. Leave the settings as default, create a name for your API, then click 'Create API'.
   ![](/img/react-to-full-stack/api-4.png)

5. You will then be brough to this screen. Click 'Actions' => 'Create Resource'.
   ![](/img/react-to-full-stack/api-5.png)

6. We will first create the 'todos' resource. Give it a name of 'todos' and resource path of 'todos. Ensure that 'Enable API Gateway CORS' is checked then click 'Create Resource'.
   ![](/img/react-to-full-stack/api-6.png)

7. Now select the '/todos' resource endpoint, click 'Actions' => 'Create Method'.
   ![](/img/react-to-full-stack/api-7.png)

8. You will see an empty drop down box appear below OPTIONS of your /todos endpoint, click it and select 'GET'. Then click the check to confirm.
   ![](/img/react-to-full-stack/api-8.png)

9. You will then see this screen, ensure that 'Integration type' is 'Lambda function', click the checkbox to say 'Use Lambda Proxy Integration', ensure the 'Lambda Region' is the same that we provisioned the function in earlier, then enter your lambda function name - it should show a drop down with your lambdas in the given region, then click 'Save'.
   ![](/img/react-to-full-stack/api-9.png)

10. You will then see this message 'Add Permission to Lambda Function', click 'OK'
    ![](/img/react-to-full-stack/api-10.png)

11. Good work the first method is done! You should now see this screen. As the illustration shows, a fetch from the frontend hits the method request, the request is forward to the lambda, the lambda does it's thing (in this case gets todos from the DynamoDB table) returns the response to API gateway and API then returns the response to the frontend.
    ![](/img/react-to-full-stack/api-11.png)

12. If you remember from configuring the lambda, there are two endpoints /todos and /todo. We've just configured the /todos endpoint with the GET method. Now we need to configure the /todo endpoint with the GET, PUT, POST, and DELETE methods. To do we need to create a resource for /todo, click the top level '/' then click 'Actions' => 'Create Resource'.
    ![](/img/react-to-full-stack/api-12.png)

13. We are now creating the /todo resource endpoint so enter 'todo' as the Resource Name and Resource Path. Ensure that you click the checkbox 'Enable API Gateway CORS', then click 'Create Resource'.
    ![](/img/react-to-full-stack/api-13.png)

14. Click the newly created '/todo' endpoint then click 'Actions' => 'Create Method'. Like before an empty drop-down list will appear select 'GET' then click the check icon. You will then be brough to this screen once again, the configuration for the method is the exact same: lambda integration type, check 'Use Proxy Integration', select the same lambda region and function name then click save.
    ![](/img/react-to-full-stack/api-14.png)

15. Repeat step 14, for method POST, PUT and DELETE. The exact same lambda integration is used each time. Remember to always check the 'Use Lambda Proxy Integration' checkbox. After you have finished configuring those methods the /todo resource endpoint should have DELETE, GET, OPTIONS, POST and PUT methods and the /todos resource endpoint should just have GET and OPTIONS methods.
    ![](/img/react-to-full-stack/api-15.png)

16. We now need to setup our authorizer. Click 'Authorizers' in the side panel.
    ![](/img/react-to-full-stack/api-16.png)

17. Click 'Create New Authorizer'.
    ![](/img/react-to-full-stack/api-17.png)

18. Give your authorizer a name, select 'Cognito' as the 'Type', ensure you have selected the same region that you provisioned your cognito user pool in earlier, then click the box and select the user pool you created earlier. Enter 'Authorization' into the 'Token Source' and leave 'Token Validation' empty.
    ![](/img/react-to-full-stack/api-18.png)

19. Using the side panel, navigate back to 'Resources'.
    ![](/img/react-to-full-stack/api-19.png)

20. Click the 'DELETE' method. Then click 'Method Request'.
    ![](/img/react-to-full-stack/api-20.png)

21. Click the pencil icon next to 'Authorization'.
    ![](/img/react-to-full-stack/api-21.png)

22. Click a drop down box will appear, click it then select the cognito authorizer we previously created, then click the check icon to confirm.
    ![](/img/react-to-full-stack/api-22.png)

23. Repeat steps 20 to 22 for methods: GET, POST, and PUT under resource endpoint '/todo', and just the GET method under resource endpoint '/todos' (DO NOT ATTACH AN AUTHORIZOR TO THE OPTIONS METHODS), once all the method requests have the authorizer attached click 'Actions' => 'Deploy API'.
    ![](/img/react-to-full-stack/api-23.png)

24. You will then see this window. For 'Deployment stage' select '[New Stage]', give your stage a name, then click 'Deploy'.
    ![](/img/react-to-full-stack/api-24.png)

25. You will then be brought to this page. Copy your "invoke URL".
    ![](/img/react-to-full-stack/api-25.png)

Now open constants.ts (todo-app > src > constants > constants.ts). Paste the your invoke URL in both the TODOS_API and TODO_API values. You will to also add the relevant endpoints for each API. So add /todos to the end the invoke URL in TODOS_API and add /todo to the end of your invoke URL for TODO_API. At this point your API variables should look like this.

```javascript
export const TODOS_API =
  "https://jgb9txcg6c.execute-api.ap-southeast-2.amazonaws.com/prod/todos";
export const TODO_API =
  "https://jgb9txcg6c.execute-api.ap-southeast-2.amazonaws.com/prod/todo";
```

26. Launch the app locally by running npm start, login, then start creating todos. The create, edit and delete functions should be workingg now, if not, you've done something wrong, try and retrace your steps.

Now, time to get the app off localhost and onto an actual domain. Let's upload our app to an S3 in the next stage.

<br>
### Upload the React App to S3.
BRIEF OVERVIEW OF S3

1. Search for S3 using the search bar.
   ![](/img/react-to-full-stack/s3-1.png)

2. Click 'Create bucket' on the right side of your screen.
   ![](/img/react-to-full-stack/s3-2.png)

3. Create a unique name for your bucket, and ensure all public access is blocked. Enable default encryption to use Amazon S3-managed keys (SSE-S3).
   ![](/img/react-to-full-stack/s3-3.png)
   ![](/img/react-to-full-stack/s3-3.1.png)
   ![](/img/react-to-full-stack/s3-3.2.png)

4. You will then be brought back to the buckets screen, select the bucket you just created.
   ![](/img/react-to-full-stack/s3-4.png)

5. Your bucket will be empty, click 'Upload'.
   ![](/img/react-to-full-stack/s3-5.png)

6. You will then reach this screen that asks to drag and drop files you wish to upload
   ![](/img/react-to-full-stack/s3-6.png)

7. Leave the s3 bucket upload window open and open the todo-repo with your editor. Run command 'npm run build'. Once the build has completed open the build folder in your project and drag it's contents into the s3 upload window, then scroll down and click 'Upload'.
   ![](/img/react-to-full-stack/s3-7.png)
   ![](/img/react-to-full-stack/s3-8.png)

8. You will see something like this once the upload has succeeded.
   ![](/img/react-to-full-stack/s3-9.png)

That's the s3 part done, our app is now hosted in the cloud, now to configure cloudfront to distribute it.

<br>
### Create a cloudfront distribution
BRIEF OVERVIEW OF S3

1. Search for cloudfront using the search bar.
   ![](/img/react-to-full-stack/cloudfront-1.png)

## References

<br>
If you have any questions or need assistance setting up your own notification system, feel free to [get in touch](https://www.mechanicalrock.io/lets-get-started/)
