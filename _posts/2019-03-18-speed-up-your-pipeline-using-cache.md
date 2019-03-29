---
layout: post
title:  Speed up your pipeline using the cache
date: 2019-03-29
tags: codebuild aws docker cache continuous-integration
author: JK Gunnink
---

Fast feedback in development is an important consideration when deploying software often as it helps
reduce context switching. When a developer creates some functionality, and wants to test and
validate it using a CI tool, it's important to maintain focus.

In a recent project I worked on, one of the tasks I was given was to speed up the time it took for
the CI tools to report success or failure in order to validate the work, but also get the work
merged in faster. This is important because the builds were taking nearly five minutes, for minor
changes. In a relatively green application, this is too long, and not consistent with fast feedback
that developers expect.

The application is a containerised ruby-on-rails application which has two
status checks which are required before any work can be merged in. They are:
- Build the image and test
- Build the image for production

Using AWS codebuild for both checks, using containers and caching enabled a 84.2% improvement on the
time taken to get a response. From 4m:45seconds down to 45 seconds.

By leveraging caching layers of docker containers, for dependencies and sections of the application
which were unchanged, we were able to take advantage of rebuilding the image fast. Docker caching
works by figuring out if any of the previous layers in the image have been changed and if they have,
that layer, and subsequent layers are rebuilt. So things like code base and images or anything
frequently changing is placed towards the end of the Dockerfile and less changing things like
container types or image dependencies at the top of the file. [Read more about docker caches
here](https://docs.docker.com/develop/develop-images/dockerfile_best-practices/#leverage-build-cache).

We started out with a buildspec file that looked like so:
```yaml
env:
  variables:
     RACK_ENV: "test"

phases:
  install:
    commands:
      - docker run -d --rm -p 5432:5432 -e POSTGRES_USER=my-application_test -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=test-db postgres:alpine
      - curl -sL https://deb.nodesource.com/setup_10.x | bash -
      - apt-get install -y nodejs

  pre_build:
    commands:
      - bundle install

  build:
    commands:
      - rake db:test:prepare
      - rspec spec
```
As can be seen in the file, we simply ran an AWS codebuild image based on the ruby image, then we:
- spun up a postgres database
- installed node
- installed the gems
- and ran the tests.

By taking advantage of packaging the application in a docker container using a separate dockerfile,
we ended up with a config that was as follows:
```yaml
version: 0.2

env:
  variables:
     REPO_URL: <Account ID>.dkr.ecr.ap-southeast-2.amazonaws.com/my-application
     REF_NAME: my-application-tests

phases:
  install:
    commands:
      - $(aws ecr get-login --no-include-email --region ap-southeast-2)
      - docker pull $REPO_URL:$REF_NAME || true

  pre_build:
    commands:
      - docker build --file Dockerfile-testing --cache-from $REPO_URL:$REF_NAME --tag $REPO_URL:$REF_NAME --tag my-application-tests .

  build:
    commands:
      - docker-compose --file docker-compose-testing.yml run rspec

  post_build:
    commands:
      - docker push $REPO_URL
```
And a docker-compose file:
```yaml
version: '3'
services:
  postgres:
    image: postgres:alpine
    ports:
      - 5432
    environment:
      POSTGRES_USER: my-application_test
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: test-db

  rspec:
    image: my-application-tests
    volumes:
      - .:/my-application
    command: "./run-tests.sh"
    depends_on:
      - postgres
    environment:
      DB_HOST_URL: postgres
```
For rails, we use RSpec as the test runner. The script specfied in the docker-compose file is:
```bash
#!/bin/sh
bundle exec rake db:test:prepare && bundle exec rspec spec
```

## The Result

At a technical level, docker builds up containers using layers. Those layers are hashed, and then
the image is stored on AWS ECR. When a new commit is made, the source is pulled in and we specify an
image to use as our cache to build from. When the container goes to build it can reuse many of the
layers, as the image of the container only changes when new dependencies (read: gems) are added to
the image. The result is a fast feedback loop for the developer. After completing their work, and
validating that it does just work on their machine, they're able to get a quick response from the CI
tooling without having to wait around with enough time for the focus to fade or distractions to come
into play.

The proof is in the pudding:

![Code Build Output]({{ site.url }}/img/caching_build_speed.png)

There you have it, using docker layers as a cache to speed up your continuous integration. Give it a
try and let us know how much time you saved! Tweet at us
[@mechanicalrock_](https://twitter.com/mechanicalrock_io) with your results!
