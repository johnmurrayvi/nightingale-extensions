if (typeof(Cu) == "undefined")
	var Cu = Components.utils;
if (typeof(Cc) == "undefined")
	var Cc = Components.classes;
if (typeof(Ci) == "undefined")
	var Ci = Components.interfaces;
if (!window.SBProperties)   
	Cu.import("resource://app/jsmodules/sbProperties.jsm");  
if (!window.LibraryUtils)   
	Cu.import("resource://app/jsmodules/sbLibraryUtils.jsm");  

/*
 * with thanks to Richard Crowley @ Flickr for his MD5 code
 * http://rcrowley.org/2007/11/15/md5-in-xulrunner-or-firefox-extensions/
 */
var Clones = {
	_md5: null,
	duplicates: null,
	initialised: false,
	
	init: function() {
		try {
			this._md5 = Cc['@mozilla.org/security/hash;1']
				.createInstance(Ci.nsICryptoHash);
		} catch (err) {
			Components.utils.reportError(err);
		}
		this.initialised = true;
	},

	md5sum: function(str) {
		if (null == this._md5) {
			return '';
		}

		// Build array of character codes to MD5
		var arr = [];
		var ii = str.length;
		for (var i = 0; i < ii; ++i) {
			arr.push(str.charCodeAt(i));
		}
		this._md5.init(Ci.nsICryptoHash.MD5);
		this._md5.update(arr, arr.length);
		var hash = this._md5.finish(false);

		// Unpack the binary data bin2hex style
		var ascii = [];
		ii = hash.length;
		for (var i = 0; i < ii; ++i) {
			var c = hash.charCodeAt(i);
			var ones = c % 16;
			var tens = c >> 4;
			ascii.push(String.fromCharCode(tens + (tens > 9 ? 87 : 48)) +
				String.fromCharCode(ones + (ones > 9 ? 87 : 48)));
		}

		return ascii.join('');
	},

	getDuration: function(item) {
		var itemDuration = (item.getProperty(SBProperties.duration) / 1000000);
		return (Math.floor(itemDuration / 60) + ":" + (itemDuration % 60));
	},

	setProgress : function(pct) {
		this.progressbar.value = pct;
		if (pct % 5) {
			while (Cc["@mozilla.org/thread-manager;1"].getService()
				.currentThread.hasPendingEvents())
			{
				Cc["@mozilla.org/thread-manager;1"].getService()
						.currentThread.processNextEvent(true);
			}
		}
	},


	onEnumerationBegin: function(list) {
		this.setProgress(0);
		this.hashMap = new Array();
	},
	onEnumeratedItem: function(list, item) {
		var pct = 100*(this.index++)/(list.length);
		this.setProgress(pct);

		if (item.getProperty(SBProperties.isList) == 1)
			return;

		var str = item.getProperty(SBProperties.artistName) + '|' +
			item.getProperty(SBProperties.albumName) + '|' +
			item.getProperty(SBProperties.trackName) + '|' +
			item.getProperty(SBProperties.duration);
			//item.getProperty(SBProperties.genre) + '|' +
			//item.getProperty(SBProperties.contentLength) + '|' +
		str = str.toLowerCase();
		
		var hash = this.md5sum(str);
		if (this.hashMap[hash]) {
			this.hashMap[hash].push(item);
			this.duplicates.push(this.hashMap[hash]);
			dump(">>> " + str + " is a dupe\n");
		} else {
			this.hashMap[hash] = new Array();
			this.hashMap[hash].push(item);
		}
	},  
	onEnumerationEnd: function(list) {
		this.setProgress(100);
	},

	detectDuplicates: function(list, progress) {
		if (!this.initialised)
			this.init();
		this.progressbar = progress;

		this.list = list;
		if (this.duplicates != null)
			delete this.duplicates;
		this.duplicates = new Array();
		list.enumerateAllItems(this);

		var duplicateGuids = new Array();
		for each (var itemArray in this.duplicates) {
			for each (var item in itemArray) {
				duplicateGuids.push(item.guid);
				dump("***** duplicate guid:" + item.guid + "\n");
			}
		}
		return duplicateGuids;
	},

	killClones: function() {
		this._strings = document.getElementById("exorcist-strings");
		var answer = confirm(this._strings.getString("killAllClonesPrompt"));
		if (answer) {
			for each (var itemArray in this.duplicates) {
				var itemToSave = null;
				var bestBitRate = -1;

				for each (var item in itemArray) {
					if (item.getProperty(SBProperties.bitRate) > bestBitRate) {
						bestBitRate = item.getProperty(SBProperties.bitRate);
						itemToSave = item;
					}
					// Added this clause to prefer clones that are rated...
					else if(item.getProperty(SBProperties.rating)) {
						dump("--Keeping rated item: " + item.guid + "\n");
						itemToSave = item;
					}
				}
				for each (var item in itemArray) {
					if (itemToSave != item) {
						dump("--Removing " + item.guid + "\n");
						this.list.remove(item);
					}
				}
			}
		}
	}
}
