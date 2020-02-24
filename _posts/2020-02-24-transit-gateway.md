---
layout: post
title:  "A DevOps Guide to AWS Transit Gateway"
date:   2020-02-24
tags: devops networking transitgateway aws
author: Marcelo Aravena
---

# A DevOps Guide to AWS Transit Gateway
![alt text](/img/transit-plane-gateway.png)
### On-Premise to Cloud Network Infrastructure Modernization

Have you ever booked a flight and found yourself making a stopover somewhere just to embark on a different flight to reach your final destination? That stopover being an airport hub in some city you had to transit through in order to get on a plane which knows or can make the final non-stop flight to your destination.  That stopover is the manifestation of AWS Transit Gateway!

It can be quite common these days to find yourself in a hybrid networking environment with your head in the clouds and your feet madly running around on earth maintaining IT Infrastructure with connectivity North-South, East-West, or you may have ended up with an expanding VPC-Peering or VPC Sharing infrastructure that resembles last nights spaghetti bolognese!  To help remove some of the complexity and overhead of managing a hybrid network infrastructure with AWS, you can modernize your networking infrastructure with AWS Transit Gateway, a Hub amd Spoke networking model making it easy to manage, monitor and maintain.

As you start making more use of AWS Cloud resources and services to help your company grow and scale, complexity will also increase.  AWS Transit Gateway's main advantage is that it allows you to scale without the complexity and administration overhead when it comes to connectivity.

Today we will focus on how to deploy an AWS Multi-Account, Muli-VPC Transit Gateway Hub and Spoke Networking solution to integrate with your On-Premise network via a VPN connection.  Workload VPC's will be isolated from each other, meaning that each Workload VPC will only be allowed to communicate with the central "Networking" Account VPC and the On-Premise network. Workload VPC Subnets will all be private, with the Networking VPC hosting private and public subnets for Egress Internet traffic. 

