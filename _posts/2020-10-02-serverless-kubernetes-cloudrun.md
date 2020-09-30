---
layout: post
title: Serverless Kubernetes with Cloudrun
date: 2020-09-28
tags: containers serverless docker kubernetes
author: JK Gunnink
image: img/cloudrun_header.png
---

![Cloudrun_Header]({{ site.base_url }}/img/cloudrun_header.png)

A short while ago, Mr Brown-shoe himself [presented a talk at DDD in Perth][ddd-link] on the great debate of Kubernetes
vs serverless, and which was to be the clear winner. Long story short it turned out that serverless is, by far a clear
winner in nearly all categories of:

- Security
- Cost
- Performance
- Learning Curve
- Development Experience
- Operations

If memory serves, the only category which Kubernetes came out a winner for according to the talk was in the performance
category. And whilst this is still true, the margins are closing, and at a significant rate. AWS recently announced
provisioned lambda capacity - so your functions are always warm reducing the latent cold-start times, and it seems that
GCP's Cloud Run service is getting faster each week. Not to mention the pricing point. For Kubernetes to actually become
an overall winner in pricing compared to a serverless function you need to be processing a hell of a lot of events.
According to the [YouTube talk from Josh][josh-youtube-talk]:

![Inflection Point]({{ site.base_url}}/img/cloudrun_significant_numbers.png)

> It is millions upon millions of requests per month before Kubernetes becomes cheaper.
> Around 20,000 requests per second.

Per second. That's a lot of requests.

For those still not in the serverless functions world or just beginning to make their first foray, it can be quite a
mind bender to understand a number of things, like deployment, logging, tracing, general observability of how it's all
done. Not to mention changing the way you think about writing applications. Since you need to account for the lack of
state, it can be quite a shift in the way applications are written. On top of that, if you've come from a Java or C#
background which are generally much heavier, and where a lot of things are done for you via packages and dependencies,
thinking about code differently can scare a lot of people away from the serverless world as there can be too much
cognitive load to work through to make any immediate gain.

## Cloud Run

This is where I'd like to introduce you to [Cloud Run][cloud-run-link]. Cloud Run is a service offered by Google Cloud
which is built with [knative][k-native-link] which, according to the website:

> Knative (pronounced kay-nay-tiv) extends Kubernetes to provide a set of middleware components that are essential to
> build modern, source-centric, and container-based applications that can run anywhere: on premises, in the cloud, or
> even in a third-party data center.

What does that mean for developers and operations? In short, you can run a container for the length of time it takes to
handle an event. For example if you run a blog application in your container, an event might be a GET request to the
container running the API, it handles the request and sends it back to the client. Then, the container is terminated
since it's handled the event. It's worth also pointing out that an event cannot last for longer than 15 minutes.
So if you need longer, you may want to consider alternative compute requirements.
[Cloud Run uses Knative][knative-gcp-link] to offer a serverless container service. This means developers who create
HTTP applications can now package their app up into a container and deploy it to Cloud Run and have their app run
on-demand whenever a HTTP request comes in.

Now, granted there are a number of use-cases where running Kubernetes does in-fact benefit the user over running a
serverless, on-demand version of their app, especially those cases where high-performance and ultra-low latency are
necessary. If your application does not fit into the above uses and for the vast majority of applications, this tends to
be the case, then you may be able to immediately take advantage of taking the first step to moving your application to a
serverless architecture.

## Requirements

- Your app must receive or be listening for HTTP or gRPC requests.
- Your app needs to be stateless. State can only live in the container for the life of the request before the container
  is terminated. (There are some un-documented scenarios where GCP will keep the container "warm" for you, without
  charging for it so that the next request can be served super quickly, which _does_ maintain state, but don't rely on
  this.)

## Use cases

There's a number of [use cases](use-cases-link) documented on GCP's website, here's a short list:

- Web Services
- REST API backends
- Back office admin
- Lightweight data processing
- Scheduled document generation (eg, invoicing at end of month)
- Business workflow automation with webhooks (eg, chatbots, slack notifications, github/JIRA integration)

As an example, I recently worked on a Ruby-on-Rails application which used Cloud Run as it's compute layer. I had a
Postgres Cloud SQL backend with a Cloud Memorystore instance for Redis-based messaging and processing. Cloud Run served
all the HTTP traffic and any requests that had to go to the database were served as needed. Here's an example
architecture as posted on the Cloud Run page:

![Rails_Architecture]({{ site.base_url }}/img/cloudrun_websites.svg)

If you're getting started on a new application, Cloud Run provisions a HTTPS generated URL for your app, and handles all
the TLS termination for you so you can focus on just building. And the best part is being serverless, you're only paying
when the compute is being consumed. As soon as the HTTP request is served, the billing stops. Plus there's a generous
free tier too.

This image is taken from GCP's [pricing for Cloud Run][cloud-run-pricing]
![CloudRun_Pricing]({{ site.base_url }}/img/cloudrun_pricing_table.png)

It's probably worth mentioning too, that what we've discussed about Cloud Run so far, is the "fully managed" version of
Cloud Run. There is another flavour too, and that's where you can bring your own Kubernetes cluster and run containers
on your own cluster rather than on compute outside of the cluster. There are some advantages to this, like if you have
special networking requirements or some kind of specific security policy around encryption and the likes. This version
of Cloud Run isn't quite serverless, since you run it on your own clusters, which means you'll already be paying for the
nodes and as such, we won't really go into it in this post.

I've been using Cloud Run since November last year in production (close to a year at time of writing), so if you have
any questions, feel free to hit me up on Twitter ([@jgunnink][jk-twitter]) or any of the fine folks on
[LinkedIn][linkedin-mechrock]. At [Mechanical Rock][mech-rock], we've helped clients build many scalable event-driven
systems that rely on serverless technologies. We are THE go-to people in Perth for anything serverless and Kubernetes.
We even recently became [certified with the cloud-native computing foundation][cncf-link] as a Kubernetes service
provider, and joined as a Silver Member. If you think we can help you, feel free to [contact us][contact-us] or
[tweet us][mr-twitter].

[inception-pipeline-post]: {{ site.baseurl }}{% post_url 2018-03-01-inception-pipelines-pt1 %}
[mech-rock]: https://www.mechanicalrock.io/
[mr-twitter]: https://twitter.com/mechanicalrock_
[contact-us]: https://www.mechanicalrock.io/lets-get-started
[jk-twitter]: https://twitter.com/jgunnink
[DDD-link]: https://dddperth.com/agenda/2019?sessionId=35e1174f-8d50-48db-a410-d53c3c8ddf73
[cloud-run-link]: https://cloud.google.com/run/
[k-native-link]: https://knative.dev/docs/
[knative-gcp-link]: https://cloud.google.com/knative/
[use-cases-link]: https://cloud.google.com/run/#section-5
[cloud-run-pricing]: https://cloud.google.com/run/#section-13
[linkedin-mechrock]: https://www.linkedin.com/search/results/people/?facetCurrentCompany=[%2218148543%22]
[cncf-link]: https://www.cncf.io/certification/kcsp/
[josh-youtube-talk]: https://www.youtube.com/watch?v=YzsKp6Je8eY&feature=youtu.be&t=2301
