---
title: Zig Installer
description: Building a simple zig installer
slug: 'zig/installer'
pubDate: 1746481853572
tags: ['zig', 'programming']
isDraft: false
---

As of right now, Zig does not have an installer so installing Zig is a manual process. Every time a new version of Zig was released, I found myself repeating the same steps:

- manually download the tarball
- extract the content into `/opt/zig` (this is the directory I prefer)
- remove the old tarball
- symlink the new version

So initially I wrote a very simple shell script to handle the process. Later, I rewrote the script to be a go program. Here is the source code if you're interested: https://github.com/exilesprx/zig-installer . And if you find it useful, feel free to give me a star :) .
