---
layout: post
title:  "Why And How To Do Unit Testing?"
date:   2016-11-30 04:48:58 +0000
categories: bdd tdd unit testing
author: Amit Sharma
image: img/bug_with_lens.png
---
If you’re reading this article, you’re most likely a developer, may even be a BDD one. You may find it interesting if your unit tests take a lot of time to execute, or if you’re trying to find out why TDD and BDD are suddenly becoming  hot topics. But in particular, I’m going to talk about the better ways of writing unit tests, and why some people fail at writing unit tests. You can expect some code as well.

You may be an expert on the topic and may suggest some improvements.

Like many people, I have been intrigued by the subject of unit testing. Over the last year, I’ve come across the correct (at least I think so!) techniques to unit test. Before i delve deep into unit testing, I want to talk about the why.

So, why is unit testing so important?

The **software testing ice-cream** cone shown below reflects on the challenges most teams face. This is what most teams’ test coverage spread looks like:

    *   A massive number of manual tests,
    *   A huge number of automated GUI tests,
    *   Few integration tests,
    *   The least number of unit tests

![Testing Ice-Cream Cone]({{ site.url }}/img/testing_ice_cream_cone.png)

This creates a lot of problems for developers, and the whole team. With this kind of coverage, you need to wait for your testing team to spend rigorous hours to exercise all the possible scenarios to tell you if your code meets the requirements, and also if it falters in some obvious scenarios, which could be embarrassing for the developer. Many manual testers are very good, but even then, they may not be able to test all the conditions, some because of the inability to think all the possible scenarios, and others because of the impracticality of testing those weird flows in an integrated environment, an example being exception flows, for example a middleware system/ API being down.

Let’s assume that the manual testing effort or even the automated GUI tests find most of the major defects, it’s still quite late in the lifecycle, and each defect has already become quite expensive to fix. Most progressive teams work in an agile mode these days, and if testers find major defects on the final few days of the iteration, it increases the risk of failure for that iteration.

The challenges encountered in maintaining a huge suite of automated GUI tests is another big subject of discussion. It’s quite rare that teams realise the desired benefits from automated GUI based tests. Automated test engineers start writing automated GUI tests with much fanfare, but over a period of time, the cost of maintaining those tests is much more than what was intended to be. They’re always in catch-up mode, and quite often, the slightest of change in the UI, leads to test failures and, instead of these tests finding defects, they keep demanding upkeep and maintenance. They may still find a few critical defects, but may not add so much value because of the maintenance required after every deployment.

Unit tests have several advantages over other types of tests. They can give developers immediate feedback about the code quality, without even having to push their code to source control. With unit tests, it is possible to test the methods by narrowing down the scope to just that particular method. The biggest bottleneck in any kind of test automation, test data setup, isn’t a concern, as you can mock the methods being called by this method under test to provide the data as per your scenario. This enables us to have a much greater control over what we want to test, and we can test all the edge cases, as well as those weird exception flows. The biggest advantage you get with unit tests is the speed of execution and their stability. Every developer should run all the unit tests at a bare minimum, before pushing their code to CI, as it takes only a few seconds or minutes. If there are any failures, they know that they’ve broken something, and it’s their responsibility to fix the failing unit tests immediately. This way, the code quality can be maintained very easily, and at a low cost, as bugs get identified very early in the development cycle.

The **ideal testing pyramid** below suggests how important and valuable unit tests are for maintaining a high-quality code:

    *   Manual testers doing exploratory testing of more interesting scenarios, instead of the lame, easily scriptable ones
    *   Few Automated GUI tests covering major flows, if there is a GUI
    *   Automated API/Integration/Component tests
    *   A large set of automated unit tests
    *   Largest number of unit tests translates to a low maintenance test suite, that executes in a minimal amount of time, and provides coverage for every possible condition.

## Ideal testing pyramid: ##

![Ideal Testing Pyramid]({{ site.url }}/img/ideal_testing_pyramid.png)

Now, let’s talk about how to do unit testing with an example:

