---
layout: postv2
font: serif
title: "Home Security Hacks On AWS: Create your own 'Musical Concierge'"
description: "Simplify the Video Streaming in near real-time with Amazon Kinesis Video Streams"
date: 2023-11-24
author: Nadia Reyhani
tags: [Data Streaming, Video Streaming, Amazon Web Services, Concierge, Amazon Kinesis, Amazon Rekognition, AI]
image: /img/kinesisVideoStreams/musical_concierge.png
---

## Mixing The Right Ingredients On AWS For A Musical Concierge

In the world of GenAI applications, we often overlook the amazing tools provided by cloud service providers like AWS to explore Machine Learning.

AWS, in particular, offers a comprehensive set of services, covering Data Analytics and Real-Time Data Streaming. When you combine these with AI and ML services like Amazon Rekognition, you can tap into Machine Learning without the complexity of setting up infrastructure or the costs and time required to train models from scratch.

To learn and understand these services, the best approach is to get hands-on. I usually start by thinking about real-world scenarios, explore existing solutions, and then build my idea using the tech and tools I'm comfortable with.

With the new year approaching, I wanted to welcome my guests in a unique way. I remembered my security camera is getting dust in my storage. What if I could use it to capture my visitors' at arrival and integrate it with a system that not only informs me when they arrive but also recommends a custom song for each visitor to keep them entertained while I get ready to welcome them to the party.

Great! We now have the idea, let's call it "Musical Concierge".

## Recipe For Musical Concierge
Resources and tools to build this custom concierge:
- 1 IP Camera of your choice (with RTSP support)
- 1 Amazon Kinesis Video Stream
- A pinch of Amazon Rekognition
- 1 Amazon Kinesis Data Stream
- AWS Lambda Function as many as you need
- 1 Amazon SNS Topic
- A dash of IAM Roles and Access Policies

## Guided Tour Of Architecture Diagram

Understanding the essential cake ingredients is just the beginning; it's the art of blending them that gives each cake its unique flavor. Similarly, now that we have the ingredients for crafting our Concierge tool, let's dive into the designed architecture and follow the instructions to bring it to life.

![architecture diagram](/img/kinesisVideoStreams/architecture.png)

In our tech setup, the main thing we need is an IP camera for the video source. There are many ways to do this project, but I went with what I have—a Tapo C310 IP camera because it supports RTSP (Real-Time Streaming Protocol). RTSP is important for smoothly streaming the captured video from the camera into a service like Amazon Kinesis Video Streams.

To playback the camera's video stream, we can use Amazon Kinesis Video Streams. This service works with Amazon Rekognition for computer vision and video analytics. So, when the video streams reach our AWS account, Amazon Rekognition can recognize familiar faces.

If you're wondering how Amazon Rekognition does this, it uses something called a "face collection." We can make different face collections and add faces to them. When the video stream data goes to Amazon Rekognition, it looks at the face collection and identifies faces based on the ones we added.

When it finds a match, Amazon Rekognition sends out the results. But we're not done yet—we need another way to deliver these results smoothly to a place like an AWS Lambda function. For this, we can use Amazon Kinesis Data Streams as a delivery service.

Now, you can get creative and use the analysis results however you want. But for our case, we need a Lambda function that sends the face recognition result to Amazon SNS (Simple Notification Service) as a messaging service. Amazon SNS lets us send the result to different subscribers, like a Lambda function that notifies us through SMS or apps like Telegram when our visitors arrive. We can even have a Lambda function subscribed to the same SNS topic that recommends a custom song for each visitor based on the music they like.

Now that we have a general idea of how the application works, it's time to set up the hardware and AWS resources.

## Configure Resources

### Camera

To set up the camera, first, you need to find its IP address. To do this, log in to your network router and look for the IP address of your device.

#### Create Camera Account

No matter what IP camera you have, they usually come with a mobile app that lets you control the camera. For my 'Tapo C310' camera, I used the TP-Link App and made a camera account. This account info is needed by Amazon Kinesis Video Streams' Client to make sure it's allowed to get the video from the camera.

This camera account is separate from your TP-Link App login. If you don't give these details, Kinesis Video Streams won't be able to get the video from the camera. If you're using the same camera as me, you can [check out the instructions here](https://www.tp-link.com/us/support/faq/2790/) on how to create your camera account.

Now, your camera is all set to send the video to the cloud. The next step is getting things ready in the cloud.

### Create AWS Resources With Cloudformation

