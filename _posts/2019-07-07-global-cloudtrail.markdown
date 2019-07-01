---
layout: post
title:  "Enabling your Global CloudTrail"
date:   2019-07-07
tags: AWS Organizations CloudTrail S3 KMS IAM
author: Pete Yandell
image: img/global-CloudTrail/cover.png
---

<!-- markdownlint-disable MD033 -->
<link rel = "stylesheet"
   type = "text/css"
   href = "{{ site.url }}/img/global-CloudTrail/carousel.css" />

**Global CloudTrail** - A practical example for protecting your AWS infrastructure

Welcome everyone to "AWS things you should know but didn't". In this lesson we'll learn how to enable CloudTrail at the AWS Organisations level so that you never have to think about setting iup again (or live with the fear that someone has tampered with it inside the Account).

Typically CloudTrail is enalbe within an account and records records into a bucket. When this is done though, there is always to posibility that a rogue actor has managed to tamper with it. However when CloudTrail is enabled at the Organiatrion level, you can pick your seciurity account to receive ALL the delicious events and the indeividual accounts dont get a chance to tamper with them. You even get the additimal juicy benefit that any new organisations that come along automatically start recording events into the bucket.

And now the icing on the cake? Setting it all up takes less time that reading down to this line. Don't believe me? Prepare to be proven wrong!

## Prerequisites

1. An AWS Account to host your CloudTRail events. Typically this is your Security or Audit account
2. An Inception Pipeline deployed into the above account. We'll be adding code to this shortly.
3. AWS Organisations enabled on your master account.

All the above is possible to run from within a single account if that's all you have.

## Getting Started

Before you can enable your GLobal CloudTrail you need to define a couple of pieces of infrastructure. I've preprepared an InceptionPipeline for you that you can checkout and run (once you've updated a few values)

1. Checkout the code from here [TODO]().
2. Check the seed values. See the oroginal Inceptionpipeline post here for how to do it.
3. Open the `capability-global-cloudtrail.json` and set the following values:

    | Name | Description |
    | ---- | ----------- |
    | TODO | TODO        |

4. Deploy the pipeline and wait for it to complete. Once it has you will need to extract the following values from the infrastruture stack.

    | Name | Description |
    | ---- | ----------- |
    | TODO | TODO        |

## Into the Meaty bits!

Now that the infrascture is all in place, we can start on ~~world domination~~ configuring GLobal CloudTrail.

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
        <img src="{{ site.url }}/img/global-CloudTrail/step-01.png" />
        <div class="content">
          <h3>Step 1</h3>
          <p>The two steps enable Trusted Access between AWS Organisations and CloudTrail.</p>
          <ol>
              <li>Log into the Root account</li>
              <li>Navigate to AWS Organisation</li>
              <li>Click Settings on the far right of the screen</li>
              <li>Scroll down to Trusted access for AWS Services</li>
              <li>Click the Enable access button.</li>
          </ol>
        </div>
      </articlecarousel>

      <articlecarousel>
        <div class="info top-left"><h3>Step 2</h3></div>
        <img src="{{ site.url }}/img/global-CloudTrail/step-02.png" />
        <div class="content">
            <ol>
                <li>Click the Enable access for AWS CloudTrail</li>
                <li>You can now create a global CloudTrail trail</li>
            </ol>
        </div>
      </articlecarousel>

      <articlecarousel>
        <div class="info top-left"><h3>Step 3</h3></div>
        <img src="{{ site.url }}/img/global-CloudTrail/step-03.png" />
        <div class="content">
          <p>Now that Trusted Access has been enabled, click the AWS CloudTrail link to open the CloudTrail console.</p>
        </div>
      </articlecarousel>

      <articlecarousel>
        <div class="info top-left"><h3>Step 4</h3></div>
        <img src="{{ site.url }}/img/global-CloudTrail/step-04.png" />
         <div class="content">
            <p>Click Create Trail button to go to the Create Trail form.</p>
        </div>
      </articlecarousel>

      <articlecarousel>
        <div class="info top-left"><h3>Step 5</h3></div>
        <img src="{{ site.url }}/img/global-CloudTrail/step-05.png" />
        <div class="content">
          <p>Complete the form as per the screen capture above. The specific fields you will need values for are:</p>
          <ul>
              <li>The name for the Trail you are about to create</li>
              <li>The name of the bucket in the Security account</li>
              <li>The full ARN of the KMS key in the Security account</li>
          </ul>
          <p><strong>Watch Out!</strong> Make sure that all radio buttons match the values in the screen capture.</p>
        </div>
      </articlecarousel>

      <articlecarousel>
        <div class="info top-left"><h3>Step 6</h3></div>
        <img src="{{ site.url }}/img/global-CloudTrail/step-06.png" />
        <div class="content">
          <p>The trail has now been created. Trail events will now start collecting in the Security account's S3 bucket</p>
        </div>
      </articlecarousel>

      <articlecarousel>
        <div class="info top-left"><h3>Step 7</h3></div>
        <img src="{{ site.url }}/img/global-CloudTrail/step-07.png" />
        <div class="content">
          <p>Navigate across to the Security Account and take a look in the S3 bucket. You should start to see paths matching all your accounts! Drill down further to see the actual logs files.</p>
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
