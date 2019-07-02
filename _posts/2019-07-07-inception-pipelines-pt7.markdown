---
layout: post
title:  "Seeds of Inception - Part 7"
date:   2019-07-07
tags: AWS Organizations CloudTrail S3 KMS IAM
author: Pete Yandell
image: img/inception-pipelines/seed_germination.png
---

**Part 7 Global CloudTrail** - A practical example for auditing your AWS infrastructure

<!-- markdownlint-disable MD033 -->
<link rel = "stylesheet"
   type = "text/css"
   href = "{{ site.url }}/img/inception-pipelines/part-7/carousel.css" />

![trail]({{ site.url }}/img/inception-pipelines/part-7/cover.jpg)

Hi, I'm Pipeline Pete and I welcome you to "AWS things you should know about but don't". In this lesson we'll learn how to enable [AWS CloudTrail](https://aws.amazon.com/cloudtrail/) at the [AWS Organizations](https://aws.amazon.com/organizations/) level so that you never have to think about setting it up again (or live with that perpetual niggling fear that someone has tampered with it inside your account).

Typically you'll see [AWS CloudTrail](https://aws.amazon.com/cloudtrail/) enabled within an account and recording events into an [S3 Bucket](https://aws.amazon.com/s3/). When it is done this way though, there is always a possibility that a rogue actor, with the right permissions, can tamper with it. However [AWS CloudTrail](https://aws.amazon.com/cloudtrail/) can also be enabled through [AWS Organizations](https://aws.amazon.com/organizations/). This means you can pick your Security/Audit account to receive **ALL** the trail events and the individual accounts don't get a chance to tamper with them as they never see the trail. You even get the additional benefit that any new accounts that get added to your [AWS Organizations](https://aws.amazon.com/organizations/) automatically start recording events into the bucket.

When I asked around about this feature no one else knew about it! Big shout out to [James](https://www.linkedin.com/in/jamesbromberger) for pointing me in the right direction!

## Prerequisites

These are the bits you'll need before we get started:

1. An AWS Account to host your [AWS CloudTrail](https://aws.amazon.com/cloudtrail/) events. Typically, this is your Security/Audit account, but you can do all of this in the same account.
2. [AWS Organizations](https://aws.amazon.com/organizations/) enabled on your account.
3. An Inception Pipeline deployed into your Security/Audit account. We'll cover this in the next section below.

## Deploying the pipeline

Before you can enable your Organizational [CloudTrail](https://aws.amazon.com/cloudtrail/) you need to first deploy a couple of pieces of infrastructure. These are an [S3](https://aws.amazon.com/s3/) bucket to store the events in and a [KMS](https://aws.amazon.com/kms/) key to protect them. To get you started I've prepared an Inception Pipeline for you to deploy. If you've never deployed one before, I highly recommend reading my original post - ["Seeds of Inception - Seeding your Account with an Inception Pipeline"](https://mechanicalrock.github.io/2018/03/01/inception-pipelines-pt1.html).

**Warning!** Unlike most AWS services, to enable [CloudTrail](https://aws.amazon.com/cloudtrail/) to write to the [S3 bucket](https://aws.amazon.com/s3/) and use the [KMS key](https://aws.amazon.com/kms/) these resources need to be created in North Virginia. This means you must create the pipeline below in `us-east-1`.

1. Checkout the code [from here](https://github.com/MechanicalRock/InceptionPipeline/tree/post/part-7).
2. Change all the Inception Pipeline values in the `aws_seed.json` and `aws_seed-cli-parameters.json` files to your specific values. See the [original post](https://mechanicalrock.github.io/2018/03/01/inception-pipelines-pt1.html) if you need a refresher on how to do this.
3. Open the `infrastructure/capability-global-cloudtrail.json` and set the following values:

    | Name                                          | Description                                                                                                                                       |
    | --------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
    | ParamBucketPrefix                             | A prefix for the bucket used to store the CloudTrail logs. A value of `-cloudtrail` is appended to this name to form the complete bucket name.    |
    | ParamKmsKeyAlias                              | A human friendly alias for the KMS key used to protect the files stored in S3.                                                                    |
    | ParamMasterAccount                            | The 12-digit AWS Account Id of your AWS Organizations' master account. It is used to grant the appropriate levels of access between the accounts. |
    | ParamTransitionLogsToGlacierAfterThisManyDays | To save on storage costs, move files older than this many days to Glacier storage. Defaults to 14 days.                                           |
    | ParamExpireLogsFromGlacierAfterThisManyDays   | To save on storage costs, delete files older than this many days from Glacier. Defaults to approximately 6 months (180 days).                     |

4. Deploy the pipeline and wait for it to complete. Once it has you will need to extract the following values from the infrastructure stack. These will be used when configuring the CloudTrail trail in the next section:

    | Name       | Description                                                       |
    | ---------- | ----------------------------------------------------------------- |
    | BucketName | The complete name of the S3 bucket where we are storing the logs. |
    | KmsKeyArn  | The KMS Key ARN to use to encrypt the logs.                       |

## Enable AWS Organizations Global CloudTrail

Now that the underlying infrastructure is deployed, we can start on ~~world domination~~ configuring Global [CloudTrail](https://aws.amazon.com/cloudtrail/)! Since this is a once-off activity it is easier and quicker to deploy via the console; one of the ultra-rare times that I will use the console for deployments.

<div class="outer-wrapper">
  <input checked type="radio" name="slider" id="slide1" />
  <input type="radio" name="slider" id="slide2" />
  <input type="radio" name="slider" id="slide3" />
  <input type="radio" name="slider" id="slide4" />
  <input type="radio" name="slider" id="slide5" />
  <input type="radio" name="slider" id="slide6" />
  <input type="radio" name="slider" id="slide7" />

  <div class="slider-wrapper">
    <div class="inner">
      <articlecarousel>
        <a target="step-01" href="{{ site.url }}/img/inception-pipelines/part-7/step-01.png"><img src="{{ site.url }}/img/inception-pipelines/part-7/step-01.png" /></a>
        <div class="content">
          <h3>Step 1</h3>
          <p>The first two steps enable Trusted Access between AWS Organizations and CloudTrail.</p>
          <ol>
            <li>Log into the Master AWS account</li>
            <li>Navigate to AWS Organizations</li>
            <li>Click Settings on the far right of the screen</li>
            <li>Scroll down to Trusted Access for AWS Services</li>
            <li>Click the Enable access button</li>
          </ol>
        </div>
      </articlecarousel>
      <articlecarousel>
        <a target="step-02" href="{{ site.url }}/img/inception-pipelines/part-7/step-02.png"><img src="{{ site.url }}/img/inception-pipelines/part-7/step-02.png" /></a>
        <div class="content">
          <h3>Step 2</h3>
          <ol>
            <li>Click the Enable access for AWS CloudTrail</li>
            <li>You can now create an Organizational-wide global CloudTrail trail</li>
          </ol>
        </div>
      </articlecarousel>
      <articlecarousel>
        <a target="step-03" href="{{ site.url }}/img/inception-pipelines/part-7/step-03.png"><img src="{{ site.url }}/img/inception-pipelines/part-7/step-03.png" /></a>
        <div class="content">
          <h3>Step 3</h3>
          <p>Now that Trusted Access has been enabled, click the AWS CloudTrail link to open the CloudTrail console.</p>
        </div>
      </articlecarousel>
      <articlecarousel>
        <a target="step-04" href="{{ site.url }}/img/inception-pipelines/part-7/step-04.png"><img src="{{ site.url }}/img/inception-pipelines/part-7/step-04.png" /></a>
        <div class="content">
          <h3>Step 4</h3>
          <p><strong>Note: </strong> Remember you need to be in the North Virginia region. Please check that you are and then click the Create Trail button to go to the Create Trail form.</p>
        </div>
      </articlecarousel>
      <articlecarousel>
        <a target="step-05" href="{{ site.url }}/img/inception-pipelines/part-7/step-05.png"><img src="{{ site.url }}/img/inception-pipelines/part-7/step-05.png" /></a>
        <div class="content">
          <h3>Step 5</h3>
          <p>Complete the form as per the screen capture above. The specific fields you will need values for are:</p>
          <ul>
            <li>The name for the Trail you are about to create</li>
            <li>The name of the S3 Bucket in the Security/Audit account</li>
            <li>The full ARN of the KMS key in the Security/Audit account</li>
          </ul>
          <p><strong>Watch Out!</strong> Make sure that all radio buttons match the values in the screen capture.</p>
        </div>
      </articlecarousel>
      <articlecarousel>
        <a target="step-06" href="{{ site.url }}/img/inception-pipelines/part-7/step-06.png"><img src="{{ site.url }}/img/inception-pipelines/part-7/step-06.png" /></a>
        <div class="content">
          <h3>Step 6</h3>
          <p>The trail has now been created. Trail events will now start collecting in the S3 bucket.</p>
        </div>
      </articlecarousel>
      <articlecarousel>
        <a target="step-07" href="{{ site.url }}/img/inception-pipelines/part-7/step-07.png"><img src="{{ site.url }}/img/inception-pipelines/part-7/step-07.png" /></a>
        <div class="content">
          <h3>Step 7</h3>
          <p>Navigate across to the Security/Audit Account and take a look in the S3 bucket. You should start to see paths matching all your accounts! Drill down further to see the actual logs files.</p>
        </div>
      </articlecarousel>
    </div>
  </div>
  <!-- .slider-wrapper -->

  <div class="slider-prev-next-control">
    <label for="slide1"></label>
    <label for="slide2"></label>
    <label for="slide3"></label>
    <label for="slide4"></label>
    <label for="slide5"></label>
    <label for="slide6"></label>
    <label for="slide7"></label>
  </div>
  <!-- .slider-prev-next-control -->

  <div class="slider-dot-control">
    <label for="slide1"></label>
    <label for="slide2"></label>
    <label for="slide3"></label>
    <label for="slide4"></label>
    <label for="slide5"></label>
    <label for="slide6"></label>
    <label for="slide7"></label>
  </div>
  <!-- .slider-dot-control -->

</div>

**Reminder** I took hi-resolution images of each step. If you can't make out what to do in each step, click the screenshot and it will open in a new tab.

<!-- markdownlint-disable MD033 -->
<p style="font-size: 0.9rem;font-style: italic;"><a href="https://www.flickr.com/photos/31367449@N00/3559717771">"Upward and Onward"</a><span>by <a href="https://www.flickr.com/photos/31367449@N00">Daniel Imfeld</a></span> is licensed under <a href="https://creativecommons.org/licenses/by-nc-sa/2.0/?ref=ccsearch&atype=html" style="margin-right: 5px;">CC BY-NC-SA 2.0</a><a href="https://creativecommons.org/licenses/by-nc-sa/2.0/?ref=ccsearch&atype=html" target="_blank" rel="noopener noreferrer" style="display: inline-block;white-space: none;opacity: .7;margin-top: 2px;margin-left: 3px;height: 22px !important;"><img style="height: inherit;margin-right: 3px;display: inline-block;" src="https://search.creativecommons.org/static/img/cc_icon.svg" /><img style="height: inherit;margin-right: 3px;display: inline-block;" src="https://search.creativecommons.org/static/img/cc-by_icon.svg" /><img style="height: inherit;margin-right: 3px;display: inline-block;" src="https://search.creativecommons.org/static/img/cc-nc_icon.svg" /><img style="height: inherit;margin-right: 3px;display: inline-block;" src="https://search.creativecommons.org/static/img/cc-sa_icon.svg" /></a></p>
