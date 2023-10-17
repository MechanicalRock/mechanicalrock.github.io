---
layout: postv2
font: serif
title: "Amazon Bedrock Anatomy"
description: "Part1: What is Amazon Bedrock And What Does It Do?"
date: 2023-10-08
author: Nadia Reyhani
image: /img/bedrock/amazon_bedrock.png
tags: [Machine Learning, Amazon Web Services, ML, Generative AI, Amazon Bedrock, AWS]
---

## Introduction

Did you catch the thrilling announcement? "Amazon Bedrock" is now officially accessible to all users. While a few incredible features of this service are still in the "Preview" stage, it is sufficient to empower teams with exciting capabilities for effortlessly creating and launching Generative AI applications.

This blog post comes in two exciting parts. In Part 1, I'll dive into the core concepts and terminology, taking apart the inner mechanisms of Amazon Bedrock. Then, brace yourself for [Part 2](https://blog.mechanicalrock.io/2023/10/08/amazon_bedrock_part2.html), where I'll walk you through crafting a simple yet captivating storytelling bot with Amazon Bedrock. If you're already well-versed in the basics, feel free to jump ahead to Part 2 and embark on your creative journey! 


## Let's Begin With The Basics

If you share my approach of beginning with documentation, you probably have already visited the "Amazon Bedrock" homepage.

![BedRock Description](/img/bedrock/bedrock_home_page.png)

 On this page, three significant phrases stand out: "Easiest way", "Scalable", and "Foundation Models". I am convinced that these attributes and characteristics are what set Amazon Bedrock apart from any other alternatives.

Ever wondered why AWS calls this the "easiest" and a "Scalable" option? Well, if you're an expert in generative AI (GenAI), you've likely tasted the complexity of setting up and managing the nuts and bolts needed for a generative AI app. It's like solving a puzzle with pieces like:

- Picking the right computing power.
- Network Configurations.
- Ensuring model and data safety.
- Monitoring and Keeping an eye on the infrastructure for a reliable app.
- Data security

So, how does Amazon Bedrock make this complex stuff easy? Picture this: Bedrock often serves up pre-configured resources, custom-made for GenAI tasks. These ready-to-go setups come with all the software bits and pieces you need, like libraries, dependencies and tools, already installed. Plus, Bedrock integrates with AWS Managed services like Amazon S3, Amazon CloudWatch, and AWS Lambda, making tough tasks like configuring data storage, authentication, and monitoring a walk in the park for your GenAI apps.

Here's the cool part: Amazon Bedrock is "Serverless." That means it can automatically grow or shrink resources as your app's popularity ebbs and flows. So, when traffic goes up, Bedrock scales up your resources, ensuring peak performance without breaking the bank. All provided data to the Bedrock is encrypted at both rest and in transit. That would give your peace of mind if you want to adopt GenAI.

If I've got you excited about the ease and efficiency of GenAI apps with Amazon Bedrock, it's time to dive into the world of "Foundation Models".

## Uncover The Magic Of Foundation Models (FMs)

FMs are like super-smart, giant neural networks trained on massive piles of data. Instead of reinventing the AI models every time from scratch, we use FMs as a launchpad to create our own customised models in a faster and cost-effective approach. These FMs are like all-in-one champs; they can execute multiple tasks with high accuracy, like generating image or text from a simple input prompt, answering tricky questions, and even solving math puzzles. 

What makes FMs stand out is their versatility. Unlike regular ML models that are one-trick ponies, FMs are like jacks-of-all-trades, zipping through tasks quicker and cheaper. They're like the cool kids who make their own labels from data, thanks to something called self-supervised learning. This sets them apart from the old-school ML models, whether they were supervised or flying solo without supervision (unsupervised learning)!

## Demystify Amazon Bedrock

### Availability

As of writing this blog post, Amazon Bedrock is accessible in four regions, as listed below. But keep in mind that by the time you're reading this, AWS might have expanded its availability to additional regions. So, always stay tuned for the latest updates!

![Availability](/img/bedrock/region_availability.png)


### Bedrock Base Foundation Model Choices

If you're new to Amazon Bedrock and you're diving into the "Base Models" within your AWS console, you might notice a warning next to the listed models. By default, your Amazon Bedrock doesn't come with access to these base FMs. To use them, you'll need to request access first.

![warning](/img/bedrock/access_models.png)

To make this happen, head to your AWS Amazon Bedrock console and navigate to "Model Access." There, you can pick the models you want to use and send in an access request for them. After a little while, maybe a few minutes or occasionally a few hours, you'll see those models go from "Pending" to "Access granted," just like in the screenshot below. Keep in mind that Model access is provided on a per-region basis. If you want models available in multiple regions, you'll need to request access for each region separately.

![request model access](/img/bedrock/request_access.png)

Feel free to explore the list of available Foundation Models (FMs) for Amazon Bedrock and discover their individual use cases. 

Pricing for each model is determined by the pricing mode you've chosen, whether it's On-Demand or Provisioned. Additionally, it's influenced by factors like the length of the generated tokens and other considerations. For detailed pricing information, you can refer to [this link](https://aws.amazon.com/bedrock/pricing/).

### Fine-Tune a Foundation Model

Isn't this exciting? The best part is that we're not restricted to just using Base Models. We have the flexibility to supply a labeled dataset, initiate a tuning job, and once we're satisfied with the model's performance and accuracy, we can seamlessly utilise the fine-tuned model for inference, just as easily as working with the Base Models.

### Bedrock Agent-Preview

I must admit, this is my absolute favourite feature, and I'm eagerly awaiting the day when AWS announces it's available to everyone, perhaps at Re:Invent 2024!

If you're not sure what an agent means in the world of Generative AI, I've put together a brief [blog post](https://blog.mechanicalrock.io/2023/07/04/LLM-Transformers.html) explaining Agents and Transformers. Agents have the incredible power to expand the capabilities of Foundation Models. They can grasp all sorts of user requests, tackle even the most complex ones by breaking them down into smaller tasks, and then take action to fulfill those requests. If you want to learn how to make your own Agent for Amazon Bedrock, you're in luck! Check out this fantastic [article](https://aws.amazon.com/blogs/aws/preview-enable-foundation-models-to-complete-tasks-with-agents-for-amazon-bedrock/) for all the details.

### Knowledge Base-Preview

Like the Bedrock agent, this feature is still in "Preview". Creating agents for Amazon Bedrock offers a big advantage: it allows secure connections between FMs and your company's data sources. This means Bedrock can tap into additional datasets, resulting in more precise answers.

If you've got Preview access to Amazon Bedrock, don't hesitate any longer. Jump into your AWS console and follow this detailed [blog post](https://aws.amazon.com/blogs/aws/preview-connect-foundation-models-to-your-company-data-sources-with-agents-for-amazon-bedrock/) to learn how to kickstart the Knowledge Base for Amazon Bedrock.

## Wrap Up

While Amazon Bedrock is still evolving, it's been a game-changer for sparking our creativity and making it easy and cost-effective to build advanced generative AI apps. Personally, I can't wait to try out Amazon Bedrock Agent and its Knowledge Base features; they promise even more exciting possibilities.

Now that you've got the basics of this service and its models, let's get hands-on. Follow along in [Part 2](https://blog.mechanicalrock.io/2023/10/08/amazon_bedrock_part2.html) of this article, where I'll guide you through creating a storytelling app using Amazon Bedrock and some other cool Amazon services. It's time to bring your ideas to life!