---
layout: post
title: Automating cross-account infrastructure with the new CloudFormation StackSet resources
date: 2020-10-08
tags: devops ci cd cloudformation infrastructure-as-code aws cross-account
author: Simon Bracegirdle
image: img/cloudformation.png
---

It has been three years since AWS [added Stack Sets as a feature to CloudFormation](https://aws.amazon.com/blogs/aws/use-cloudformation-stacksets-to-provision-resources-across-multiple-aws-accounts-and-regions/). StackSets are a way to manage the deployment of infrastructure templates over many accounts and regions. For example, you could schedule the execution of a lambda function in all accounts and regions to report on non-standard resources.

If you are administering many accounts in an AWS landscape, StackSets are a critical tool in your toolbelt.

But, up until recently, StackSets were not supported in CloudFormation. This means you had to click around in the console or you had to write your own complicated orchestration code to manage their rollout and to keep them updated. This made a code-driven infrastructure approach difficult.

AWS introduced [AWS Control Tower Customisations in early 2020](https://aws.amazon.com/about-aws/whats-new/2020/03/introducing-customizations-aws-control-tower-solution/) to help with deploying stack sets from the Organisation master account (in Control Tower setups). But, the solution was still complicated as it required deploying many separate components. It also had some limitations such as; lack of support for the CloudFormation capabilities parameter, inability to automate rollback, and inability to deploy within the master account itself.

Fast forward to late 2020, AWS has added support for deploying StackSets via CloudFormation resources. This means that you can orchestrate deployment to many regions and accounts from a single CloudFormation stack by embedding StackSet resources.

This addition has the potential to realise the original promise of StackSets. Let's take it for a spin.

## An overview of the resource syntax

[According to the documentation](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-resource-cloudformation-stackset.html), the YML syntax for creating StackSets in CloudFormation is this:

```yaml
Type: AWS::CloudFormation::StackSet
Properties: 
  AdministrationRoleARN: String
  AutoDeployment: 
    AutoDeployment
  Capabilities: 
    - String
  Description: String
  ExecutionRoleName: String
  OperationPreferences: 
    OperationPreferences
  Parameters: 
    - Parameter
  PermissionModel: String
  StackInstancesGroup: 
    - StackInstances
  StackSetName: String
  Tags: 
    - Tag
  TemplateBody: String
  TemplateURL: String
```

The template for the StackSet can be provided inline via `TemplateBody` or as a reference to a file in S3 via `TemplateURL`. The inline approach is extremely convenient for simple StackSets. But, if you have a complex template, you should note the 51K maximum length. There are other limitations that we will discover in a later section.

`PermissionModel` is a key parameter as it determines whether you manage the IAM Roles that CloudFormation will assume (`SELF_MANAGED` approach), or whether CloudFormation will manage them for you (`SERVICE_MANAGED` approach). The latter approach is only possible if you are deploying from the AWS Organizations master account.

The StackSet will deploy according to the `StackInstancesGroup` property . You can specify specific accounts, Organisation Units, or an entire Organisation.

Enabling `AutoDeployment`  will trigger automated deployment for new accounts added to the targeted AWS Organisation or Organisation Unit (OU) . This is a necessity if you're using StackSets for managing organisation guard rails. This is only possible when using the `SERVICE_MANAGED` approach.

## Self managed example

Let's show the usage of the StackSet resource through a theoretical example.

As part of a data platform, we want to create an S3 bucket in many regions. This will enable us to minimise cross region data transfer costs and decrease latency.

CodePipeline is capable of deploying these stacks to many regions. However, it may be simpler to use a StackSet, especially if deploying many stacks to many different regions and we want to ensure that they're kept in sync.

The CloudFormation code for this use case would look like this:

```yaml
MyCrossRegionBucketStackSet:
  Type: AWS::CloudFormation::StackSet
  Properties:
    StackSetName: MyCrossRegionBucketStackSet
    PermissionModel: SELF_MANAGED
    StackInstancesGroup:
      - Regions:
          - us-east-1
          - ap-southeast-2
        DeploymentTargets:
          Accounts:
            - !Ref AWS::AccountId
    TemplateBody: |
      Resources:
        MyStackSetBucket:
          Type: AWS::S3::Bucket
          DeletionPolicy: Delete
          Properties:
            AccessControl: Private
            BucketName: !Sub 'my-bucket-stack-set-test-${AWS::Region}-${AWS::AccountId}'
            BucketEncryption:
              ServerSideEncryptionConfiguration:
                - ServerSideEncryptionByDefault:
                    SSEAlgorithm: AES256
```

## StackSet roles and relationships

Note that we have used the `SELF_MANAGED` value for `PermissionModel`. This means that we need to ensure an execution role and administration role exist with a trust relationship in place. Unless you specify otherwise via the parameters, it will look for roles with the name `AWSCloudFormationStackSetAdministrationRole` for administartion and `AWSCloudFormationStackSetExecutionRole` for execution [by default](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/stacksets-prereqs-self-managed.html).

<center><img src="/img/stacksets_perms_master_target.png" /></center>
<br/>

If these roles do not exist in your account, you can use the CloudFormation resources in the following sections to create them for this particular use case.

## Creating the Administration role

The administration role is the top-level role assumed by CloudFormation to orchestrate the StackSet:

```yaml
AdministrationRole:
  Type: AWS::IAM::Role
  Properties:
    RoleName: AWSCloudFormationStackSetAdministrationRole
    AssumeRolePolicyDocument:
      Version: 2012-10-17
      Statement:
        - Effect: Allow
          Principal:
            Service:
              - cloudformation.amazonaws.com
          Action:
            - "sts:AssumeRole"
    Path: /
    Policies:
      - PolicyName: AWSCloudFormationStackSetAdministrationPolicy
        PolicyDocument:
          Version: "2012-10-17"
          Statement:
            - Effect: "Allow"
              Action: "cloudformation:*"
              Resource: "*"
```

### Creating the Execution role

We need to allow the administration role to assume the execution role, which is then used to create the StackSet instance.

Note the `AssumeRolePolicyDocument` property, where we establish a trusted relationship by allowing the administration role to assume the execution role.

```yaml
AWSCloudFormationStackSetExecutionRole:
  Type: AWS::IAM::Role
  Properties:
    RoleName: AWSCloudFormationStackSetExecutionRole
    AssumeRolePolicyDocument:
      Version: 2012-10-17
      Statement:
        - Effect: Allow
          Principal:
            AWS: !GetAtt AdministrationRole.Arn
          Action:
            - "sts:AssumeRole"
    Path: /
    Policies:
      - PolicyName: AWSCloudFormationStackSetExecutionRolePolicy
        PolicyDocument:
          Version: "2012-10-17"
          Statement:
            - Effect: "Allow"
              Action: "s3:*"
              Resource: "*"
            - Effect: "Allow"
              Action: "cloudformation:*"
              Resource: "*"
            - Effect: "Allow"
              Action: "sns:*"
              Resource: "*"
            - Effect: "Allow"
              Action: "lambda:InvokeFunction"
              Resource: "*"
```

### Inline vs URL template approach

We used the inline approach for the template itself via the `TemplateBody` parameter. You may have noticed that this breaks the editor's code highlighting for the nested template, since it's treated as a string value. I'm expecting that it will also bypass linting and error checking tools.

You may want to consider the `TemplateUrl` approach for production workloads as part of a CI/CD pipeline. This would necessitate that you first deploy the StackSet template to S3 in a prior pipeline stage.


## Deployment and tear down

If we deploy the previous CloudFormation fragments as a Stack, it should create our StackSet, instances and nested resources in the referenced regions.

If we navigate to StackSets in the CloudFormation console, all our instances should be visible:

<center><img src="/img/stack_set_instances.png" /></center>
<br/>

If we delete the parent stack, it will rollback all child StackSets, instances and nested resources. This is a powerful automation feature that has not been possible until now.

## Additional examples

Before we finish up, let's briefly cover a few other template examples.

What if we want to deploy to child accounts from the master account? If we use the `SERVICE_MANAGED` approach, we can only deploy to OU's, not specific accounts, as I discovered when attempting to do so:

```shell
Exception=[class software.amazon.awssdk.services.cloudformation.model.CloudFormationException] ErrorCode=[ValidationError], ErrorMessage=[StackSets with SERVICE_MANAGED permission model can only have OrganizationalUnit as target]
```

However, not all is lost if you run AWS Control Tower. In an [AWS Control Tower](https://docs.aws.amazon.com/controltower/latest/userguide/how-control-tower-works.html) environment, roles are provided out of the box that you can make use of in StackSets (`AWSControlTowerStackSetRole` in the master account and `AWSControlTowerExecution` in the spoke accounts).

Below is an example template that deploys a SNS topic to specific accounts and regions by making use of Control Tower roles:

```yml
SimonTestTopicStackSet:
  Type: AWS::CloudFormation::StackSet
  Properties:
    AdministrationRoleARN: !Sub "arn:aws:iam::${AWS::AccountId}:role/service-role/AWSControlTowerStackSetRole"
    ExecutionRoleName: AWSControlTowerExecution
    StackSetName: SimonTestTopicStackSet
    PermissionModel: SELF_MANAGED
    StackInstancesGroup:
      - Regions:
          - us-east-1
          - ap-southeast-2
        DeploymentTargets:
          Accounts:
            - 123456789012
            - 098765432101
    TemplateBody: |
      Resources:
        SimonTestTopic:
          Type: AWS::SNS::Topic
          Properties:
            DisplayName: !Sub 'simon-test-topic-${AWS::Region}-${AWS::AccountId}'
            TopicName: !Sub 'simon-test-topic-${AWS::Region}-${AWS::AccountId}'
```

If you did want to use the service managed roles and deploy to an entire OU, it would look like this:

```yml
SimonTestTopicStackSet:
  Type: AWS::CloudFormation::StackSet
  Properties:
    AutoDeployment:
      Enabled: true
      RetainStacksOnAccountRemoval: false
    StackSetName: SimonTestTopicStackSet
    PermissionModel: SERVICE_MANAGED
    StackInstancesGroup:
      - Regions:
          - us-east-1
          - ap-southeast-2
        DeploymentTargets:
          OrganizationalUnitIds:
            - ou-abc1-abc12ab1
    TemplateBody: |
      Resources:
        SimonTestTopic:
          Type: AWS::SNS::Topic
          Properties:
            DisplayName: !Sub 'simon-test-topic-${AWS::Region}-${AWS::AccountId}'
            TopicName: !Sub 'simon-test-topic-${AWS::Region}-${AWS::AccountId}'
```

## Debugging StackSets

If you are deploying the parent stack as part of a CI/CD pipeline, errors in the StackSet can be difficult to debug if they fail on the initial deployment. This is because CloudFormation by default will rollback to the previous state if it encounters any errors. This will cause the StackSet to disappear, preventing any debugging attempts.

To avoid this, I find it helpful to deploy the StackSet with zero instances (omit the `StackInstanceGroup` property). This way you can achieve a green deployment before adding any instances, enabling you to capture any errors.

If a StackSet operation fails, it can be difficult to gather any useful information from the web console. In this case the following CLI command is useful (where operation ID and StackSet name is from StackSet operations in the web console):

```shell
aws cloudformation list-stack-set-operation-results \
    --stack-set-name StackSetTestStackSet \
    --operation-id 62e57fe2-3068-4b0c-9b9d-f070e8ae9a89
```

## Retrospective and summary

In this article we learned how to create StackSets using CloudFormation for some inter-account and cross-account use cases. We learned about the two permission models that it supports, and the role structure it requires to work.

After using the StackSet resources for this brief period of time, I can see it will be a great help in an code-driven infrastructure approach to cross-account and cross-region infrastructure. This would be very useful in situations that you want to customise the guard rails for your AWS account landscape, to support a federated AWS workload approach with central governance.

If you combined StackSets with the [Inception Pipeline](https://mechanicalrock.github.io/2018/03/01/inception-pipelines-pt1.html) pattern, you could build a Governance Pipeline, something we could explore in a future article.

Please feel free to [get in touch with us](https://mechanicalrock.io/lets-get-started) if you need any help with central governance or cross-account infrastructure.


