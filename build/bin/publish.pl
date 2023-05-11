#!/usr/bin/perl
use strict;
use warnings;
use v5.10.0;
use utf8;
use open qw/:std :utf8/;

use Cwd;

my $CWD = cwd;
say $CWD;

my $version = `npm pkg get version | sed 's/"//g'`;
chomp $version;
say "package.json version $version";

my $online = `npm view x_ite version`;
chomp $online;
say "NPM version $online";

#system "npm version patch" if $version eq $online;
