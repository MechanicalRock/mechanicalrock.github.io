---
layout: postv2
font: serif
title: "Home Security Hacks On AWS to create your own musical concierge"
description: "Simplify the Video Streaming in near real-time with Amazon Kinesis Video Streams"
date: 2023-11-24
author: Nadia Reyhani
tags: [Data Streaming, Video Streaming, Amazon Web Services, Concierge, Amazon Kinesis, Amazon Rekognition, AI]
image: /img/bedrock/application_demo.png
---

## Mixing The Right Ingredients On AWS For A Musical Concierge

In the world of GenAI applications, we often overlook the amazing tools provided by cloud service providers like AWS to explore Machine Learning.

AWS, in particular, offers a comprehensive set of services, covering Data Analytics and Real-Time Data Streaming. When you combine these with AI and ML services like Amazon Rekognition, you can tap into Machine Learning without the complexity of setting up infrastructure or the costs and time required to train models from scratch.

To learn and understand these services, the best approach is to get hands-on. I usually start by thinking about real-world scenarios, explore existing solutions, and then build my idea using the tech and tools I'm comfortable with.

With the new year approaching, I wanted to welcome my guests in a unique way. I remembered my neglected security camera and had an idea. What if I could use it to capture my visitors' arrivals and create a system that not only informs me when they arrive but also recommends a custom song for each visitor to keep them entertained while I get ready to welcome them to the party.

Great! We now have the idea, let's call it "Musical Concierge".

### Recipe for Musical Concierge

- 1 IP Camera (with RTSP support)
- 1 Amazon Kinesis Video Stream
- A pinch of Amazon Rekognition
- 1 Amazon Kinesis Data Stream
- AWS Lambda Function as many as you need
- 1 Amazon SNS Topic
- A dash of IAM Roles and Access Policies

### Guided Tour of the Diagram

Understanding the essential cake ingredients is just the beginning; it's the art of blending them that gives each cake its unique flavor. Similarly, now that we have the recipe for crafting our Concierge tool, let's dive into the designed architecture and follow the instructions to bring it to life.

![architecture diagram](/img/kinesisVideoStreams/architecture.png)

In our tech recipe, the key ingredient is an IP camera. While numerous different exist for this project, I opted for the one that is available to me. I chose to utilize an IP camera (Tapo C310) because it supports RTSP (Real-Time Streaming Protocol). But why RTSP, you ask? It's essential for streaming the captured video from the camera and seamlessly feeding it into a Stream Service delivery, such as Amazon Kinesis Video Streams.


### Setting up The Camera

#### Get the IP address of the camera 
To find the IP address of your camera, login to your Network router and find your Device IP.

#### Create Camera Account
Any type of IP camera you choose, they usually have an application to enable users to interact with the camera, for my 'Tapo C310' camera, I Set up the TP-Link App and created a camera account. This credential is used with Amazon Kinesis Video (KVS)Stream's Client to authenticate it on getting the stream records from the camera. The Camera Account is something different from your TP-Link App login account, if you do not provide these credentials KVS will fail to get the stream from Camera. if you are using the same camera as mine [here is the instruction](https://www.tp-link.com/us/support/faq/2790/) on how to create your camera account.

At this stage your camera is ready to send the video stream to the cloud. Next step is to prepare the resources in the cloud.

### Create AWS Resources With Cloudformation

Looking back at the list of required resources and tools, we have a clear understanding of which services to set up in AWS. I will use Cloudformation to create the resources in AWS account.


#### Amazon Kinesis Resources
// Add more content about video stream and data stream

 As soon as it finds a match, the results are streamed out from Amazon Rekognition. But we it doesn't stop there; We need another delivery system to seamlessly deliver the analysis results from Amazon Rekognition to a destination like an AWS Lambda function. For this purpose 

Please note that Amazon Kinesis Video Streams (KVS) availability is limited in certain regions. To optimize performance and ensure support for the KVS service, it's essential to deploy the stack in a region that is both geographically close to you and a supported region for KVS.

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

#### Amazon Rekognition Resources

##### Rekognition Stream Processor
With our real-time video stream successfully ingested into Kinesis Video Streams from camera, you might be wondering "How does this tool recognize my visitors?", or "Which services help us achieve that?". These are valid questions, but we've got the answers. All we need is "Amazon Rekognition Stream Producer" and a "Face Collection".

Once the Live Video Data reaches Amazon Rekognition, it searches through a collection of images from various individuals.

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
  - We need an IAM role for Amazon Rekognition service that allows Rekognition to get the Video Data stream from Amazon Kinesis Video Streams service and put the Facial Match Records into Amazon Kinesis Data Stream, for that we need a policy like this:


```
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "kinesis:PutRecord",
                "kinesis:PutRecords"
            ],
            "Resource": "<KINESIS-DATA-STREAM-ARN>"
        },
        {
            "Effect": "Allow",
            "Action": [
                "kinesisvideo:GetDataEndpoint",
                "kinesisvideo:GetMedia"
            ],
            "Resource": "<KINESIS-VIDEO-STREAM-ARN>"
        }
    ]
}
```


