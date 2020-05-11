---
layout: post
title: Serverless Express Without The Express (Or Lambda) - Client Edition
date: 2020-05-05
tags: javascript tutorial serverless aws
author: Matthew Tyler
image: img/amazon_api_gateway.png
---

<center><img src="/img/amazon_api_gateway.png" /></center>
<br/>

# Introduction

In a previous installment, we investigated converting over the HTTP API we had built to a REST API. In doing so, we switched out the persistence layer to DynamoDB, and moved to VTL-based service integrations over lambdas. We also used IAM authorization instead of using JWTs. We used Postman to test our API because it is easy way to set up Authorization headers that are compatible with IAM authorization. In previous installments though, I showed how to set up generate client code from our OpenAPI definition, and then apply the JWT to the header. This allowed us to write tests in javascript that could be used for end-to-end testing of the API. Can we do the same when using IAM Authorization? Of course we can! Let's see how!

All code for this tutorial is available [here](https://github.com/matt-tyler/simple-node-api-sls). It may help to go over the client tool generation section that I wrote previously.

# IAM Authorization and AWS Signature V4

IAM Authorization uses a different method to validate that requests are authorized, and it is called AWS Signature V4. It is a special signature that is applied to a request in the Authorization header. The signature contains information about the request itself, and is signed with an access key and secret of the user making the request. This is in contrast to a JWT, which only signs claims that are asserted by the authorization server and does not contain any information about the particular request that is being sent.

The header typically looks something like this

```yaml
Authorization: AWS4-HMAC-SHA256 Credential=AKIA****************/20200320/ap-southeast-2/execute-api/aws4_request, SignedHeaders=host;x-amz-date, Signature=39467d7f8e91e137a49a2713ceb9538d189fdc1e5f76b6939f8027f2ee8c8170
```

This consists of several parts.

1. AWS4-HMAC-SHA256
  
   This indicates the particular signature type and signing algorithm used.

2. Credential=

   This indicates the owning credential. It consists of the principal ID (AKIA****************), the date the request was sent (20200320), the scoped region (ap-southeast-2), the service being called (execute-api), and the request type (aws4_request).

3. Signed Headers

   This indicates the headers that were in the canonical string, which is used to calculate the signature. Not all headers need to be included, so you need to specify if any optional headers were included - otherwise the signature calculation will fail on the AWS end.

4. The signature that was created by signing the hashed canonical string

That brings us to the next point - the canonical string. The canonical string is an encapsulation of the request, into a single string, which is then hashed. That has is signed by the secret access key. When you request is sent, AWS will attempt to reconstruct this string, sign it, and then compare signatures. If the signatures match, AWS determines that request is valid, and can then apply futher checks (e.g. IAM Policy).

A canonical request looks like the following;

```
POST
/prod/

content-length:9
content-type:text/plain
host:3r47x2ktzh.execute-api.ap-southeast-2.amazonaws.com
x-amz-date:20200318T063056Z

content-length;content-type;host;x-amz-date
b526aef1a341cfe6e5c377ed4c222888eeb81f913a107110a867e009c1758f24
```

It contains a few things

1. The method of the HTTP Request.
2. The path being accessed, relative to host.
3. A query string, if present (it isn't here).
4. The canonical headers that are to be signed with the request.
5. A list of the headers that are in the signed request
6. A hex-encoded SHA2 Hash of the content in the request body

Additional information about constructing a canonical request is available [here](https://docs.aws.amazon.com/general/latest/gr/sigv4-create-canonical-request.html).

A hash is then calculated on the canonical request, and a signature is calculated by signing this with the secret access key. This is then included as the signature in the Authorization header.

# Client Implementation

That's all well and good, but how can we practically use that in a client? In an earlier installment we pre-generated a client that uses a node library, Axios, to send the request. Adding a header that doesn't depend on the content, like a JWT, is fairly easy. How can we do it in this scenario, without having to write signature calculation code every time we want to send a request?

The answer is pretty easy - most good HTTP client libraries will provide some way to intercept requests before they are sent off, and responses before they are received. Axios providers 'intercepters' which can transform the request before it is sent to the server. Michael Hart has written a [library](https://github.com/mhart/aws4) to perform the hard work of constructing the signature, so all we have to do is create an interceptor to do the work.

What follows is an excerpt.

```typescript
import axios from "axios";
import { createHash } from "crypto";
import { URL } from "url"
import { Config } from "aws-sdk"

const aws4 = require('aws4');

function hash(string: string) {
    return createHash('sha256').update(string, 'utf8').digest('hex')
}

    const instance = axios.create()

    // the interceptor
    instance.interceptors.request.use(async (config) => { 
        // load AWS credentials
        const { credentials: {
            accessKeyId, secretAccessKey
        }} = new Config();

        const url = new URL(config.url);
        const data = config.data ? config.data : "";

        const headers: { [key: string]: string }[] = [
            { 'X-Amz-Content-Sha256': hash(data) },
        ];

        if (!new Set(['OPTIONS', 'GET']).has(config.method.toUpperCase())) {
            headers.push({ 'Content-Type': config.headers['Content-Type'] })
        }
    
        const req = aws4.sign({
            service: 'execute-api',
            region: 'ap-southeast-2',
            method: config.method.toUpperCase(),
            path: `${url.pathname}${url.search}`,
            headers: Object.assign({}, ...headers),
            body: data,
            host: url.host
        }, { accessKeyId, secretAccessKey });

        config.headers = req.headers;
        return config
    })

    const api = new DefaultApi({}, process.env["ENDPOINT"], instance);
```

Assuming your API Gateway endpoint is loaded, this can now be used to sign requests that require IAM authorization. Assuming that the credentials that have been used have access to the invoke the relevant API Gateway endpoint.

# A Comparison with JWT Authorizers

It makes sense to talk about the difference between this method and JWT's, given that JWT support is available in HTTP APIs for API Gateway and IAM authorization isn't (it's limited to REST APIs). I don't think this means that AWS is abandoning IAM authorization for API Gateway - JWT's are extremely popular and every customer was implementing their own JWT Authorizer with Lambda (sometimes incorrectly). I think IAM authorization has several advantages over JWTs.

- It provides a different signature per request, thereby providing a way to ensure the request isn't tampered with.
- The secret is not exposed in the request, thereby limiting the opportunities to expose the secret, either via a man-in-the-middle attack or similar vector.
- Because the request is tied to an IAM entity, all the powers of IAM are available to determine whether the caller is allowed to perform a specific action.

The downside is that this method is limited to AWS. If you were to port the API to another provider you would need to implement another authorization method. You also need to aquire the credentials in the first place. Embedding credentials in an application is usually not a good idea - so most applications will use cognito federation, to enable clients to exchange a JWT from an Identity Provider for AWS Access Tokens. So even if you do decide to use IAM Authorization for your API, for a public API you will likely still end up with a JWT somewhere. I personally believe that it is worth it, given how powerful and flexible IAM policies can be (that being said, new HTTP APIs do not have support for IAM authorization). The addition of session tags and scope propogation to Cognito would also offer flexible ways to control access to protected resources, but we might be waiting awhile. 

# Conclusion

The previous installment showed how to create a REST API with IAM Authorization, but didn't show how IAM authorization worked. We've fixed that now by introducing the AWS Signature V4 signing process. We showed how the signature in this process is created, and how it is used in the Authorization header of a HTTP request in order to authorize requests to protected resources on AWS. We showed how to implement the process in generated client code, by showing how to write a request interceptor in Axios using the aws4 node library. Finally, we compared the AWS Sig V4 method with JWTs.

Serverless is More [Contact Mechanical Rock to Get Started!](https://www.mechanicalrock.io/lets-get-started)