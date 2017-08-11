---
layout: post
title:  "Using AWS With Cross Account Role (Javascript)"
date:   2017-07-17
categories: javascript aws-sdk
author: Bryan Yu
---

Using AWS API With Cross Account Role (Javascript)

This article highlights the preliminary steps of performing AWS API calls in Javascript for a cross account role without going into too much detail.

Why would you want to do this? Because you are currently working on a project using Javascript’s AWS API and have absolutely no idea how to do stuff with cross accounts.

Before starting, it is assumed that you have already configured the necessary AWS policies and groups for cross account access <a href="https://aws.amazon.com/blogs/security/how-to-enable-cross-account-access-to-the-aws-management-console/">here</a>.

In the AWS Console, you can easily switch roles by using a link specific to switching to the cross account role. In code we will need to do something slightly different.

API calls relating to assuming roles can be found in the AWS.STS API(http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/STS.html). Essentially you need to use it to generate temporary credentials(access key and secret key) to use for the cross account. These are short lived credentials, so don’t expect it to be valid once it has passed its expiry date. 

You should also know the cross account policy role ARN. Unless you already have it, follow the steps below: 
1. Go into the AWS console 
2. Navigate to IAM section
3. Click on the Users tab
4. Click on your username
5. Click on Permissions
6. Click on the policy drop down arrow that corresponds to the Cross Account you intend to get access to
7. Copy the role ARN (*Resources* field) within the JSON policy document
8. Substitute it as the RoleArn parameter (see code below)

In code once you have imported the AWS SDK in JS, we can specify something like below:

```javascript
new AWS.STS().assumeRole({
   RoleArn: ‘arn:aws:iam:666666:role/BlahRole’,
   RoleSessionName: “Fred’s Session”
   DurationSeconds: “1000”
},(err, data) => {
    let credentials = new AWS.Credentials()

     credentials.accessKeyId = data.Credentials.AccessKeyId
     credentials.secretAccessKey = data.Credentials.SecretAccessKey
     credentials.sessionToken = data.Credentials.SessionToken
     credentials.expiryTime = data.Credentials.Expiration

     let s3Svc = new AWS.S3({
        credentials: credentials
     })

     let snsSvc = new AWS.SNS({
        credentials: credentials
     })
})
```

At some point in time you will want to check if the credentials has expired. You can easily achieve this as specified below:

```javascript
if(new Date(credentials.expiryTime) > new Date()) {
    //good to go
} else {
   //time to renew
}
```

That’s about it, you just have to create and keep a reference to the credentials object so it can passed along in the options parameter when you construct an instance of an AWS service, else you will just end up using your default credentials.

You should then be able to make API calls and modify resources in the other account.
