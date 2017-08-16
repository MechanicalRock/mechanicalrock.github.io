---
layout: post
title:  "Using AWS With Cross Account Role (Javascript)"
date:   2017-08-14
categories: javascript aws-sdk
author: Bryan Yu
---

Using AWS API With Cross Account Role (Javascript)

This article highlights the preliminary steps of performing AWS API calls in Javascript for a cross account role. 

Setting up for cross account roles is outside the scope of this, so if you need more information on that, visit <a href="https://aws.amazon.com/blogs/security/how-to-enable-cross-account-access-to-the-aws-management-console/">AWS policies and groups for cross account access</a>.

There are a multitude of <a href="http://blog.flux7.com/aws-cross-accounts-access-part-2">reasons and benefits</a> for taking the cross account approach. At the end of the day, they usually boil down to security, billing and access to customer accounts

In the AWS Console, you can easily switch roles by using a link specific to switching to the cross account role. In code we will need to do something slightly different.

API calls relating to assuming roles can be found in the AWS.STS API <a href="http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/STS.html">here</a>. Essentially you need to use it to generate temporary credentials(access key and secret key) to use for the cross account. These are short lived credentials, so don’t expect it to be valid once it has passed its expiry date. 

You should also know the cross account policy role ARN. Unless you already have it, follow the steps below: 
1. Go into the AWS console 
2. Navigate to IAM section
3. Click on the Users tab
4. Click on your username (i.e. john.doe)
5. Click on Permissions
6. Click on the policy drop down arrow that corresponds to the Cross Account you intend to get access to (i.e. OtherAccountRole)
7. Copy the role ARN (see *Resources* field i.e. arn:aws:iam::1234567890:role/MyRole) within the JSON policy document
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

At some point in time you will want to check if the credentials has expired and refresh it otherwise. You can easily achieve this as specified below:

```javascript
if(credentials.needsRefresh()) {
    credentials.refresh()
}
```

Thats about it!

The next step you will need to consider is how you choose to manage the temporary credentials so they are refreshed (when expired) as and when needed again.

Regardless of it being short lived credentials, security is still top priority and you should ensure that at no point in time they are exposed publicly.