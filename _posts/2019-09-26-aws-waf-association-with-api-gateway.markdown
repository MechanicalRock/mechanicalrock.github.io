---
layout: post
title:  "AWS WAF association with API Gateway"
date:   2019-09-26
tags: AWS API WAF
author: Natalie Laing
image: img/lock.png
---

I was recently trying to attach a WAF (Web Application Firewall) regional ACL (Access Control List) to an API (Application Programming Interface) Gateway using cloudformation and I ran into problems when the API gateway was created using Serverless Framework.
The majority of the docs that I found online outlined how to attach your WAF to an ELB (Elastic Load Balancer), My suspicion is because support for attaching WAF to API gateway was announced in November 2018 where support for ELB's has been around since 2016.

I tried to hardcode the ARN (Amazon Resource Name) and web ACL id into the AWS::WAFRegional::WebACLAssociation properties and still when I went into the AWS console the ACL and API gateway was not associated in the test account but they were in the production account. I spent way too much time looking over the API gateway ARN and trying to ascertain why it wasn't functioning correctly.


### WAF v WAF Regional

Amazons Web Applications Firewall allows you to attach your WAF ACL to your API gateway. Your API gateway will be region-specific so where you would use AWS::WAF::WebACL to attach to cloudfront traditionally you will need to use the regional WAF resource type AWS::WAFRegional::WebACL.
```js
if(Cloudfront) { 
    return AWS WAF 
} else { 
    return AWS WAF Regional
}
```

### Common gotchas
The errors I encountered when deploying the stack were inadequate, I would get a lot of null error responses.
* YAML indentation 
* Formatting your API gateway ARN. This should look like: 
```yml 
arn:aws:apigateway:{region}::/restapis/{rest_api_id}/stages/{stage_name}
```
* Find out where the API gateway was created, was it in your cloudformation or a serverless deployment.
*  ```Status Code: 400; Error Code: WAFInvalidParameterException```  This could be a whole list of reasons according to the aws documentation so have fun figuring out which one it is.

### Solution
So how did I resolve the issues I was having? 
Ensure you have all the resources needed to set up your ACL, these include but are not limited to:
* AWS::WAFRegional::WebACL
* AWS::WAFRegional::Rule
* AWS::WAFRegional::WebACLAssociation

```yml
YourRegionalSqlInjDetection: 
    Type: AWS::WAFRegional::SqlInjectionMatchSet
    Properties: 
      Name: Find SQL injections
      SqlInjectionMatchTuples:
      - 
        FieldToMatch:
          Type: QUERY_STRING
        TextTransformation: URL_DECODE
      - 
        FieldToMatch: ** ADD AS NEEDED **
          Type: 
        TextTransformation: 

YourRegionalWafWebAcl: 
    Type: AWS::WAFRegional::WebACL
    Properties: 
    DefaultAction: 
        Type: ALLOW
    MetricName: SqlInjWebACL
    Name: Web ACL to block SQL injection in the query string
    Rules: 
        - 
        Action: 
            Type: BLOCK
        Priority: 1
        RuleId: 
            Ref: YourRegionalSqlInjRule

YourRegionalSqlInjRule: 
Type: AWS::WAFRegional::Rule
Properties: 
    Name: YourRegionalSqlInjRule
    MetricName : YourRegionalSqlInjRule
    Predicates: 
    -
        DataId :  
        Ref : YourRegionalSqlInjDetection
        Negated : false
        Type : YourSqlInjectionMatch

YourWebACLAssociation:
Type: AWS::WAFRegional::WebACLAssociation
Properties:
    ResourceArn: !Ref YourApiARN
    WebACLId: 
    Ref: YourRegionalWafWebAcl
```

So remember that serverless file I mentioned? 
If your API was created through serverless you will need to run ```npm i serverless-associate-waf```
in your serverless yml you will need to utilize this plugin:
```
plugins:
    - serverless-associate-waf
```
You will then need to append the following snippet:
```
custom:
  associateWaf:
    name:  Web ACL to block SQL injection in the query string
```

The name must be the name you specified in your web ACL.
```yml
Type: AWS::WAFRegional::WebACL
    Properties: 
      DefaultAction: 
        Type: ALLOW
      MetricName: SqlInjWebACL
      Name: Web ACL to block SQL injection in the query string ** HERE **
```


### Wrapping up

After X amount of hours spent trying to associate a WAF ACL to an API gateway, I finally got the development and production accounts associated with the correct ACL.
Hopefully, after reading this blog, this means you don't have to.


If you think we can help you secure your API gateways, feel free to [contact-us](https://www.mechanicalrock.io/lets-get-started).

### References

* [https://aws.amazon.com/about-aws/whats-new/2016/12/AWS-WAF-now-available-on-Application-Load-Balancer/](https://aws.amazon.com/about-aws/whats-new/2016/12/AWS-WAF-now-available-on-Application-Load-Balancer/)
* [https://aws.amazon.com/blogs/compute/amazon-api-gateway-adds-support-for-aws-waf](https://aws.amazon.com/blogs/compute/amazon-api-gateway-adds-support-for-aws-waf/)
* [https://docs.aws.amazon.com/waf/latest/APIReference/API_regional_GetWebACLForResource.html](https://docs.aws.amazon.com/waf/latest/APIReference/API_regional_GetWebACLForResource.html)
* [https://www.npmjs.com/package/serverless-associate-waf](https://www.npmjs.com/package/serverless-associate-waf)
