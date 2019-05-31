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

TODO - Give a bit of a spiel around why this is a good thing and why you should do it.
Maybe mention that this doesn't well known?

<div class="outer-wrapper">
  <input checked type="radio" name="slider" id="slide1" />
  <input type="radio" name="slider" id="slide2" />
  <input type="radio" name="slider" id="slide3" />
  <input type="radio" name="slider" id="slide4" />
  <input type="radio" name="slider" id="slide5" />

  <div class="slider-wrapper">
    <div class="inner">

      <articlecarousel>
        <div class="info top-left"><h3>Step 1</h3></div>
        <img src="{{ site.url }}/img/global-CloudTrail/step-01.png" />
        <div class="content">
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
            <ol>
                <li>Click the AWS CloudTrail link to open the CloudTrail console.</li>
            </ol>
        </div>
      </articlecarousel>

      <articlecarousel>
        <div class="info top-left"><h3>Step 4</h3></div>
        <img src="{{ site.url }}/img/global-CloudTrail/step-04.png" />
         <div class="content">
            <ol>
                <li>Click Create Trail button to go to the Create Trail form.</li>
            </ol>
        </div>
     </articlecarousel>

      <articlecarousel>
        <div class="info top-left"><h3>Step 5</h3></div>
        <img src="{{ site.url }}/img/global-CloudTrail/step-05.png" />
        <div class="content">
            <ol>
                <li>Complete the form as per the screen capture to the left. The specific fields you will need values for are:
                    <ul>
                        <li>The name for the Trail you are about to create</li>
                        <li>The name of the bucket in the Security account</li>
                        <li>The full ARN of the KMS key in the Security account</li>
                    </ul>
                </li>
                <li>Make sure that all radio buttons match the values in the screen capture.</li>
            </ol>
        </div>
      </articlecarousel>

      <articlecarousel>
        <div class="info top-left"><h3>Step 6</h3></div>
        <img src="{{ site.url }}/img/global-CloudTrail/step-06.png" />
        <div class="content">
            <ol>
                <li>The trail has now been created.</li>
                <li>Trail events will now start collecting in the Security account's S3 bucket</li>
            </ol>
        </div>
      </articlecarousel>

      <articlecarousel>
        <div class="info top-left"><h3>Step 7</h3></div>
        <img src="{{ site.url }}/img/global-CloudTrail/step-07.png" />
        <div class="content">
            <ol>
                <li>Navigate into the Security Account and look in the S3 bucket you should start to see paths matching all your accounts.</li>
                <li>Drill down further to see the actual logs files.</li>
            </ol>
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