## App code: ##
```
public class App {

private final Provider provider;

public App(Provider provider) {

this.provider = provider;

}

public boolean hasLongerNameThan(int aContactId, int bContactId) {

String aContactName = provider.getContactName(aContactId);

String bContactName = provider.getContactName(bContactId);

int aContactNameLength = aContactName.length();

int bContactNameLength = bContactName.length();

return aContactNameLength > bContactNameLength;

}

public interface Provider {

String getContactName(int contactId);

}

public class ProviderImpl implements Provider {

private final ContactService contactService = new ContactService();

public String getContactName(int contactId) {

return contactService.getContact(contactId);

}

}
```

Below test code will attempt to test the above method *hasLongerNameThan*:

## Test code using Mockito mocking framework: ##
```
import org.junit.Assert;

import org.junit.Test;

import org.mockito.Mockito;

import static org.mockito.BDDMockito.given;

public class AppTest {

private Provider provider = Mockito.mock(Provider.class);

@Test

public void shouldReturnTrueWhenContactANameIsLongerThanContactB() {

given(provider.getContactName(1)).willReturn("Robert");

given(provider.getContactName(2)).willReturn("John");

boolean result = new App(provider).hasLongerNameThan(1, 2);

Assert.assertTrue(result);

}

@Test

public void shouldReturnFalseWhenContactANameIsShorterThanContactB() {

given(provider.getContactName(1)).willReturn("John");

given(provider.getContactName(2)).willReturn("Robert");

boolean result = new App(provider).hasLongerNameThan(1, 2);

Assert.assertFalse(result);

}

@Test

public void shouldReturnFalseWhenContactANameIsOfSameLengthAsContactB() {

given(provider.getContactName(1)).willReturn("John");

given(provider.getContactName(2)).willReturn("John");

boolean result = new App(provider).hasLongerNameThan(1, 2);

Assert.assertFalse(result);

}
```

So, as you can understand from the above examples, we can mock any methods being called in our method under test *hasLongerNameThan*. Test code without using mocking framework( **I’ll explain later why this is a better idea**):
```
public class AppTest {

@Test

public void shouldReturnTrueWhenContactANameIsLongerThanContactB_() {

boolean result = new App(new MockProviderImplALongerThanB()).hasLongerNameThan(1, 2);

Assert.assertTrue(result);

}

@Test

public void shouldReturnFalseWhenContactANameIsShorterThanContactB_() {

boolean result = new App(new MockProviderImplAShorterThanB()).hasLongerNameThan(1, 2);

Assert.assertFalse(result);

}

@Test

public void shouldReturnFalseWhenContactANameIsOfSameLengthAsContactB_() {

boolean result = new App(new MockProviderImplASameLengthAsB()).hasLongerNameThan(1, 2);

Assert.assertFalse(result);

}

private class MockProviderImplALongerThanB extends ProviderImpl {

@Override

public String getContactName(int contactId) {

switch (contactId) {

case 1:

return "Robert";

case 2:

return "John";

}

return null;

}

}

private class MockProviderImplAShorterThanB extends ProviderImpl {

@Override

public String getContactName(int contactId) {

switch (contactId) {

case 1:

return "John";

case 2:

return "Robert";

}

return null;

}

}

private class MockProviderImplASameLengthAsB extends ProviderImpl {

@Override

public String getContactName(int contactId) {

return "John";

}

}
```

This helps us limit the scope of testing to the logic being exercised in this method. It also ensures that we’re not dependent on any services or data access objects to fetch the contact corresponding to the contact id passed, which leads to a stable test.

Now, there are two ways to mock the methods. One is to use a mocking framework like Mockito. The other is to create a mock class implementing the provider interface, or extending the class that implements the methods being called. Then, we just need to override the specific methods to return a specific response based on our scenario.

It’s up to you when to use a mocking framework or override the methods to be mocked.

I’ve used both, but if possible, I would prefer overriding the methods, the reason being it’s considerably faster than using a mocking framework. Just these 3 tests, while using Mockito, took anywhere from 30 to 44 ms to execute. I used Intellij IDE to execute these tests. And the same tests when using override mechanism executed in anywhere b/w 4 to 14 ms.

Needless to say, the only case when you won’t be able to use override is if the class is final or the method to be mocked is a final, otherwise, you should be able to mock by overriding.

The example above should explain both ways of mocking very well.