#!/usr/bin/perl
use v5.10.0;
use utf8;
use open qw/:std :utf8/;

use File::Basename;

$ref = "/Users/holger/Desktop/X_ITE/x_ite/docs/_posts/components";

sub node {
   $file = shift;
   chomp $file;

   $text = `cat '$file'`;

   $text =~ /belongs to the \*\*(.*?)\*\*/;
   $component = $1;
   $component =~ s/[\\-]//;

   $text =~ /title: ([^\s]+)/;
   $node = $1;

   say $component, " ", $node;

   $fmatter = "---
title: $node
date: 2022-01-07
nav: components
categories: [components]
tags: [$node, $component]
---
<style>
.post h3 {
  word-spacing: 0.2em;
}
</style>
";

   $text =~ s|---.*?---|$fmatter|s;
   $text =~ s|$node\n=+|## Overview|;
   $text =~ s|\n(.+?)\n=+|\n## $1|g;
   $text =~ s/\n(Hints?|Examples?)\n-+/\n### $1/g;
   $text =~ s|H-Anim|HAnim|g;
   $text =~ s|Hanim|HAnim|g;
   $text =~ s|</div></section><section><div>||g;
   $text =~ s|<section><div>||g;
   $text =~ s|</div></section>||g;
   $text =~ s|\\\[mwm-aal-display\\\]\n\n||g;
   $text =~ s|<pre class="">||g;
   $text =~ s|</div></section><section><div>||g;
   $text =~ s|</article><article class="function">||g;
   $text =~ s|<article class="function">||g;
   $text =~ s|</article>||g;
   #$text =~ s|</?small>||g;
   $text =~ s|\\([\[\]])|$1|g;
   $text =~ s|&lt;|\\<|g;
   $text =~ s|&gt;|\\>|g;
   $text =~ s|\\<(.*?)\\>|`<$1>`|sg;
   $text =~ s|[\s\n]*$||sg;
   $text =~ s|(\w)\\(_\w)|$1$2|g;
   $text =~ s|,"|, "|g;
   $text =~ s|\bX3DAppearanceChild\b|X3DAppearanceChildNode|g;
   $text =~ s|Value_changed|value_changed|g;
   $text =~ s|(\[.*?\]\(.*?\))|$1\{:target="_blank"\}|g;
   $text =~ s|## Browser Compatibility.*?</table>\n\n||s;
   $text =~ s|http://www.web3d.org|https://www.web3d.org|sg;
   $text =~ s|\[X3D Specification\]|[X3D Specification of $node]|s;
   $text =~ s|\[c3-source-example url="(.*?)"\]|<x3d-canvas src="https://create3000.github.io/media/examples/$component/$node/$node.x3d"></x3d-canvas>|g;

   $text =~ m|#### See Also\s+?((?:\[.*?\]\(.*?\)\s*)+)|;
   $links = $1;
   $links =~ s|\[|\n- [|sg;
   $text =~ s|#### See Also.*?###|### See Also\n$links\n\n###|s;

   system "mkdir -p '$ref/$component'";
   open FILE, ">", "$ref/$component/$node.md";
   say FILE $text;
   close FILE;
}

$components = "/Volumes/Home/Projekte/Server/create3000.de/www.md/users-guide/components";

node $_ foreach sort `find $components -maxdepth 2 -mindepth 2 -type f`;