Now that we know what services we need from the list, we can easily set them up in AWS. I'll use Cloudformation to create these resources in our AWS account.

#### Amazon Kinesis Resources

Lets start with Amazon Kinesis Family: 

```
  # Amazon Data Stream
  MusicalConciergeDataStream:
    Type: "AWS::Kinesis::Stream"
    Properties: 
      Name: !Sub ${ApplicationName}-Data-Stream
      ShardCount: 1
  # Amazon Video Stream
  MusicalConciergeVideoStream:
    Type: AWS::KinesisVideo::Stream
    Properties:
      DataRetentionInHours: 24
      Name: !Sub ${ApplicationName}-Video-Stream

```
Please note that Amazon Kinesis Video Streams (KVS) availability is limited in certain regions. To optimize performance and ensure support for the KVS service, it's essential to deploy the stack in a region that is both geographically close to you and a supported region for KVS.

#### Amazon Rekognition Resources

##### Rekognition Stream Processor

Now that our camera's live video is flowing into Kinesis Video Streams in real-time, you might be curious about how it recognizes your visitors and what services make it happen. Well, as I mentioned earlier the answer is simple: we just use "Amazon Rekognition Stream Producer" and a "Face Collection."

When the live video data gets to Amazon Rekognition, it looks through a collection of images from different people.

You can set up the face collection and Rekognition Stream Producer using the instructions in this CloudFormation snippet:

```
  RekognitionFaceCollection:
    Type: AWS::Rekognition::Collection
    Properties:
      CollectionId: !Ref MusicalConciergeFaceCollectionId

  RekognitionStreamProcessor:
    Type: AWS::Rekognition::StreamProcessor
    Properties:
      Name: "MusicalConciergeStreamProcessor"
      RoleArn: !GetAtt RekognitionVideoIAMRole.Arn
      KinesisVideoStream: 
        Arn: !GetAtt MusicalConciergeVideoStream.Arn
      FaceSearchSettings:
        CollectionId: !Ref MusicalConciergeFaceCollectionId
        FaceMatchThreshold: 98
      KinesisDataStream: 
        Arn: !GetAtt MusicalConciergeDataStream.Arn

```
##### Rekognition Iam Role

We need an IAM role for Amazon Rekognition service that allows Rekognition to get the Video Data stream from Amazon Kinesis Video Streams service and put the Facial Match Records into Amazon Kinesis Data Stream, for that we need a policy like this:


```
  RekognitionVideoIAMRole:
    Type: AWS::IAM::Role
    Properties:
      AssumeRolePolicyDocument:
        Version: '2012-10-17'
        Statement:
          -
            Effect: Allow
            Principal:
              Service: rekognition.amazonaws.com
            Action: sts:AssumeRole
      Path: '/'
      Policies:
        -
          PolicyName: RekognitionVideoIAMRole-policy
          PolicyDocument:
            Version: '2012-10-17'
            Statement:
              -
                Effect: Allow
                Action:
                    - 'kinesis:PutRecord'
                    - 'kinesis:PutRecords'
                Resource: !GetAtt MusicalConciergeDataStream.Arn
              -
                Effect: Allow
                Action:
                    - 'kinesisvideo:GetDataEndpoint'
                    - 'kinesisvideo:GetMedia'
                Resource: !GetAtt MusicalConciergeVideoStream.Arn
              -
                Effect: Allow
                Action:
                    - 'rekognition:*'
                Resource: '*'
```


### Create Joy From Amazon Rekognition Analysis

Once the AWS Lambda gets the info about matching faces from Amazon Kinesis Data Streams, we can do lots of cool things with it. We can use it however we want—like sending a happy text to tell us our visitor is here with their name, or playing a nice song for them as they wait for our welcoming hello at the door.

To make our two Lambda functions—one for publishing a message to Amazon SNS topic containing the face recognition result and the other for suggesting music—we can use the cloudformation resources like this:

