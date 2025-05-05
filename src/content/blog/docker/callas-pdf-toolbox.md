---
title: Callas PDF Toolbox
description: Optimizing a docker image
slug: 'docker/callas-pdf-toolbox'
pubDate: 1746481292639
tags: ['docker']
isDraft: false
---

- [Problem](#problem)
- [Goals](#goals)
- [How do we accomplish these goals?](#how-do-we-accomplish-these-goals)
  - [Reduced build quantity](#reduced-build-quantity)
  - [Reduced image size](#reduced-image-size)
  - [Centralized source code and builds](#centralized-source-code-and-builds)
  - [Access to prior releases](#access-to-prior-releases)
  - [Improved control over releases](#improved-control-over-releases)
- [How do you build new version?](#how-do-you-build-new-version)
  - [.env file](#env-file)
  - [docker-compose.build.yml](#docker-composebuildyml)
  - [callas-pdftoolbox/Dockerfile](#callas-pdftoolboxdockerfile)
- [Notes](#how-do-you-build-new-version)

## Problem

The Callas PDF Toolbox was integrated into a PHP Docker image, leading to a couple of issues:

- increased docker image size
- lack of separation of concerns

I recognized the need for improvement, and I successfully addressed the primary issue with additional positive side effects.

## Goals

- reduced build quantity
- reduced image size
- centralized source code and builds
- access to prior releases
- improved control over release versions

## How do we accomplish these goals?

### Reduced build quantity

We reduce build quantities by moving the tool into a separate repository. This provides us with the ability to re-build the tool when dependencies of the tool change or we need a new version. Thats it.

Meaning, if this tool was embedded into a php image directly and the php version changed, we would be required to download this tool again, extract it, link it, etc. We don’t want that to happen just because we bump the php version. Its unnecessary and unpredictable. Builds can fails. Different versions can be pulled.

### Reduced image size

We reduce the image size by including only what is absolutely necessary in the final image version. This means, no build tools, no dev tools, etc. Only the binary that was built and/or extracted from a release will be included. We can accomplish this using two simple steps in a Dockerfile which requires the tool:

- copy the binary from our build
- setup a symlink

```
COPY --from=docker.remindermedia.net/devops/docker/pdf-toolbox:14-1-606-x64-debian /opt/callas_pdfToolboxCLI_x64_Linux /opt/callas_pdfToolboxCLI_x64_Linux

RUN ln -s /opt/callas_pdfToolboxCLI_x64_Linux/pdfToolbox /usr/bin/pdfToolbox
```

This copies over the binary and its dependencies only, leaving out any utilities used to build the tool.

### Centralized source code and builds

Because the tool is built and exposed via its own docker image, any project can leverage its use by copying the binary and its dependencies into a container that requires the tool. This leverages a few very important aspects:

- all applications have access to the exact same toolbox
- the tool needs to be tested only once will integration testing necessary for any consuming applications
- the tool is always available via image

### Access to prior releases

Once we build an image, we have access to the source code and binary of that release forever, or at least until we delete the image, giving us the confidence the tool is always available regardless of release age.

### Improved control over releases

Building images with tags based on the toolbox version provides us with the ability to easily transition and/or use and test different versions of the tool. Docker image tags will be based on the release version of the toolbox making its version is easily identifiable by anyone using it.

## How do you build new version?

While I cannot share the code used for this specific project, when building a new version a developer can simply:

- navigate to the repository containing the toolbox image source code
- update the .env file to reflect the new release version to build
- submit a merge request and merge
- let gitlab do its work by building and pushing the new image
- then, navigate to the services needing the toolbox and update the version of the toolbox image you want to copy the toolbox from

To learn more about the pieces involved, you’ll want to learn more about a few files:

- .env file
- docker-compose.build.yml
- callas-pdftoolbox/Dockerfile

The .env file specifies what release version to use and most importantly, keeps the image tag in sync with the release version. The release tar contains a folder named to reflect the release version. An example:

### .env file

```
PDF_TOOLBOX_VERSION=14-1-606
```

Would correspond to an extracted release folder: `callas_pdfToolboxCLI_x64_Linux_14-1-606`

```
root@ece66277b04d:/opt# ls -la
total 609216
drwxr-xr-x 1 root root      4096 Jan 23 20:20 .
drwxr-xr-x 1 root root      4096 Jan 23 20:18 ..
-rw-r--r-- 1 root root 623815396 Jul 11  2023 callas_pdfToolboxCLI_x64_Linux.tar.gz
drwxr-xr-x 7 root root      4096 Jan 11  2023 callas_pdfToolboxCLI_x64_Linux_14-1-606
```

### docker-compose.build.yml

As with all other docker compose build files, this file targets a stage to build. In addition, it ensures the image tag correlates to the toolbox release version using the environment variable specified in the .env file. Don’t make any changes to this file unless you know exactly what you’re doing.

For those not familar with how I structure my compose files, I have two different types:

- build files
- stack files

The build files define specific targets, build images, and tag accordingly. The stack files deploy images to a targeted environment.

### callas-pdftoolbox/Dockerfile

As with the docker-compose.build.yml file the most important part is to ensure the toolbox version defined in the .env aligns with the extracted folder from the release tar (minus the target platform and tool name). This is done via anARG.

## Notes

By now you may have noticed when you copy the toolbox from an image, the path to the toolbox does not include the release version. This is intentional to prevent developers from making errors by requiring them to update the release version in multiple locations. Simply rely on the image tag and know the toolbox you copy matches the tag version.

As of writing this, I know of no way to tie a release version to the tar ball download. With that said, if we find this is possible, we should include the release version when fetching the toolbox.
