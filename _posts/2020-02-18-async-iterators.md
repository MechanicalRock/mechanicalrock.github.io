---
layout: post
title: Easy Paging of AWS calls with Async Iterators
date: 2020-02-18
tags: javascript tutorial aws
author: Matthew Tyler
image: img/thundering-herd.jpg
---

<center><img src="/img/thundering-herd.jpg" /></center>
<br/>

# Introduction

A little while ago I was having some issues with a particular piece of code that was making a fairly large number of external calls to an AWS service. The sheer volume of calls was causing the service to throttle my client. This was largely due to the fact the client would make a few calls, which would be fired off all at once, then resolved with `Promise.all`. From those results, it would list more data, then make more calls, then list more, ad-nauseum. Each listing call would page through the full set of data before making the next 'nested' call.

The big problem here is that each next set of calls is multipled by the previous set of calls. The solution to this is to remove the `promise.all` mechanism and page through explicitly, using for-loops. However, if you have ever used the Javascript AWS SDK, this can look messy. 

```typescript
private async listProvisionedProducts() {
    const provisionedProducts: ServiceCatalog.ProvisionedProductAttributes = []
    let response: ServiceCatalog.SearchProvisionedProductsOutput = {}
    do {
        response = await this.serviceCatalog.searchProvisionedProducts({ 
          PageToken: response.NextPageToken 
        }).promise();
        provisionedProducts.push(...response.ProvisionedProducts)
    } while (response.NextPageToken);
    return provisionedProducts;
}
```

This extract lists all of the provisioned products in an account. As the API is paged we need to fetch each set of results in turn. If we want to act on each set of results in this manner, we would need to either return the entire result set first (as is done here), or perform some sort of transformation within the loop. The former is what led to this problem, and the second leads to the mess that I was trying to avoid.

It would look a lot cleaner if you could define an iterator over a collection of promises. It turns out you can, and it's the result of a (relatively) new feature called async iterators.

# What is an Async Iterator?

Async iterators enable the use of the `for await...of` syntax in javascript. This enables you to loop over something which returns an iterable of promises. For more information, you can see the following [documentation](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/for-await...of) over at Mozilla. 

Async iterators are natively supported in Node.js 10 and up. If you are using 8 or 9, you can run node with the `--harmony_async_iteration` flag to enable support. If you are using typescript, ensure your configuration is enabled for compatibility with ES2018 and then everything should be fine.

Most of the time I prefer to write a bit more functional, making use heavy use of map, reduce, et. al, rather than using for loops. There are two big reasons related to making calls to external services where I find using for-loops can have a significant advantage, particular when making remote calls. I'll cover this soon, but let's first see an example. 

# A Practical Example.

We'll make a very simple script that can be invoked via the command line to demonstrate the mechanism. When run, it'll wait for input for you to press a key before it fetches any output. It will exit once it has finished.

```javascript
const S3 = require('aws-sdk/clients/s3');
const pressAnyKey = require('press-any-key');

// Here we hide the pagination details
async function* ListObjects(s3, params) {
  let isTruncated = false;
  let token;
  do {
    const response = await s3.listObjectsV2({ 
        ...params, ContinuationToken: token
    }).promise();

    // One could also yield each item separately
    yield response.Contents;

    ({ IsTruncated: isTruncated, NextContinuationToken: token  } = response);
  } while (isTruncated)
}

async function main() {
  const Bucket = process.argv.slice(2)[0];
  const s3 = new S3({ params: { Bucket }});

  // Usage of the for-await syntax hides the pagination details
  for await (const contents of ListObjects(s3, { MaxKeys: 2})) {
    const objects = contents.map(({ Key }) => Key).join(', ')
    console.log(objects);
    await pressAnyKey('Press any key to fetch next result...');
  }
}

main().then(() => console.log('Finished'))
```

Of particular note is `async function* ListObject` declaration. The asterix that is appended to the 'function' statement indicates that we defining this as a 'generator', with the 'async' qualifier denoting it is an 'async generator'. In doing this, yielding from this function will result in returning a promise, with the return type of the function being an asynchronous iterable - thereby fulfilling the async iterator protocol. 