```
  GetVideoAnalysisLambda: 
    Type: "AWS::Lambda::Function"
    Properties: 
      Code: ./.build/GetVideoAnalysis.zip
      FunctionName: GetVideoAnalysisLambda
      Handler: src/GetVideoAnalysis.handler
      Role: !GetAtt GetVideoAnalysisLambdaRole.Arn
      Environment:
        Variables:
          SNS_TOPIC: !Ref SNSTopic
      Runtime: "nodejs18.x"
      MemorySize: 1024
      Timeout: "900"

  GetVideoAnalysisLambdaKinesisMapping:
    Type: "AWS::Lambda::EventSourceMapping"
    Properties: 
      BatchSize: 10
      Enabled: true
      EventSourceArn: !GetAtt MusicalConciergeDataStream.Arn
      FunctionName: !GetAtt  GetVideoAnalysisLambda.Arn
      StartingPosition: "TRIM_HORIZON"

  InformHostLambda: 
    Type: "AWS::Lambda::Function"
    Properties: 
      Code: .build/InformHost.zip
      FunctionName: InformHostLambda
      Handler: src/InformHost.handler
      Role: !GetAtt InformHostLambdaRole.Arn
      Environment:
        Variables:
          BUCKET_NAME: !Ref ConciergeAudioBucketName
          SECRET_NAME: !Ref TelegramBotSecretName
      Runtime: "nodejs18.x"
      MemorySize: 1024
      Timeout: "900"

  InformHostLambdaPermission:
    Type: AWS::Lambda::Permission
    Properties:
      Action: lambda:InvokeFunction
      FunctionName: !GetAtt InformHostLambda.Arn
      Principal: sns.amazonaws.com
      SourceArn: !Ref SNSTopic
```

