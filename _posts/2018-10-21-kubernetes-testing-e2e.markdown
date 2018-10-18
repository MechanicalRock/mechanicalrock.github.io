---
layout: post
title:  "Testing and Kubernetes"
date:   2018-10-21
tags: Kubernetes Go Conformance BDD
author: Matt Tyler
image: img/kubernetes/k8s.png 
---

## Cliff Notes

- Interacting with the Kubernetes API is a great way to validate that things are as they should be in your cluster
- The Go client is the most mature Kubernetes client and can be used to efficiently watch for changes in cluster state.
- We can write BDD style tests with Ginkgo and Gomega frameworks for Go
- The Go tooling is flexible; we can use some tricks that enable us to use Go's standard testing infrastructure outside of plain old unit tests, for more flexible end-to-end testing of arbitrary environments.

## What, I have to test my infrastructure as well now?

I'm sure it wouldn't raise too many eyebrows if I asserted that testing is an oft neglected element in the software development process. 

This brave new cloud world might have freed us from months of waiting for hardware by placing provisioning behind a programmable API, but how many of us are testing our deploys of infrastructure? I can only assume that if these two things on their own were already 'uncommon', the combination thereof is probably rare as hen's teeth. Given that we have these fantastic cloud infrastructure management planes, why not put them to good use by validating our infrastructure? Here's how to do it in Kubernetes using the Client-Go.

## BDD Style Testing in Go

