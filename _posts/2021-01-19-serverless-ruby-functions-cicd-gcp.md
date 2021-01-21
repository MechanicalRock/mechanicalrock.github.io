---
layout: post
title: Ruby functions on Google Cloud. A guide for automated testing and deployment
date: 2021-01-19T23:22:39+08:00
tags: [google-cloud, functions, serverless, gcp, continuous integration, continuous deployment, ci, cd]
author: Jean-Klaas Gunnink
image: img/ruby-functions-cover.jpg
description:
  Google Cloud recently announced the general availability of cloud functions in the Ruby programming language. Find out
  by example, how to automate the testing and deployment of your code.
canonical_url: https://jeanklaas.com/blog/ruby_cloud_functions_ci-cd/
---

Less than a week ago, Google Cloud announced the
[availability of cloud functions using the ruby programming language](https://cloud.google.com/blog/products/application-development/ruby-comes-to-cloud-functions).
As an ex-ruby developer, I was delighted by this news as I will always have a soft spot in my heart for ruby as it was
my first language I learned as a software developer.

For some fun, I wanted to explore how you might build, test and deploy your function code in an automated manner. But I
wanted it to do something interesting, not just respond with Hello, world! Right now, as I type this, bitcoin is going
through a huge spike in price which has caused a buzz, so why not combine two hot-right-now topics!

## Overview

This guide will help you setup a ruby function, test it, and deploy it using free automation tools inside the free-tier
from both Google Cloud and Github. If you don't already have accounts for these services, feel free to sign up or just
follow along.

We'll be deploying (and I'll include a link to the sample code) a ruby function which gets the current bitcoin price
from a public API and returns it to the user.

## Getting started

Before we begin, you can either clone the same repository and push it to your own account or you can create the files
from scratch. If you want to learn something, try to follow along and enter the code, but the source code is there if
you need it, make a mistake or get lost in the guide.

You'll also need ruby 2.6 or greater installed on your system.

## The ruby code

1. Create a gemfile and add the following gems:

```ruby
# Gemfile
source "https://rubygems.org"
gem "functions_framework", "~> 0.7"
gem "json"

group :test, :optional do
  gem "minitest"
  gem "webmock"
end
```

2. Create an `app.rb` file and an `app.test.rb` file.

3. In order to write our function, we're going to use the functions framework for readability and simplicity. We can
   declare our function as follows:
   First, require the libraries we'll need for the function.

```ruby
require "functions_framework"
require "net/http"
require "json"
```

Second, we'll declare the function.

```ruby
FunctionsFramework.http("getPrice") do |request|
  uri = URI('https://api.coindesk.com/v1/bpi/currentprice.json')
  response = JSON.parse(Net::HTTP.get(uri))
  return response["bpi"]["usd"]["rate"]
end
```

Side note: we don't have to use the `return` statement, but I personally find ruby's implicit return _very_ strange to
look at, so I have included it here.

4. If we visit the above URL in our browser, we'll see that we get a JSON response formatted data object. As you can see
   in the code on line 3, we're going to need to parse it so that ruby can understand it and access the keys from the hash
   it will get converted to.

5. Let's copy that response from our browser to the clipboard.

6. In our test file, we can paste the _string_ representation of the JSON object into our test file as a mocked response
   from the API to make sure we're going to pull out the right data to respond to our users of the cloud function.

Here's what that looks like:

```ruby
require "minitest/autorun"
require "functions_framework/testing"
require 'webmock/minitest'

class Test < Minitest::Test
  include FunctionsFramework::Testing

  mocked_response = "{\"time\":{\"updated\":\"Jan 19, 2021 13:22:00 UTC\",\"updatedISO\":\"2021-01-19T13:22:00+00:00\",\"updateduk\":\"Jan 19, 2021 at 13:22 GMT\"},\"disclaimer\":\"This data was produced from the CoinDesk Bitcoin Price Index (USD). Non-USD currency data converted using hourly conversion rate from openexchangerates.org\",\"chartName\":\"Bitcoin\",\"bpi\":{\"USD\":{\"code\":\"USD\",\"symbol\":\"&#36;\",\"rate\":\"37,036.3183\",\"description\":\"United States Dollar\",\"rate_float\":37036.3183},\"GBP\":{\"code\":\"GBP\",\"symbol\":\"&pound;\",\"rate\":\"27,216.1385\",\"description\":\"British Pound Sterling\",\"rate_float\":27216.1385},\"EUR\":{\"code\":\"EUR\",\"symbol\":\"&euro;\",\"rate\":\"30,542.4443\",\"description\":\"Euro\",\"rate_float\":30542.4443}}}"

  WebMock.stub_request(:get, "https://api.coindesk.com/v1/bpi/currentprice.json").
    to_return(body: mocked_response, status: 200)

  def test_bitcoin_price_ticker
    load_temporary "app.rb" do
      request = make_get_request("https://localhost")
      response = call_http("getPrice", request)

      assert_equal 200, response.status
      assert_equal "37,036.3183", response.body.join
    end
  end
end
```

