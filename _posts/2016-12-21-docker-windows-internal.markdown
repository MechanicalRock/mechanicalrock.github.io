---
layout: post
title:  "Docker for Windows Internal"
date:   2016-12-07 04:48:58 +0000
tags: docker devops windows
author: William Sia
image: img/docker-windows.png
---

In Windows Server 2016, which was released on Oct 12, 2016 Microsoft released the native windows support for Containers. It’s better to be late than never.

The installer for Docker for Windows can be found [here](https://download.docker.com/win/stable/InstallDocker.msi)

You can start windows container either in Windows Server mode or Hyper-V mode. Images created in one can be used in other. The difference between these two modes is the level of isolation when launching the image.

One of the great things about Docker for Windows is you don’t have to relearn how to work with containers if you have past experience with Linux container. However there are a number of functionalities of docker in Linux, that is not being implemented in its windows port.

The source code for Docker can be found in [here](https://github.com/docker/docker)

The way the interfaces are implemented in Go, make it very easy for the core development team to write windows & linux specific implementation while keeping the user interface (the commands line) the same.

Both of windows and linux specific implementation can be found in the same repository. To find out a specific implementation for Linux, just do a search with
~~~
// +build !windows
~~~
{: .language-go}

This is the build tag to indicate to go compiler to only include this file if the build system is not windows.

So if you browse on the repo, you normally see a lot of files with the postfix of either **_windows.go** or **_linux.go**, all **_linux.go** files have the postfixed mentioned above, which means when they’re compiled for docker linux distro and not for windows.

If you compare the two files, you notice that there are a lot of methods in files with windows postfix that is not implemented, .e.g

+ container_windows.go

~~~
// IpcMounts returns the list of Ipc related mounts.
func (container *Container) IpcMounts() []Mount {
  return nil
}
~~~
{: .language-go}

+ daemon_windows.go

~~~
func getBlkioReadBpsDevices(config *containertypes.HostConfig) ([]blkiodev.ThrottleDevice, error) {
  return nil, nil
}

func getBlkioWriteBpsDevices(config *containertypes.HostConfig) ([]blkiodev.ThrottleDevice, error) {
  return nil, nil
}
~~~
{: .language-go}



This will give you some idea of what functions are not implemented in windows, such as **getSystemCPUUsage** in **stats_collector_windows.go**
~~~
// +build windows

package stats

// platformNewStatsCollector performs platform specific initialisation of the
// Collector structure. This is a no-op on Windows.
func platformNewStatsCollector(s *Collector) {
}

// getSystemCPUUsage returns the host system's cpu usage in
// nanoseconds. An error is returned if the format of the underlying
// file does not match. This is a no-op on Windows.
func (s *Collector) getSystemCPUUsage() (uint64, error) {
  return 0, nil
}

func (s *Collector) getNumberOnlineCPUs() (uint32, error) {
  return 0, nil
}
~~~
{: .language-go}

You can also search for
~~~
runtime.GOOS == "windows"
~~~
{: .language-go}

to know which specific feature is implemented or not implemented on windows. Feature such as diff on running container, which is not supported in Windows.

~~~
// ContainerChanges returns a list of container fs changes
func (daemon *Daemon) ContainerChanges(name string) ([]archive.Change, error) {
  start := time.Now()
  container, err := daemon.GetContainer(name)
  if err != nil {
    return nil, err
  }

  if runtime.GOOS == "windows" && container.IsRunning() {
    return nil, errors.New("Windows does not support diff of a running container")
  }

  container.Lock()
  defer container.Unlock()
  c, err := container.RWLayer.Changes()
  if err != nil {
    return nil, err
  }
  containerActions.WithValues("changes").UpdateSince(start)
  return c, nil
}

~~~
{: .language-go}

So when a particular feature does not on Windows Docker engine, consult the source code to check whether that feature is in fact implemented or not.

Windows’ equivalence of LXC
------

Docker for Windows uses [hcsshim](https://github.com/Microsoft/hcsshim) package to create containers in Windows Servers. The hcsshim library itself is a go package that serves as a wrapper to windows system dll called **vmcompute.dll**

This system library itself is the OS primitive that does the virtualization for you.
~~~
var (
modole32     = windows.NewLazySystemDLL("ole32.dll")
modiphlpapi  = windows.NewLazySystemDLL("iphlpapi.dll")
modvmcompute = windows.NewLazySystemDLL("vmcompute.dll")

procCoTaskMemFree                      = modole32.NewProc("CoTaskMemFree")
procSetCurrentThreadCompartmentId      = modiphlpapi.NewProc("SetCurrentThreadCompartmentId")
procActivateLayer                      = modvmcompute.NewProc("ActivateLayer")
procCopyLayer                          = modvmcompute.NewProc("CopyLayer")
procCreateLayer                        = modvmcompute.NewProc("CreateLayer")
procCreateSandboxLayer                 = modvmcompute.NewProc("CreateSandboxLayer")
procExpandSandboxSize                  = modvmcompute.NewProc("ExpandSandboxSize")
procDeactivateLayer                    = modvmcompute.NewProc("DeactivateLayer")
procDestroyLayer                       = modvmcompute.NewProc("DestroyLayer")
procExportLayer                        = modvmcompute.NewProc("ExportLayer")
~~~
{: .language-go}

Docker command line is not the only way for you to interact with the docker daemon (docker windows service in Windows world). There is a [PowerShell cmdlet](https://github.com/Microsoft/Docker-PowerShell) that you can use if you’re more familiar with powershell or want to integrate your existing powershell script with dockers.

This powershell cmdlet itself is built on top of [Docker.DotNet](https://github.com/Microsoft/Docker.DotNet). Docker.DotNet itself is just a library that interact with the [Docker Remote API](https://docs.docker.com/engine/reference/api/docker_remote_api/).


