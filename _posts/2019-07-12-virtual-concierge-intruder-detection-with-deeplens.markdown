---
layout: post
title:  "Virtual Concierge - Intruder Dectection with AWS DeepLens"
date:   2019-07-12
tags: devops iot greengrass aws deeplens
author: Nathan Glover
image: img/blog/virtual-concierge-intruder-detection-with-deeplens/architecture.png
---

## Introduction

Virtual Concierge is an office assistant written to help detect intruders that enter the Mechanical Rock office.

## Architecture

![Architecture](/img/blog/virtual-concierge-intruder-detection-with-deeplens/architecture.png)

Seen above is the high level architecture implemented in [virtual-concierge](https://github.com/MechanicalRock/virtual-concierge). Each component handles a different stage in the intruder detection processing stream.

### Source Code

The full source code for the project is available on our GitHub at [MechanicalRock/virtual-concierge](https://github.com/MechanicalRock/virtual-concierge).

_**Note:** Guess what! You don't need a DeepLens in order to follow along with this tutorial 😍. If you have another device ([lets say a Raspberry Pi 3 for example](https://docs.aws.amazon.com/greengrass/latest/developerguide/gg-gs.html)), as long as you're able to load AWS IoT Greengrass, onto it, you'll be able to re-use the code in this repo._

#### 😃 [facecrop](https://github.com/MechanicalRock/virtual-concierge/blob/master/deeplens/facecrop.py)

---

Receives the incoming video feed from the DeepLens camera, then makes use of the Amazon single shot detector (SSD) for recognising facial characteristics.

Upon successful detection the face area is cropped out of the video feed and send over the DeepLens [AWS IoT](https://aws.amazon.com/iot/) topic for the next stage of processing.

#### 🔍 [decode](https://github.com/MechanicalRock/virtual-concierge/blob/master/doorman/decode.py)

---

Decode is responsible for receiving the base64 encoded face image from the DeepLens IoT topic. It makes use of an [AWS IoT Topic Rule](https://docs.aws.amazon.com/iot/latest/developerguide/iot-rules-tutorial.html) as an event trigger and takes the decoded image and places it into an S3 bucket in the `/incoming` folder.

#### 🔮 [guess](https://github.com/MechanicalRock/virtual-concierge/blob/master/doorman/guess.py)

---

Guess is triggered when a new image lands in the `incoming/` folder of the S3 bucket. Its role is to perform an inference with [Amazon Rekognition](https://aws.amazon.com/rekognition/) on the supplied face image.

```python
client = boto3.client('rekognition')
...
resp = client.search_faces_by_image(
    CollectionId=rekognition_collection_id, # Collection ID (more on this later)
    Image=image, # Image object from S3
    MaxFaces=1, # Single face provided in image
    FaceMatchThreshold=70) # Match threshold, sweet spot based on some tweaking.
```

At this point the process flow can go one of two ways.

1. **If the person in the image IS NOT detected**, then a message is delivered to slack prompting members of the team to tag a new face.

    This interaction happens by [another Lambda called unknown](https://github.com/MechanicalRock/virtual-concierge/blob/master/doorman/unknown.py) that retrieves the image from the `unknown/` directory of the S3 bucket. This interaction is also faciliated via S3 events.

    The input asks for a Slack username so that an identity within chat can be tagged later on when the user is seen again.

    {:refdef: style="text-align: center; width:100px;"}
    <img src="/img/blog/virtual-concierge-intruder-detection-with-deeplens/hamish-slack-02.png" width="450">
    {: refdef}

2. **If the person in the image is detected**, then a message is delivered to slack notifying the office that their colleague has entered the building. The bot also tags the user into the message, so that if it isn't actually them they can quickly warn the team of the imposter.

    {:refdef: style="text-align: center;"}
    <img src="/img/blog/virtual-concierge-intruder-detection-with-deeplens/hamish-slack-01.png" width="200">
    {: refdef}

#### 🥋 [train](https://github.com/MechanicalRock/virtual-concierge/blob/master/doorman/train.py)

---

Train is responsible for completing the feedback loop based on the users selection from Slack.

* **If the user clicks `ignore`**, the image is removed from the S3 bucket and not assigned to any identities.

* **If the user selects a Slack identity** however, the image is fed back into [Amazon Rekognition](https://aws.amazon.com/rekognition/) for future inferences.

    ```python
    client = boto3.client('rekognition')
    ...
    resp = client.index_faces(
        CollectionId=rekognition_collection_id,
        Image={
            'S3Object': {
                'Bucket': bucket_name,
                'Name': key,
            }
        },
        ExternalImageId=user_id,
        DetectionAttributes=['DEFAULT']
    )
    ```

## Deploy Your Own

If you'd like to deploy your own version, I recommend familiarzing yourself with the following technologies:

* [Serverless Framework](https://serverless.com/) - Used for the majority of the lambdas in the project. The configuration for deployment can be found in the [serverless.yaml](https://github.com/MechanicalRock/virtual-concierge/blob/master/serverless.yml) file.
* [AWS Serverless Application Model](https://aws.amazon.com/serverless/sam/) - Used for the DeepLens Greengrass code due to a small limitation around packaging up subfolders within one [monorepo](https://mechanicalrock.github.io/2019/02/03/monorepos-aws-codebuild.html).
* [AWS CLI](https://docs.aws.amazon.com/cli/latest/userguide/cli-chap-configure.html) - Ensure that your AWS CLI is setup and configured with your account credentials.
* [DeepLens Setup](https://docs.aws.amazon.com/deeplens/latest/dg/deeplens-getting-started-set-up.html) - If you do end up using a DeepLens, run through the setup guide.

Once you've familiarized yourself, head on over to the [MechanicalRock/virtual-concierge](https://github.com/MechanicalRock/virtual-concierge) repository and checkout the [README](https://github.com/MechanicalRock/virtual-concierge/blob/master/readme.md) for detailed instruction.

If you're interested in the possibilities of deploying AWS IoT Greengrass or Serverless workflows [get in touch](https://www.mechanicalrock.io/lets-get-started)!

And [we're hiring](https://www.mechanicalrock.io/lets-get-started)!

## Attribution

Implementation of the guess, unknown & train code was based on the work by [Sander van de Graaf](https://github.com/svdgraaf) in his project [Doorman](https://devpost.com/software/doorman-a1oh0e).