There are other ways to define async iterables, but I find the generator method is usually the easiest to understand, without needing to dive into all the details. Though, if you do want to know the details you could do worse than to read this [article](https://javascript.info/async-iterators-generators).

You can run the example via [cloning this repository](https://github.com/matt-tyler/async-iterators) and executing `npm run script -- <BUCKET-NAME>` from within the base directory. Just make sure you have your AWS profile set up correctly!

# So why is this better?

It's perhaps not entirely clear why this is a better way to do things, but I think it is generally superior for two reasons.

> The code is easier to follow

Separating the paging mechanism from the logic makes the code easier to understand. If I were to come back to the code later, or I was new to the continuation-token mechanism of the AWS APIs, I would still be able to understand what was going on. I would not be confused by the continuation-token loop - all I need to understand is that I'm 'listing objects' and performing something on each object in turn. Whilst the paging mechanism is important from the service point of view e.g. I'm not unintentionally pulling more data unless I actually have to - it's probably not relevant to understanding the top-level logic of the code. We have hidden that implementation detail away.

> It can reduce 'thundering herds' of API calls

This isn't obvious from the above example. Utilizing async iterators can help reduce the number of API calls that are being made, and this helps to reduce the chance of being throttled. I'll often make a bunch of calls which return promises, and resolve them simultaneously with a `Promise.all()` call. Most of the time this is ok, but this can have consequences when making external API calls, which in turn resolve and then make other external calls. If I first wanted to list all my buckets, and then returned 50 buckets, listed all the objects, and then performed calls against all those objects... this can result in a huge number of calls in a short space of time, and it's highly likely I will start to encounter throttling errors. The number of calls potentially being made in parallel from the same source also makes it difficult to implement a good backoff strategy. Whilst it is efficient to make a external calls in parallel, a balance needs to be maintained to prevent flooding the remote service.

# Further Thoughts

Some of the SDKs offer, IMHO, better ways to page through sets of data. 

The Boto3 Python API provides paginators in various service clients making the need to create an async iterable (as in Javascript) unnecessary e.g.

```python
import boto3

# Create a client
client = boto3.client('s3', region_name='us-west-2')

# Create a reusable Paginator
paginator = client.get_paginator('list_objects')

# Create a PageIterator from the Paginator
page_iterator = paginator.paginate(Bucket='my-bucket')

for page in page_iterator:
    print(page['Contents'])
```

The Go v2 and Rust clients do something similar. The following is can example of searching through AWS Service Catalog, using the paging mechanism of the AWS Go Client.

```golang
	request := catalog.SearchProductsAsAdminInput{
		Filters: map[string][]string{
			"FullTextSearch": {productName},
		},
	}

	req := p.client.SearchProductsAsAdminRequest(&request)
	pager := req.Paginate()
	for pager.Next() {
		page := pager.CurrentPage()
		productIDs = append(productIDs,
			findProductsWithName(page.ProductViewDetails, productName)...)
	}
```

As an aside, the Go client is particular interesting, because the API design feels quite different from the Python and Javascript clients. In the Go client, you construct requests which are then actioned via a 'send' call on the request. Python and Javascript instead directly dispatch the call by providing parameters to the method. Interestingly enough, [version 3 of the Javascript SDK](https://github.com/aws/aws-sdk-js-v3) is moving towards a similar interface. 

At any rate, I hope they also make paging a bit nicer, because pagination is not handled in a standard manner across the Javascript SDK. Ian Mckay put together this interesting [survey](https://github.com/iann0036/aws-pagination-rules) of various pagination rules in AWS.

# Conclusion

We looked at async iterators in Javascript, and how to implement them to perform paginated requests in the Javascript AWS SDK. We can see that this allows up to write cleaner code that can avoid throttling errors. Finally, we had a quick look at how pagination is implemented in other language SDKs, and how this might propagate over to version 3 of the Javascript SDK.

Struggling with serverless? We can help! Contact us to [get started!](https://www.mechanicalrock.io/lets-get-started)