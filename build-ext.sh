#!/bin/sh

ext=$1
if [ ! -d "built" ] ; then
	mkdir xpis
elif [ -f "built/$ext.xpi" ] ; then
	rm -f $ext.xpi
fi

cd $ext
zip -r ../xpis/$ext.xpi ./

