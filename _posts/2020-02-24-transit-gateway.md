---
layout: post
title:  "A DevOps Guide to AWS Transit Gateway"
date:   2020-02-24
tags: devops networking transitgateway aws
author: Marcelo Aravena
---

![alt text](/img/transit-plane-gateway.png)
### On-Premise to Cloud Network Infrastructure Modernization

Have you ever booked a flight and found yourself making a stopover somewhere just to embark on a different flight to reach your final destination? That stopover being an airport hub in some city you had to transit through in order to get on a plane which knows or can make the final non-stop flight to your destination.  That stopover is the manifestation of AWS Transit Gateway!

It can be quite common these days to find yourself in a hybrid networking environment with your head in the clouds and your feet madly running around on earth maintaining IT Infrastructure with connectivity North-South, East-West, or you may have ended up with an expanding VPC-Peering or VPC Sharing infrastructure that resembles last nights spaghetti bolognese!  To help remove some of the complexity and overhead of managing a hybrid network infrastructure with AWS, you can modernize your networking infrastructure with AWS Transit Gateway, a Hub and Spoke networking model making it easy to manage, monitor and maintain.

As you start making more use of AWS Cloud resources and services to help your company grow and scale, complexity will also increase.  AWS Transit Gateway's main advantage is that it allows you to scale without the complexity and administration overhead when it comes to connectivity.

Today we will focus on how to deploy an AWS Multi-Account, Muli-VPC Transit Gateway Hub and Spoke Networking solution to integrate with your On-Premise network via a VPN connection.  Workload VPCs will be isolated from each other, meaning that each Workload VPC will only be allowed to communicate with the central "Networking" Account VPC and the On-Premise network. Workload VPC Subnets will all be on private subnets, with the Networking Account VPC hosting private and public subnets for Egress Internet traffic. 