As we can see from the test file, we've got a mocked response which was our _actual_ response when we went to visit the
server in our browser. We use webmock to stub out the request and return the string version of the JSON object the API
sends over.

Our test asserts that the function will respond with a 200 status code and that the response body will contain the
current bitcoin price.

7. Let's validate everything is working. In your console, run `bundle install` to install all the necessary gems for our
   function and tests

8. Then, run `ruby app.test.rb` in the console and make sure the tests are passing. If they aren't you may have missed
   something along the way.

9. Tests passing? Great! We can also run our function locally too, to see how it would work should it be deployed to the
   cloud. To do so, we can just run `bundle exec functions-framework-ruby --target getPrice`. This will start a local server which we can then access via <http://localhost:8080>

10. Let's save and commit our ruby code now that we've built and tested our function locally.

## Automation

Now the fun begins! We've written our code and now we want to show it to the world. First thing's first though, we need
to make sure it's not a case of "works on my machine"!

Let's build some automation.

1. In the code editor, create the following file: `.github/workflows/test.yaml`

1. This file will run our CI at pull request time and also install any gems.

1. Create the following [Github Action](https://github.com/features/actions)

```yaml
name: CI tooling
on: pull_request

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-ruby@v1
        with:
          ruby-version: "2.6"
      - run: bundle install && ruby app.test.rb
```

With our automated tests done, we can now look at automated deployments!

1. Again in the code editor, create a `cloudbuild.yaml` file. This is going to make use of GCP's cloudbuild service
   which will deploy our function for us.
1. At this time, we're just going to have the deployment step, since we've already unit tested the application. Update
   the `cloudbuild.yaml` file with the following:

```yaml
steps:
  - name: "gcr.io/cloud-builders/gcloud"
    args:
      - functions
      - deploy
      - getPrice
      - --source=.
      - --trigger-http
      - --runtime=ruby26
      - --region=australia-southeast1
      - --allow-unauthenticated
```

As I am sure you can guess, this will deploy the function in Australia region, and allow anyone to invoke the function
without the need to be authenticated. The other flags describe the runtime to use and where the source code is. Given
it's just a simple flat directory, we denote this location with the use of a dot `.`

With the files written and the tests completed, it's time to wire it up on the cloud. All we need to do is setup a
trigger in the cloudbuild console to deploy this function each time a change is detected on the main branch. What this
means is that the build will only fire after a pull request is merged (or someone pushes to the main branch), which as
we've setup earlier will ensure the tests are running before such merges are made.

To setup a trigger, follow the process in the console here: <https://console.cloud.google.com/cloud-build/triggers/add>

## Putting it all together

Ok, with the deployment config set it's time to test!

Start by making sure all your code is committed and pushed.

Then create a branch, push it and then open a pull request. You should see your tests running (if not instantly wait
about 20 seconds) in the `Checks` tab of the PR.

Once the tick appears indicating the tests have passed, merge your code. You'll then see a build kicking off in the
cloud console.

If you get any permissions based errors you may need to assign a special privilege to the cloudbuild service account.

As an example:
![Cloudbuild permission page screenshot]({{ site.base_url }}/img/serverless-ruby-functions-cicd-gcp/cfadmin.png)

Note that this is quite a wide privilege set. I would recommend testing that this solves the permission issue, and then
narrow down the scope to only allow the correct permission required to make the change. This is good security habits,
and follows the principle of assigning the least amount of privilege to the service account in order for it to
accomplish it's task.

If permissions are all good at the end of the build cycle you'll be able to see a URL of where you can access your newly
built function.

Look in the logs for this:
![Screenshot of build output logs]({{ site.base_url }}/img/serverless-ruby-functions-cicd-gcp/functionURL.png)

If we visit <https://australia-southeast1-jkpersonal.cloudfunctions.net/getPrice> we'll get a current price on the value
of bitcoin.

## Conclusion

Congratulations! If you made it this far, you now have a working ruby function deployed completely via automation which
is tested too.

Are you a ruby developer? Did you learn something? I love feedback of any type! Please let me know if I helped you or if
you can use what you learned here. You can find me on [Twitter](https://twitter.com/jgunnink) and Mechanical Rock at
[this handle](https://twitter.com/mechanicalrock_) or get in touch the old fashion way, via the
[contact form](https://www.mechanicalrock.io/lets-get-started).

### Useful links

- [Source code of this work](https://github.com/jgunnink/gcp_ruby_function_example)
- [See the testing automation pull request](https://github.com/jgunnink/gcp_ruby_function_example/pull/1)
- [Cloudbuild deploying functions docs](https://cloud.google.com/cloud-build/docs/deploying-builds/deploy-functions)
- [Google announcing ruby functions](https://cloud.google.com/blog/products/application-development/ruby-comes-to-cloud-functions)
- [Functions framework overview](https://googlecloudplatform.github.io/functions-framework-ruby/v0.7.0/index.html)
