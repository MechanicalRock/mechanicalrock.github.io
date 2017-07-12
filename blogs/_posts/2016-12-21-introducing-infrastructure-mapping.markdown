---
layout: post
title:  "Introducing Infrastructure Mapping!"
date:   2016-12-21 04:48:58 +0000
categories: bdd devops
---
If it looks like you have seen this article somewhere before, that is not accidental.  They say imitation is the sincerest form of flattery (or maybe it just lacks imagination).

We have been using [Example Mapping](https://cucumber.io/blog/2015/12/08/example-mapping-introduction), developed by Matt Wynne, for some time now to develop our BDD stories and it’s a really effective technique to help drive focussed discussions.  If you aren’t doing it, then I suggest you start – even if you aren’t doing BDD.

Infrastructure Mapping takes the technique and applies it to DevOps when discussing the design of infrastructure.

## How it Works ##

![Infrastructure Mapping Concepts]({{ site.url }}/img/im-labels.png)

The process starts with an initial sketch of the physical architecture we wish to produce:

![Infrastructure Diagram Before]({{ site.url }}/img/infrastructure-diagram1.png)

For each server in the architecture, we write out a **yellow index card** as the **context**.  A context is a location from where you can make observations and run tests.  At this point, we also write out yellow cards for additional contexts that we can spot at this point - e.g. “I am connecting externally” to consider someone connecting from outside the infrastructure, such as an end user.


Starting with the **external context**, we often start by asking **questions**:

* “Which servers am I able to see?”
* “Which ports can I connect to?”


These questions enable us to explore the **rules** and **examples** for that context.

Once we feel we have a clear understanding for the context under review, we move on to consider each context in turn.

Like Example Mapping for BDD stories, Infrastructure Mapping provides structure and focus to what can often become long winded, rambling discussions.  It gives us a visual approach to see the work ahead, and a simple way to partition the work and defer rules/examples until later.

It creates a feedback loop: as we discuss the infrastructure, this will raise questions and highlight examples which in turn lead to tweaking the diagram.

![Infrastructure Diagram After]({{ site.url }}/img/infrastructure-diagram2.png)

## Standardised Approach ##

Example Mapping does not prescribe the conversations around the rules and examples.  Rather it helps structure those conversations to aid deliberate discovery and drive out the unknown unknowns.

Infrastructure Mapping on the other hand can benefit from a structured approach.  The stuff that you need to consider is consistent from one context to the next.  As such, we have started to capture the contexts and rules we use to help focus discussion.

### Context ###

Context is considering the point of view from which you want to carry out observations.  Servers should be partitioned into **roles** to highlight common function.  Every role in the infrastructure should have a context. If you are logged onto the server, what can you see?  Some servers may have multiple roles.  For example, when starting out, you may choose to host your web server and database on the same machine.  These are separate roles that you will probably want to separate out later on.


In addition, the following contexts may apply:

* “Connecting externally” - Connecting from outside the infrastructure, such as an end user.

* “Authenticated to the VPN” - You may have an internal VPN network.

### Rules ###

Rules around Infrastructure Mapping can be grouped into **categories** that are applicable across most contexts.  Capture and maintain a list of categories to structure the conversation.  We have found it useful to keep blue cards with the rules on and re-use them across sessions.  During an infrastructure mapping session, review each category; decide whether it is relevant and discuss examples and rules around it if necessary.

We use the following categories:

* Routing/Firewall - What servers/ports can you see from the context?
* Users - What users are configured in the context?
* Applications/Services - What applications/services are installed?  What ports do they run on?  How are they configured?
* Containers - What containers are running in the context?
* Files - What files exist and their contents?
* Peripherals - What devices are connected to the context?

## Output ##

At the end of an Infrastructure Mapping session, you will have a collection of examples and rules for each context identified.  As well as a set of questions that require further analysis.  This gives you an overall picture of the work lying ahead.

![Example Infrastructure Mapping Output]({{ site.url }}/img/im-output.png)


These can be used for estimation, as well as partitioning the cards into work items for incremental delivery, in the same way as you would for Example Mapping.  But the cards are a transitory medium.  The primary goal is to transform the cards into **executable specifications**.

We use Serverspec for capturing our executable specs, and the context, rules and examples map directly to the various server spec directives.

{% highlight ruby %}
require "serverspec"
require "docker"

describe "I am logged onto the webserver" do
  container = nil

  before(:all) do
    set :backend, :exec
  end

  describe "MyApp" do

    describe docker_container('myapp') do
      it { should be_running }
    end

    describe port(8080) do
      it { should be_listening }
    end

    describe command("curl http://localhost:8080") do
      its(:stdout) { should match /Hello World/ }    
    end

  end

  describe "Routing" do
    describe "Internet connectivity is enabled" do
      describe host('8.8.8.8') do
        it { should be_reachable.with( :port => 53 ) }
      end
      describe host('www.google.com') do
        it { should be_reachable.with( :port => 443 ) }
      end
    end
  end

end
{% endhighlight %}

Once you have your executable specifications, you can TDD the development of your infrastructure, and the cards from your infrastructure mapping session can be discarded.

## Benefits ##

Being able to capture requirements as executable specifications is an important part of TDD and Infrastructure as Code.  Infrastructure Mapping provides a focussed, structured conversation around capturing your infrastructure requirements, providing a definition of done that is directly translatable into code.  
Who Should Attend

Infrastructure Mapping is a DevOps activity: the [3 Amigos](https://www.scrumalliance.org/community/articles/2013/2013-april/introducing-the-three-amigos) analogy still applies, but perhaps now it’s the A-Team!

![The A-Team]({{ site.url }}/img/Ateam.jpg)

* A **developer** representative brings the knowledge of the application functionality to deliver.  
* The **operations** representative has the experience of ensuring the application can be kept running effectively.  
* A **tester** representative will help probe the boundaries of the infrastructure.  
* A **security** representative will consider risk and help harden the infrastructure.

## Timebox ##

Matt Wynne suggests 25 minutes for an Example Mapping session.  When Infrastructure Mapping, we tend to be a bit more generous but that’s because we are mapping out a number of contexts within a single session.

In general, it should be possible to map out a single context in about **5-10 minutes**.  And an entire infrastructure design in an hour or so.

We retro after each context to decide whether to continue the session or stop based on answering two questions:

* Do we have enough information for now?
* Are energy levels are dropping?

## Final Tips

Systems are getting more complex.  Understanding complex architectures is hard.  Infrastructure Mapping provides a structured approach to break down the complexity of infrastructure into small manageable chunks.

Remember that like application architecture, the infrastructure should continually evolve.  Spend enough time in a single Infrastructure Mapping session to identify a clear understanding for the short term.  Subsequent sessions will refine it.

Like Example Mapping, Infrastructure Mapping offers a mechanism for driving out unknown unknowns, enabling relevant stakeholders to have more focussed, productive discussions to spend less time in meetings and more time delivering value.
