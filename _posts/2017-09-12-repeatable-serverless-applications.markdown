---
layout: post
title: "Repeatable Serverless Applications"
date: 2017-09-11
categories: serverless architecture docker aws
author: Rick Foxcroft
image: img/no_servers.png
---

Servers can be expensive right? We aren't the biggest fan of lengthy provisioning processes, managing, maintenance and the costly nature that comes with deploying applications on servers. This doesn't mean that we avoid them altogether. We still have a monolithic application that uses several ec2 instances for numerous environments. On one of our recent mob-programming sessions, we decided to tackle the topic of, "How can we turn off any lurking, superfluous and idle ec2 instances" or any other idle instances we may have forgotten to stop/terminate. 

![serverless benefits]({{ site.url }}/img/about_serverless_architecture.jpg)

The preferred approach for any new software project here at Mechanical Rock, is to tackle it with a test-first mindset and a serverless implementation. The difficulty comes in, with the infancy of the whole "serverless" paradigm. Meaning, that there aren't many established best practices regarding test-first serverless applications and as a DevOps consultancy, ideally we would like to practice a Continuous Delivery model on all of our software projects. In order to achieve this, we need to be able test our application locally, on a pipeline and have it run bug-free in the cloud. The good thing is, there are tools out there, that can help us achieve this, most desired method of software development efficiency. 

![serverless benefits]({{ site.url }}/img/localstack.png)

Meet, LocalStack. LocalStack, was created by the good people at Atlassian and provides you with "A fully functional local AWS cloud stack". This means, that with a few cheeky bash scripts and some Docker magic. You can automate the provisioning of all(almost) the necessary resources for your cloud-based application. Sounds too easy? Well you're absolutely right! With a docker-compose file, you can start up the LocalStack service in conjunction with your dev-env in your Dockerfile. 

```yml
<!-- docker-compose.yml -->
# add the folling service
localstack:
    image: localstack/localstack
    ports:
      - "4569-4581:4569-4581"
      - "8080:8080"
```

In your dockerfile, you can reference a bash script which provisions your AWS resources so that when the docker services are up and running, your resources will available on the relevant service port referenced on the LocalStack GitHub page (<a href=https://github.com/localstack/localstack></a>). If you would like visibility of the resources available on your 'stack', just hit up <a href=http://localhost:8080></a>, in your browser. 

```bash
if [ $ENV = "local" ]; then
    aws --endpoint-url=http://localhost:4572 s3 mb s3://instance-reaper-${COMPANY_NAME}-logging
else
    aws s3 mb s3://instance-reaper-${COMPANY_NAME}-logging --region ${REGION}
fi
```

You can now test code locally, that can send and receive data from a dynamoDB table and leverage s3 buckets for all your file storing needs.
We were using the boto3 library provided by AWS, which allows you to set the endpoint URL of the service you want to talk to when creating a client connection to it. Using this endpoint URL parameter, we were able to establish a connection to our s3 bucket on LocalStack, when the 'ENV' environment variable was set to 'local'. This way, we don't get charged for creating excess and unnecessary resources on our AWS account. 

```python
s3_endpoint = "http://localhost:4572" if os.environ.get("ENV") == "local" else None
self.s3_resource = boto3.resource('s3', endpoint_url=s3_endpoint)
```

If dynamoDB is a feature in your application and you are using Python, you may want to use the PynamoDB library which will create a table, if it doesn't already exist. You will have to specify the host name, in the Meta subclass, to point to a LocalStack resource.

```python
class ProductModel(Model):
    class Meta:
        table_name = 'Products'
        region = 'ap-southeast-2'
        host = "http://localhost:4569" if os.environ.get(
            "ENV") == "local" else None 
```


Since LocalStack is a docker image, you can use it to test your application on your pipeline in the exact same way you would test locally.

```yml
pipelines:
  default:
    - step:
        script:
          - ./scripts/install-and-test.sh
        services:
          - localstack

  branches:
    master:
      - step:
          script:
            - ./scripts/install-and-test.sh
            - export ENV=PROD
            # - ./scripts/scaffold-environment.sh
            - ./scripts/deploy.sh
          services:
            - localstack

definitions:
  services:
    localstack:
      image: localstack/localstack
```

It's that simple. Thanks to Docker and LocalStack, your developers now have a reproducible environment that can be tested locally and on a pipeline. In the true fashion of serverless architecture, all that needs focusing on, is your application code.
