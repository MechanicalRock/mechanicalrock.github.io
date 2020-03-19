---
layout: post
title: Improve Your CloudFormation Game with these 9 Tips
date: 2020-03-17
tags: javascript tutorial aws
author: Matthew Tyler
image: /img/cfn-icon.png
---

<center><img src="/img/cfn-icon.png" /></center>
<br/>

# Introduction

I've been writing CloudFormation for about half a decade now. A lot of people love to complain about CloudFormation, but to be honest, I still feel it's the best option out there for handling cloud infrastructure. Most of the tools in the AWS ecosystem compile down to it, so having a really good understanding of CloudFormation can still benefit you even if you interface to it via some other means. Along the way, I've picked up some various tips and tricks that make dealing with CloudFormation easier. In most cases, I find the big problem with CloudFormation is writing templates in such a way that other people can understand them. That includes you, the author, when you inevitably need to make some adjustments in six months time.

# 1. Use !Sub

CloudFormation has a bunch of intrinsic functions, but none is as useful as Fn::Sub when it comes to cleaning up a template. Sub was introduced in 2016, and since then has pretty much replaced all the Fn::Join tomfoolery that was present in a lot of templates. Consider constructing an ARN in IAM trust principle statement. Using Fn::Join might look something like this;

```yaml
AWSTemplateFormatVersion: 2010-09-09
Resources:
  RootRole:
    Type: AWS::IAM::Role
    Properties:
      AssumeRolePolicyDocument:
        Version: 2012-10-17
        Statement:
          - Effect: Allow
            Principal:
              AWS:
              - !Join
                - ""
                - - "arn:"
                  - !Ref AWS::Partition
                  - ":iam::"
                  - !Ref AWS::AccountId
                  - ":root"
            Action:
              - sts:AssumeRole
# ...
```

Using !Sub is a lot cleaner.

```yaml
AWSTemplateFormatVersion: 2010-09-09
Resources:
  RootRole:
    Type: AWS::IAM::Role
    Properties:
      AssumeRolePolicyDocument:
        Version: 2012-10-17
        Statement:
          - Effect: Allow
            Principal:
              AWS:
              - !Sub "arn:${AWS::Partition}:iam::${AWS::AccountId}:root"
            Action:
              - sts:AssumeRole
# ...
```

You can also take advantage of !Sub when build out step functions definitions. This would be a complete nightmare without Sub. Consider this template;

```yaml
 Publisher:
    Type: AWS::StepFunctions::StateMachine
    Properties:
      DefinitionString: !Sub |
        {
          "StartAt": "FindProduct",
          "States": {
            "FindProduct": {
              "Type": "Task",
              "Resource": "${FindProduct.Arn}",
              "Next": "Fork",
              "Retry": [{
                "ErrorEquals": [ "States.ALL"]
              }]
            },
            "Fork": {
              "Type": "Choice",
              "Default": "AmbiguousProductName",
              "Choices": [
                {
                  "Variable": "$.products.count",
                  "NumericEquals": 0,
                  "Next": "CreateProduct"
                },
                {
                  "Variable": "$.products.count",
                  "NumericEquals": 1,
                  "Next": "CreateVersion"
                }
              ],
              "OutputPath": "$.candidate"
            },
            "AmbiguousProductName": {
                "Type": "Fail",
                "Cause": "Product name belongs to multiple products",
                "Error": "ErrorAmbiguousProductName"
            },
            "CreateProduct": {
              "Type": "Task",
              "Resource": "${CreateProduct.Arn}",
              "End": true,
              "Retry": [{
                "ErrorEquals": [ "States.Timeout" ]
              }]
            },
            "CreateVersion": {
              "Type": "Task",
              "Resource": "${CreateVersion.Arn}",
              "End": true,
              "Retry": [{
                "ErrorEquals": [ "States.Timeout" ]
              }]
            }
          }
        }
      RoleArn: !GetAtt StatesExecutionRole.Arn
```

In the above template, I've used the !Sub function to substitute in the correct ARNs for each function that has been defined elsewhere in the template. As an aside, multi-line string support in YAML is god-send for resource parameters that need to take JSON strings, as is the case with some properties within Step Functions and EventBridge.

# 2. Using Lists of ARNs

This doesn't mean that other pseudo functions like !Split and !Join have been supplanted by !Sub. There are still some cool tricks you can do. Imagine you wanted to pass a list of Account Identifiers, that needed to be expanded into a resource policy. e.g.

```yaml
Parameters:
  AccountIds:
    Type: CommaDelimitedList
```

Ideally we want to turn '01234567890,1111111111,2222222222' into:

