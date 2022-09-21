---
layout: post
font: serif
title: HVR and HVA
date: 2022-08-08
highlight: monokai
author: Matt Carter, Jack Menzie, Leon Ticharwa
image: /img/blog/hvr-and-hva/banner.jpg
tags: hvr hva data replication
---

# HVR and HVA

## HVR

![Architecture](/img/blog/hvr-and-hva/hvr-architecture.png)

### HVR Hub Machine

### Change Data Capture

HVR and HVA utilise a log-based Change Data Capture (**CDC**) method to replicate data between both heterogeneous and homogeneous databases. A log-based capturing method involves maintaining a transaction log that records the content and metadata of a database, in which only incremental changes are replicated from source to target after the initial synchronisation of data. Through utilisation of a log-based CDC method, the following benefits are achieved:

- Low latency
- No requirements required for changes to made either programmatically or to the schema of databases
- Minimal impact to the database itself

These features allow replication to take place between multiple highly distributed systems with impressive speeds, via multiple different replication topologies options.

### Topologies

There are multiple replication topologies that are supported for use with HVR. The replication topologies include the following:

- Uni-directional (one-to-one)
  This topology is used in scenarios where one would like to offload reporting, feed data into a data lake or to populate data warehouses

- Broadcast (one-to-many)
  This topology involves one source location and multiple target locations, this topology may be used for cloud solutions targeting both a file based data lake such as S3 as well as a relational database such as Snowflake.

- Consolidation (many-to-one)
  This Topology involves multiple source locations consolidating data into a single target location.

- Cascading (one-to-one-to-many)
  This involves a source location pushing data to a target location that acts as a source location distributing data to multiple targets.

- Bi-directional (active-active)
  In this topology data is replicated in both directions and modified on both sides. It is referred to as an active/active scenario because the two sides are kept in sync. HVR employs the use of collision detection and loop-back detection to protect the integrity of the data

- Multi-directional
  Multi-directional replication involves more than two locations that are in an active-active replication setup.

### Agents, Source Machines and Target Machines

On each source/target machine (database, data warehouse or file) an agent can be installed and configured. The agent performs the capturing/integration of data that is consumed/processed by the HVR Hub Machine.
The option to go agentless also exists, in which the HVR Hub Machine accesses a remote database/data warehouse via a DBMS protocol. This is generally not recommended due to the following key benefits provided by utilising the agent:

- Reduction in network costs, distribution of CPU load and capturing of changes direct from DBMS logs
- Compression of data before prior to sending to the hub, resulting in significant bandwidth savings (in ratios of up to 10x)
- Secure and consistent connections that utilise encryption and authentication

### User Interface and Rest API

The two main methods in which a user can interact with the HVR Hub Server are Web UI and Remote CLI.
The Web UI provides the means to visualise and control the replication process via a dashboard.

The CLI can be accessed on the hub machine or from a remote machine provided there exists an HVR installation on the remote machine.
In addition to the Web UI and CLI there exists a Rest API that can be used to build custom interactions in any programming language.

## HVA

### Overview

High Volume Agent (HVA) is the marriage of HVR’s replication capabilities with Fivetran’s ease of use. HVR was recently acquired by Fivetran, and in line with Fivetran’s objectives, HVA hopes to house its replication technology within Fivetran’s core product. Presently, HVA is an enterprise ready Fivetran connector for Oracle and MySQL. The throughput of this replication is a staggering 10+ mB/s. The major use case for this tool is for enterprise companies that produce a large amount of data or have large amounts of historical data, that wish to transport its data and leverage one of the many cloud based storage solutions Fivetran integrates with.

### Issues solved by HVA

- Faster and higher volume replication
- Major compute impacts of replication
- Complicated process of replication

HVA seeks to tackle both of these issues in the data space. Data collection is ever increasing and enterprises today are racing to leverage their own data. Thus, speed and volume of replication are two metrics paramount to success in this race. Both of which are provided by HVA. With more than 10 mB/s being replicated a second, HVA is a leader in both speed and volume. In addition, the utilisation of change data capture, reading only the changes made to a database, means that the database isn’t directly queried. Similar to HVR, HVA leverages the database’s change data capture transaction logs to do this. This avoids querying the database for incremental loads, and the compute load on the database itself is minimised. Finally, HVA is a simple tool to use. In both setup and use, Fivetran relative to other products minimises the typically verbose and drawn out process of setting up a replication service. Once HVA’s agent is set up, it can easily be plugged into your Fivetran account and thus its numerous destination options.

### Setup

![Architecture](/img/blog/hvr-and-hva/hva-architecture.png)

HVA uses an agent-based approach in which an ‘agent’ is installed on the database server. This is due to HVA’s need to read the change data capture transaction logs.

The setup for an Oracle Database is relatively simple. HVA currently supports Generic Oracle and Oracle RAC services. The setup follows these high level steps:

- Choose and configure the type of connection to the source database. These options include:
  - Direct
  - SSH tunnel
  - AWS PrivateLink
- Setup a read-only access User for Fivetran’s agent
- Configure Archivelog Mode, Supplemental logging and Configure Direct - Capture to be enabled.
- Install and configure the HVA Agent
- Start the HVA Agent

A complete setup guide can be found here: https://fivetran.com/docs/databases/oracle/oracle_hva/setup-guide

Once this is complete, a connector can be added to your Fivetran account via the dashboard or dashboard.

## Use Cases (based on Oracle databases)

It is recommended that HVR and HVA should only be utilised where databases store more than 1TB of data, process more than 400GB of change data volume per day and throughput greater than 10mB/s is required. Additionally, an agent must be installed on the source location if HVA is preferred whereas it is an optional install when using HVR. HVR also provides real-time replication and the ability to compare/repair between source and target locations.

## Resources

https://fivetran.com/docs/hvr6
