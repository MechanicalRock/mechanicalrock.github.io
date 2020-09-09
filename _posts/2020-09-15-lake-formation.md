---
layout: post
title: Lake Formation
date: 2020-09-15
tags: aws cloudformation lakeformation glue data
image: img/../.jpg
author: Zainab Maleki, Simon Bracegirdle
---
<!-- <center><img src="/img/kinesis-analytics/realize-real-time-analytics.jpg" /></center><br/> -->

## Introduction

If you're building a data platform for your organisation, you may be wondering how to make data in one business area accessible to other areas. You want the technology to support the way your organisation works, or to even enable improvements in how you work.

*(Drawing around sharing of data here)*

But how can we achieve this in the context of a data lake built on AWS?

AWS Glue is a managed service that enables crawling of data repositories to help assemble a data catalog, as well as providing tools for Extract, Transform and Load (ETL). But, one of the challenges with using AWS Glue is sharing the data catalog and the underlying repositories amongst AWS accounts.

This is where AWS Lake Formation can step in. AWS Lake Formation is another managed service that builds upon the capabilities of AWS Glue. What it offers is streamlining access management and enable easier cross-account sharing of resources.

If that sounds like something that can be of use to you, then please keep reading. We'll go though the steps of setting up a cross-account resource sharing scenario with AWS LakeFormation.


## Scenario overview

e.g. What problem are solving? What are we building? Architecture diagram

## Establish our source lake

e.g. Source bucket, sample data, crawler. Introduction to some Lake Formation basic concepts.

## Cross-account grant

e.g. create grant, look at RAM etc

## Query/ETL in target lake

e.g. local lake grants, ETL Job/Athena integration etc

## Summary

e.g. What did we build? What did we learn? How would we summarise our view of Lake Formation?