```yaml
 - "arn:aws:iam::01234567890:root"
 - "arn:aws:iam::11111111111:root"
 - "arn:aws:iam::22222222222:root"
```

We can do this with one weird trick. Imagine we needed to give a set of accounts access to a KMS key.

```yaml
  KmsKey:
    Type: AWS::KMS::Key
    Properties:
      KeyPolicy:
        Id: KeyPolicy
        Statement:
          - Sid: Root Permissions
            Effect: Allow
            Principal:
              AWS: !Sub 'arn:aws:iam::${AWS::AccountId}:root'
            Action: kms:*
            Resource: '*'
          - Sid: Target Accounts
            Effect: Allow
            Principal:
              AWS: !Split
                - ','
                - !Sub
                  - 'arn:aws:iam::${inner}:root'
                  - inner: !Join
                    - ':root,arn:aws:iam::'
                    - !Ref AccountIds
            Action: 
              - kms:Decrypt
              - kms:DescribeKey
            Resource: '*'
```

The magic is happening here:

```yaml
  Principal:
    AWS: !Split
      - ','
      - !Sub
        - 'arn:aws:iam::${inner}:root'
        - inner: !Join
          - ':root,arn:aws:iam::'
          - !Ref AccountIds
```

To understand it,  we start from the inner most function.

1. The first join statement ('inner') will create the following string,

```
'01234567890:root,awn:aws:iam::1111111111:root,arn:aws:iam::2222222222'
```

2. This string is now substituted into the first parameter of the !Sub function.

```
'arn:aws:iam::01234567890:root,awn:aws:iam::1111111111:root,arn:aws:iam::2222222222:root'
```

3. Which will then be split along the commas into the following.

```
['arn:aws:iam::01234567890:root','awn:aws:iam::1111111111:root','arn:aws:iam::2222222222:root']
```

Pretty cool!

# 3. Use SSM Parameters

