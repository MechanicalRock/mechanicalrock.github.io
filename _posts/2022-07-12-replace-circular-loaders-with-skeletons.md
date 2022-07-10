---
layout: post
font: serif
title: "Why Skeleton Loaders are better than Circular Loaders"
description: "Since ajax was introduced we've been firmiliar with circular loading spinners, dot-dot-dot animations, crazy logo transitions and more, all in place to distract the user while the application requests more data to present to the user."
date: 2022-07-12
highlight: monokai
author: Quintin Maseyk
tags: [react, mui, ux]
---

## Background

Since ajax was introduced we've been firmiliar with circular loading spinners, dot-dot-dot animations, crazy logo transitions and more, all in place to distract the user while the application requests more data to present to the user.

Loaders are typically displayed when a page/component mounts or when a user interacts with the application (ie. submitting a form, searching for something, etc). These are essential to the overall user experience of an application for without them a user could be left in doubt which is not ideal.

<br />

---

<br />

## Skeletons

:skull:
_Don't worry, skeleton loaders have nothing to do with what's in your closet._

> The data for your components might not be immediately available. You can improve the perceived responsiveness of the page by using skeletons. It feels like things are happening immediately, then the information is incrementally displayed on the screen.
>
> Skeleton screens provide an alternative to the traditional spinner method. Rather than showing an abstract widget, skeleton screens create anticipation of what is to come and reduce cognitive load.
>
> The background color of the skeleton uses the least amount of luminance to be visible in good conditions (good ambient light, good screen, no visual impairments).
>
> [MUI](https://mui.com/material-ui/react-skeleton/)

<br />

---

<br />

## What's the problem?

The problem with circular loaders is they don't set the scene or express well enough on how the content will be rendered in the UI once it has finished loading.

A few problems can arise from this but I'd like to focus on the following:

1. The user has to analyse and discover the revealed content, inevitably increasing the user's cognitive load.
2. [Cumulative Layout Shift](https://web.dev/optimize-cls/) (CLS) breakage.

### Problematic Examples

**Circular Loader with no appropriate dimension**

The following gif animation shows 1 Credit Card box using the circular loading indicator; once the content is ready the loading indicator immediately gets removed and the true Credit Card box's content gets revealed. You'll notice this pushed the below content down quite a lot, hense the affect to our CLS score.

![](/img/skeleton-loaders/circular-no-height.gif)


:bulb: Why CLS matters:

Have you ever been to a site on either a desktop or mobile phone, got presented some content, found a link to click on but just as you did the link jumped away from you? Worse yet, you ended up clicking something else completely irrelevant!

This is occuring more often than none and the experience is frustrating! This is why perormance tools like [Lighthouse](https://web.dev/performance-scoring/) are increasing their weight (penalty) of CLS more and more.


**Circular Loader with an appropriate dimension**

This is the same implementation as the above with the addition of the developer ensuring the circular loading indicator fills out to the default size of a rendered Credit Card box.
This is starting to feel a bit better but I'm having to cognitively re-read everything in the box to make my next move.

![](/img/skeleton-loaders/circular-with-measured-box.gif)

<br />

---

<br />


## How Skeleton Loaders Can Help

Skeleton loaders force the developer to think about the content which it is emulating in a much more heuristic manner as they would have to take some time to think about the content's:

* box model: position, height, width, padding...
* content layout (ie. the first row is a title with a round action button to the right; the second row has a square image; the last row has two buttons)

Let's use the following screenshot as our example.

![Screenshot showing a demo NextJS app rendering in order from top to bottom the 'Client Fetch' page title, some random static text, then the Credit Card Summary section which details the final content layout we need to create skeletons from](/img/skeleton-loaders/screenshot-credit-card-summary.png)

Our task is to create a skeleton for the "Credit Card Summary" cards. The goal is to style the skeleton close enough to the design so there are no suprises when the content renders.

> I will be using [MUI's Skeleton component](https://mui.com/material-ui/react-skeleton/) to construct our new `<CreditCardSkeleton> component`. MUI's Skeleton component expose 3 variants: Text, Circular, Rectangle.

Like most things developing from a design it's best to develop from the outside in, like so:

* Figure out the root node's layout constraints. _Ask yourself what direction the cards flow, do they wrap, what spacing is between each item?_
  <br />
  ![1](/img/skeleton-loaders/card-layout.jpg)

* Figure out the inner content layout. _In our case there are 3 rows 2 columns_<br />
  |Rows|Columns|
  |-|-|
  |![1](/img/skeleton-loaders/card-breakdown-rows.jpg)|![2](/img/skeleton-loaders/card-breakdown-columns.jpg)|


* What are the key landmarks for the inner content? _You decide how simple or complex your skeleton should be_<br />
  __Simple:__<br />
  |Simple|Complex|
  |-|-|
  |![1](/img/skeleton-loaders/card-breakdown-landmark-simple.jpg)|![1](/img/skeleton-loaders/card-breakdown-landmarks.jpg)|

We now have enough information to construct our skeleton and here's what we should end up with:

![1](/img/skeleton-loaders/skeleton.gif)

A few things to note:

* I chose to implement a more complex landmark as I felt it better transitioned when the true content was revealed.
* I rendered a second skeleton in the horizontal list to let the user know there _may_ be more than one Card after the loading finishes.
* I lowered the opacity for the consequitive skeletons to emphaise there may/may-not be more than one card after the load has completed.

---

## Conclusion

When skeletons are implemented correctly you'll not only make your application look and feel better, but deliver a better overall user experience to your users as they will have a better understanding on page layouts and content landmarks before the true content has even loaded.


<!--
## Cumulative Layout Shift (CLS)

Have you ever been to a site on either a desktop or mobile phone, got presented some content, found a link to click on but just as you did the link jumped away from you? This is occuring more often than none and the experience is frustrating!

> :bulb:
> This is why perormance tools like [Lighthouse](https://web.dev/performance-scoring/) are increasing their weight (penalty) of CLS more and more.

The cause for CLS can be caused by many things:

* You simply didn't supply a width/height to an image, so once it finished loading the binary image size took place and shifts the content around.
* You display a loading spinner inside of a box, once the content loads in the box it grows the box's dimension, thus, shifting content around it from its original reading position.

The above won't neccessarily be solved by implementing skeleton loaders, but by implementing skeleton loaders you're getting closer to the mark. -->




---

Don't be shy, [get in touch with us!](https://www.mechanicalrock.io/lets-get-started)

![Mechanical Rock Logo](/img/mr-logo-dark-landscape.jpg)
