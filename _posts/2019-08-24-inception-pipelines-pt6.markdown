---
layout: post
title:  "Seeds of Inception - Part 6"
date:   2018-08-24
tags: aws codepipeline inception pipeline iam roles
author: Pete Yandell
image: img/inception-pipelines/seed_germination.png
---

**Part 6 planting the seed** - A practical example for DevOps on AWS

![vines]({{ site.url }}/img/inception-pipelines/part-6-planting-the-seed.jpg)

## What's The Problem

In this month's instalment I'm going right back to the beginning to answer a question that I'm frequently asked; namely *"How do I do the initial seeding of a pipeline in my shiny new AWS Account?"*.

Like all things AWS-ey, there are multiple ways to accomplish this. The three that immediately come to mind are:

1. Use the AWS Account root user credentials
2. Create an IAM user directly in the AWS Account .
3. Assuming the /roles/OrganizationAccountAccessRole role that was created if your AWS Account was created using AWS Organisations.

The more versatile and secure way is **Option 2**, which I'll discuss in detail below. My (personal) reasoning for this is you only need to keep the credentials around for as long as it takes to seed the pipeline and add more specific accounts as documented in [Part 5](https://mechanicalrock.github.io/2018/07/31/inception-pipelines-pt5.html). Once you've done this, delete the credentials to make the IAM User secure. If/when you need to seed another pipeline, simply regenerate new credentials and run from Step 4 again.

**Warning:** This post gets a bit heavy on the screenshots in a couple of steps. So, brace yourself and accept my apologies in advance!

Let's dig in!

## Step 1 - AWS Account

