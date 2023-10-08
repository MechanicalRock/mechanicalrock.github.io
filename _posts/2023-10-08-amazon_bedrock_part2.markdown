---
layout: postv2
font: serif
title: "Story telling with Amazon Bedrock"
description: "Part2: Building your very own storytelling application with Foundation Models from Amazon Bedrock"
date: 2023-10-08
author: Nadia Reyhani
tags: [Machine Learning, Amazon Web Services, ML, Generative AI, Amazon Bedrock, AWS]
---

## Introduction

Welcome to Part 2 of our introductory blog series! In Part 1, we delved into the basic concepts such as Foundation Models and discovered the amazing features and capabilities of Amazon Bedrock. Now, it's time for the fun part: building your very own storytelling application with Foundation Models from Amazon Bedrock.

Just a heads-up, we're keeping things super simple in this app. We won't be focusing on the bells and whistles of user experience for now. I'll explain what I mean by that in a moment, but first, let's talk about what you'll achieve by the end of this post.

By the time we're done here, you'll have deployed a serverless setup with two APIs. We'll be using Appsync and GraphQL to make requests to these APIs and generate stories. If you're wondering how these APIs work their magic with FM models to conjure up stories and illustrations, that's the enchantment of Amazon Bedrock we'll uncover together. So, let's get started on this storytelling adventure! 

Now that you've got a glimpse of what we're building, let's take a moment to unravel the complexity hidden behind this seemingly simple feature. Imagine this: a user hops onto your web app and wants to create a story by giving it a topic prompt. From the user's standpoint, they expect the story to magically unfold, complete with illustrations, as quickly as they can think of it. They might want to edit and personalize the story, or even ensure that it suits the age group it's intended for. And what if they want to save and share their literary masterpiece with others?

All these amazing features and optimizations are like extra layers of icing on the cake, but for our project, we're keeping things focused. So, while they're fascinating possibilities, we'll save them for another time!

## Build an story telling app with me 

Take a look at the cool diagram below! It shows you exactly how our app works at every step:

- The user, starts by giving us an idea for a story or what the story should be about.

- When user clicks on "Generate Story," the web app send a request to foundation model to create the story, and then it returns the generated story.

- Now, here's where it gets interesting. user can either generate another story with the same topic or change the topic and get a new one. Plus, they can even add illustrations to the story! In this app, I've configured the FM model to generate an image for each paragraph. These images are stored in an S3 bucket, and the UI shows them to user once it gets back the S3 presigned URLs.

For all the nitty-gritty details, just check out the solution architecture diagram. It's like a map that guides you through the app's awesomeness.


### Architecture

![Solution Diagram](/img/bedrock/solution_diagram.png)

### Web application

We won't be diving into the fancy frontend design here. I've laid out the basic structure of the application. You can grab the source code from our GitHub repository and give it your own unique style or add more features if you'd like. Once you've got the code, just follow the simple steps in the ReadMe file to get your app running on your computer.

And if you're feeling adventurous and want to share your app with the world, you can even host it on your AWS account. I won't get into the nitty-gritty details in this blog post, but all you really need is an Amazon S3 bucket to store your web app's resources. Then, set up Amazon CloudFront and use Route 53 to manage your domain's traffic and routing. It's not as complicated as it might sound, and it's a great way to take your project to the next level!


### Amazon Bedrock Magician



### Conclusion

Overall, custom tools in Transformers provide flexibility, control, and customization options to accommodate specific requirements, domain expertise, and performance optimization. They empower developers to fine-tune the library's functionality and achieve better results in various NLP applications.

I hope this guide has provided you with a solid foundation to get started with building your own custom Transformer tools. If you have any further questions or need assistance, please feel free to reach out to [contact us](https://mechanicalrock.io/lets-get-started). Our team is dedicated to providing unwavering support and guidance whenever you need it.

Good luck with your LLM endeavors!
