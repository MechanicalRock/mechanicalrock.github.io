---
layout: post
title: Doesn't look good to me — a requiem for thorough code reviews
date: 2022-03-08
tags: code cloudnative consultants deployment continuous-delivery devops patterns review software test testing
author: Simon Bracegirdle
image: img/dont-lgtm-code-reviews.jpg
description:
  "Do you give a cursory review and slap the trusty 'LGMT!' on pull requests? Read this to find out how you could bring more rigour to your team's code review practices and improve the software delivered."
---

![Header](/img/dont-lgtm-code-reviews.jpg)

A lot of development teams are doing code reviews these days, it's become the industry norm. But are they done well? The idea of the lazy code review — "LGTM, ship it" — has [become a widespread meme](https://knowyourmeme.com/memes/lgtm), and it's funny because there's an element of truth in it that we've experienced ourselves.

In this post I aim to convince you of the value of thorough code reviews and i'll provide some pointers for bringing rigour and methods to increase the value you get out of them.

Let's be honest though, when we're working towards deadlines, it's easy to deprioritise or simplify what we see as low priority tasks to ensure we can meet our commitments. This isn't malicious or lazy, it's human nature.

What's the solution then? There's no quick fix of course — it comes down to individuals and teams, and how much value they place in the benefits of code review. But even if you value code reviews highly, you still need a disciplined, well articulated and well understood approach to overcome the habits of individuals and sustain a high level of review quality over time.

## What do I mean by code review?

I'm focusing on asynchronous code reviews specifically, also known as pull requests, often done when merging a code change from a branch back to the mainline in git.

There's other forms of code review such as; pairing, code walk throughs and code review meetings, each with their own advantages and drawbacks, but this comparison is not the focus of this post. The approaches I suggest may or may not be applicable to those other forms.

In fact, pairing is probably a more effective approach to code review than pull requests. With pairing two individuals are working on the same change simultaneously and with a shared understanding of the context. The individual on the keyboard edits the code whilst the other provides feedback and ask questions. But pull requests are more commonplace in the industry, so I won't go into the nuance of pairing in this post.

## Why do code reviews?

This may be well covered ground, but I think it's always worth revisiting the fundamentals to refresh our appreciation for practices we've adopted. Having a practice without a good reason is not an approach that leads to success in my experience, unless you get lucky.

Lets explore the rationale...

### Reason 1 — Learning opportunity

Code reviews present an opportunity to learn something for both reviewer and the author. Here's some examples:

- As a reviewer, you may learn about the behaviour of an upcoming feature that you had some assumptions about, which turned out to be wrong.
- As an author, you may receive some suggestions about how to improve error handling that results in code with less bugs.
- As a reviewer, you're confused about the code structure, so you ask a question about it and learn about a new approach.
- As an author, you may ask the reviewer of what they think about the expected behaviour in the tests you've written, they may present some feedback and ideas.

Code reviews should be a conversation.  Conversations happen to be a good tool to achieve common understanding between two or more individuals.

