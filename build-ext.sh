#!/bin/sh

ext=$1
bdir=xpis
if [ ! -d $bdir ] ; then
	mkdir xpis
elif [ -f "$bdir/$ext.xpi" ] ; then
	rm -f $ext.xpi
fi

cd $ext
zip -r ../$bdir/$ext.xpi ./

