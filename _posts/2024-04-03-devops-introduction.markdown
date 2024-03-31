---
layout: postv2
font: serif
hidden: false
title: "DevOps: An Introduction"
description: "An overview of the Waterfall and Agile Methodologies, and an introduction to DevOps."
date: 2024-4-3
highlight: monokai
tags: [DevOps, DataOps, Agile]
author: Benjamin Dang
---

## Continuous Improvement
Have you ever wondered how leading companies maintain their edge in today's rapidly changing, and highly interconnected world? Perhaps the answer lies in the continuous evolution of organisational frameworks, principles, and philosophies.  Each iteration is driven by a singular goal in mind - to optimise the delivery of business value in our increasingly competitive global economy.

In the 1950s, Toyota, a relatively obscure car brand at the time, grappled with a dire shortage of raw materials, severely limiting its vehicle manufacturing capability. In a bid to not just survive but also thrive on the highly globalised international stage, Toyota’s engineers pioneered the renowned lean-production system—an organisational philosophy centred on continuous improvement, waste minimisation, and streamlined quality control. By the 1970s, Toyota had fulfilled its pledge of delivering superior quality at reduced costs, firmly establishing itself as a dominant force in the automotive industry to this day.

<center>
<div ><img src="/img/devops-introduction/timeline.png"/><p></p></div>
</center>

Just as Toyota's lean-production system revolutionised manufacturing, inspiring a culture of continuous improvement and efficiency, it also heavily influenced the emergence of Agile software development methodologies. The conventional Waterfall model was unable to meet the ever-changing demands of consumers - a new approach was necessary to maintain competitiveness. Thus, Agile software development emerged as an innovative method for delivering better software, faster.

## Waterfall and Agile
The Waterfall model is a sequential and linear approach to software development, typically structured into phases such as requirements gathering, design, implementation, testing, deployment, and maintenance. While this approach offers a robust and systematic process, it often lacks adaptability, leading to challenges such as delayed delivery, increased costs, and loss of market share.

<center>
<div ><img src="/img/devops-introduction/waterfall.png"/></div>
</center>

Agile software development can be characterised by its responsiveness to change, straying away from the constraints of following a plan. Supported by an iterative and incremental approach, Agile methodologies emphasise collaborative flexibility to deliver value early whilst continuously adapting to evolving requirements. This iterative approach enables teams to frequently inspect and adapt, allowing them to respond promptly to changing market conditions, customer needs, and technological advancements.

<center>
<div ><img src="/img/devops-introduction/sprint.png"/><p>Agile Sprint Lifecycle</p></div>
</center>

A 2020 <a href="https://www.researchgate.net/publication/344434872_Comparative_Case_Study_of_Plan-Driven_and_Agile_Approaches_in_Student_Computing_Projects">Comparative Case Study of Plan-Driven and Agile Approaches in Student Computing Projects</a> found that student projects which used the Agile methodology had better team cohesion - likely a result of the Agile methodology’s emphasis on team collaboration. In terms of productivity, Agile projects were found to be more complete (functional completeness), but Waterfall projects had a slight advantage in the quality of the project (functional adequacy). In essence, Agile projects deliver a minimum viable product whilst Waterfall projects focus on perfectionism. 
<center>
<div ><img src="/img/devops-introduction/average_mean_scores.png"/><p></p></div>
</center>

Additionally, a 2022 <a href="https://www.sarjournal.com/content/51/SARJournalMarch2022_52_62.html">case study</a>  found that only 40.2% of respondents surveyed at an insurance company believed that Waterfall projects meet deadlines. This figure was significantly higher for Agile projects which came in at 57.3%, a massive 17.1 percentage points more than Waterfall projects.

 
## DevOps
Emerging as a response to the fast-paced and competitive technology market, the DevOps philosophy builds upon the principles of the Agile movement. At its core, DevOps emphasises stronger collaboration and communication between software development and IT operations teams.

DevOps, an amalgamation of "development" and "operations," encompasses both a cultural shift and a set of practices aimed at delivering <a href="https://www.mechanicalrock.io/about/our-story">better software, faster through</a>:
- Everything-as-Code under configuration management, including immutable infrastructure validated via Behaviour Driven Infrastructure (BDI).
- Test First Development, exemplified by Test Driven Development (TDD) and Behaviour Driven Development (BDD).
- Continuous Build via deployment pipelines, including automated testing at the unit and scenario level.
Continuous Operations including monitoring and alerting, auto remediation and optimisation.
- Transparency of information, and active collaboration across teams, throughout the process.

<center>
<div ><img src="/img/devops-introduction/devops.png"/><p></p></div>
</center>

The 2022 <a href="https://arxiv.org/pdf/2211.09390.pdf">Study of Adoption and Effects of DevOps Practices</a> found significant positive correlations between the adoption of DevOps practices and organisational performance. These organisational performance metrics were performance, profitability, customer satisfaction, quality, efficiency and achieving goals. The below practices were found to have the most significant correlation with organisation performance:

| DevOps Practice            | Metric          | Correlation | p-value |
|----------------------------|-----------------|-------------|---------|
|  &nbsp; Automated and continuous deployments |  &nbsp; Efficiency | &nbsp; 0.482       | &nbsp; < 0.001 |
|  &nbsp; Small and continuous releases      |  &nbsp; Achieving goals | &nbsp; 0.389       | &nbsp; < 0.001 |
|  &nbsp; Configuration management |  &nbsp; Efficiency | &nbsp; 0.371       | &nbsp; < 0.001 |
|  &nbsp; Test-driven development    |  &nbsp; Efficiency | &nbsp; 0.392       | &nbsp; < 0.001 |

The case studies also delivered the following benefits when introducing highly scalable DevOps practices:
- <a href="https://www.mechanicalrock.io/docs/case-studies/31_Woodside_CNF_Case_Study.pdf">Woodside Cloud Native Factory</a>: A reduction of release times from 3 months to 3 days, reducing risks of complexity and deployment failures.
- <a href="https://www.mechanicalrock.io/docs/case-studies/22_MR_CaseStudy_Accelerating_Cloud_Capability.pdf">Accelerating Cloud Capability</a>: Almost 40,000 Developer Hours saved over the span of approximately 6 months.

## DataOps
DataOps applies the principles of DevOps to the realm of data engineering, aiming to enhance the reliability and efficiency of data pipelines and systems.

DataOps methodologies streamline the development and deployment of data pipelines through the implementation of CI/CD pipelines. These pipelines automate the testing and deployment processes, ensuring that changes are quickly validated and deployed into production environments. Additionally, pipelines can be configured to enforce a minimum quality standard.

Practices such as Infrastructure as Code (IaC) enable the provisioning and management of resources, such as databases, permissions, and storage, in a repeatable and consistent manner across multiple environments. This approach not only reduces errors but also enhances scalability and resource management.

Monitoring and alerting systems play a crucial role in DataOps by tracking the performance of data pipelines and detecting anomalies in real-time. This proactive approach allows teams to respond promptly to issues, minimising downtime and optimising system performance.

By embracing DevOps practices, data engineering teams can accelerate the development and deployment of data-driven applications, while maintaining high standards of reliability and efficiency.
