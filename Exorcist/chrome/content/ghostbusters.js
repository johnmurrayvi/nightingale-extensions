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

var Ghostbusters = {
	list : null,
	ghosts : null,
	progressbar: null,
	index: 0,

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

	errorConsole : Cc["@mozilla.org/consoleservice;1"]
		.getService(Ci.nsIConsoleService),

	onEnumerationBegin: function(list) {
		this.ios = Cc["@mozilla.org/network/io-service;1"]
					.getService(Ci.nsIIOService);
		this.fileHandler = this.ios.getProtocolHandler("file")
					.QueryInterface(Ci.nsIFileProtocolHandler);
		this.setProgress(0);
	},
	onEnumeratedItem: function(list, item) {
		var pct = 100*(this.index++)/(list.length);
		this.setProgress(pct);

		if (item.getProperty(SBProperties.isList) == 1)
			return;
		var path = item.getProperty(SBProperties.contentURL);
		if (path) {
			// if it's not a file URI then skip (don't want to do it
			// for http URIs)
			if (this.ios.extractScheme(path) != "file") {
				this.errorConsole.logStringMessage("Exorcist: " +
						path + " isn't a local file, skipping");
				return;
			}

			var file;
			try {
				file = this.fileHandler.getFileFromURLSpec(path);
			} catch (e) {
				alert("Failed to open a file handler for: " + path);
			}
			if (!file.exists()) {
				this.errorConsole.logStringMessage("Exorcist: " + path +
						" is missing");
				this.ghosts.push(item);
			}
		}
	},  
	onEnumerationEnd: function(list) {
		this.setProgress(100);
	},

	findGhosts : function(list, progressbar) {
		this.list = list;
		this.ghosts = new Array();
		this.progressbar = progressbar;
		list.enumerateAllItems(this);
		this.errorConsole.logStringMessage("Exorcist: " +
				this.ghosts.length + " ghosts found!");
		return (this.ghosts);

	},

	killAllGhosts : function() {
		this._strings = document.getElementById("exorcist-strings");
		var answer = confirm(this._strings.getString("killAllGhostsPrompt"));
		if (answer) {
			for (ghost in this.ghosts) {
				this.list.remove(this.ghosts[ghost]);
			}
		}
	}
}
