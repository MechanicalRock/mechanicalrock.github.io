---
layout: post
title: "AWS WAFV2 association with API Gateway"
date: 2022-03-17
tags: AWS API WAFV2
author: Dale Murugan
image: img/lock.png
---

I recently had to attach a Web Application Firewall (WAF) regional Access Control List (ACL) to an API gateway created using the [Serverless Framework](https://www.serverless.com/). The only quality documentation I could find was from our very own [Natalie Laing](https://au.linkedin.com/in/natalie-laing-652a9131) in this [post](https://mechanicalrock.github.io/2019/09/26/aws-waf-association-with-api-gateway.html) she wrote back in 2019. I ran into an issue where my WebACL would not properly associate to the API. After some research I found that many others also faced this issue, mainly because the ‘Classic WAF’ has been [depreciated](https://docs.aws.amazon.com/waf/latest/developerguide/classic-waf-chapter.html) by AWS.

AWS [WAFV2](https://docs.aws.amazon.com/waf/latest/APIReference/Welcome.html) is the latest version of the AWS WAF API released in November 2019. Configuring the WAFV2 with an API is pretty straightforward, however, there are little resources available online. Hence, this post is to help those who are as lost as I was configuring a WAFV2 with an API gateway.

### Things to be aware of

I got the tip on these ahead of my implementation thanks to Natalie’s [article](https://mechanicalrock.github.io/2019/09/26/aws-waf-association-with-api-gateway.html).

- YAML indentation - I’d recommend installing [cfn-lint](https://github.com/aws-cloudformation/cfn-lint), a huge help for formatting YAML files and catching bugs early.
- Formatting your API Gateway's Application Resource Name (ARN), you will need this to associate it to the WebACL. This should look like:

```yml
arn:aws:apigateway:{region}::/restapis/{rest_api_id}/stages/{stage_name}
```

### Solution

To configure your WAF you'll need to provision a WebACL then associate it to your API. In this case I was configuring a WAF to block SQL injection, however, this format could be used for other security protocols as well. Hence, the resources required at a minimum are:

- [AWS::WAFv2::WebACL](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-resource-wafv2-webacl.html)
- [AWS::WAFv2::WebACLAssociation](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-resource-wafv2-webaclassociation.html)

```yml
WebACL:
  Type: "AWS::WAFv2::WebACL"
  Properties:
    Name: WebACLSQLi
    Scope: REGIONAL
    Description: Web ACL to block SQL injection
    DefaultAction:
      Allow: {}
    VisibilityConfig:
      SampledRequestsEnabled: true
      CloudWatchMetricsEnabled: true
      MetricName: MyMetricName
    Rules:
      - Name: SQLInject-RuleSet
        Priority: 0
        Statement:
          ManagedRuleGroupStatement:
            VendorName: AWS
            Name: AWSManagedRulesSQLiRuleSet
        OverrideAction:
          None: {}
        VisibilityConfig:
          SampledRequestsEnabled: true
          CloudWatchMetricsEnabled: true
          MetricName: SQLInjection-ruleset-metric

WebACLAssociation:
  Type: "AWS::WAFv2::WebACLAssociation"
  Properties:
    WebACLArn: !GetAtt WebACL.Arn
    ResourceArn: !Ref ApiARN
```

I have used Amazon's Managed Rules to do the hard work of SQL injection blocking. You can see the other rule sets available [here](https://docs.aws.amazon.com/waf/latest/developerguide/aws-managed-rule-groups-list.html)

If your API was created using the Serverless Framework you will need to run `npm i serverless-associate-waf`.
In your serverless.yml you will need to utilize this plugin:

```
plugins:
    - serverless-associate-waf
```

You will then need to append the following snippet:

```
custom:
  associateWaf:
    name:  WebACLSQLi
    version: V2
```

The name must be the name you specified in your WebACL.

### Wrapping up

And voila, that's it. Simple right? Hopefully this post saves you the hours of frustration I endured.

If you'd like your API's secured, feel free to [contact-us](https://www.mechanicalrock.io/lets-get-started).

### References

- [https://mechanicalrock.github.io/2019/09/26/aws-waf-association-with-api-gateway.html](https://mechanicalrock.github.io/2019/09/26/aws-waf-association-with-api-gateway.html)
- [https://docs.aws.amazon.com/waf/latest/APIReference/Welcome.html](https://docs.aws.amazon.com/waf/latest/APIReference/Welcome.html)
- [https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-resource-wafv2-webacl.html](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-resource-wafv2-webacl.html)
- [https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-resource-wafv2-webaclassociation.html](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-resource-wafv2-webaclassociation.html)
- [https://www.codeproject.com/Articles/5325719/How-to-Create-Regional-Web-ACL-WAFv2-with-CloudFor](https://www.codeproject.com/Articles/5325719/How-to-Create-Regional-Web-ACL-WAFv2-with-CloudFor)
- [https://www.npmjs.com/package/serverless-associate-waf](https://www.npmjs.com/package/serverless-associate-waf)

### Further Reading

- [https://en.wikipedia.org/wiki/API_management](https://en.wikipedia.org/wiki/API_management)
