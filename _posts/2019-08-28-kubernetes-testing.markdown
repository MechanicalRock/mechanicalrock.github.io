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

But we can go a few steps further than this. We can extend that test binary to take all sorts of additional flags, print out usage information, while still taking advantage of features of the golang tooling (eg; test reporting). I've done this in the past to extend my test binaries to bootstrap managed kubernetes clusters in Google Cloud Platform, and/or target existing clusters that have been defined in a standard kubeconfig file. How to do this is mentioned briefly in Go's testing documentation, but I've found things work slightly differently when using Ginkgo. Most notably, it's not necessary to use TestMain for setup - you can get away with writing a single *_test.go file to act as an entry point.

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

    RunSpecsWithDefaultAndCustomerReporters(, "My Test Suite", r)
}

```

```
// A test, say "suite.go"
package e2e

import (
    . "github.com/onsi/ginkgo"
    . "github.com/onsi/gomega"
)
```

Executing a command like `go test` will now not execute our tests; would need to pass the -test flag e.g.: `go test -test`

This can be quite useful for bring up a target environment before executing tests against the environment e.g.: `go test -up -test- down` to bring up a cluster, execute my tests against it, then tear my resources down.

## The Kubernetes Golang Client

The kubernetes client has typical CRUD like operations for dealing with various resources that you may be used to from working with the clients from other services, but it adds some extra primitives (primarily targeted at controller authors) that we can abuse. Kubernetes provides listers (which obviously are used to list things) and watchers. Watchers are used to set up a long polling client in the background, there-by allowing the client to be alerted as soon a change occurs to a particular resource. At the same time, these two things are combined into "Informers". Informers essentially create a shared spaced for the watchers that are registered client side. This helps optimise for the situation where clients need to watch multiple resource, by preventing a client from flooding the Kubernetes API server with long-polling operations. Watches can be restricted by labels/selectors and namespaces.

Here's an example for setting up a watch on the service objects with a test label in the default namespace.

```
import (
	"context"
	"time"

	"k8s.io/client-go/kubernetes"
	"k8s.io/client-go/tools/cache"
	"k8s.io/apimachinery/pkg/labels"

	kubeinformers "k8s.io/client-go/informers"
	corelisters "k8s.io/client-go/listers/core/v1"

	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
)


// The resync period, if specified x > 0, will send
// the entire list of watched resources to the client
// every x * period.

// Clients will typically need to set this if they are
// behaving as a controller - if the controller dies
// it will need to get back up to "resync" by
// interrogating the current state
resyncPeriod = 0 * time.Second

// I'll admit the API for filtering out resources
// is a tad.... baroque.
listOptions := func(options *metav1.ListOptions) {
	options.LabelSelector = labels.Set(map[string]string{
		"test": "test",
	}).AsSelector().String()
}

// We need to make a handler that will receive the events
// from the informer
events = make(chan struct{}, 10)
fn := func(obj interface{}) {
	events <- struct{}{}
}

// TODO: FIX THIS
handler := &cache.ResourceEventHandlerFuncs{
	AddFunc: fn,
	DeleteFunc: fn,
	UpdateFunc: func(old interface{}, new interface{}) {
		fn(new)
	},
}

// NewForConfigOrDie panics if the configuration throws an error
kubeclientset := kubernetes.NewForConfigOrDie(config)
kubeInformerFactory := kubeinformers.NewFilteredShareInformer(
	kubeclientset, resyncPeriod, namespace, listoptions)

serviceInformer := kubeInformerFactory.Core().V1().Services()
serviceLister = serviceInformer.Lister()
serviceInformer.Informer().AddEventHandler(handler)

ctx, cancel = context.WithCancel(context.Background())

go kubeInformerFactory.Start(ctx.Done())

// Generally it is a good idea to wait for the informer
// cache to sync. client-go provides a helper to
// do this...
if !cache.WaitForCacheSync(ctx.Done(),
	serviceInformer.Informer().HasSynced) {
		Fail("Timed out waiting for cache sync")
	}

// TODO: Show receiving events
```