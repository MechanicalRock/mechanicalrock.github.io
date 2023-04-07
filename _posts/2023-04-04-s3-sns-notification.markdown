---
layout: post
title: Pain point of S3 Notification Configuration for SNS
description: !
date: 2023-03-21
tags: [S3 Notification Configurations, SNS Topic, Lambda Event]
author: Nadia Reyhani
image: /img/sns-Notifications-reconfiguration/SNS_Notification_Error.png
---

![Avoid "Unable to validate the following destination configurations" Error](/img/sns-Notifications-reconfiguration/SNS_Notification_Error.png)

## How to Avoid "Unable to validate the following destination configurations" Error

As is widely known amongst cloud geeks, working with CloudFormation as an Infrastructure as Code tool to deploy resources poses a major challenge when it comes to deciphering errors in the create/update stack process. These errors are not usually straightforward or informative, which makes it difficult to identify the problem immediately. Recently, I had good fun with re-configuring notifications on an Amazon S3 bucket, and it took me a full day to trouble shoot why an error was occurring and how to resolve it. I consulted numerous resources, each of which pointed to a specific reason for the deployment failure. Ultimately, I had to combine all the information I had gathered to successfully address the issue.

This brief blog post will outline the complexities involved in updating SNS Notification configurations on an Amazon S3 Bucket, as well as steps for resolving the issue efficiently.

## Why "Invalid Destination" Happens?

The reason for this is largely due to the way CloudFormation orders the dependencies. The S3 Notification configurations are considered part of the Amazon S3 Bucket properties and are created simultaneously with the bucket. To ensure proper resource creation, CloudFormation must follow this sequence:

- Create the SNS Topic.
- Create the Amazon S3 Bucket.
- Create the SNS Access Policy to allow your S3 Bucket to publish events to the specified topic.
- Create the S3 Notification Configuration.

Now, let's examine the CloudFormation code for deploying the Amazon S3 Bucket and SNS Topics.

```
----- main.yml ------
AWSTemplateFormatVersion: 2010-09-09
Description: SNS topic and S3 Notification configuration

Parameters:
  MySNSTopicName:
    Type: String
  MyBucketName:
    Type: String

Resources:
  NewTopic:
    Type: AWS::SNS::Topic
    Properties:
      TopicName: !Ref MySNSTopicName

  DataBucket:
    Type: AWS::S3::Bucket
    DeletionPolicy: Retain
    DependsOn: !Ref Topic
    UpdateReplacePolicy: Retain
    Properties:
      BucketName: !Ref MyBucketName
      VersioningConfiguration:
        Status: Enabled

  TopicPolicy:
    Type: AWS::SNS::TopicPolicy
    Properties:
      PolicyDocument:
        Id: BucketNotificationPolicy
        Version: "2012-10-17"
        Statement:
          - Sid: AllowPublishNotifications
            Effect: Allow
            Principal:
              Service: "s3.amazonaws.com"
            Action: sns:Publish
            Resource:
              - !Ref NewTopic
            Condition:
              ArnLike:
                aws:SourceArn: !GetAtt DataBucket.Arn
```

Once you have deployed the SNS Topic, S3 Bucket and SNS Access Policy, the next step is to configure S3 Notifications for the specified SNS topic. This can be accomplished easily with the following block of code:

```
  DataBucket:
    Type: AWS::S3::Bucket
    DeletionPolicy: Retain
    UpdateReplacePolicy: Retain
    Properties:
      BucketName: !Ref MyBucketName
      VersioningConfiguration:
        Status: Enabled
      NotificationConfiguration:
        TopicConfigurations:
          - Topic: !Ref NewTopic
            Event: s3:ObjectCreated:Put
            Filter:
              S3Key:
                Rules:
                  - Name: prefix
                    Value: !Sub "${Bucket}/${Key}"  // configure the bucket and folder you want to monitor for new uploads
```

## How to troubleshoot and fix the "Invalid Destination Error"

So far everything seems straightforward when you are deploying the resources for the very first time. However, fun starts when you need to update the access policy on your SNS Topic, Or alternatively, for any reason you have to reconfigure new Notification Configurations on your S3 Bucket. That's where you will bump into this error:

```
"Unable to validate the following destination configurations
(Service: Amazon S3; Status Code: 400; Error Code: InvalidArgument;Request ID: xxxxx;
S3 Extended Request ID: xxxxx; Proxy: null)"
```

Earlier, we mentioned that the error occurs due to the way CloudFormation creates or updates resources. To resolve this issue, you will need to perform reverse engineering, which may be simple but frustrating. To save you time, here is a recipe you can easily follow to eliminate the error.

Start by checking if any of your AWS Lambda resources are subscribed to your SNS topic. If so, remove the event configuration on the lambda function, which will in turn remove the subscription on your SNS topic.

Next, remove the notification configuration on your S3 bucket. This will revert your stack to its initial state, with only the S3 bucket, SNS topic, and policies attached to the SNS topic.

Now, you can update the SNS topic in your CloudFormation stack without worrying about the error. However, be sure that the S3 Bucket ARN specified in your SNS policy Condition section is an exact match.

After successfully updating the SNS Topic resource, you can configure notifications on your S3 Bucket as per the example provided earlier in this post.

Finally, to complete your event-driven workflow, configure SNS Events on your Lambda resources.

In conclusion, CloudFormation can be a powerful Infrastructure as Code tool for deploying AWS resources. However, deciphering errors during the create/update stack process can be challenging. Specifically, configuring SNS Notifications on an S3 Bucket can be complex due to the order in which dependencies are created. The errors can be frustrating to troubleshoot, but by following the recipe outlined in this article, you can save time and efficiently resolve the issue.
