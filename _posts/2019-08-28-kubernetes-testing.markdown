---
layout: post
title:  "Testing Kubernetes"
date:   2016-12-07 04:48:58 +0000
tags: kubernetes golang BDD
author: Matt Tyler
image: 
---

## Cliff Notes

- Interacting with the kubernetes API is a great way to validate that things are as they should be in your cluster
- The golang client is the most mature kubernetes client
- We can right BDD style tests with Ginkgo and Gomega frameworks for Golang
- The golang tooling is flexible - we can do some tricks that enable us to use golangs standard testing infrastucture outside of plain old unit tests, for more flexible end-to-end testing of arbitrary environments.

## What, I have to test my infrastructure as well now?

I'm sure it wouldn't raise to many eyebrows if I asserted that testing is the most neglected element in the software development process. If you disagree, I ask you to reflect on how many times you've heard someone complain about being a handed a project that didn't have any tests. The second would probably be poor infrastructure and CI/CD practices - how many times have you heard someone talk about it taking months to get hardware and/or do deploys?

This brave new cloud world might have freed us from months of waiting for hardware by placing provisioning behind programmable API's, but how many of us are testing our deploys of infrastructure? I can only assume that if these two things on their own were already 'uncommon', the combination thereof is probably rare as hen's teeth.

## BDD Style Testing in Golang

The in-built testing package in the standard library isn't particularly nice to use for the BDD style tests I've become accustomed to in Javascript land. Fortunately, there is a package in Golang that offers similar semantics to those found in popular Javascript testing frameworks. Those who are familiar with jasmine, mocha, jest etc should feel right at home. It consists of a specification framework (Ginkgo) and an assertion library (Gomega). Coincidently, these are the same packages that the Kubernetes projects uses for it's end-to-end and integration testing.

What follows is an incredibly contrived example based on a famous statement from our newest ex-Prime Minister. I'm sure no-one is going to struggle to understand this.

```
package suite

import (
	. "github.com/onsi/ginkgo"
	. "github.com/onsi/gomega"
)

var _ = Describe("Example", func() {
	var (
		a int
		b int
	)

	BeforeEach(func() {
		a = 5
		b = 2
	})

	Describe("Law of mathematics applies in Australia", func() {
		Context("When adding two numbers", func() {
			It("should be equal to their sum", func() {
				Expect(a + b).To(Equal(7))
			})
		})

		Context("When multiplying two numbers", func() {
			It("should be equal to their product", func() {
				Expect(a * b).To(Equal(10))
			})
		})
	})
})
```

## Reusing Golangs Test Framework

Anyone has used Golang in any capacity is probably aware that you can execute `go test`, which will merily go along and execute a bunch *_test.go files that you have in your source directory. Under the hood, golang compiles a binary and executes, not much to see here. We can control were that test binary is what it is called by running `go test -c -o MyTests`. The `-o` flag will cause golang to create the binary in the current working directory, and `-c` will ensure the test binary is not immediately executed - only compiled. We can then execute our tests by issuing a `./MyTests` command.

But we can go a few steps further than this. We can extend that test binary to take all sorts of additional flags, print out usage information, while still taking advantage of features of the golang tooling (eg; test reporting). I've done this in the past to extend my test binaries to bootstrap managed kubernetes clusters in Google Cloud Platform, and/or target existing clusters that have been defined in a standard kubeconfig file. How to do this is mentioned briefly in Go's testing documentation, but I've found things work slightly differently when using Ginkgo. Most notably, it's not nessecary to use TestMain for setup - you can get away with writing a single *_test.go file to act as an entry point.

```
// My "main" testing file, say e2e_test.go
package e2e

import (
    "flag"
    "testing"

    . "github.com/onsi/ginkgo"
    . "github.com/onsi/gomega"

    _ ""
)

var Test bool

// init is a special keyword in Go. Functions defined here are executed when the package is imported.
func init() {
    // This is where I normally define command line flags to 
    // pass to my tests. This is a dumb flag to determine
	// whether to run the tests or not.
    flag.BoolVar(&Test, "test", false, "")
}

func TestE2E(t *testing.T) {
    RunE2ETests(t)
}

func RunE2ETests(t *testing.T) {
    flag.Parse()

    if !Test {
        return
    }

    RegisterFailHandler(Fail)
    r := make([]Reporter, 0)

    RunSpecsWithDefaultAndCustomerReporters(t, "My Test Suite", r)
}

```

```
// A test, say "suite.go"
package e2e

import (
    . "github.com/onsi/ginkgo"
    . "githubg.com/onsi/gomega"
)
```