As a bonus with Transit Gateway, we now get Centralized Monitoring with [Transit Gateway Network Manager](https://aws.amazon.com/transit-gateway/network-manager/) .  Providing centralized logs, Geo-location of your network connectivity  and realtime network topology maps showing connectivity status from your VPN all the way up to the VPC level.  

The Architecture we are going to deploy as code(CloudFormation) is illustrated below:

![alt text](/img/TGW-Architecture.png)


### Laying down the foundations needed to build the Networking Infrastructure
The first step is to choose whether you want to use AWS Organizations or not.  Structure your accounts in an Organization if you want to automate the process of accepting Resource Sharing invitations when adding or removing accounts to your AWS Organization, otherwise you can manually add the AWS account Ids to allow access to the shared resource as you add and remove accounts.  Here is a sample account setup, all members of the same Organization:
- Tooling/Build Account: Centralized CI/CD infrastructure with CodePipeline deploying CloudFormation templates across the Networking and Workload Accounts
- Networking Account: Centralized Networking Hub, hosting Transit Gateway and Egress Internet for private resources.
- Internal Sandbox Account: Experimentation account
- Internal Staging Account: End-to-End Integration testing account
- Internal Production Account: Runs your application for production use
- Security Account: SIEM Infrastructure account, watch this space for an AWS SIEM solution coming soon

If you chose to use AWS Organizations, enable the Resource Access Manager service at the Organization level. This will allow us to deploy and share the AWS Transit Gateway resource to accounts with auto-accept, automating the process. This applies to any account that is a member of the Organization created.  You can choose to not allow external accounts when we create the shared resource through CloudFormation. 

We are now ready to configure the build pipeline in our Build/Tooling Account to deploy our infrastructure across the accounts.  We get to adopt Mechanical Rock's Pipeline-Pete's Inception Pipeline. Each account will have their own CloudFormation deployed from the Tooling account, utilising the cross-acount assume role for CodePipeline and the Deployer role with specific permissions to create the AWS resources required. Each Workload Account will have their own account management pipeline and private CodeCommit repository.

### VPC CIDR and Subnet Planning

Before we start deploying the infrastructure, we need to scope out and plan the IP Ranges the VPC CIDRs will use and slice them into subnets that align with the applications architecture.  The plan is to have the on-premise network forward all traffic destined for the 10.1.0.0/16 AWS network to the VPN associated with Transit Gateway, which means we need to create all of our VPC CIDRs under 10.1.0.0/16.  To segment the 10.1.0.0/16 across our VPCs, we will use 10.1.0.0/21 for the first VPC CIDR, followed by 10.1.8.0/21 etc..  Here is the complete breakdown of VPC CIDR and Subnets.  It's important to get this right before anything is deployed, there are many online subnetting tools to help you size out what you need, or if you're an old school networking dude, 1s and 0s bit counting and masking it is! 00001010.00000001.00001000.00000000 

![alt text](/img/VPC-CIDR-Subnet.png)

We create a subnet for each availability zone to give us high availability of the resources and services running inside a VPC.  In this case AWS Sydney Region (ap-southeast-2) has 3 availability zones.

You are now ready to deploy your VPC and Subnet infrastructure to all of your AWS accounts.

### Transit Gateway Deployment
With the base VPCs and subnets deployed, we can now start deploying Transit Gateway resources.
#### Transit Gateway CloudFormation Snippet

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

By disabling Default Route Table Association and Propagation, you get control over which Transit Gateway Route Table you can associate with, allowing you to implement custom rules and routing requirements.  AutoAcceptSharedAttachments are enabled so we don't have to manually accept invitations
of a shared resource.  Choose a unique ASN number for AmazonSideAsn.  

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

When sharing the Transit Gateway resource with the AWS Organization Id as the principal, all accounts which are members of the Organization you have created will automatically get access to the Transit Gateway resource in their VPC. Make sure you keep "AllowExternalPrincipals" as false, unless you really want to expose the Transit Gateway Resource to an AWS account you don't manage.

### Site-to-Site VPN Deployment
Now that we have a Transit Gateway in place (That was easy!), we can bring up the VPN and Customer Gateway resources on the AWS side.  Just a heads up on the behaviour of the Site-to-Site VPN connection with AWS, if there is no traffic over a period of time, the tunnel will go down, so as traffic starts to come through the VPN again, and the tunnel is down due to no activity, there will be a lag of about 15 seconds as the tunnel comes back online.  If your application is sensitive to this initial lag, you should be able to configure keepalive packets from the on-premise gateway to be more frequent so the tunnel does not go down - anything lower than 10 seconds should be fine.

#### CloudFormation Snippets for Customer Gateway and Site-to-Site VPN
    VpnCustomerGateway:
        Type: AWS::EC2::CustomerGateway
        Properties: 
        BgpAsn: !Ref BGPASN
        IpAddress: !Ref CustomerGwIP
        Tags:
            - Key: Name
            Value: ACME VPN Customer Gateway
        Type: ipsec.1

The main configuration item for the Customer Gateway is the public facing IP Address of the on-premise gateway appliance. If you are using BGP, enter in a BGP ASN.

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

We opted here for static routes, mainly because it was compatible with how the on-premise appliance was configured with the rest of the environment.  The VPN Site-to-Site configuration is what associates the VPN traffic with Transit Gateway to enable routing between AWS and your On-Premise network, in our case the 192.168.1.0/24 on-premise network. Once the VPN resource is deployed, the Transit Gateway VPN Attachment will automatically be added.  You can then download a configuration from the AWS VPC-VPN console by clicking on "Download Configuration" where you will be prompted to enter the model and release versions of your on-premise gateway appliance to assist in configuring it specific to AWS requirements. 

### VPC Routing Table Configuration
The AWS Workload Accounts (Sandbox, Staging, Production) will have similar VPC configurations, with the main differences being the CIDR ranges will not overlap. The AWS Networking Account VPC Configuration will be slightly different as it will be the "Internet Gateway" for the internal accounts, which have resources living only in private subnets.  To save cost, we won't deploy a NAT gateway to each Workload account's private subnets, we will be using the Centralized Networking account to deploy an Internet Gateway in the public subnet and a NAT in the Private subnet.  Workload VPCs will have all traffic (0.0.0.0/0) routed to Transit Gateway and let all routing decisions be made there. By having centralised internet egress traffic, it makes it easier to monitor and manage egress traffic for multiple VPCs spread across different AWS Accounts.  Because we have already shared the Transit Gateway resource from the Networking Account to all other accounts that are members of the same AWS Organization, we can now use the transit gateway as an option to route traffic on the workload VPCs.  You can refer to the Architecture diagram on what routes to create for each VPC.

#### Workload VPCs Route Table CloudFormation
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

Take note that we cannot reference the Transit Gateway as a destination until the Transit Gateway VPC attachment has been successfully created, only then can a route to the central transit gateway be added to the VPC Route Table.  The VPC TGW Attachment just created in the workload account will automatically appear in the networking account transit gateway list of attachments ready to be used as an association or propagation in the transit gateway world of routing. 

### Putting it all Together - The Magic of Transit Gateway Unleashed
Just before we jump into the final step of deploying a functional Hub and Spoke Network Architecture with Transit Gateway, lets make clear what Route Table Associations, Route Table Propagations and Transit Gateway Attachments mean and their purpose in life when it comes to Transit Gateway Routing Tables.  If you have read other transit gateway documentation which makes reference to Route Domains, it is essentially the transit gateway route table.  

#### Transit Gateway Attachments
For the VPC Workload accounts, when we create a Transit Gateway VPC Attachment which references the shared Transit Gateway resource, The VPC Attachment will automatically appear in the list of TGW Attachments in the Networking account.  Attachments can be generally thought of the network identifier for a network location, VPCs or VPN in our case. They can either be Added into TGW Route Tables as Associations or Propagations.

#### Route Table Associations
A Transit Gateway Route Table Association is where network traffic is initiated from(Source), but we don't use an IP Address CIDR block to define the source location, it is simply the name of the VPC or VPN Attachment. For example; if we want to create a TGW Route Table entry to route traffic from the on-premise network to a VPC in AWS, we know that the traffic would be initiated from the on-premise network 192.168.1.0/24, which AWS only knows about through the VPN Attachment, so the TGW Route Table entry would have the VPN Attachment as the Association and the VPC as the Propagation.  The source or initiator of traffic can only be associated to 1 Transit Gateway Route Table.  We will have 3 TGW Route tables in our deployment.

#### Route Table Propagation
Propagation is the path or next hop your traffic needs to take to arrive at its destination.  Once we add the VPC or VPN attachment to the TGW Route Table as a Propagation, the CIDR Block of the destination VPC Attachment will be automatically added to the Routes column as a propagated route, which you can override with a static IP CIDR Block destination, but you normally would not do this for VPC destinations, although you need to do this for VPN Propagations outside of the AWS network.  For example, if we are wanting to get to the on-premise network 192.168.1.0/24 from an AWS VPC, we would have the VPC as the Association (where traffic is initiated from) and VPN as the Propagation (The attachment that knows how to get to 192.168.1.0/24), followed by adding a static route for 192.168.1.0/24, which is linked to the VPN TGW Attachment Id and Viola! Jeff's your Uncle. 

There is also the Black Hole option when it comes to adding Static Routes to the Transit Gateway Route Table.  In our architecture, because we want to isolate Workload VPCs from each other, we add TGW static routes for inter Workload-VPC traffic with Black-Hole as a destination.  

#### Transit Gateway Route Table CloudFormation
Below are CloudFormation snippets on how to deploy Transit Gateway Route tables as per the architecture diagram illustrated earlier on. We will need to deploy the 3 Transit Gateway Route Tables, Route Table Associations, Route Table Propagations and Routes. The naming will follow what we have in the architecture diagram. 

    VpnToVpcRouteTable:
        Type: AWS::EC2::TransitGatewayRouteTable
        Properties: 
            Tags: 
                - Key: Name
                Value: VPN to All VPCs
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

    ProductionVpcFromNetworkingVpcPropagation:
        Type: AWS::EC2::TransitGatewayRouteTablePropagation
        Properties: 
            TransitGatewayAttachmentId: !Ref TgwProductionVpcAttachmentId
            TransitGatewayRouteTableId: !Ref NetworkingVpcToWorkloadVpcRouteTable

##### VPN to All VPCs TGW Route Table Propagations
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

##### Workload VPCs to Networking VPC TGW Route Table Propagations
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

##### Disallow Workload VPC Intercommunication with Static Route using Transit Gateway Blackhole Destinations
    ProductionVpcFromWorkloadVpcBlackhole:
        Type: AWS::EC2::TransitGatewayRoute
        Properties: 
            Blackhole: true
            DestinationCidrBlock: '10.1.8.0/21'
            TransitGatewayRouteTableId: !Ref WorkloadVpcToNetworkingVpcRouteTable

#### Wrapping it all up
We now have a Transit Gateway Hub and Spoke architecture deployed using Infrastructure as Code, with the Networking Account configured as the Hub.  The best part is the visibility we now have over the whole network, which is provided by Transit Gateway Network Manager.  You will notice that the topology view has an uncanny resemblance to AWS X-Ray.. but for networking connectivity of your VPN all the way to your VPCs.  Identifying network issues will not be as arduous with realtime status of the whole network displayed in a user friendly manner - just follow the bouncing packet.

Are you ready to board the flight to Transit Gateway?.. Mechanical Rock have your boarding passes ready at [Mechanical Rock Ticketing](https://www.mechanicalrock.io/lets-get-started/)