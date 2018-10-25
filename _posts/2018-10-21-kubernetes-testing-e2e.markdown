---
layout: post
title:  "Testing and Kubernetes"
date:   2018-10-21
tags: Kubernetes Go Conformance BDD
author: Matt Tyler
image: img/kubernetes/k8s.png 
---
### Public Service Announcement
#### Mechanical Rock will be running a two day 'Intro to Kubernetes' course on January 9th & 10th at Cliftons Perth. Participants will learn to deploy and manage scalable applications in Kubernetes, from local development through to production. Participants will also demonstrate how Kubernetes provides high availability, scalability, and how Kubernetes integrates into existing on-premise and public cloud environments. [More information may be found at the event site.](https://ti.to/intro-to-kubernetes/intro-to-kubernetes)

<br/>

### TL;DR

- No matter how simple or complex our use of Kubernetes is, we want to ensure we can test and verify our interactions.
- As these interactions become more complex, or we require additional features like reporting, polling with cURL simply doesn't scale
- Instead, lets combine the Kubernetes Go Client and the Go testing framework to create and efficient and flexible testing platform.

### What and when should I test when using Kubernetes?

Kubernetes is a complex beast. Most operations are asynchronous; submitting an object definition (deployment, containers, etc) will return to the caller well before kubernetes has finished processing it. Therefore, if you absolutely need to know that what ever operation you submitted has taken effect, polling the cluster is essentially required.

This is generally OK for simple uses of the Kubernetes API eg; deploying stateless applications. Where this begins to break down is when using advanced Kubernetes features that you may want to verify are working correctly, or in the case where you are standing up systems upon Kubernetes that may use multiple resource types to function (clustered databases such as Elasticsearch, ETCD, and Cassandra being good examples).

The first case (advanced feature usage) is likely to occur when companies have opted to build an internal platform on Kubernetes, whereby developers are kept (mostly) oblivious to decisions like what storage to mount, use of service meshes etc. Admission controllers are a popular way to do this by intercepting and mutating developer workloads either by injecting sidecar proxies into containers, or configuring defaults. For compliance reasons, developer workloads should be tested and audited to ensure they are being configured in accordance with policy. How else would we know that; a) policy isn't being circumvented or b) the policy is actually configured correctly in the first place?

The latter case (use of multiple resource types, and the one I am personally more familiar with) commonly occurs when a team wants to provide multiple instances of a particular service - usually a third party service that is not provided by a public cloud vendor (if using a managed kubernetes provider, or because they are operating an on-premise cluster). Alternatively they could be packaging a system to run on other clusters (either their own or someone elses, potentially needing to test upon many different Kubernetes-based environments (AWS EKS, GCP GKE, OpenShift etc)). For those packaging a complex service for Kubernetes, testing is particularly important - how else would we guarantee that our service is going to work across many distributions? Plenty of potential customers may only run workloads in one cloud vendor, and therefore only one Kubernetes distribution.

