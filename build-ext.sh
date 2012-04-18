#!/bin/sh

ext=$1
rm -f $ext.xpi
cd $ext
zip -r ../$ext.xpi ./