There are myriad of [parameter types](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/parameters-section-structure.html#aws-specific-parameter-types) in CloudFormation. The SSM types are my favorites, in particular `AWS::SSM::Parameter::Value<String>`. You might use it like this:

```yaml
Parameters:
  TargetAccountId:
    Type: AWS::SSM::Parameter::Value<String>
    Default: '/<some-prefix/default'
```

I'll often create reusable templates which can be composed together. One template can create an SSM parameter that can be resolved in another template. If the parameter doesn't exist, CloudFormation will throw an error. This can act as a prompt to ensure the other template is instantiated first.

You could also StackSet deploy a set of 'base stacks' that include a bunch of SSM parameters to configure accounts in a default manner. Then other templates can use those parameters to build upon them. For example, your organization might give teams a set of accounts for non-production and production workloads. They could deploy SSM parameters that define those accounts - and any pipeline stacks can use SSM parameters to resolve to the correct targets.

I'll also often use SSM parameters to replace a lack of environment variables in Lambda@Edge environments. To do this, I'll instantiate parameters that use the distribution ID of the CloudFront distribution. I can then pull information from SSM parameters that are prefixed using the distribution ID.

# 4. Prefer default template parameters instead of hard-coding magic strings

If you need store a reference to something that is likely only ever going to be one value, it can be tempting to hard-code that value within the body of a template. I find that this can be confusing for those that may come to template and wonder what the source of the value is. A good example of this can be found within CloudFront - you may need to use the value 'Z2FDTNDATAQYW2', which is the default Hosted Zone ID for CloudFront distributions, and is required when setting up Route 53 Alias for CloudFront. Now, you could embed this in your template, but if your unfamiliar with this value, it'll likely confuse the next person who sees it in the template. There's also the unlikely chance it may change, but it's worth guarding against.

So I'll often do this;

```yaml
  CloudFrontHostedZoneId:
    Type: string
    Default: Z2FDTNDATAQYW2
    AllowedValues:
      - Z2FDTNDATAQYW2
    Description: >-
      The Default Hosted Zone for CloudFront Distributions
```

This way it has;

- A relevant default value,
- With only one allowed value (so no-one changes it unknowingly), and
- A description about what it is for.

You could also add a link to the documentation that explains the value in the description.

# 5. Use Parameter Metadata

Parameters, where possible, should be documented and grouped together in order to make it easier for users to fill in parameters. This really only comes into play when using the console to launch a template - so if you are fully automated the benefits are more in documentation. But if you are building templates for things like tutorials, or providing simple infrastructure for someone to stand up via something like AWS Service Catalog, it can help certain demographics to provision bits of infrastructure. Here is a sample that demonstrates this;

```yaml
Parameters:
  Name:
    Type: String
    Description: >-
      The name of the application. 
      This should include a stage qualifier if this is a nonproduction instance.
      Stage qualifiers should only include 3-5 characters
    AllowedPattern: ^[a-z]{3,}(-[a-z]{3,5})?$
    MinLength: 3
  Domain:
    Type: String
    Default: app
    AllowedValues:
      - example.com
      - otherdomain.com
    Description: The domain for the application.
  SigningKeyParameter:
    Type: 'AWS::SSM::Parameter::Name<String>'
    Default: /system/signing-key/default
    Description: >-
      The name of SSM parameter from which to retrieve the cookie signing key
    AllowedValues:
      - /system/signing-key/default
  SigningKeyParameterKeyId:
    Type: string
    Description: >-
      The ID of the KMS key used to encrypt signing key in SSM Parameter Store.
  ClientId:
    Type: String
    Description: The Application Client ID that has been assigned to the application
  CloudFrontHostedZoneId:
    Type: string
    Default: Z2FDTNDATAQYW2
    AllowedValues:
      - Z2FDTNDATAQYW2
    Description: >-
      The Default Hosted Zone for CloudFront Distributions
Metadata:
  'AWS::CloudFormation::Interface':
    ParameterGroups:
      - Label: 
          default: Authentication
        Parameters: 
          - ClientId
          - SigningKeyParameter
      - Label: 
          default: Application Domain
        Parameters:
          - Name
          - Domain
      - Label:
          default: System
        Parameters:
          - CloudFrontHostedZoneId
    ParameterLabels:
      SigningKeyParameter:
        default: Signing Key Parameter
      ClientId:
        default: Client ID
      CloudFrontHostedZoneId:
        default: CloudFront Hosted Zone ID
```

A set of parameters is defined, and then we use the 'Metadata' section to group-like parameters, and order them. In this case, we create a few groups; an authentication group, an application domain group, and system parameters groups. This gives users hints as to the purpose of each parameter. 

# 6. Nested Stacks

Nested stacks are a good way to split templates up into components. This has a few benefits;

- Templates start to form building blocks, which enables reuse.
- Large templates are split up into chunks that can make it easier to understand what is going on.
- It can help with template authorship - splitting templates into chunks forces you to do a lot of thinking up front. This can help prevent you get lost in a million lines of YAML.
- It can help you get around the 200 resource limit.

# 7. Try SAM! - Nested Applications but be aware of limitations

The serverless application model is superset of CloudFormation that is designed to build and deploy serverless applications. It does this via some additional resources and a CloudFormation macro. Using it can make it easier to build and deploy serverless applications; the behavior of deploying a new template SAM is pretty close to what developers expect. Defining resources using SAM-specific resources is typically less verbose than the equivalent template defined in plain CloudFormation.

There are some limitations;

- You can't StackSet deploy serverless applications (although you can if you include them in a nested template, called from the main template - go figure)
- Some resources in a SAM template must be included together - this includes any resource that references other 'serverless' resources that are defined in the template. Serverless::Functions that reference a RestApiId from a Serverless::Api are a good example of this.
- You need to be aware that the serverless transform is a macro - as such, if you don't want to or can't create and approve a changeset, you will need to use the CAPABILITY_AUTO_EXPAND to deploy a template without reviewing the changeset. This is particular relevant to those who are deploying templates via AWS Service Catalog.

# 8. Don’t name things! - use tags if you must

There are loads of resources in CloudFormation that cannot be updated or replaced when names are defined for them; S3 Buckets being noticeable examples. When possible, prefer auto-generated names. If some semantic naming must be given to a particular resource, I would generally give them an appropriate tag instead. The auto-generated names can be provided via CloudFormation outputs. If you are finding it difficult to work with auto-generated names that need to be provided to other stacks, consider creating SSM parameters under an application specific prefix, and storing the auto-generated name inside it. The next template can then reference the name using an SSM parameter input.

I often find the naming of various resources can be become very contentious in large enterprises who have decided on specific naming conventions for different resources. This is largely because systems in the past have not had robust mechanisms for dealing with attribute metadata. In these instances,it is worth putting in the effort to push back and insist on using a lightweight labeling mechanism like tags. I have seen enterprises insist on duplicating information in names (stuffing information about the region inside a resource name), and in doing so exhaust the character limit of some resource names. This results in using various abbreviations inside a resource name, to the point at which the names start to like look randomly generated names anyway. Fight hard to avoid this silliness if you can, early.

# Conclusion

I hope you enjoyed my tips for writing CloudFormation. Come back in a few weeks time, in which I'll enumerate a few more tips for writing better templates!

Infrastructure-as-Code causing you pain? Contact us to [get started!](https://www.mechanicalrock.io/lets-get-started)