In either case, what we want is clear - we want to be able to verify that what we run on our clusters (or someone else's for that matter) is working, no matter how complex it is. 

Performing long polling operations in an unstructered manner, built on bash scripts and hope, is both a recipe for an unmaintainable mess, and an *extremely* inefficient way to interrogate the cluster. To make matter worse, not using a proper testing framework means you will end up building swathes of non-differentiating functionality including test reporters, parallel test executors and test filters. The Kubernetes project's core controllers have less intensive ways of querying and caching responses from the Kubernetes API, and there are plenty of mature testing frameworks out there, so why not reuse them, rather than trying to build a better (read: worse) mouse-trap?

### BDD Style Testing in Go

This does come with a caveat; to take advantage of these libraries we will need to use Go, so our first step will be to learn how to write tests in it.

While the default testing libraries in Go are good, I, like most Mechanical Rock members, personally prefer the Given-When-Then style tests that Behaviour Driven Development tends to encourage. Fortunately there are already some libraries we can use to do this.

Those who are familiar with jasmine, mocha, jest etc should feel right at home. It consists of a specification framework [Ginkgo](https://onsi.github.io/ginkgo/) and an assertion library [Gomega](https://onsi.github.io/gomega/). Coincidently, these are the same packages that the Kubernetes project uses for it's end-to-end, integration and conformance testing.

What follows is an incredibly contrived example based on an infamous statement from our newest ex-Prime Minister. I'm sure no-one is going to struggle to understand this.

```
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
	})
})
```

### Reusing Go's Test Framework

Anyone that has used Go in any capacity is probably aware that you can execute `go test`, which will merrily go along and execute a bunch *_test.go files that you have in your source directory. Under the hood, Go compiles a binary and executes it, not much to see here. We can control the location of that test binary and what it is called by running `go test -c -o MyTests`. The `-o` flag will cause golang to create the binary in the current working directory, and `-c` will ensure the test binary is not immediately executed - only compiled. We can then execute our tests by issuing a `./MyTests` command.

We can go a few steps further than this. We can extend that test binary to take all sorts of additional flags, print out usage information, while still taking advantage of features of the Go tooling (eg; test reporting). I've done this in the past to extend my test binaries to bootstrap managed Kubernetes clusters in Google Cloud Platform, and/or target existing clusters that have been defined in a standard Kubernetes configuration file (kubeconfig). How to do this is briefly mentioned in Go's testing documentation, but I've found things work slightly differently when using Ginkgo. Most notably, it's not necessary to use TestMain for setup - you can get away with writing a single *_test.go file to act as an entry point.

```
// My "main" testing file, say e2e_test.go
import (
	...
	// Other imports ommitted for brevity
	// This import registers a test suite
	// The underscore indicates we are importing
	// it for the side-effects.
    _ ".../suite.go" 
)

var Test bool

// init is a special keyword in Go. Functions defined
// here are executed when the package is imported.
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

Personally, I combine this with extra flags; `-up` and `-down`. I can use these to both setup and tear down a cluster in one round of tests. I do this to prevent forgetting to tear down a cluster that I only had up for testing purposes; which goes a long way to ensuring my credit card isn't massacred by the charges that are incurred from cluster hosting.

Even cooler - we could package our test binary into a container and deploy it to a Kubernetes cluster. By binding a role to the container, our test binary could communicate with the Kubernetes cluster (the very same one that is currently hosting it) and perform a battery of tests in order to verify the cluster. One could deploy our container to a registry, spin up multiple clusters in different providers, pull the contaniner, and verify against all of them - seamlessly and simultaneously.

This is actually how the Kubernetes project [audits distributions of Kubernetes for conformance](https://github.com/heptio/sonobuoy). Those that pass the tests are able to assert that their distribution is eligible to be accepted as part of the [Certified Kubernetes Conformance programme](https://kubernetes.io/blog/2017/11/certified-kubernetes-conformance/).

### The Kubernetes Go Client

The Kubernetes client has typical CRUD like operations for dealing with various resources that you may be used to from working with clients for other services, but it adds some extra primitives (primarily targeted at controller authors) that we can take advantage of. Kubernetes provides listers (which obviously are used to list things) and watchers. Watchers are used to set up a long polling client in the background, there-by allowing the client to be alerted as soon a change occurs to a particular resource. At the same time, these two things are combined into "Informers". Informers essentially create a shared spaced for listers/watchers that are registered client side. This helps optimise for the situation where clients need to watch multiple resources; it prevents a client from flooding the Kubernetes API server with long-polling operations. Watchers (and listers for that matter) can also be restricted by labels/selectors and namespaces.

Here's an example for setting up a watch on service objects in a cluster within the default namespace. The full repository is available [here](https://github.com/MechanicalRock/k8s-service-watcher-demo/blob/master/main.go). You can safely copy the direct source (it's only one source file) or pull down the whole repository to compile and run it.

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
	// other auth providers. These need to be imported for their
	// side-effects
	_ "k8s.io/client-go/plugin/pkg/client/auth/gcp"
)
```

A lot of libraries need to be pulled into used shared-informers. It's probably one of the most annoying aspects of their use.

```
func main() {

	signalChannel := make(chan os.Signal, 2)

	signal.Notify(signalChannel, os.Interrupt, syscall.SIGTERM)

```

This is some basic signal handling, so we can handle a graceful termination upon a termination signal (Ctrl+C).

```
	config, err := buildConfig(kubeconfig)
	if err != nil {
		panic(err)
	}

	resyncPeriod := 5 * time.Second
```

The resync period, if specified x > 0, will send the entire list of watched resources to the client every x * period. Clients typically set this if they are behaving as a controller. If the controller dies it will need to recover by being sent what the most recent state was. It's then up to the controller to determine what it may have missed during it's downtime.

```
	namespace := "default"

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
```

We need to make a handler that will receive the events from the informer. For the sake of the example I'll just throw them onto a channel (queue). We can receive events for adding, deleting or updating a resource.

```
	// NewForConfigOrDie panics if the configuration throws an error
	kubeclientset := kubernetes.NewForConfigOrDie(config)
	kubeInformerFactory := kubeinformers.NewFilteredSharedInformerFactory(
		kubeclientset, resyncPeriod, namespace, nil)
```

Client-Go provides a factory for constructing informers for various resources. Constructing informers from the factory ensures that if two processes query for the same set of resources, only one call is made to the API server, thereby reducing load.

```
	serviceInformer := kubeInformerFactory.Core().V1().Services()
	// serviceLister := serviceInformer.Lister()
	serviceInformer.Informer().AddEventHandler(handler)
```

In this case, we'll get an informer for service objects, and pass in our event handler we defined earlier to capture the events.

```
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
```

We need to both start the informer, and provide a means to stop it upon receiving the aforementioned termination signal. To do this, we create a context to act as a cancellation signal to the informer. We pass this to the WaitForCacheSync method so we can stop the initial cache synchronisation if we cancel early. We also pass in the informers we want to use. This ensures we populate the underlying cache before we start using it.

```
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

This is printing off the services as we receive events indicating that something changed (added, updated, or deleted) in the service space. 

Try running this against a cluster while creating service objects. From this example it should be reasonably clear how to extend this to watch other resources.

### Putting it all together

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

I've applied the same strategy when building tests for my (admittedly, work-in-progress) [elasticsearch operator](https://github.com/matt-tyler/elasticsearch-operator/blob/master/e2e/suite/create.go). In it, I register a Custom Resource Definition. I can then create "clusters" which are objects representing a complete elasticsearch cluster. Underneath that definition though, are various lower level resources (services, deployments, roles) that enable the Elasticsearch cluster. By watching for those resources that I expect the controller to create upon submitting a cluster definition to the controller, I can ensure the controller behaves as expected. This tends to map very well with Behavior Driven Development. I would typically start with statements like;

``` 
Given I have registered my Custom Resource Definition with the cluster,

	When I apply a Custom Resource Specification

		Then I should create a headless service for the control plane

		Then I should create a master node deployment

		Then I should create a data node deployment
```

A small demonstration: The bottom window shows the logging output of the controller, the top-left is the output of the test runner, and the top-right is a watch of on service objects (eg; `watch -n 1 kubectl get services`).

![](/img/kubernetes/k8s-testing.gif)

This is helping me to focus my development on the most important functionality required to get things working, without getting too bogged down in the details (which admittedly still happens but less so than before!).

### Conclusion

As alluded to earlier, I've been using this approach to testing to build an elasticsearch controller. I've found this a useful way to write and execute tests that are expressive enough to both serve as a useful for specification for further development, and as a comprehensive verification suite. Building a functioning elasticsearch cluster is an arduous process, requiring different components (master nodes, data nodes, client nodes, frontend nodes) as well different discovery methods for both client and master node election resolution. 

Quite frankly, due to the complexity involved, if I did not have a comprehensive test suite, I would not feel confident asserting that it would work across the most popular Kubernetes distributions. As a big plus, if another distribution came along, I could target my existing test framework at this cluster with no extra work involved (aside from potentially needing to fix broken functionality uncovered by the tests). I could also package my verification tests; so if a third party wanted to check that my controller worked on their cluster, they could so independently of me by deploying the verification tests to their cluster. I can't think of too many vendors that provide automated test suites that verify their software design is working in the field.

This should have given you a few ideas about how to interact with the Kubernetes API to create flexible test suites. There is a wealth of resources in the [Kubernetes community repositories](https://github.com/kubernetes/community/blob/master/contributors/devel/e2e-tests.md) if you are looking to learn more about the project's test infrastructure. I hope the examples here will serve as a useful starting point for verifying your own systems.