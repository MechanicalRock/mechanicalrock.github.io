---
layout: post
title: Unlocking The Power Of Machine Learning To Automate Diagram Information Extraction
description: A simple but efficient solution to extract data from documents with Amazon Textract.
date: 2023-05-15
tags: [ML, AWS, Machine Learning, Amazon Textract]
author: Shermayne Lee, Nadia Reyhani
image:
---

## Introduction

![MLOps](/img/reinventRecap2022-ML/MLOps.png)

These days, the volume of information stored in documents and diagrams is growing exponentially. It is making it increasingly difficult for individuals and organisations to extract valuable information. However, with the advent of Artificial Intelligence (AI) and Machine Learning (ML), extracting text and data from documents and diagrams has become significantly easier and more accurate. 

AI and ML algorithms can analyse and interpret various types of documents and diagrams, such as invoices, research papers, flow charts and piping & instrumentation diagrams (P&ID). This transformative technology not only saves time and resources but also revolutionises the way we process information. 

In this blogpost, we are going to walk through how we extract information from P&ID diagrams and convert them into a digital process model using Amazon Textract. 


## Amazon Textract

What is Amazon Textract? Amazon Textract is a machine learning service provided by Amazon Web Services (AWS) that makes it easier to extract text and data from documents. 
This is a perfect service to automate the process of document analysis and eliminating the need for extraction. 


### Why do we end up using Amazon Textract ?

![MLOps Security Layer](/img/MLOpsComponents/MLOps-security-layer.png)

To ensure the security of MLOps solutions, prioritizing security and adhering to recommended security practices at every stage of the ML workflow is crucial. This includes:

- Deploying the solution within a Virtual Private Cloud (VPC) and exclusively utilizing VPC endpoints for AWS services.
- Restricting internet access in ML environments by disabling public network access within resources like SageMaker Notebooks and incorporating Private Subnets and Security Groups.
- Establishing appropriate user and service roles by implementing a least-privilege policy.
- Implementing secure solutions for multi-account architectures, leveraging services such as AWS Control Tower.
- Enforcing end-to-end data encryption during transit and at rest throughout the ML solution.

### Solution Overview

![MLOps Monitoring Layer](/img/MLOpsComponents/Monitoring.png)

This involves the ongoing monitoring of data and model quality to identify potential bias or drift and promptly address them. An example of this is leveraging Amazon CloudWatch events to automatically monitor drift, initiate re-training, and notify relevant stakeholders in a timely manner.

### Exploration

![MLOps Exploration Layer](/img/MLOpsComponents/Exploration.png)

Machine learning operations (MLOps) commence with exploratory data analyzes (EDA), where data scientists analyze a subset of data and employ diverse ML algorithms and techniques to identify the most suitable ML solution. This process is seamlessly facilitated by Amazon SageMaker Studio, offering capabilities for data analyzes, data processing, model training, and deploying models for inference through a non-production endpoint. To ensure the reproducibility of experiments, SageMaker's Experiment capability tracks all activities performed by data scientists.

### ML Pipeline

![ML Pipeline Layer](/img/MLOpsComponents/ML-Pipeline.png)

After this exploratory phase, machine learning engineers convert the proposed solution by the data scientist to the production-ready ML code and create end-to-end machine learning workflow including data processing, feature engineering, training, model evaluation, and model creation for deployment using a variety of available hosting options.

### Continuous Integration

![ML CI Layer](/img/MLOpsComponents/CI.png)

To eliminate manual work as a result of making any update to the code or infrastructure, an MLOps engineer will add the Continuous Integration (CI) capability to the workflow to enable data scientists or ML engineers to regularly merge their changes to ML Code or ML assets/resources.

### Continuous Deployment

![ML CD Layer](/img/MLOpsComponents/CD.png)

Our objective is to establish not just a continuous building and testing capability but also an automated continuous deployment process to the production environment. To accomplish this, we can separate the training stage of the ML workflow from the model deployment stage. This decoupling enables us to modify the model configuration and infrastructure without impacting the training workflow. Additionally, it provides the flexibility of a rollback option in case any issues arise during the deployment phase.

## Final words

![ML workflow](/img/MLOpsComponents/MLPipeline.png)

As mentioned in this concise blog post, an ML pipeline typically comprises two workflows positioned on either side of a machine learning model registry. The model registry serves as a centralized hub for managing machine learning models, enabling ML engineers and data scientists to train models, compare different versions, visualize metrics, and make decisions regarding acceptance or rejection. Ideally, approving a new model version initiates a pipeline that culminates in the deployment of the model into production.

In the realm of Machine Learning, particularly within the AWS ecosystem, numerous options exist for crafting an effective workflow. Various services cater to the needs of both Data Scientists, like Amazon SageMaker, and Operations teams, such as Amazon CodePipeline. Familiarizing yourself with the distinctive features of each tool or service empowers you to select the optimal solution for your Machine Learning project and team. 


If you're curious about Mechanical Rock's approach to architecting Machine Learning solutions or require assistance with your ongoing Data Science project, don't hesitate to [contact us](https://mechanicalrock.io/lets-get-started). Our team is dedicated to providing unwavering support and guidance whenever you need it.
