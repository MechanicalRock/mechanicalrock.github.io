---
layout: post
title:  "AWS CodeBuild Reports"
date: 2019-12-27
tags: aws codebuild reports testing devops
author: JK Gunnink
image: /img/blog/codebuild-reports/.png
---

# Introducing CodeBuild Reports

AWS (Amazon Web Services) [recently
introduced](https://aws.amazon.com/blogs/devops/test-reports-with-aws-codebuild/) a new feature to
the CodeBuild service called [Test
Reports](https://docs.aws.amazon.com/codebuild/latest/userguide/test-reporting.html). In a nutshell
it enables developers and testers to see a summary of their automated tests which are executed in
AWS CodeBuild. Additional stats and metadata about the CodeBuild run is also available.

# Getting stuck in

Getting setup is fairly straight forward. There is a requirement that your test runner outputs the
test results in a JUnit XML or Cucumber JSON formatted file. Once you have the generated file in the
correct format you just need to add the following to your `buildspec.yml` file. Note that the
indentation is at the front of the file, so it's not a step in the `phases` section of the buildspec
file, rather in its own section at the end.

Example:
```yaml
reports:
  CiReports:
    files:
      - "junit.xml"
    discard-paths: yes
```
In the above instance, I have chosen to point the reporter tool to a file called `junit.xml` in the
root of the directory and opted to discard paths.

With the generated output the reporting tool generated a nice looking report as pictured below:
{:refdef: style="text-align: center;"}
<img src="/img/blog/codebuild-reports/report-overview.png">
{: refdef}

As can be seen from the above image, there's some indication around pass rates, how long the tests
took to run, as well as a test stat for each of the tests that ran in the execution around time to
run the spec etc (not pictured). In the case above, there are 3,221 tests that were executed in
about four and a half minutes of which 8 were skipped meaning an overall 99.75% pass rate.

{:refdef: style="text-align: center;"}
<img src="/img/blog/codebuild-reports/report-trends.png">
{: refdef}

This screen shows us trends of current and previous reports and how it's tracking. It shows failures
as well as passes and unknowns, which is what I presume is when the interpreter didn't get a result
it was expecting.

# This sounds great and I want it

Give me all the graphs and delicious reporting tools now!

So, you're sold!? Excellent luckily it's pretty straightforward to setup and get going. If you've
already got the `reports` bit setup in your buildspec, as I outlined above, then all you need to do
is setup the required IAM policies for your CodeBuild instance. Here's some handy CloudFormation you
may find useful:

```yaml
AWSTemplateFormatVersion: 2010-09-09

Parameters:
  CodeBuildProjectNameForCI:
    Type: String
    Default: MyProject-Continuous-Integration

Resources:
  CodeBuildRoleForCI:
    Type: AWS::IAM::Role
    Properties:
      AssumeRolePolicyDocument:
        Statement:
          - Action: ["sts:AssumeRole"]
            Effect: Allow
            Principal:
              Service: [codebuild.amazonaws.com]
        Version: "2012-10-17"
      Path: /
      Policies:
        - PolicyName: CodeBuildAccess
          PolicyDocument:
            Version: "2012-10-17"
            Statement:
              - Effect: Allow # Codebuild Logs
                Action:
                  - "logs:CreateLogStream"
                  - "logs:CreateLogGroup"
                  - "logs:PutLogEvents"
                Resource:
                  - !Sub "arn:aws:logs:${AWS::Region}:${AWS::AccountId}:log-group:/aws/codebuild/${CodeBuildProjectNameForCI}*"
              - Effect: Allow # Codebuild Reports
                Action:
                  - "codebuild:CreateReportGroup"
                  - "codebuild:CreateReport"
                  - "codebuild:UpdateReport"
                  - "codebuild:BatchPutTestCases"
                Resource:
                  - "*"
  CodeBuildProjectForCI:
    Type: "AWS::CodeBuild::Project"
    Properties:
      Name: !Ref CodeBuildProjectNameForCI
      ......etc
```