If you want to know what each lambda function does, check out the examples in this code repository on [GitHub](https://github.com/RonakReyhani/MusicalJoyBells/blob/main/src/Implementation/MusicalJoyStore.ts). You can use them as a starting point and change them however you like.

### Configure Face collection (AWS CLI)


To make Amazon Rekognition recognize faces in the live stream, we have to give it a collection of known faces. In earlier steps, we made this collection. Now, to add familiar faces to it, you can use AWS CLI. This part requires some manual work, though. You must have set up your AWS CLI and put in your credentials to run these commands and make it work.

##### Add face to face collection:

I put some pictures of faces in a folder on S3. When I run this command, it grabs a picture from S3 and adds it as a new face to my collection:


```
  aws rekognition index-faces \
    --image '{"S3Object":{"Bucket":"<BUCKET_NAME>","Name":"<FILE_NAME>.jpg"}}' \
    --collection-id "<COLLECTION_ID>" \
    --detection-attributes "ALL" \
    --external-image-id "<FACE-TAG>" \
    --region <AWS_REGION>

```
*Tip: make sure the region of your bucket is same as face collection*

### Start Rekognition Stream Producer (AWS CLI)

This is the heart of the system. It pulls video from Kinesis video, analyzes it & pushes the results to Kinesis data. We created the Amazon Rekognition Procession within the cloudformation lets get a list of existing processors:

- To List Rekognition Stream Producer run this command in your terminal:

```
aws rekognition list-stream-processors
```

When the Rekognition Stream Producer is initially created, the default status is "STOPPED":

```
output:
{
    "StreamProcessors": [
        {
            "Name": "musical-concierge-rekognition-processor",
            "Status": "STOPPED"
        }
    ]
}
```

- To Start Rekognition Stream Producer run this command in your terminal:

```
aws rekognition start-stream-processor \
    --name <PROCESSOR_NAME>

```
After starting the Stream Producer the status will change to "Running":

```
{
    "StreamProcessors": [
        {
            "Name": "musical-concierge-rekognition-processor",
            "Status": "RUNNING"
        }
    ]
}

```

#### Connect the Camera as a stream source (Producer) for Kinesis Video Stream

After setting up Amazon Kinesis, it's time to send data to it. We can use the SDK to create code for our application. This code grabs video data, called frames, from the video source and sends it to Kinesis Video Streams. These apps are also called producers.

The producer libraries usually have two parts:

- Kinesis Video Streams Producer Client
- Kinesis Video Streams Producer Library

Kinesis Video Streams doesn't have ready-made setups for devices like cameras. To get data from media devices, you need to write code to create your own custom media source. After that, you can register your custom media sources with 'KinesisVideoClient', and it will send the data to Kinesis Video Streams.

To implement the application to extract and upload the data to Kinesis Video stream from scratch I recommend to follow [this document page on AWS](https://docs.aws.amazon.com/kinesisvideostreams/latest/dg/producer-sdk-javaapi.html).

That might seem to be very complex but thanks to Docker we can build the entire application as a Docker image and use one of the provided samples from [AWS Amazon Kinesis Repository](https://github.com/awslabs/amazon-kinesis-video-streams-producer-sdk-cpp/blob/master/samples/kvs_gstreamer_sample.cpp) to start with uploading the data to Kinesis.

For Musical Concierge app I have used the docker image approach:

1- Set up docker if it's first time using Docker [get Docker](https://docs.docker.com/get-docker/).
2- Copy provided Docker File [in the source repo](https://github.com/RonakReyhani/MusicalJoyBells/blob/main/Dockerfile) to the root of your project.
3- Build and Run the docker image:
        
```
        docker build -t <YOUR_IMAGE_NAME> .
        <!-- List docker images and find your image ID -->
        docker images   
        docker run -it <YOU_IMAGE_ID>

```
4- Run the gstreamer sample app with the requisite argument
In your running docker execute the following command:

``` 
AWS_ACCESS_KEY_ID=<AWS_ACCESS_KEY_ID> \
AWS_SECRET_ACCESS_KEY=<AWS_SECRET_ACCESS_KEY> \
./kvs_gstreamer_sample <STREAM_NAME> <RTSP_URL>

```

*Tip1: Make sure that you are Authenticate with your AWS credentials. Set up aws config within your Docker.*

*Tip2: If you are using the same camera as mine, the <RTSP_URL> url is typically something in this format rtsp://camera_username:camera_password@camera_ip:554/stream1*


### Set Up Telegram ChatBot

To be notified on my guests arrival, I have created a lambda function that sends me a message on Telegram application. 

You can simply follow instruction from [this web page](https://sendpulse.com/knowledge-base/chatbot/telegram/create-telegram-chatbot) to set up your Telegram chatbot. Once the chatbot is ready, you will be provided by an API Token. As it's a secret token you can store the API Token in Amazon Secrets Manager Service to get the secret in the lambda function. The Lambda Function will use this token to send the visitors names and the music file to the telegram bot.

We are nearly there, through cloudformation snippets from this blog post we almost created all the core resources required for the Musical Concierge. However, there are some other resources such as Amazon Secrets Manager or AWS S3 Buckets to store the face images or collection of musics, to access the full version of all the resources please check out the cloudformation file in [this code repository](https://github.com/RonakReyhani/MusicalJoyBells/blob/main/cloudformation.yaml).

### Deploy Resources as Infrastructure as Code

Time to deploy all the resources in AWS account. Go ahead and continue with build, package and deploying the resources.


#### Build and Package
```
npm run build
npm run package

aws cloudformation package --template-file ./cloudformation.yaml --s3-bucket $ARTIFACT_BUCKET --output-template-file /<FOLDER>/cloudformation.yaml

aws cloudformation deploy \
  --template /path_to_template/my-template.yml \
  --stack-name <STACK_NAME> \
  --parameter-overrides Key1=Value1 Key2=Value2 \
```
*In this project I have not set up CI/CD, if you are planing to productionise this project, make sure this step is part of your continues integration and continues deployment.*


### Trouble shooting and Wrap up

After setting everything up, it's good to go! Try out the Musical Concierge with a friend, or the next time you have someone visiting, check your Telegram messages. Here's an example of a message I got when a friend visited me over the weekend ;)


![Telegram chatbot message](/img/kinesisVideoStreams/telegram-message.jpg)
*Tip: Remember to start your Chatbot before proceeding with deployment process*

Building your Amazon Kinesis Video Stream app gives you more control over your media stream frames. This helps prevent issues like getting the same stream records again. I recommend starting with the gstreamer sample app to save time and effort as you build on it.

In this article, I wanted to show how easily you can set up a budget-friendly custom concierge. This is just the start.You can add more, like displaying a welcome message on an LED board when guests arrive or sending a fun message to their phone. Get creative, maybe even tease them about forgetting to bring your favorite beverage!

I hope this guide has provided you with a solid foundation to get started with building your own Concierge. If you have any further questions or need assistance, please feel free to reach out to [contact us](https://mechanicalrock.io/lets-get-started). Our team is dedicated to providing unwavering support and guidance whenever you need it.

And don't forget to clean up the resources once you finished.

### Clean up

After you've had fun with it, now it's time to delete everything!

Here's what you do:

- Stop the Docker container.
- Stop & delete the stream processor:
```aws rekognition stop-stream-processor --name <REKOGNITION_STREAM_PRODUCER>```
```aws rekognition delete-stream-processor --name <REKOGNITION_STREAM_PRODUCER>```
- Delete cloudformation stack.
- Delete the Rekognition faces collection:
```aws rekognition delete-collection --collection-id <COLLECTION_ID```