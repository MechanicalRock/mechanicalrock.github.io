---
layout: post
title: 'Private Bastion - I'll do what you want me to do'
date: 2020-07-06
tags: aws ssm vpc ssh ec2
author: Paul Symons
---

This post and its title are inspired by Tina Turner and her 1984 album "Private Dancer". Themes of fortitude, defiance and resiliency echo throughout her life story and her works, yet it is her belief that we can find a better way, that resonates most strongly right now.

> *May you always find a way to turn poison into medicine* <br/><br/>Tina Turner, 2019

# Private Bastions - Using VPC Endpoints to teleport into your VPC

[Bastion Hosts](https://en.wikipedia.org/wiki/Bastion_host) are a fairly well known and aged concept - that of a server that acts as a solitary, publicly accessible network access point, placing authorised users within the perimeter of an otherwise private network.

The problem with any bastion host is the public attack surface that it leaves exposed. This can be mitigated to an extent by restricting IP ranges, disabling root logins, using private key passwords and the likes; yet the nature of the world dictates that a public bastion host can never be risk free.

AWS Systems Manager released a feature in 2018 called *Session Manager*, allowing the ability to connect directly to EC2 hosts without the need to expose any ports on those hosts (for example, port 22 for SSH). There are two ways you can make this work:

* Place your EC2 in a public subnet with a public IPV4 address
* Place your EC2 in a private subnet and create VPC endpoints to SSM related services

Today we'll focus on the second strategy.

## Use Cases

Here's a couple of scenarios to explain why you might want to use Session Manager to access resources in private subnets.

The first scenario is that you deploy an application consisting of microservices and a database to private subnets, made public by a load balancer in a public subnet. If you want the ability to test these services within the network, a private bastion might be a good way to do that:

![Scenario 1](/img/blog/ssm-private-terminal/scenario1.png)

Another use case is that you have a hybrid network consisting of AWS resources and on-premise networks, perhaps by interconnected by a Transit Gateway attachment. In such scenarios, you may be forbidden from placing EC2 resources in public subnets or you may not even have an Internet Gateway at all:

![Scenario 2](/img/blog/ssm-private-terminal/scenario2.png)

## Building out your network

I decided to do something different for this blog, using CDK instead of CloudFormation. CDK allows you to take a programmatic approach to provisioning your infrastructure, yet it still generates CloudFormation script and simply wraps the calls for CloudFormation to deploy your code. I followed the guide at CDK Workshop website (see below) and created a sample app.

So here's what we are going to create

* A new VPC
* Some private subnets, route tables and security groups
* An EC2 instance to act as the *bastion host*
* Some VPC Endpoints so our EC2's SSM agent can connect to Session Manager

I'm not going to explain how CDK works ~~because I'm lazy~~, instead I'll just focus on the code and how surprisingly terse it is. I did my app in TypeScript but you could use any of the other supported languages such as JavaScript, Python, Java, and C#/. Net.  The following snippets are taken from the file `lib/blog-ssm-private-terminal-stack.ts`

## Code

Ok so I'm in my typescript file - I'm going to create my VPC and its subnets and route tables and stuff:

```js
 const vpc = new ec2.Vpc(this, 'blog-vpc', {
      maxAzs: 1,
      enableDnsHostnames: true,
      enableDnsSupport: true,
      cidr: '10.16.0.0/23',        
      subnetConfiguration: [
        {
          cidrMask: 26,
          name: 'isolated',
          subnetType: ec2.SubnetType.ISOLATED            
        }
      ]
    });
```

Wow, this was surprisingly easy. So assuming you installed the cdk cli tool, you can go and run `cdk synth` to generate the cloudformation that this code would create. You might be surprised and you will learn a lot about how much CDK is doing under the hood. Bear it in mind, because the defaults may not always be what you want.

Above you can see that I've specifically stated that I want `ISOLATED` subnets. Public subnets would have an internet gateway, and I believe private subnets will automatically configure you a NAT gateways, which I do not want for my scenarios. You can see I also specified `maxAzs: 1`; the default is to spread across multiple availability zones, which I also don't want for my scenarios.

For me, one of the most rewarding things of using CDK (in VSCode) is the code completion, because it often saves you from having to lookup a million pages of documentation on the internet - the libraries are really well documented regarding the intent and default behaviour of the code. If you need more reference docs, jump to the [latest version of the API docs](https://docs.aws.amazon.com/cdk/api/latest/versions.html)

Ok, let's keep going!

```js
    const vpcEndpointSecurityGroup = new ec2.SecurityGroup(
        this,
        'endpoint-security-group', {
            allowAllOutbound: true,
            vpc
        }
    );
```

Right, I'm creating a security group for a couple of reasons:

* If you don't specify a security group when creating VPC endpoints, CDK will generate one for you
* When you create an EC2, you'll want to apply the security group so that the EC2 instance is allowed to send / receive via the VPC endpoints

You should consider if you need to be more fine grained with how many security groups you create for your VPC Endpoints, and what ingress and egress they permit.

I shall now create some endpoints:

```js
    vpc.addS3Endpoint('s3-gateway');

    vpc.addInterfaceEndpoint('ssm-messages', {
      open: true,
      privateDnsEnabled: true,
      service: InterfaceVpcEndpointAwsService.SSM_MESSAGES,
      subnets: vpc.selectSubnets(),
      securityGroups: [vpcEndpointSecurityGroup]
    });

    vpc.addInterfaceEndpoint('ec2-messages', {
      open: true,
      privateDnsEnabled: true,
      service: InterfaceVpcEndpointAwsService.EC2_MESSAGES,
      subnets: vpc.selectSubnets(),
      securityGroups: [vpcEndpointSecurityGroup]
    });

    vpc.addInterfaceEndpoint('ssm', {
      open: true,
      privateDnsEnabled: true,
      service: InterfaceVpcEndpointAwsService.SSM,
      subnets: vpc.selectSubnets(),
      securityGroups: [vpcEndpointSecurityGroup]
    });
```

How simple! Did you notice the S3 gateway? It's not actually required for *Session Manager* but here's the thing, we have no Internet or NAT Gateway; when you land on your EC2 you are probably going to want to `yum update` or `yum install mysql` for example, and without a connection to the internet these things are not going to work. Yet with Amazon Linux, yum repos are set to pull from S3, so as long as you have a gateway endpoint set up, you will be able to install yum packages. Yum!!

We are so close! All we need now are an EC2 role and an EC2 instance:

```js
    const ec2Role = new iam.Role(this,'ec2-role', {
      assumedBy: new iam.CompositePrincipal(
        new iam.ServicePrincipal('ec2.amazonaws.com'),
        new iam.ServicePrincipal('ssm.amazonaws.com')
      ),
      managedPolicies: [
        ManagedPolicy.fromManagedPolicyArn(this, 'ssmManaged', 'arn:aws:iam::aws:policy/AmazonSSMManagedInstanceCore')
      ]
    });
```

Here, we allow the role to be assumed by two AWS service principals - EC2 and SSM. Additionally, we apply a managed policy that gives the necessary SSM permissions to interact with *Session Manager*.

Finally, we go and create our EC2 Instance:

```js
 const ec2Instance = new ec2.Instance(this, 'private-terminal', {
      vpc,
      machineImage: MachineImage.latestAmazonLinux(),
      instanceType: new InstanceType('t3.micro'),
      role: ec2Role,
      securityGroup: vpcEndpointSecurityGroup
    });
```

No more slinging around AMI identifiers for me - CDK can look that up for me. I map my role and security group to the new EC2 instance, choose an instance size and off we go. I can now run `cdk deploy` to build this stack in my account:

![cdk deploy](/img/blog/ssm-private-terminal/cdk-deploy.png)

After a few minutes, we are ready to try connecting to our instance. 
Navigating to the console, we can now see our EC2: 
![EC2 Instance](/img/blog/ssm-private-terminal/ec2-instance.png)

By clicking on the ***Connect*** button, we can choose to use *Session manager* to connect to our new instance:

![connect to ec2](/img/blog/ssm-private-terminal/connect.png)

And that's a wrap - hopefully this inspires you to try CDK or *Session Manager*, or better still, both! If you have any comments or feedback, do get in touch with [Mechanical Rock on LinkedIn](https://au.linkedin.com/company/mechanical-rock)


## References

* [https://github.com/MechanicalRock/cdk-ssm-private-terminal](https://github.com/MechanicalRock/cdk-ssm-private-terminal) (private bastion repository)
* [https://docs.aws.amazon.com/cdk/latest/guide/home.html](https://docs.aws.amazon.com/cdk/latest/guide/home.html)
* [https://cdkworkshop.com/](https://cdkworkshop.com) (Use this for getting started with CDK)
* [https://docs.aws.amazon.com/cdk/api/latest/versions.html](https://docs.aws.amazon.com/cdk/api/latest/versions.html) (API Guide)
* [https://au.linkedin.com/company/mechanical-rock](https://au.linkedin.com/company/mechanical-rock) (Mechanical Rock on LinkedIn)
* [https://aws.amazon.com/premiumsupport/knowledge-center/ec2-systems-manager-vpc-endpoints/](https://aws.amazon.com/premiumsupport/knowledge-center/ec2-systems-manager-vpc-endpoints/) (ClickOps Guide) 
* [Tina Turner Live at Wembley Stadium, London](https://www.youtube.com/watch?v=LLqJ_dczP0g)