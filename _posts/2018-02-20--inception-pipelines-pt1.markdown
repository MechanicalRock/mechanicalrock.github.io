---
layout: post
title:  "Seeds of Inception - Part 1: Seeding your Account with an Inception Pipeline"
date:   2018-02-20
categories: aws continuous deployment
author: Pete Yandell
image: img/inception-pipelines/inception-pipeline-cover.png
---

## What's the problem

As we all know, we are supposed to automate everything, every must be 'as code' and there are no manual steps to doing anything. However when pressed with project deadlines, production fires and the rare moments when we get to work on something new, we just don't get around to it.

While working on a recent project, building out a continuous deployment pipeline, I got to thinking about the number of upcoming future projects. Each project would need at least one pipeline per application, and a dedicated one for the AWS Account. Rolling a unique snowflake pipeline everytime just seemed evil and wasteful and wrong and totally against everything we stand for a [Mechanical Rock](https://www.mechanicalrock.io)!

So welcome to the Inception Pipeline; a [CloudFormation](https://aws.amazon.com/cloudformation/) template that plants itself inside an AWS Account and then self manages and self updates itself using nothing more than off-the-shelf AWS services.

## What technologies are we going to use

* [CloudFormation](https://aws.amazon.com/cloudformation/)
* [CodeCommit](https://aws.amazon.com/codecommit/)
* [CodePipeline](https://aws.amazon.com/codepipeline/)
* [IAM](https://aws.amazon.com/iam/) [Roles](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_roles.html)
* [S3](https://aws.amazon.com/s3/)

## What are the prerequisites

1. An AWS Account to create the pipeline in.
1. The AWS CLI installed and configured with [access credentials](https://docs.aws.amazon.com/cli/latest/userguide/cli-chap-getting-started.html).
1. CodeCommit [git credentials configured](https://docs.aws.amazon.com/codecommit/latest/userguide/setting-up-https-unixes.html#setting-up-https-unixes-credential-helper).

While not strictly required, a passing familarity of Bash Shell scripts, Git, JSON & YAML, and CloudFormation templates will make understanding everything easier.

## How it all works

At a high-level, the Inception Pipeline works by executing a CloudFormation template which then creates a CodeCommit repository, a CodePipeline pipeline and a few other supporting resources. The first non-source action in the pipeline is a [CloudFormation Deployment Action](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/continuous-delivery-codepipeline.html). This blog post won't dive deeply into the CloudFormation template (I'll leave that as an exercise for you dear reader). Instead I'll just discuss the really juicy bits.

The secret-sauce to the Inception Pipeline is the using the same CloudFormation stackname in the CLI/console invocation and the CodePipeline Action (CloudFormation parameter ```StageAdministerPipelineStackName```). Once the initial CloudFormation stack has been created, the CodePipeline action below maintains the pipeline.

```yaml
- Name: 'AdministerPipeline'
    Actions:
    - Name: 'AdministerPipeline'
        ActionTypeId:
            Category: 'Deploy'
            Owner: 'AWS'
            Provider: 'CloudFormation'
            Version: '1'
        Configuration:
            ActionMode: 'REPLACE_ON_FAILURE' 
            Capabilities: 'CAPABILITY_NAMED_IAM'
            RoleArn: !GetAtt [CloudFormationDeployActionRole, Arn]
            StackName: !Ref StageAdministerPipelineStackName
            TemplateConfiguration: !Join ['', [!Ref RepositoryName, 'Source', '::aws_seed.json']]
            TemplatePath: !Join ['', [!Ref RepositoryName, 'Source', '::aws_seed.yml']]
        InputArtifacts:
            - Name: !Join ['', [!Ref RepositoryName, 'Source']]
        RunOrder: '1'
```

The CodePipeline is also configured to restart execution if it updates itself (```RestartExecutionOnUpdate: true```). This means when you add new stages, actions, etc, the pipeline will run the above action, realise its changed and then restart itself.

While not strictly necessary, I would recommend that:

1. The ```AdministerPipeline``` stage is only used for the ```AdministerPipeline``` action, i.e. don't add any other actions in.
2. The ```AdministerPipeline``` stage is the first stage after the ```Source``` stage. This allows the pipeline to update itself before anything else runs.

## Where do I get the seed files

Go grab a copy from the [GitHub repository](https://github.com/MechanicalRock/InceptionPipeline/part1). I'll wait while you do.

## What are the files

|File|Description|
|----|-----------|
|init.sh|Executing this script (assuming the prerequisites are met) will create a seed pipeline |
|aws_seed-cli-parameters.json|These are the paramerters to pass to the initial CloudFormation execution. These **MUST** match the values in ```aws_seed.json```|
|aws_seed.json|These are the parameters used by the CloudFormation template when executed as a deployment action in CodePipeline|
|aws_seed.yml|The pièce de résistance, the CloudFormation template that makes it all work|

## Taking it for a spin

1. Download the seed files from the [GitHub repository](https://github.com/MechanicalRock/InceptionPipeline/part1). Do not clone the repo, as the shell script will perform a ```git init```. Copy the downloaded files into a folder which will become your project folder.
1. Open all the files into your editor-of-choice. An editor that allows global search-and-replace will be super helpful.
1. Open ```aws_seed-cli-parameters.json```. Perform a global replace for all values between the ```@@```:
    |Parameter|Description|
    |---------|-----------|
    |RepositoryName|The name of the CodeCommit repository to create|
    |CodePipelineS3BucketName|The name of the S3 bucket to create that will be used to store artifacts from CodePipeline execution runs.|
    |CloudFormationDeployActionRoleName|The name of the IAM role that will be created to run the CloudFormation deployment action as.|
    |CodePipelineRoleName|The name of the IAM role that will be created for the CodePipeline to use.|
    |CodePipelineName|The name of the CodePipeline to create.|
    |StageAdministerPipelineStackName|The name of this stack that is creating the pipeline. If the names do not match then the pipeline will not be able to update itself.|
1. Run the ```init.sh|init.bat``` and watch the output.
1. If all goes well, within a few minutes you will have a running Inception Pipeline in your account!

## WIP/TODO/etc

Verify that the windows batch file works
