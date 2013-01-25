#!/bin/sh

ext=`echo $1 | sed 's/\///g'`
ver=$(cat $ext/install.rdf | grep em:version | sed 's/^[ \t]*//g' | sed 's/[<*>,em:version,\/]//g') 
bdir=xpis
if [ ! -d $bdir ] ; then
	mkdir xpis
elif [ -f "$bdir/$ext-$ver.xpi" ] ; then
	rm -f $ext.xpi
fi

cd $ext
zip -r ../$bdir/$ext-$ver.xpi ./

