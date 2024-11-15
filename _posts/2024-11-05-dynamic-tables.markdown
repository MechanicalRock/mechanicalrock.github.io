---
layout: postv2
title: "Getting Dynamic with Snowflake"
description: "Exploring Snowflake's Dynamic Tables feature"
date: 2024-11-18
highlight: monokai
image: /img/pip-freeze/ai-cover.png
author: Ben Dang
tags:
  [
    Snowflake,
    Dynamic Tables,
    Data
    ]
---


# Dynamic Tables

After more than a year in preview, Snowflake finally launched Dynamic Tables for general availability in [April 2024](https://docs.snowflake.com/en/release-notes/2024/other/2024-04-29-dynamic-tables). For those of us in data engineering, this is massive. Dynamic Tables bring together scheduling and data ingestion into one setup, all in SQL. This means we can handle batch and streaming data seamlessly without needing complex infrastructure or extra tools. After implementing and monitoring Dynamic Tables a few months with a client, here’s my take on how they’re reshaping data pipelines.

# The Previous Stack

The client's batch processing architecture in AWS was powerful but complex. At the heart of it was an event manager that triggered every minute. Here’s how it worked:

- The event manager checked each batch’s CRON expression in DynamoDB and initiated jobs on schedule.
- It pulled additional parameters for each batch from pre-configured JSON files in an S3 bucket.
- For some workflows, it even ran Snowflake procedures directly.

Whilst the abstraction allowed for heaps of customisation, it was a bit of a maze to navigate, especially for newcomers. Debugging was tough, and maintaining and scaling the stack eventually became unwieldy. We started looking for a simpler solution.

TODO: Diagram of Architecture

# The Decision

The team was made up of Data Analysts and Data Engineers. As they were already well-versed with SQL in Snowflake, it made sense to stick with something that wouldn’t need a lot of extra learning or complexity. As our data needs grew, we wanted a hassle-free way to run incremental pipelines.

We explored incremental models in DBT, but it had its own issues:

- DBT needs a separate orchestration tool, like DBT Cloud, which costs extra and adds another layer to manage.
- Jinja expressions in DBT, while handy, added a learning curve compared to plain SQL.

Dynamic Tables just made more sense. They work directly in SQL, can still be version-controlled, and offer easy refresh options. This approach kept things flexible and simple without needing more tools.

# Issues and Concerns

TODO: Limitations

Limited visibility of Dynamic Tables failures (such as upstream sources) - this can be worked around by running a scheduled task to review dynamic tables logs (at additional overheads)

Dynamic Tables don't support self-merges or window functions (this will result in a Dynamic Table always doing a full refresh, as opposed to an incremental refresh)

# Takeaways

Switching to Snowflake Dynamic Tables has been a game-changer.

- Reduced complexity: No need for external orchestration tools; everything is managed directly in SQL.
- Incremental refresh: Easy to control, helping us keep data up-to-date without overcomplicating things.
- Simple onboarding: New team members can jump in without needing to learn additional tools.
- Streamlined workflows: We’re focusing more on building robust data solutions rather than wrestling with infrastructure.
- Cost-effective: No added fees for extra tooling, and we’re using resources more efficiently.

Dynamic Tables have been a great addition, fitting perfectly into our Snowflake environment and team skill set. They’re helping us work more effectively, and we’re excited to see how they’ll continue to support our data strategy moving forward.