As a bonuse with Transit Gateway, we now get Centralized Monitoring with [Transit Gateway Network Manager](https://aws.amazon.com/transit-gateway/network-manager/) .  Providing centralized logs, Geo-location of your network connectivity  and realtime network topology maps showing connectivity status from VPN all the way down to the VPC level.  

The Architecture we are going to deploy as code(Cloudformation) is illustrated below:

![alt text](/img/TGW-Architecture.png)


### Laying down the foundations needed to build the Networking Infrastructure
The first step is to organize your AWS accounts with AWS Organizations, creating an Organization which will house the AWS accounts needed for your company to operate in the cloud. To configure this, login to your AWS Console Root/Master account and setup the account structure within an Organization.  As a minimum, you should have the following accounts members of the AWS Organization you create:
- Tooling/Build Account: Centralized CI/CD infrastructure with Codepipeline deploying Cloudformation templates across the Networking and Workload Accounts
- Networking Account: Centralized Networking Hub, hosting Transit Gateway and Egress Internet.
- Internal Sandbox Account: Experimentation account
- Internal Staging Account: End-to-End Integration tests
- Internal Production Account: Runs your application for production use
- Security Account: SIEM Infrastructure, watch this space for an AWS SIEM solution coming soon

Whilst in AWS Organizations, enable the Resource Access Manager service at the Organization level, this will allow us to deploy and share aws transit gateway resource between accounts with auto-accept, automating the process. This applies to any account that is a member of the Organization created.  You can choose to Not allow External Accounts when we create the shared resource through cloudformation. 

We are now ready to configure the build pipeline in our Build/Tooling Account to deploy our infrastructure across the accounts.  We get to adopt Pipeline-Pete's legendary Inception Pipeline. Each account will have their own cloudformation deployed from the Tooling account, utlising the cross-acount assume role for codepipeline and the Deployer role with specific permissions to create the AWS resources required. Each Workload Account will have their own account management pipeline and private code-commit repository.

### VPC CIDR and Subnet Planning

Before we start deploying the infrastucture, we need to scope out and plan the IP Ranges the VPC CIDR's will use and slice them into Subnets that align with applications architecture.  The plan is to have the on-premise network forward all traffic destined for the 10.1.0.0/16 AWS network to the VPN associated with Transit Gateway, which means we need to create all of our VPC CIDR's under 10.1.0.0/16.  To segment the 10.1.0.0/16 across our VPC's, we will use 10.1.0.0/21 for the first VPC CIDR, followed by 10.1.8.0/21 etc..  Here is the complete breakdown of VPC CIDR and Subnets.  It's important to get this right before anything is deployed, there are many online subnetting tools to help you size out what you need, or if you're an old school networking dude, 1's and 0 bit counting and masking it is! 00001010.00000001.00001000.00000000 

![alt text](/img/VPC-CIDR-Subnet.png)

We create a subnet for each availability zone to allow for high availability configuration of resources and services running inside a VPC.  In this case AWS Sydney Region (ap-southeast-2) has 3 availability zones.

You are now ready to deploy your VPC and Subnet infrastructure to all your AWS accounts.

### Transit Gateway Deployment
With the base VPC's and subnets deployed, we can now start deploying Transit Gateway resources.
#### Transit Gateway Cloudformation Snippet

    Resources:
        TransitGateway:
            Type: "AWS::EC2::TransitGateway"
            Properties:
            AmazonSideAsn: 65200
            Description: "Transit Gateway Networking between VPC and On-Prem VPN"
            AutoAcceptSharedAttachments: "enable"
            DefaultRouteTableAssociation: "disable"   
            DefaultRouteTablePropagation: "disable" 
            DnsSupport: "enable"
            VpnEcmpSupport: "enable"
            Tags:
                - Key: "Name"
                Value: "ACME Transit Gateway"
    Outputs:
        TransitGateway:
            Description: Static Transit Gateway Id
            Value: !Ref TransitGateway
            Export:
                Name: TransitGatewayId

By disabling Default Route Table Association and Propagation, you get control over which Transit Gateway Table you can associate with, allowing you to restrict workload VPC(Eg, Sandox) to communicate with other Workload VPC(Eg, Production) or other specific requirements you may have.  AutoAcceptSharedAttachments are enabled so we don't have to manually accept invitations
of shared resource for each account added to the AWS Organization Business Unit.  Choose a unique ASN number for AmazonSideAsn.  

    TGWResourceAccessShare:
        Type: AWS::RAM::ResourceShare
        DependsOn: TransitGateway
        Properties:
        AllowExternalPrincipals: false
        Name: "Transit Gateway Resource Share with ACME AWS Organization"
        ResourceArns:
            - !Sub "arn:aws:ec2:${AWS::Region}:${AWS::AccountId}:transit-gateway/${TransitGateway}"
        Principals: 
            - !Sub "arn:aws:organizations::${MasterAwsAccountId}:organization/${AwsACMEOrgId}"
        Tags:
            - Key: "Name"
            Value: "ACME Organizarion TGW Resource Share"

When sharing the Transit Gateway resource with the AWS Organization Id as the principal, all account members of the Organization you have created will automatically get access to the Transit Gateway resource in their VPC. Make sure you keep "AllowExternalPrincipals" as false, unless you really want to expose the Transit Gateway Resource to an AWS account you dont manage.

### Site to Site VPN Deployment
Now that we have a Transit Gateway in place (That was easy!), we can bring up the VPN and Customer Gateway resources on the AWS side, which will give us the option to download a configuration guide specific the on-premise VPN gateway appliance.

#### Cloudformation Snippets for Customer Gateway and Site to Site VPN
    VpnCustomerGateway:
        Type: AWS::EC2::CustomerGateway
        Properties: 
        BgpAsn: !Ref BGPASN
        IpAddress: !Ref CustomerGwIP
        Tags:
            - Key: Name
            Value: ACME VPN Customer Gateway
        Type: ipsec.1
The main configuration item for the Customer Gateway is the public facing IP Address of the on-premise gateway appliance and if you are using BGP, enter in a BGP ASN.

    VpnSiteToSiteConnection:
    Type: AWS::EC2::VPNConnection
    Properties: 
        CustomerGatewayId: !Ref VpnCustomerGateway
        StaticRoutesOnly: True
        Tags: 
        - Key: Name
            Value: VPN Connection to ACME On-Prem Datacentre
        TransitGatewayId: !ImportValue TransitGatewayId
        Type: ipsec.1
We opted here for StaticRoutes, mainly because it was the compatible with how the on-premise appliance was configured with the rest of their environment.
The VPN Site to Site configuration is what associates the VPN traffic with Transit Gateway to enable routing between AWS and your On-Premise network, in our case the 192.168.1.0/24 on-premise network. Once the VPN resource is deployed, the Transit Gateway VPN Attachment will automatically be added.  You can then download a configuration from the AWS VPC-VPN console by clicking on "Download Configuration" where you will be prompted to enter the model and release versions of your on-premise gateway appliance to assist in configuring the appliance specific to AWS requirements. 

### VPC Routing Table Configuration
The AWS Workload Account's (Sandbox, Staging, Production), will have similar VPC configurations, with the main differences being the CIDR ranges with no overlap. The AWS Networking Account VPC Configuration will be slightly different as it will be the "Internet Gateway" for the Internal Accounts, which have resources living in the private subnets only.  To save cost, we won't deploy a NAT gateway to each Workload account's private subnets, we will be using the Centralized Networking account to deploy an Internet Gateway in the public subnet and a NAT in the Private subnet.  Workload VPC's will have all traffic (0.0.0.0/0) routed to Transit Gateway and let all routing decisions be made there. With Centralized Internet Egress traffic it makes it easier to monitor and manage a single internet egress point for multiple VPC's spread across different AWS Accounts.  Because we have already shared the Transit Gateway resource from the Networking Account to all other accounts members of the same Organization Unit, we can now use the transit gateway as an option to route traffic to in the workload VPC's.  You can refer to the Architecture diagram on what routes to create for each VPC.

#### Workload VPC's Route Table Cloudformation
    TransitGatewayAttachmentVPC:
        Type: AWS::EC2::TransitGatewayAttachment
        Properties: 
        SubnetIds:
            - Fn::ImportValue:
                !Sub ${EnvironmentName}-AZ1-Subnet-Compute
            - Fn::ImportValue:
                !Sub ${EnvironmentName}-AZ2-Subnet-Compute
            - Fn::ImportValue:
                !Sub ${EnvironmentName}-AZ3-Subnet-Compute
        Tags:
            - Key: Name
            Value: !Sub ${EnvironmentName} VPC Attachment
        TransitGatewayId: !Ref TransitGatewayId
        VpcId:
            Fn::ImportValue:
            !Sub ${EnvironmentName}-VPC

    PrivateVPCInternetRoute:
        Type: AWS::EC2::Route
        DependsOn: TransitGatewayAttachmentVPC
        Properties: 
        DestinationCidrBlock: '0.0.0.0/0'
        RouteTableId:
            Fn::ImportValue: !Sub ${EnvironmentName}-VPC-PrivateRouteTable
        TransitGatewayId: !Ref TransitGatewayId
Take note that we cannot reference the Transit Gateway as a destination until the Transit Gateway VPC attachment has been successfully created, only then can a route to the central transit gateway be added to the VPC Route Table.  The VPC TGW Attachment just created in the workload account will automatically appear in the networking account transit gateway list of Attachments ready to be used as an association or propogation in the transit gateway world of routing. 

### Putting it all Together - The Magic of Transit Gateway Unleashed
Just before we jump into the final step of deploying a completely functional Hub and Spoke Network Architecture with Transit Gateway, lets make clear what Route Table Associations, 
Route Table Propagations and Transit Gateway Attachments mean and their purpose when it comes to Transit Gateway Routing Tables. 

#### Transit Gateway Attachments
For VPC Workload accounts, when we create a Transit Gateway VPC Attachment using the shared Transit Gateway resource from the Central Networking account, The VPC Attachment will automatically appear in the list of TGW Attachments.  Attachments can be generally thought of the network identifier for a network location, VPC's or VPN in our case. They can either be Added into TGW Route Tables as Associations or Propagations.

#### Route Table Associations
Transit Gateway Route Table Associations is where network traffic is initiated from(Source), but we don't use an IP Address CIDR block to define the source location, it is simply the name of the VPC or VPN Attachment. For example; if we want to create a TGW Route Table entry to route traffic from the on-premise network to a VPC in AWS, we know that the traffic would be initiated from the on-premise network 192.168.1.0/24, which AWS only knows about through the VPN Attachment, so the TGW Route Table entry would have the VPN Attachment as the Association and the VPC as the Propagation.  The source or initiator of traffic can only be associated to 1 Transit Gateway Route Table.  We will have 3 TGW Route tables in todays example.

#### Route Table Propagation
Propagation is the path your traffic needs to take to arrive at its destination. Whilst we use the name of the VPC or VPN attachment here as the destination we want to get to, Propagation will automatically workout the CIDR Block of the destination VPC Attachment and add it to the Routes config for you, which you can override with a static IP CIDR Block, But you normally would not do this for VPC destinations, but you need to do this for VPN Propagations outside of the AWS network. For example, if are wanting to get to the on-premise network 192.168.1.0/24, then we would have the VPC as the Association (where traffic is initiated from) and VPN as the Propagation (The attachement that knows how to get to where we want), followed by adding a static route IP CIDR of 192.168.1.0/24(linked to the VPN TGW Attachment Id), which is the on-premise network on the other side of the VPN and Viola! Jeff's your Uncle. 

There is also the Black Hole option when it comes to adding Static Routes to the Transit Gateway Route Table..  In our architecture, because we want to isolate Workload VPC's from each others private subnet traffic, we add TGW static routes for inter VPC traffic with Black-Hole as a destination.  

#### Transit Gateway Route Table Cloudformation
Below are Cloudformation snippets on how to deploy Transit Gateway Route tables as per the architecture diagram we have illustrated earlier on. We will need to deploy the 3 Transit Gateway Route Tables, Route Table Associations, Route Table Propagations and Routes. The naming will follow what we have in the architecture diagram. 

    VpnToVpcRouteTable:
        Type: AWS::EC2::TransitGatewayRouteTable
        Properties: 
            Tags: 
                - Key: Name
                Value: VPN to All VPC's
            TransitGatewayId: !Ref TransitGateway
Create 2 more TGW Route tables as per the Architecture diagram. 
   

#### Transit Gateway Route Table ASSOCIATIONS, Source that is initiating the network request
I have included just one of the Workload VPC Associations(Production) as an example
    NetworkingVpcToWorkloadVpc:
        Type: AWS::EC2::TransitGatewayRouteTableAssociation
        DependsOn: WorkloadVpcToNetworkingVpcRouteTable
        Properties: 
            TransitGatewayAttachmentId: !Ref NetworkingVPCAttachment
            TransitGatewayRouteTableId: !Ref NetworkingVpcToWorkloadVpcRouteTable

    VpnToAllVpc:
        Type: AWS::EC2::TransitGatewayRouteTableAssociation
        DependsOn: VpnToVpcRouteTable
        Properties: 
            TransitGatewayAttachmentId: !Ref TgwVpnAttachmentId
            TransitGatewayRouteTableId: !Ref VpnToVpcRouteTable
   
    ProductionVpcToNetworkingVpc:
        Type: AWS::EC2::TransitGatewayRouteTableAssociation
        DependsOn: WorkloadVpcToNetworkingVpcRouteTable
        Properties: 
            TransitGatewayAttachmentId: !Ref TgwProductionVpcAttachmentId
            TransitGatewayRouteTableId: !Ref WorkloadVpcToNetworkingVpcRouteTable

#### Transit Gateway Route Table PROPAGATIONS, Destination that the Associated Attachment above needs to get to
##### Networking VPC to Workload VPC TGW Route Table Propagations
Only one of the Workload VPC Attachments is shown as an example
    ProductionVpcFromNetworkingVpcPropagation:
        Type: AWS::EC2::TransitGatewayRouteTablePropagation
        Properties: 
            TransitGatewayAttachmentId: !Ref TgwProductionVpcAttachmentId
            TransitGatewayRouteTableId: !Ref NetworkingVpcToWorkloadVpcRouteTable

##### VPN to All VPC's TGW Route Table Propagations
    NetworkingVpcFromVpnPropagation:
        Type: AWS::EC2::TransitGatewayRouteTablePropagation
        Properties: 
            TransitGatewayAttachmentId: !Ref TgwNetworkingVpcAttachmentId
            TransitGatewayRouteTableId: !Ref VpnToVpcRouteTable

    ProductionVpcFromVpnPropagation:
        Type: AWS::EC2::TransitGatewayRouteTablePropagation
        Properties: 
            TransitGatewayAttachmentId: !Ref TgwProductionVpcAttachmentId
            TransitGatewayRouteTableId: !Ref VpnToVpcRouteTable

##### Workload VPC's to Networking VPC TGW Route Table Propagations
    NetworkingVpcFromWorkloadVpcPropagation:
        Type: AWS::EC2::TransitGatewayRouteTablePropagation
        Properties: 
            TransitGatewayAttachmentId: !Ref TgwNetworkingVpcAttachmentId
            TransitGatewayRouteTableId: !Ref WorkloadVpcToNetworkingVpcRouteTable

##### Static Route Definitions
    NetworkingVPCtoAcmeNet:
        Type: AWS::EC2::TransitGatewayRoute
        Properties: 
            Blackhole: false
            DestinationCidrBlock: '192.168.1.0/24'
            TransitGatewayAttachmentId: !Ref TgwVpnAttachmentId
            TransitGatewayRouteTableId: !Ref NetworkingVpcToWorkloadVpcRouteTable

    WorkloadVPCtoInternet:
        Type: AWS::EC2::TransitGatewayRoute
        Properties: 
            Blackhole: false
            DestinationCidrBlock: '0.0.0.0/0'
            TransitGatewayAttachmentId: !Ref NetworkingVPCAttachment
            TransitGatewayRouteTableId: !Ref WorkloadVpcToNetworkingVpcRouteTable

##### Disallow Workload VPC Intercommunications with Static Route using Transit Gateway Blackhole Destinations
    ProductionVpcFromWorkloadVpcBlackhole:
        Type: AWS::EC2::TransitGatewayRoute
        Properties: 
            Blackhole: true
            DestinationCidrBlock: '10.1.8.0/21'
            TransitGatewayRouteTableId: !Ref WorkloadVpcToNetworkingVpcRouteTable

#### Wrapping ia all up
We now have Transit Gateway Hub and Spoke topology deployed all as Infrastructure as Code across multiple accounts, with the Networking Account configured as the Hub.  The best part is the visibility we have over the whole network now, which is provided by Transit Gateway Network Manager.  You will notice that the topology view has an uncanny resemblance to AWS Xray.. but for networking connections from your VPN all the way to your VPC's.  You can immediately identify where the network issues are, without having to start pinging, tracerouting, digging your way through the networkings manually, realtime status of the whole network is displayed in a user friendly manner, just follow the bouncing ball.

Are you now ready to board the flight to Transit Gateway?.. Mechanical Rock have your boarding passes ready 