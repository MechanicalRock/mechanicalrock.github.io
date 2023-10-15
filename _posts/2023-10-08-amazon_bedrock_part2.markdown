---
layout: postv2
font: serif
title: "Story telling App with Amazon Bedrock"
description: "Part2: Building your very own storytelling application with Foundation Models from Amazon Bedrock"
date: 2023-10-08
author: Nadia Reyhani
tags: [Machine Learning, Amazon Web Services, ML, Generative AI, Amazon Bedrock, AWS]
image: /img/bedrock/application_demo.png
---

## Initial Words

Welcome to Part 2 of our introductory blog series! In [Part 1](), we delved into the basic concepts such as Foundation Models and discovered the amazing features and capabilities of Amazon Bedrock. Now, it's time for the fun part: building your very own storytelling application with Foundation Models from Amazon Bedrock.

Just a heads-up, we're keeping things super simple in this app. We won't be focusing on the bells and whistles of user experience for now. I'll explain what I mean by that in a moment, but first, let's talk about what you'll achieve by the end of this post.

By the time we're done here, you'll have deployed a serverless setup with two APIs. We'll be using Appsync and GraphQL to make requests to these APIs and generate stories. If you're wondering how these APIs work their magic with FM models to conjure up stories and illustrations, that's the enchantment of Amazon Bedrock we'll uncover together. So, let's get started on this storytelling adventure! 

Now that you've got a glimpse of what we're building, let's take a moment to unravel the complexity hidden behind this seemingly simple feature. Imagine this: a user hops onto your web app and wants to create a story by giving it a topic prompt. From the user's standpoint, they expect the story to magically unfold, complete with illustrations, as quickly as they can think of it. They might want to edit and personalize the story, or even ensure that it suits the age group it's intended for. And what if they want to save and share their literary masterpiece with others?

All these amazing features and optimizations are like extra layers of icing on the cake, but for our project, we're keeping things focused. So, while they're fascinating possibilities, we'll save them for another time!

## Build An Storytelling App With Me 

![Solution Diagram](/img/bedrock/application_demo.png)


Take a look at the cool diagram below! It shows you exactly how our app works at every step:

- The user, starts by giving us an idea for a story or what the story should be about.

- When user clicks on "Generate Story," the web app send a request to foundation model to create the story, and then it returns the generated story.

- Now, here's where it gets interesting. user can either generate another story with the same topic or change the topic and get a new one. Plus, they can even add illustrations to the story! In this app, I've configured the FM model to generate an image for summary of each paragraph. These images are stored in an S3 bucket, and the UI shows them to user once it gets back the S3 presigned URLs.

For all the nitty-gritty details, just check out the solution architecture diagram. It's like a map that guides you through the app's awesomeness.


### Architecture

![Solution Diagram](/img/bedrock/solution_diagram.png)

### Web application