### Create Joy From Amazon Rekognition Analysis

Once the face matching result arrives at the AWS Lambda function, the possibilities are endless. We have the freedom to utilize it in whichever way we desire – whether that means sending a joyful text message to notify us of our guest's arrival, complete with our visitor's name, or even treating them to a delightful song while they wait for our warm welcome at the entrance.


### Configure Face collection (AWS CLI)

We need to provide the known faces as a collection to Amazon Rekognition so that on live stream it can analyse and find the matches. within previous steps collection was create, to add known faces to the collection we can do it through AWS CLI. This is a manual step, you need to have set up your AWS CLI and configured your credentials to be able to run this command successfully. 

##### Add face to face collection:

I have stored the face examples which are just simple photos with`.jpg` format in a S3 Bucket. 

*Tip: make sure the region of your bucket is same as face collection*

```
  aws rekognition index-faces \
    --image '{"S3Object":{"Bucket":"<BUCKET_NAME>","Name":"<FILE_NAME>.jpg"}}' \
    --collection-id "<COLLECTION_ID>" \
    --detection-attributes "ALL" \
    --external-image-id "<FACE-TAG>" \
    --region <AWS_REGION>

```

### Start Rekognition Stream Producer (AWS CLI)

This is the heart of the system. It pulls video from Kinesis video, analyzes it & pushes the results to Kinesis data. 

- List Rekognition Stream Producer:

```
aws rekognition list-stream-processors
```

When we initially create the Rekognition Stream Producer the default status is "STOPPED".

```
output:
{
    "StreamProcessors": [
        {
            "Name": "musical-joy-rekognition-processor",
            "Status": "STOPPED"
        }
    ]
}
```

- Start Rekognition Stream Producer:
To Start the Rekognition Stream Producer run the following command:

```
aws rekognition start-stream-processor \
    --name <PROCESSOR_NAME>

```
After starting the Stream Producer the status will change to "Running"

```
{
    "StreamProcessors": [
        {
            "Name": "musical-joy-rekognition-processor",
            "Status": "RUNNING"
        }
    ]
}

```


#### Connect the Camera as a stream source (Producer) for Kinesis Video Stream.
/// talk about kinesis producer and client and the docker image

This seems to be very complex but thanks to Docker we can build the entire environment as a Docker image and use one of the provided samples from [AWS Amazon Kinesis Repository](https://github.com/awslabs/amazon-kinesis-video-streams-producer-sdk-cpp/blob/master/samples/kvs_gstreamer_sample.cpp).

1- Set up docker if it's first time using Docker [get Docker](https://docs.docker.com/get-docker/).
2- Copy provided Docker File [in the source repo](####) to the root of your project.
3- Build and Run the docker image:
        
```
        docker build -t <YOUR_IMAGE_NAME> .
        <!-- List docker images and find your image ID -->
        docker images   
        docker run -it <YOU_IMAGE_ID>

```

#### Run the gstreamer sample app with the requisite arguments

In your running docker execute the following command

``` 
AWS_ACCESS_KEY_ID=<AWS_ACCESS_KEY_ID> \
AWS_SECRET_ACCESS_KEY=<AWS_SECRET_ACCESS_KEY> \
./kvs_gstreamer_sample <STREAM_NAME> <RTSP_URL>

```

*Tip1: Make sure that you are Authenticate with your AWS credentials. Set up aws config within your Docker.*

*Tip2: The <RTSP_URL> url is typically something in this format rtsp://camera_username:camera_password@10.0.0.42:554/stream1*


### Set Up Telegram ChatBot

Simply follow instruction from (this web page)[https://sendpulse.com/knowledge-base/chatbot/telegram/create-telegram-chatbot], I am storing my API Token in Amazon Secrets Manager Service to get the secret in my (InformHost)[####] Lambda Function to send the visitors names and the music file to my telegram bot.


### Deploy Resources as Infrastructure as Code
We still need other resources like lambda functions to get the stream record from Amazon Kinesis Data stream, Amazon SNS Topic and so on. go ahead and continue with build, package and deploying the resources.

*In this project I have not set up CI/CD, if you are planing to productionise this project, make sure this step is part of your continues deployment process.*

*Remember to start your Chatbot before proceeding with deployment process*


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

// closing


### Clean up
After you’ve played with it to your heart’s content, it’s time to destroy it all! Follow these steps:

- Stop the Docker container.
- Stop & delete the stream processor:
```aws rekognition stop-stream-processor --name <REKOGNITION_STREAM_PRODUCER>```
```aws rekognition delete-stream-processor --name <REKOGNITION_STREAM_PRODUCER>```
- Delete cloudformation stack.
- Delete the Rekognition faces collection:
```aws rekognition delete-collection --collection-id <COLLECTION_ID```
- Delete the S3 bucket.