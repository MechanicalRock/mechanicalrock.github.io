---
layout: post
title:  "The New Donut"
date:   2017-10-15 04:48:58 +0000
categories: donut automated test reports
author: Hamish Tedeschi & Amit Sharma
image: img/the-new-donut/donut.png
---

![We Love Donuts](/img/the-new-donut/donut.png)

Donut was an idea born at [MagenTys](https://magentys.io/) with the intention of making test results from Cucumber more visual and accessible to software development teams. Since its initial commit over a year or so ago it has grown to a rich report which now supports unit, integration and acceptance tests. It also has a number of adaptors and related projects which make it easier to integrate with various test runners and CI tools.

Since inception, the number of contributors has grown and the product roadmap has become clearer. In that time, [Mechanical Rock](https://www.mechanicalrock.io/) was also born. As both [MagenTys](https://magentys.io/) and [Mechanical Rock](https://www.mechanicalrock.io/) are part of the core contributor team and the Donut ecosystem of related projects has grown, it made sense to move it to its own GitHub Organization, similar to how LocalStack has moved from the Atlassian repo to a LocalStack owned one.

The new GitHub Organization is named [Donut Report](https://github.com/DonutReport) and all the projects there (including [Donut](https://github.com/DonutReport/donut)) can be cloned and contributed to in that space. As Donut now supports JUnit XML and NUnit XML, pretty much any test runner out there can produce the output necessary to produce a Donut report. If you are a current user of Donut, you may need to make a few small changes to get the latest versions:

```bash
wget http://repo1.maven.org/maven2/report/donut/1.1/donut-1.1-one-jar.jar
```

If you're using it as a dependency:

```xml
<dependency>
  <groupId>report.donut</groupId>
  <artifactId>donut</artifactId>
  <version>1.1</version>
</dependency>
```

Please note the new groupId `report.donut`. You can still continue using the older versions with `io.magentys`. You can find more artifacts on [Maven](https://mvnrepository.com/artifact/report.donut).

The migration of donut to a new organisation involved the following steps:

    1. Transfer of all donut related repositories to a new organisation
    2. Creation of a new groupId 'report.donut' on maven central
    3. Refactor of all relevant repositories to be consistent with the new groupId
    4. Deployment of all relevant artifacts to the new group
    5. Notification to all stakeholders and users

The transfer of all donut related repositories was straightforward. Someone with admin rights on the old repo and the new organisation could do this.

For creation of the new groupId, we had to raise a ticket with **Sonatype OSSRH** team, and we had to assure them that we own the `donut.report` domain.
The new group was created in about a day.

Refactoring exercise took most of the time, it involved refactoring the package name being used by all repositories. The readme files had to be updated with correct instructions
and branding. The POM xmls had to be updated as well. We also ensured that all the tests were still passing throughout this exercise.

Deployment to maven central was seamless. Post the changes mentioned above, it was just a matter of running the same deployment commands as before.

For more details about Donut & related plugins, you can go to [Donut Report](https://github.com/DonutReport). If there are any questions, issues, feature requests
please feel free to raise an issue on the respective repository.