The in-built testing package in the Go standard library isn't particularly nice to use for the BDD style tests I've become accustomed to in Javascript land. Fortunately, there is a package in Golang that offers similar semantics to those found in popular Javascript testing frameworks. Those who are familiar with jasmine, mocha, jest etc should feel right at home. It consists of a specification framework [Ginkgo](https://onsi.github.io/ginkgo/) and an assertion library [Gomega](https://onsi.github.io/gomega/). Coincidently, these are the same packages that the Kubernetes projects uses for it's end-to-end, integration and conformance testing.

What follows is an incredibly contrived example based on an infamous statement from our newest ex-Prime Minister. I'm sure no-one is going to struggle to understand this.

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

## Reusing Go's Test Framework

Anyone has used Go in any capacity is probably aware that you can execute `go test`, which will merrily go along and execute a bunch *_test.go files that you have in your source directory. Under the hood, Go compiles a binary and executes, not much to see here. We can control where that test binary is and what it is called by running `go test -c -o MyTests`. The `-o` flag will cause golang to create the binary in the current working directory, and `-c` will ensure the test binary is not immediately executed - only compiled. We can then execute our tests by issuing a `./MyTests` command.

We can go a few steps further than this. We can extend that test binary to take all sorts of additional flags, print out usage information, while still taking advantage of features of the Go tooling (eg; test reporting). I've done this in the past to extend my test binaries to bootstrap managed Kubernetes clusters in Google Cloud Platform, and/or target existing clusters that have been defined in a standard Kubernetes configuration file (kubeconfig). How to do this is briefly mentioned in Go's testing documentation, but I've found things work slightly differently when using Ginkgo. Most notably, it's not necessary to use TestMain for setup - you can get away with writing a single *_test.go file to act as an entry point.

```
// My "main" testing file, say e2e_test.go
package e2e

import (
    "flag"
    "testing"

    . "github.com/onsi/ginkgo"
    . "github.com/onsi/gomega"

	// This import registers a test suite
	// The underscore indicates we are importing
	// it for the side-effects.
    _ ".../suite.go" 
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

Executing a command like `go test` will now not execute our tests; would need to pass the -test flag e.g.: `go test -test`

This can be quite useful for bring up a target environment before executing tests against the environment e.g.: `go test -up -test- down` to bring up a cluster, execute my tests against it, then tear my resources down.

Even cooler - we could package our test binary into a container and deploy it to a Kubernetes cluster. By binding a role to the container, our test binary could communicate with the Kubernetes cluster (the very same one that is currently hosting it) and perform a battery of tests in order to verify the cluster.

This is actually how the Kubernetes project [audits distributions of Kubernetes for conformance](https://github.com/heptio/sonobuoy). Those that pass the tests are able to assert that their distribution is eligible to be accepted as part of the [Certified Kubernetes Conformance programme](https://kubernetes.io/blog/2017/11/certified-kubernetes-conformance/).

## The Kubernetes Go Client

The Kubernetes client has typical CRUD like operations for dealing with various resources that you may be used to from working with the clients from other services, but it adds some extra primitives (primarily targeted at controller authors) that we can take advantage of. Kubernetes provides listers (which obviously are used to list things) and watchers. Watchers are used to set up a long polling client in the background, there-by allowing the client to be alerted as soon a change occurs to a particular resource. At the same time, these two things are combined into "Informers". Informers essentially create a shared spaced for watchers that are registered client side. This helps optimise for the situation where clients need to watch multiple resources; it prevents a client from flooding the Kubernetes API server with long-polling operations. Watchers (and listers for that matter) can be restricted by labels/selectors and namespaces.

Here's an example for setting up a watch on service objects in a cluster within the default namespace. The full repository is available [here](https://github.com/MechanicalRock/k8s-service-watcher-demo/blob/master/main.go).

```
package main

import (
	"context"
	"flag"
	"fmt"
	"time"

	"os"
	"os/signal"
	"syscall"

	// "k8s.io/apimachinery/pkg/labels"
	"k8s.io/client-go/kubernetes"
	"k8s.io/client-go/rest"
	"k8s.io/client-go/tools/cache"
	"k8s.io/client-go/tools/clientcmd"

	"k8s.io/api/core/v1"

	kubeinformers "k8s.io/client-go/informers"

	// metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"

	// depending on how you are configured, you may want to add
	// other auth providers
	_ "k8s.io/client-go/plugin/pkg/client/auth/gcp"
)

var kubeconfig string

func init() {
	flag.StringVar(&kubeconfig, "kubeconfig", "~/.kube/config", "Location of kubeconfig")
}

func buildConfig(kubeconfig string) (*rest.Config, error) {
	if config, err := clientcmd.BuildConfigFromFlags("", kubeconfig); err == nil {
		return config, err
	}

	// else try running with the from the default kubeconfig location
	return clientcmd.NewNonInteractiveDeferredLoadingClientConfig(
		clientcmd.NewDefaultClientConfigLoadingRules(),
		&clientcmd.ConfigOverrides{},
	).ClientConfig()
}

func main() {

	signalChannel := make(chan os.Signal, 2)

	signal.Notify(signalChannel, os.Interrupt, syscall.SIGTERM)

	config, err := buildConfig(kubeconfig)
	if err != nil {
		panic(err)
	}

	// The resync period, if specified x > 0, will send
	// the entire list of watched resources to the client
	// every x * period.

	// Clients will typically need to set this if they are
	// behaving as a controller - if the controller dies
	// it will need to get back up to "resync" by
	// interrogating the current state
	resyncPeriod := 5 * time.Second

	namespace := "default"

	// I'll admit the API for filtering out resources
	// is a tad.... baroque.

	/*listOptions := func(options *metav1.ListOptions) {
		options.LabelSelector = labels.Set(map[string]string{
			"test": "test",
		}).AsSelector().String()
	}*/

	// We need to make a handler that will receive the events
	// from the informer. For the sake of the example I'll
	// just throw them onto the queue.
	events := make(chan interface{})
	fn := func(obj interface{}) {
		events <- obj
	}

	handler := &cache.ResourceEventHandlerFuncs{
		AddFunc:    fn,
		DeleteFunc: fn,
		UpdateFunc: func(old interface{}, new interface{}) {
			fn(new)
		},
	}

	// NewForConfigOrDie panics if the configuration throws an error
	kubeclientset := kubernetes.NewForConfigOrDie(config)
	kubeInformerFactory := kubeinformers.NewFilteredSharedInformerFactory(
		kubeclientset, resyncPeriod, namespace, nil)

	serviceInformer := kubeInformerFactory.Core().V1().Services()
	// serviceLister := serviceInformer.Lister()
	serviceInformer.Informer().AddEventHandler(handler)

	ctx, cancel := context.WithCancel(context.Background())

	go kubeInformerFactory.Start(ctx.Done())

	// Generally it is a good idea to wait for the informer
	// cache to sync. client-go provides a helper to
	// do this...
	if !cache.WaitForCacheSync(ctx.Done(),
		serviceInformer.Informer().HasSynced) {
		os.Exit(1)
	}

	// At this point we can receive and the events and do
	// whatever we like with them. If we receive SIGTERM
	// we cancel the context and exit.

	for {
		select {
		case event := <-events:
			service, ok := event.(*v1.Service)
			if ok {
				fmt.Printf("%s\t\t%s\t\t%s\n", service.Namespace, service.Name, service.Spec.Type)
			}
		case <-signalChannel:
			cancel()
			os.Exit(0)
		}
	}
}
```

Try running this against a cluster while creating service objects. From this example it should be reasonably clear how to extend this to watch other resources.

## Putting it all together

The Kubernetes API is more or less a set of building blocks. The smaller blocks are used to compose bigger pieces of functionality. This is most obvious when inspecting Containers, Pods, ReplicaSets and Deployments. These four objects build upon each to provide the container orchestration functionality. Inspecting the API, we can see that in each there is a kind-of embedding of the lower level primitives (containers, replicas) in a higher level primitive (deployment).

```
apiVersion: apps/v1
kind: Deployment
metadata:
  name: nginx-deployment
  labels:
    app: nginx
spec:
  replicas: 3
  selector:
    matchLabels:
      app: nginx
  template:
    metadata:
      labels:
        app: nginx
    spec: // The spec is more or less the pod object
      containers: // As you may guess, this is a list of container definitions
      - name: nginx 
        image: nginx:1.15.4
        ports:
        - containerPort: 80	
```

A natural consequence of this is the expectation that creating a higher level object will result in the creation of lower level objects, and you can see a practical result of this in the Kubernetes test for certain resources. For example, you can clearly see this in the test for the deployment resource, located [here](https://github.com/Kubernetes/Kubernetes/blob/master/test/e2e/apps/deployment.go).

I've applied the same strategy when building tests for my (admittedly, work-in-progress) [elasticsearch operator](https://github.com/matt-tyler/elasticsearch-operator/blob/master/e2e/suite/create.go). In it, I register a Custom Resource Definition. I can then create "clusters" which are objects representing a complete elasticsearch cluster. Underneath that definition though, are various lower level resources that (services, deployments, roles) that enable the Elasticsearch cluster. By watching for those resources that I expect the controller to create upon submitting a cluster definition to the controller, I can ensure the controller behaves as expected. This tends to map very well with Behavior Driven Development. I would typically start with statements like;

``` 
Given I have registered my Custom Resource Definition with the cluster,

	When I apply a Custom Resource Specification

		Then I should create a headless service for the control plane

		Then I should create a master node deployment

		Then I should create a data node deployment
```

This is helping me to focus my development on the most important functionality required to get things working, without getting too bogged down in the details (which admittedly still happens but less so than before!).

## Conclusion

This should have given you a few ideas about how to interact with the Kubernetes API to create flexible test suites. There is a wealth of resources in the [Kubernetes community repositories](https://github.com/kubernetes/community/blob/master/contributors/devel/e2e-tests.md) if you are looking to learn more about the project's test infrastructure. I hope the examples here will serve as a useful starting point for verifying your own systems.