The very first step is making sure you have an AWS Account and you have either root, admin or enough permissions to create an IAM user and policy. Oh, you also need to log into the [AWS Console](https://console.aws.amazon.com/console/home).

## Step 2 - Create A Customer Managed IAM policy

Follow the four simple actions below to create a [Customer Managed IAM Policy](https://docs.aws.amazon.com/IAM/latest/UserGuide/access_policies_managed-vs-inline.html#customer-managed-policies). You'll use this policy in the next step when we create an [IAM User](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_users.html).

Navigate to the `Policies` section of the IAM console and click `Create policy`.

![Create IAM Policy]({{ site.url }}/img/inception-pipelines/part-6/step2-01-CreatePolicy.png)

Next copy and paste the latest version of the [policy from GitHub](https://github.com/MechanicalRock/InceptionPipeline/blob/post/part-6/policy.json)

![Enter the Policy]({{ site.url }}/img/inception-pipelines/part-6/step2-02-EnterThePolicy.png)

Review the policy and give it a name (required) and an optional description.

![Review the Policy]({{ site.url }}/img/inception-pipelines/part-6/step2-03-ReviewThePolicy.png)

Success!

![Success!]({{ site.url }}/img/inception-pipelines/part-6/step2-04-Success.png)

## Step 3 - Create the IAM User

Once you've created the [Customer Managed IAM Policy](https://docs.aws.amazon.com/IAM/latest/UserGuide/access_policies_managed-vs-inline.html#customer-managed-policies) it's now time to create an [IAM User](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_users.html) to attach it to:

Navigate to the `Users` section of the IAM console and click `Add user`.

![Create User]({{ site.url }}/img/inception-pipelines/part-6/step3-01-CreateUser.png)

Give the user a name and tick `Programmatic access`. Unless you have an overriding and burning desire, leave the `AWS Management Console access` unticked.

![Enter User Details]({{ site.url }}/img/inception-pipelines/part-6/step3-02-UserDetails.png)

Click the `Attach existing policies directly` button and search for the policy we created in Step 2.

![Set Permissions]({{ site.url }}/img/inception-pipelines/part-6/step3-03-SetPermissions.png)

Review the user details.

![Review]({{ site.url }}/img/inception-pipelines/part-6/step3-04-Review.png)

Download and/or copy the credentials for late use in Step 4.

![Credentials]({{ site.url }}/img/inception-pipelines/part-6/step3-05-Credentials.png)

Success!

![Success]({{ site.url }}/img/inception-pipelines/part-6/step3-06-Success.png)

## Step 4 - Configure Your CLI User

Now that you have your [IAM User](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_users.html) it's time to configure the AWS CLI with the credentials. When running the `aws configure` command, I've specified a specific profile name which allows me to jump between different AWS Accounts quite easily. If you are just seeding and using one AWS Account then you could just use the default profile.

```bash
$ aws configure --profile InceptionPipelineSeedingUser
AWS Access Key ID [None]: AKIADEADBEEFBEERGERS
AWS Secret Access Key [None]: SecretSquirrelBusinessSsshDontTellASeoul
Default region name [None]: ap-southeast-2
Default output format [None]: json

$ cat ~/.aws/config
[profile InceptionPipelineSeedingUser]
output = json
region = ap-southeast-2

$ cat ~/.aws/credentials
[InceptionPipelineSeedingUser]
aws_access_key_id = AKIADEADBEEFBEERGERS
aws_secret_access_key = SecretSquirrelBusinessSsshDontTellASeoul
```

## Step 5 - Configure CodeCommit Access

This is an optional step that I like to perform before I seed the pipeline. When I know what the CodeCommit repository name will be, I add this snippet below into my `~/.gitconfig` file. By doing so it allows the seed `init.sh` file to perform an initial commit and push for me which gets the Inception Pipeline green (by default it will be red as there are no files in the repository to build).

```INI
[credential "https://git-codecommit.ap-southeast-2.amazonaws.com/v1/repos/InceptionPipelinePost6/"]
    helper = !aws codecommit --profile InceptionPipelineSeedingUser credential-helper $@
    UseHttpPath = true
```

## Step 6 - Change the default profile

Assuming you're still reading along and you are still using the cli profile name InceptionPipelineSeedingUser, you will need to update the `init.sh` file, which is super easy. Simply search-and-replace `default` `with InceptionPipelineSeedingUser` like so (hint, there are four defaults to replace):

```bash
reset

echo "Create the initial CloudFormation Stack"
aws --profile InceptionPipelineSeedingUser cloudformation create-stack --stack-name "InceptionPipelineSeedingUserStack" --template-body file://aws_seed.yml --parameters file://aws_seed-cli-parameters.json --capabilities "CAPABILITY_NAMED_IAM"
echo "Waiting for the CloudFormation stack to finish being created."
aws --profile InceptionPipelineSeedingUser cloudformation wait stack-create-complete --stack-name "InceptionPipelineSeedingUserStack"
# Print out all the CloudFormation outputs.
aws --profile InceptionPipelineSeedingUser cloudformation describe-stacks --stack-name "InceptionPipelineSeedingUserStack" --output table --query "Stacks[0].Outputs"

export CODECOMMIT_REPO=`aws --profile InceptionPipelineSeedingUser cloudformation describe-stacks --stack-name "InceptionPipelineSeedingUserStack" --output text --query "Stacks[0].Outputs[?OutputKey=='CodeCommitRepositoryCloneUrlHttp'].OutputValue"`

echo "Initialising Git repository"
git init
echo "Adding the newly created CodeCommit repository as origin"
git remote add origin $CODECOMMIT_REPO
echo "Adding all files"
git add .
echo "CodeCommitting files"
git commit -m "Initial commit"
echo "Pushing to CodeCommit"
git push --set-upstream origin master
```

## Step 7 - Make It Go

Now the really hard bit (*note* heavy sarcasm); seed the pipeline by typing `init.sh`, then sit back and watch it grow!

## Wrapping Up

This month's article was a light one, mostly as I've been experimenting with the [AWS Cloud Development Kit](https://github.com/awslabs/aws-cdk); specifically, how the concepts within Inception Pipeline map to this new paradigm. Stay tuned for next month's post where I discuss (i.e. vent) my feelings and share my journey!
