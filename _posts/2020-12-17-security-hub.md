---
layout: post
title: Monitoring resource compliance with AWS Security Hub
date: 2020-12-22
tags: devops ci cd cloudformation infrastructure-as-code aws cross-account security
author: Simon Bracegirdle
image: img/sh-logo-256.png
---

Do you often wonder about how to maintain consistent security best practice in the cloud? With DevOps and agile being all the rage, how do you keep your infrastructure secure in these fast paced environments? If you're running on AWS, [Security Hub](https://aws.amazon.com/security-hub/) is one tool that can help.

## What is Security Hub?

[AWS Security Hub](https://aws.amazon.com/security-hub/) is a managed security aggregation and compliance service provided by AWS. Security Hub will inspect changes to your infrastructure and compare them against a set of compliance packs, such as the [Center for Internet Security (CIS) foundations benchmark](https://docs.aws.amazon.com/securityhub/latest/userguide/securityhub-standards-cis.html). It raises findings for non-compliant resources, which can prompt further action and remediation. It also has multi-account support, so you can collect findings from all accounts into a central account.

It's like a [linter](https://en.wikipedia.org/wiki/Lint_(software)), but for your infrastructure. This is important as we can't depend on linting CloudFormation (or CDK, or Terraform) templates, since not all projects use CloudFormation, and there isn't a security-focused linter available as far as I can tell.

For engineers and administrators responsible for managing infrastructure, this is a welcome tool for helping to maintain consistent security best practice and for keeping infrastructure secure.

Whilst it's becoming easier to manage multi-account environments, there are some challenges in the rollout of Security Hub that you'll want to keep in mind. In this article, we'll cover our experience, and tips for ensuring a smooth rollout and keeping it relevant for your organisation.


## Multi-account rollout of Security Hub

*Before we start, a warning; enabling Security Hub and compliance packs will cause a large number of AWS Config rules to execute for the first time across your accounts. If you have subscribed to AWS Config notifications (e.g. default AWS Control Tower setup), then you will receive a large influx of notifications during the rollout. We recommend you disable these subscriptions temporarily.*

Also, as we recommend for all cloud services, please review the pricing pages for [AWS Security Hub](https://aws.amazon.com/security-hub/pricing/) and [AWS Config](https://aws.amazon.com/config/pricing/) to assess their suitability for your budget. Enabling AWS Config does cause charges for configuration items recorded on every resource change, so keep that in mind.

Now, the first step to using Security Hub is to elect the admin account and then enable all other accounts as members. It consolidates findings into the admin account for each region to give a centralised view of your security state.

The method we used to rollout Security Hub at the time was the [Security Hub Enabler](https://github.com/aws-samples/aws-control-tower-securityhub-enabler) tool provided by AWS. As of November 2020, Security Hub now supports [AWS Organizations](https://aws.amazon.com/organizations/), which is a much simpler method for enabling Security Hub.

To [elect the Security Hub admin account](https://docs.aws.amazon.com/cli/latest/reference/securityhub/enable-organization-admin-account.html), run this via the AWS CLI for your Organization root account (where `123456789012` is the account ID you want to elect) in each of the regions you want to use Security Hub:

```sh
aws securityhub enable-organization-admin-account --admin-account-id 123456789012
```

According to the [documentation](https://docs.aws.amazon.com/securityhub/latest/userguide/securityhub-accounts-orgs.html), this will also add all AWS Organizations accounts as Security Hub members.

Then, from your Security Hub main account, run the following to [automatically add new accounts](https://docs.aws.amazon.com/cli/latest/reference/securityhub/update-organization-configuration.html) as Security Hub members in the future:

```sh
aws securityhub update-organization-configuration --auto-enable
```

That's it! You should now have the [CIS AWS Foundations benchmark](https://docs.aws.amazon.com/securityhub/latest/userguide/securityhub-standards-cis.html) and [AWS Foundational Security Best Practices standard](https://docs.aws.amazon.com/securityhub/latest/userguide/securityhub-standards-fsbp.html) packs enabled in all accounts by default.

## What else to consider after deployment?

### Compliance pack review

Once you have enabled Security Hub, we recommend reviewing the individual security controls for each of the compliance packs:

- [CIS AWS Foundations Benchmark controls](https://docs.aws.amazon.com/securityhub/latest/userguide/securityhub-cis-controls.html)
- [AWS Foundational Security Best Practices controls](https://docs.aws.amazon.com/securityhub/latest/userguide/securityhub-standards-fsbp-controls.html)

Not all controls will be relevant to your organisation, also there is some overlap between the two default packs. Also, we should enable rules that apply to global services in one region (e.g. IAM rules).

An example of a rule that we disabled is Foundations [S3.5](https://docs.aws.amazon.com/securityhub/latest/userguide/securityhub-standards-fsbp-controls.html#fsbp-s3-5); "S3 buckets should require requests to use Secure Socket Layer". We felt that it's a low risk issue, is not applicable in all cases, can be auto remediated, and is laborious to add to every single S3 bucket.

An example of duplication between CIS and Foundations is, CIS rule [1.1](https://docs.aws.amazon.com/securityhub/latest/userguide/securityhub-cis-controls.html#securityhub-standards-cis-controls-1.1) and [IAM.4](https://docs.aws.amazon.com/securityhub/latest/userguide/securityhub-standards-fsbp-controls.html#fsbp-iam-4). Both check that the root user is not used, so you may like to disable one or the other.

### Disabling irrelevant rules

Once you have an idea of the rules you want to enable, you need to roll it out. You can use [Stack Sets](/2020/10/26/stack-set-cfn-resources.html) or [Control Tower Customisations](https://aws.amazon.com/solutions/implementations/customizations-for-aws-control-tower/) to roll that out to all accounts and regions.

One drawback of Security Hub (as of December 2020) is the lack of CloudFormation support for managing individual security controls. You can rely on Custom resources backed by lambda functions to polyfill this in the meantime. We created the following inline function to do that:

```yaml
SecurityHubRuleTogglerFunction:
  Type: AWS::Lambda::Function
  Properties:
    Runtime: python3.7
    Handler: index.handler
    Role: !GetAtt SecurityHubRuleTogglerExecutionRole.Arn
    Timeout: 300
    MemorySize: 256
    Environment:
      Variables:
        FND_RULES: !Join
          - ","
          - !Ref FoundationControlIds
        CIS_RULES: !Join
          - ","
          - !Ref CISRuleIds
    Code:
      ZipFile: |
        import time
        import os
        import json
        import boto3
        import cfnresponse

        client = boto3.client('securityhub')

        def handler(event, context):
            try:
                stds = client.get_enabled_standards()
                cis_rules = list(
                    map(lambda id: f"CIS.{id}", os.getenv('CIS_RULES').split(',')))
                fnd_rules = os.getenv('FND_RULES').split(',')

                for std in stds['StandardsSubscriptions']:
                    is_foundation = 'aws-foundational-security-best-practices' in std['StandardsSubscriptionArn']
                    is_cis = 'cis-aws-foundations-benchmark' in std['StandardsSubscriptionArn']

                    if is_foundation or is_cis:
                        rules = cis_rules if is_cis else fnd_rules
                        controls = get_controls(std['StandardsSubscriptionArn'])

                        for control in controls:
                            expected_enabled = control['ControlId'] in rules
                            actual_enabled = control['ControlStatus'] == 'ENABLED'
                            if expected_enabled != actual_enabled:
                                print(
                                    f"- {control['ControlId']} updating to: {'ENABLED' if expected_enabled else 'DISABLED'}.")
                                for i in range(3):
                                    try:
                                        client.update_standards_control(
                                            StandardsControlArn=control['StandardsControlArn'],
                                            ControlStatus='ENABLED',
                                        ) if expected_enabled else client.update_standards_control(
                                            StandardsControlArn=control['StandardsControlArn'],
                                            ControlStatus='DISABLED',
                                            DisabledReason='Disabled by security control orchestration tool based on review of Security Hub rules',
                                        )
                                    except Exception as e:
                                        if 'TooManyRequestsException' in f"{e}":
                                            time.sleep(2 ** i)
                                            print('TooManyRequestsException, retrying...')
                                            continue
                                        else:
                                            raise e
                                    break  # BREAK OUT OF RETRY LOOP
                            else:
                                print(
                                    f"- {control['ControlId']} is OK")

                cfnresponse.send(event, context, cfnresponse.SUCCESS, {})
            except Exception as e:
                print(e)
                cfnresponse.send(event, context, cfnresponse.FAILED, {})

        def get_controls(sub_arn, NextToken=None):
            controls = client.describe_standards_controls(
                NextToken=NextToken,
                StandardsSubscriptionArn=sub_arn) if NextToken else client.describe_standards_controls(
                StandardsSubscriptionArn=sub_arn)
            if ('NextToken' in controls):
                return controls['Controls'] + get_controls(sub_arn, NextToken=controls['NextToken'])
            else:
                return controls['Controls']
```

Here's an example of parameters to supply to the template. Those in the lists will be `ENABLED`, those omitted will be `DISABLED`:

```json
[
  {
    "ParameterKey": "FoundationControlIds",
    "ParameterValue": [
      "ACM.1",
      "AutoScaling.1",
      "CodeBuild.1"
      // ... more here
    ]
  },
  {
    "ParameterKey": "CISRuleIds",
    "ParameterValue": [
      "1.4",
      "1.12",
      "2.2"
      // ... more here
    ]
  }
]
```


### Notifications and alerts

Now that you have Security Hub enabled and configured, you may want to subscribe to events. For example, you may want Slack or email notifications when Security Hub reports a failing security control.

We created an Event Bridge rule to achieve this. For example, for AWS Foundation events see the below CloudFormation YAML snippet:

```yaml
SecurityHubFoundationEvents:
  Type: AWS::Events::Rule
  Properties:
    Description: Whenever Security Hub findings occur for AWS Foundation standards
    EventPattern:
      source:
        - "aws.securityhub"
      detail-type:
        - "Security Hub Findings - Imported"
      detail:
        findings:
          Compliance:
            Status:
              - "FAILED"
          Workflow:
            Status:
              - "NEW"
          ProductFields:
            ControlId: !Ref FoundationControlIds
    State: ENABLED
    Targets:
      - Arn: !Ref MyTopic
        Id: SecurityTopicFoundation
```

Where `FoundationControlIds` is a list of AWS Foundation control IDs (e.g. `AutoScaling.1`), and `MyTopic` is a reference to a [`AWS::SNS::Topic`](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-sns-topic.html) resource.

For CIS, copy-paste the above and replace the `ProductFields` block with the following:

```yaml
ProductFields:
  RuleId: !Ref CISRuleIds
```

Where `CISRuleIds` is a list of CIS rule IDs (e.g. `1.1`).

If you then subscribe to the topic, you can receive Security Hub notifications via Email, SMS or [ChatOps](https://aws.amazon.com/blogs/devops/introducing-aws-chatbot-chatops-for-aws/). In our case, we created our own custom Slack application to manage notifications. We won't cover that in this article, but perhaps a separate one in the future!

### Avoiding re-notification

Findings identified by Security Hub will perpetually remain in a `NEW` [workflow state](https://docs.aws.amazon.com/securityhub/latest/userguide/finding-workflow-status.html) until you resolve the finding, or manually adjust the state to `NOTIFIED` or `SUPRESSED`. It will re-send notifications for the same finding if updated at a later date, creating excessive noise for the team to sift through.

To deal with this, we created an inline lambda function (this time with NodeJS for variety) in CloudFormation to automatically progress `NEW` notifications to `NOTIFIED`:

```yaml
SecurityHubFindingNotifiedFunction:
  Type: AWS::Lambda::Function
  Properties:
    Runtime: nodejs12.x
    Handler: index.handler
    Role: !GetAtt SecurityHubFindingNotifiedExecutionRole.Arn
    MemorySize: 256
    Timeout: 60
    Code:
      ZipFile: |
        const AWS = require('aws-sdk')
        exports.handler = async (event) => {
          if (event.detail.findings.length !== 1)
            throw Error(
              `Expected one finding, found ${event.detail.findings.length}`,
            )
          const sh = new AWS.SecurityHub()
          console.log(`Marking finding ID ${event.detail.findings[0].Id} as NOTIFIED`)
          const result = await sh
            .batchUpdateFindings({
              FindingIdentifiers: [
                {
                  Id: event.detail.findings[0].Id,
                  ProductArn: event.detail.findings[0].ProductArn,
                },
              ],
              Workflow: {
                Status: 'NOTIFIED',
              },
            })
            .promise()
          if (
            result.ProcessedFindings.length !== 1 ||
            result.UnprocessedFindings.length !== 0
          ) {
            throw Error(
              'Finding was not processed (incorrect count returned from SDK)',
            )
          }
        }
```

Then, add a new target to the event rules created in the previous section:

```yaml
- Arn: !GetAtt SecurityHubFindingNotifiedFunction.Arn
  Id: SecurityHubFindingNotified
```


## Example findings

Now that you've enabled Security Hub, adjusted the enabled rules and added event rules, you may wonder what the actual findings look like...

My favourite test case for generating findings is to create an S3 bucket without encryption enabled, which should trigger [S3.4](https://docs.aws.amazon.com/securityhub/latest/userguide/securityhub-standards-fsbp-controls.html#fsbp-s3-4). Let's deploy the following CloudFormation snippet (or create a bucket via the console if you prefer):

```yaml
MyDodgeyBucket:
  Type: AWS::S3::Bucket
  Properties: 
    AccessControl: Private
    BucketName: my-dodgey-bucket
    # Oops, no encryption...
    #
    # BucketEncryption:
    #   ServerSideEncryptionConfiguration:
    #     - ServerSideEncryptionByDefault:
    #       SSEAlgorithm: AES256
```

After about five minutes, our security-orientated Slack app reported the following:

<center><img src="/img/sh-notification-secbot.png" /></center><br/>

I then inspected findings in the Security Hub console and found this:

<center><img src="/img/sh-finding-console.png" /></center><br/>

## Summary

We've learnt how to setup Security Hub and customise it to our organisation's needs and we've seen an example of the contents of a finding.

The feedback that these findings provide is useful for engineers and administrators, who are often busy solving problems and can overlook security best practice.

With Security Hub enabled, [Auto Remediation](https://aws.amazon.com/blogs/security/how-to-deploy-the-aws-solution-for-security-hub-automated-response-and-remediation/) is now a possibility. We'll cover that in a future article, as well as details on our custom Slack App.

Need help managing the security of your infrastructure? [Please get in touch!](https://mechanicalrock.io/lets-get-started)