Those conversations should also be [psychologically safe](https://en.wikipedia.org/wiki/Psychological_safety) for both parties — we should be able to speak up with questions and ideas without fear of punishment, blame or judgement. Blameless environments allow members to learn from mistakes and be more engaged in continuous improvement.

But even then success isn't guaranteed. We need to build the habit of asking good questions, providing suggestions and other forms of feedback that move code reviews from a chore into a conversation. Reviews with a reasonable attention to detail and tactful use of tone and language will have this benefit.

This learning opportunity is critically important when one of the participants is more senior than the other. Seniors have a responsibility to provide guidance to their less experienced peers, and code reviews are an opportunity to do so.

### Reason 2 — Product quality

Thorough code reviews can lead to higher code quality, and code that is more maintainable and robust will allow the sustained delivery of a higher quality product.

A good reviewer will look for issues that impact the robustness, security or performance of the system. For example; an error that is not handled could cause a catastrophic bug that leads to data loss or a system outage, both of which would be a poor experience for users.

Nobody is perfect and having a second set of eyes can pick up potential issues that we missed ourselves during development. A fresh perspective can have a different view on the code than yours after a tiring development stint. Everyone brings with them a different set of experience and a different world view, leverage that to get the most out of your reviews.

Even if the change under review doesn't directly have any bugs in it, but is missing tests, or has bad naming, or is hard to understand, it could lead to bugs in future changes when confused developers try to understand what's going on.

Who's responsible for code quality though? I think everyone in the team holds the same level of responsibility for quality. But in the context of a specific change, the author's ultimately responsible that it meets the agreed standard. The reviewers are there to help by asking questions, making suggestions and sharing knowledge, but they won't be making the necessary changes and clicking the merge button.

Who should the author pick to review then? Ideally it's the person that will give the best feedback — asking good questions, making insightful suggestions and identifying potential issues. But we also need to consider the impact of creating bottlenecks in the team. For example; if the senior engineer receives all the code reviews, then they're not going to be able to work on their own tasks and will block merging of other pull requests.

We also need to give opportunities to less experienced team members so they can grow their own skills and learn from others. With the use of some of the suggestions in this post we can help them to uplift their code review game.

### Reason 3 — Sustained delivery over time

Code that is buggy or hard to understand will slow down the delivery of value to customers, so code reviewers should look for changes that might work against these goals.

For example; if tests are not added to a change, then it might make it hard to enhance or fix that code next time, it becomes worse if the developer is new and unfamiliar with the intended purpose of the code.

Small paper cuts add up over time to form what is now well known as technical debt. Code bases that have accumulated enough technical debt can exceed a threshold of no return, beyond which they become unmaintainable messes that everyone's scared to touch.

To control the fallout of tech debt, management often bring in manual gates and other heavy approval processes to attempt to limit the damage of any changes. This increases the time needed to make changes (lead time) and reduces the frequency that we deliver to customers.

If you're working on a system that needs to continue to serve real customers for the foreseeable future, play the long game and optimise for testability, maintainability and changeability. Code reviews are a critical tool to help sustain that discipline over time.

### Aside — Why not do code reviews?

As with everything in software, there is no universal laws, practices that are useful in some cases are harmful in others. Code reviews are no exception — they aren't necessarily suitable for every situation and team.

Here are some cases where you wouldn't do code reviews and why:

- You are experimenting or prototyping, in which case code quality is not a concern. Be careful that your prototype doesn't become a production application overnight. Ideally throw away any prototype code and start again.
- You are a one person show and don't have a team. You have no choice here unless you can afford to bring on another person.

Okay, with those points aside and assuming you're interested in code reviews, let's look at some approaches for adding rigour.

## How can we improve our code review approach?

### Approach 1 — Review in context

Most teams use Git these days and so the popular process for code reviews is to create a feature branch and then open a pull request from that feature branch back to the main line. In git platforms such as GitHub, BitBucket and GitLab, the pull request is where the code review takes place.

Code review tools emphasise the "diff" view, which highlights the files and lines of code that have changed in the branch when compared to the main line. This is a fantastic tool as it makes it clear what the contents of the change are. The expander that allows us to view more of the file is also useful for getting more context for the changed file.

But the "diff" has a limited view of the source code. For more complex changes, or changes in a complex context, or if you want to browse around to get an understanding of the code base, opening the change in a full IDE can help to provide the bigger picture of the impact of a change.

For example, if you make a one-line change to the returning statement of a function, what's missing in the diff view is how the callee of that function is interacting with the return value. Without seeing the full picture, you could miss a side effect leading to a bug. Opening in an IDE will allow us to use the powerful search features, or the "search for dependencies" feature.

Tooling in this space is always improving. In 2021 GitHub released https://github.dev, which allows you to open up any file in a web-based Visual Studio editor with the press of the `.` button in a GitHub file or PR view.

The code author should provide as much context in the description of the PR itself. For example:

- Provide a reason for the change — what is the rationale and motivation behind it?
- Explain the scope of the change — does it cover the entirety of the ticket, or is there more changes to follow?
- Explain the contents of the change — what have you changed and how does it work?

It's unreasonable to expect authors to remember these points for every change, so leverage [pull request templates](https://docs.github.com/en/communities/using-templates-to-encourage-useful-issues-and-pull-requests/creating-a-pull-request-template-for-your-repository) to establish a format to follow.

### Approach 2 — Use of language and tone

Code reviews are a great opportunity for feedback, but if you're not careful they can also be a source of arguments, defensiveness and frustration. We've all experienced it, I'm guilty of it too.

It's understandable, it's hard receiving critical feedback on work we've put a lot of effort into, and are under pressure to deliver. If we feel like a reviewer is being overly pedantic, we naturally go into defensive mode.

I think it's critical that the reviewer makes careful choice of words when giving feedback. The author has this responsibility too, but the reviewer is the one that sets the initial tone.

Thankfully, there is an approach that can help us — [conventional comments](https://conventionalcomments.org/). Conventional comments helps by prefixing a label to each comment posted by a reviewer. The prefix describes the intent of the comment. For example; "`question`: could you explain the intent behind this function?". By prefixing an intent to a comment, it helps to provide insight into the motivation behind the comment and belay our fears of harshness.

A `question` indicates a curiosity to learn more about the author's approach. A `suggestion` shows a willingness to have a discussion and be flexible with the author instead of dictate changes. A `nitpick` indicates something minor that the reviewer doesn't feel strongly about.

There's no label for `do-as-i-say` or `this-is-trash`. Code reviews should be a conversation about the change. When it's a two way dialogue where both parties feel respected and listened to we get the benefits we talked about earlier.

What about as the author? What if you're not getting the feedback that you hoped for? Don't be afraid to ask for it — be clear about what kind of feedback you want and from who.

For example:

> Hi Sam! Could you please take a look at this change and tell me what you think about the way I've structured the code? With your experience in design patterns I'm interested to get your input.



### Approach 3 — Checklists

As covered extensively in [The Checklist Manifesto](https://www.goodreads.com/book/show/6667514-the-checklist-manifesto), checklists have many benefits including:

- They help us to achieve, and exceed, a given benchmark
- They supplement memory recall
- The provide structure in a complex space

Anecdotally, I once worked in a team that had a well defined code review approach with something resembling a checklist.

When I followed the checklist I gave high quality actionable feedback to authors. But over time, I paid less attention to the checklist and I became lazier with my feedback. I became reactive, responding to the code in the diff and how I intuitively perceived it, instead of being proactive and thinking of a wide range of concerns such as security, performance and testability.

Sticking to the checklist changes that, it helps the reviewer to drive the discussion and maintain a high standard if you remain disciplined over time. Even after we've been doing reviews for a long time, and we've internalised the checklist, we're human and can forget considerations. The checklist helps us to be consistent.

I've defined my own personal code review checklist, and identified four key areas that I think are critical:

- Testability
- Maintainability
- Security/privacy
- Robustness

Below is my full checklist, based on what I think is important, and also inspired by [other checklists](https://github.com/mgreiler/code-review-checklist) out there. If you're looking to adopt a checklist in your team, I suggest you use one that encapsulates the properties your team thinks is important. There's plenty of [good checklists](https://github.com/mgreiler/code-review-checklist) around the web to use as source material.

#### Simon's Code Review Checklist

Checklist questions grouped by four key areas...

**Testability**

If you're running production code, and that code is changing frequently due to new features and improvements, having an automated test suite is critical for being able to deploy fast and make changes without fear. Below are the items are look for:

- [ ] Implementation can change without breaking tests (black-box tests)
- [ ] I can understand the expected behaviour of the system by reading tests
- [ ] Uses a variety of testing approaches for robustness (unit + integration etc)
- [ ] Has good code coverage and covers a good number of core and edge cases

**Maintainability**

Being able to continue to make changes to production software over its lifespan is critical for continuing to keep customers happy. Team members will change over time and knowledge about software is potentially lost. Tests and well organised code help to capture this knowledge in code.

Here are some questions that cover what I think are important maintainability concerns:

- [ ] Does the file structure follow a consistent pattern? (e.g. ports and adapters)
- [ ] Do file / function / variable / object names reflect their purpose?
- [ ] Is there any unnecessary coupling that would make refactoring or testing harder (e.g. email function and sms function linked together)?
- [ ] Is the code split into appropriate concerns / layers if necessary. E.g. API code does not interact with database.
- [ ] Is there any unnecessary complexity that makes the code harder to reason about?
- [ ] Comments provide extra context (the "why?") where necessary
- [ ] Is the API, architecture, setup and usage documented (e.g. README, OpenAPI, etc)?
- [ ] Is the code configurable? Can you change config in one place without re-factoring?

**Security and privacy**

The risk and cost of security breaches these days is too high to make compromises on security or privacy. These questions focus on keeping our security posture tight:

- [ ] Are there any opportunities for abuse? E.g. large volume of requests? Bad input?
- [ ] Are all entry points authenticated and authorised appropriately?
- [ ] Does any process, resource or user have more access than they need?
- [ ] Is all PII and sensitive data handled appropriately (not logged, not in plain text, not checked in)
- [ ] Are all third-party dependencies vetted and pinned?

**Robustness**

If your code is secure and maintainable, that's a good start. If it's constantly falling over in production or riddled with bugs, it's going to result in a poor user experience and frustrate the team. These questions focus on robustness concerns:

- [ ] Can you think of any errors or conditions that would cause an unexpected state?
- [ ] Are there any statements that won't scale well to large data sets?
- [ ] Is there anything that can have an impact on system load / service limits / costs?
- [ ] Are all read and write operations logged to assist debugging and support?
- [ ] Are error messages readable and assist debugging and support (e.g. shows key non-sensitive details)?

**Other considerations**

We could introduce other checklist items depending on the code change under review. For example; if we're reviewing a user interface code change, we may ask for a screenshot of the UI and have some checklist items to check for certain styling issues (e.g. bad white-spacing).

If we're reviewing an API change, we may have some checklist items for reviewing the OpenAPI schema, for example to check the correct use of verbs and nouns

### Approach 4 — Get consensus on approach

Dictating practices from top down is not generally a good idea. If people aren't invested in your practices, or don't understand the motivations behind them and are instead forced to adopt them, they may resent it and not commit to the approach. You won't get the feedback and engagement you're looking for.

Instead, let the team choose its own path. Discuss together what you think are important attributes of code, and share thoughts on why code review is valuable in your context. Decide as a team the details of how you'll conduct code reviews. For example; Will you use a checklist? What questions are most important during review?

Write down your decisions and the rationale behind them so people that join later have the context of that original decision. That'll inform those people to make their own suggestions for improvement. Writing down decisions also helps for reviewing decisions at a later date to see if the reasons are still valid.

### Approach 5 — Don't review the trivial or the major

I don't believe we should spend any effort reviewing tasks that can be trivially automated. Automated tasks can save a lot of hassle and wasted effort in looking for small nits during code review.

For example:

- Automated formatters that ensure we format code according to an agreed upon style guide
- Static analysis tools and code linters can pick up issues such as unused variables and syntax errors
- Code build in CI can uncover syntax issues and misconfiguration
- Code coverage reports can find testing gaps
- Pull request templates for defaulting the pull request description to the agreed upon structure

We also shouldn't be making or changing major design decisions in a code review. Major architectural design changes late in the process is going to incur a lot of waste. We'd ideally catch these earlier in the process in an architectural review step or similar. This is another reason why pairing is a good option — we can catch design issues earlier and provide that feedback instantaneously.

If you find that changes with poor design are ending up in code review, it could be an opportunity to run a [blameless post-mortem](https://www.atlassian.com/incident-management/postmortem/blameless) to understand where your process is going wrong.

## Summary

Code reviews give you an opportunity to learn through knowledge sharing, increase product quality and sustain delivery over time. Some approaches you can use for success are; viewing the full context of the change, using conventional comments, a code review checklist and getting team consensus.

The ideal code review for me depends on what kind of change we're reviewing, but would involve:

- Clear context and description of the change by the author.
- A respectful and insightful discussion between author and reviewers.
- Both the author and reviewers learnt something that they can bring to future changes.
- Results in a high quality code change that brings value to the customer.

With the approaches outlined in this post, we can trend towards that ideal.

If you or your team would like help with code reviews or anything to do with cloud native software, then [please get in contact with us](https://www.mechanicalrock.io/lets-get-started).

