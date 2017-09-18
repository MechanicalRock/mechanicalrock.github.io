---
layout: post
title: "Repeatable Serverless Applications"
date: 2017-09-11
categories: serverless architecture docker aws
author: Rick Foxcroft
image: img/no_servers.png
---

Building and testing serverless applications locally can be challenging. It's a relatively new landscape and there aren't many established practices, regarding good serverless application design.
At a recent Mechanical Rock mob programming session we decided to tackle the topic of, "How can we turn off any superfluous and idle ec2 instances" that we may have forgotten to stop/terminate because servers are expensive right? We decided to call the new project, Instance Reaper. Source code available <a href="https://github.com/MechanicalRock/instance-reaper">here</a>. 

![serverless benefits]({{ site.url }}/img/about_serverless_architecture.jpg)
>Whilst a serverless architecture does alleviate a lot of these mundane tasks, it doesn't necessarily remove the need for them completely.
- Serverless **is** Scalable, fault tolerant and simplifies many of the operational tasks, associated with traditional architectures.


The preferred approach for any new software project here at Mechanical Rock, is to tackle it with a test-first mindset and a serverless implementation. The difficulty comes in, with the infancy of the whole "serverless" paradigm. As a DevOps consultancy, ideally we would like to practice a Continuous Delivery model on all of our software projects. In order to achieve this, we need to be able test our application locally, on a pipeline and have it run bug-free in the cloud. The good news is, there are tools out there, that can help us achieve this.

![serverless benefits]({{ site.url }}/img/localstack.png)

Meet, LocalStack. LocalStack, was created by the good people at Atlassian and provides you with "A fully functional local AWS cloud stack". This means, that with a few cheeky bash scripts and some Docker magic, you can automate the provisioning of almost all the necessary resources for your cloud-based application. Sounds too easy? Well you're absolutely right! With a docker-compose file, you can start up the LocalStack service in conjunction with your dev-env in your Dockerfile. 

```yml
<!-- docker-compose.yml -->
# add the folling service
localstack:
    image: localstack/localstack
    ports:
      - "4569-4581:4569-4581"
      - "8080:8080"
```

In your dockerfile, you can reference a bash script which provisions your AWS resources so that when the docker services are up and running, your resources will be available on the relevant service port referenced on the <a href="https://github.com/localstack/localstack">LocalStack GitHub page</a>. If you would like visibility of the resources available on your 'stack', just hit up http://localhost:8080, in your browser. 

```bash
if [ $ENV = "local" ]; then
    aws --endpoint-url=http://localhost:4572 s3 mb s3://instance-reaper-$COMPANY_NAME-logging
else
    aws s3 mb s3://instance-reaper-$COMPANY_NAME-logging --region $REGION
fi
```

You can now test code locally, that can send and receive data from a dynamoDB table and leverage s3 buckets for file storage.
We were using the boto3 library provided by AWS, which allows you to set the endpoint URL of the service you want to talk to when creating a client connection to it. Using this endpoint URL parameter, we were able to establish a connection to our s3 bucket on LocalStack, when the 'ENV' environment variable was set to 'local'. This way, we don't get charged for creating excess and unnecessary resources on our AWS account. 

```python
s3_endpoint = "http://localhost:4572" if os.environ.get("ENV") == "local" else None
self.s3_resource = boto3.resource('s3', endpoint_url=s3_endpoint)
```

If you're hoping to use DynamoDB as a layer of persistence in your application and you are using Python, you may want to use the PynamoDB library which will create a table, if it doesn't already exist. To establish a connection to your local instance of Dynamo, you will have to specify the host name, in the Meta subclass, to point to Dynamo on LocalStack.

```python
class ProductModel(Model):
    class Meta:
        table_name = 'Products'
        region = 'ap-southeast-2'
        host = "http://localhost:4569" if os.environ.get(
            "ENV") == "local" else None 
```

Since LocalStack is a docker image, with all the AWS services you would typically use, in a cloud native application, you can assume that your application would run the same locally, as it would in the cloud. Subsequently, you should test your application assuming that all the application necessary services are present, when developing locally.  

```python
def test_write_data():
    ''' test the write_data function, which writes over
     50 items to our DynamoDB table.'''
    DataRepository().write_data()
    # check that our table exists
    assert ProductModel.exists() is True
    # perform a "scan" operation on our table
    for item in ProductModel.scan(limit=50):
        # checks that we can read at least 50 items
        # Perform a type check on the object received from the scan
        if isinstance(item, ProductModel):
            break
```

Testing on a pipeline is also a relatively trivial endeavour. Using BitBucket pipelines, we are able to attach the LocalStack docker image, which includes all the necessary AWS services for the lifetime of our pipeline. No additional configuration is required, simply run the same tests you did locally, on your pipeline. You can now use the outcome of your pipeline, as a deciding factor, to whether you will deploy your application to AWS.

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
            - ./scripts/scaffold-environment.sh
            - ./scripts/deploy.sh
          services:
            - localstack

definitions:
  services:
    localstack:
      image: localstack/localstack
```

It's that simple. Thanks to Docker and LocalStack, your developers now have a reproducible environment that can be tested locally and on a pipeline. In the true fashion of serverless architecture, all that needs focusing on, is your application code.