We won't be diving into the fancy frontend design here. I've laid out the basic structure of the application. You can grab the source code from our [GitHub repository](https://github.com/RonakReyhani/botRock/tree/main) and give it your own unique style or add more features if you'd like. Once you've got the code, just follow the simple steps in the ReadMe file to get your app running on your computer.

And if you're feeling adventurous and want to share your app with the world, you can even host it on your AWS account. I won't get into the nitty-gritty details in this blog post, but all you really need is an Amazon S3 bucket to store your web app's resources. Then, set up Amazon CloudFront and use Route 53 to manage your domain's traffic and routing. It's not as complicated as it might sound, and it's a great way to take your project to the next level!


### Amazon Bedrock Magician

To set up the necessary APIs for our app to function, we'll be creating a serverless stack. You can access the complete source code in the [GitHub repository](https://github.com/RonakReyhani/botRock/tree/main) within the "Backend" folder. In this folder, you'll find all the required Functions, IAM Roles, and Managed Policies listed in the "serverless.yml" file. To deploy the API, all you have to do is run the command specified in the "ReadMe.md" file.

However, I strongly recommend that before you deploy the serverless stack, you continue reading this article. I'll be sharing code snippets from various lambdas, explaining how to define your Input Prompt, how to access the API "Request" object, and different methods for invoking the Foundation Models. It's like getting a sneak peek behind the scenes!   

### Configure the Bedrock runtime Client

```py
# Implementation in Python
import boto3, json

bedrock_client = boto3.client(
    service_name="bedrock-runtime",
    region_name="us-east-1"
)

```



```ts
// Implementation in Nodejs

import { BedrockRuntimeClient } from "@aws-sdk/client-bedrock-runtime";

const bedrockRuntimeClient = new BedrockRuntimeClient({ region: "us-east-1" })

```
### Model playground

To understand how to send requests for each Bedrock model, you have two options. You can check out the Notebook examples in the Bedrock console, or you can use the model playground. In the model playground, pick the model you want, configure the inference options (The result will be influenced by the model parameters), and then click "View API Request." This allows you to copy the request and modify the input as needed.

For our Generate Story API, we'll be using the "Jurassic-2 Ultra" model from the "AI21 Lab" category. It's going to be a fun ride! 

![select model](/img/bedrock/select_model.png)

![request payload](/img/bedrock/get_keywords.png)

### Construct your Request Payload

Now that we have the request payload, we can begin making it more versatile, allowing our model to generate stories for any given topic.

```py

kwargs = {
  "modelId": "ai21.j2-ultra-v1", <------ Text generator model
  "contentType": "application/json",
  "accept": "*/*",
  "body": "{\"prompt\":\" write a stroy up to 200 words about "+ storyTopic + "\",\"maxTokens\":300,\"temperature\":0.7,\"topP\":1,\"stopSequences\":[],\"countPenalty\":{\"scale\":0},\"presencePenalty\":{\"scale\":0},\"frequencyPenalty\":{\"scale\":0}}"  <-------- Body Object contains the Model Parameters & Input prompt
}

```


```ts
// Implementation in Nodejs
    private constructStoryRequestPayload = (prompt: string, maxToken: number) => {
        return {
            "modelId": this.textModelId,
            "contentType": "application/json",
            "accept": "*/*",
            "body": `{\"prompt\":\ ${prompt},\"maxTokens\": ${maxToken},\"temperature\":0.7,\"topP\":1,\"stopSequences\":[],\"countPenalty\":{\"scale\":0},\"presencePenalty\":{\"scale\":0},\"frequencyPenalty\":{\"scale\":0}}`
        }
    }

```

### Invoke FM for inference

We're nearly there! It's as straightforward as this: to obtain inference from our text generator model "Jurassic-2 Ultra," we have two options. We can either use the "invoke_model" method or the "invoke_model_with_response_stream" method. If you're wondering about the difference, here's the scoop:

- With the "invoke_model" method, the model won't provide any response until it has fully generated the text or completed the requested task.
- On the other hand, "invoke_model_with_response_stream" offers a smoother and more real-time experience for users. It sends stream response payloads back to clients as the model works its magic.



```py
# Implementation in Python

story = bedrock_client.invoke_model(**kwargs)

```
OR 

```py

story = bedrock_client.invoke_model_with_response_stream(**kwargs)
stream = story.get('body)
if stream:
    for event in stream:
        chunk = event.get('chunk)
        if chunk:
            print(json.loads(chunk.get('bytes').get('completion'), end=""))

```


```ts
// Implementation in Nodejs

private invokeTextModel = async (prompt: string, maxToken: number): Promise<string> => {
        // construct model API payload
        const input = this.constructStoryRequestPayload(prompt, maxToken)
        const command = new InvokeModelCommand(input);
        // InvokeModelRequest
        const response = await this.bedrockRuntimeClient.send(command);
        const story = response.body.transformToString()
        // get the text body
        const parsedStory = JSON.parse(story)
        return parsedStory.completions[0].data.text
    }

```


### Extract the generated text

```py
story_stream = json.loads(story.get('body').read())
story_content = story_stream.get('completions')[0].get('data').get('text')

```

To create illustrations for other APIs based on a generated story, simply utilize the "stable-diffusion-xl-v0" model from the "Stability AI" category. It's that easy!


### Final Words

I've always been a fan of keeping things simple and staying grounded in the fundamentals. It's a great way to uncover new ideas, explore, and learn, all while having a good time building cool stuff.

In this two-part blog post, my goal was to introduce you to Amazon Bedrock, showcase its features, and demonstrate how you can easily integrate various FMs into your APIs to build amazing generative AI-powered applications. I hope you've found it valuable. Now that you have a solid foundation, feel free to build upon it and explore even further! The possibilities are endless.  