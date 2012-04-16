var libmove =
{
	source: "",
	destination: "",
	onLoad: function(){
		var strings = document.getElementById("libmover-strings");
		this.movecomplete = strings.getString('libmover.movecomplete');
		this.selectdir = strings.getString('libmover.selectdir');
		this.playbackwarning = strings.getString('libmover.playbackwarning');
		alert(this.playbackwarning);
	},

	moveFiles: function()
	{
		var start = libmove.getCurrentTime();
		var ios = Components.classes["@mozilla.org/network/io-service;1"]
			.getService(Components.interfaces.nsIIOService);
		var files = libmove.getContent(libmove.source);
		var gMM = Components.classes["@songbirdnest.com/Songbird/Mediacore/Manager;1"].getService(Components.interfaces.sbIMediacoreManager);
		gMM.sequencer.stop();	//interrupt playback
		for(var i=0; i<files.length;++i)
		{
			//document.getElementById('prog').value = (i+1)/files.length*100;
			//dump("\nMoving file "+ios.newFileURI(files[i]).spec);
			files[i].moveTo(libmove.destination, '');
		}
		
		var ios = Components.classes["@mozilla.org/network/io-service;1"] 
			.getService(Components.interfaces.nsIIOService);   
		var sourceURL = ios.newFileURI(libmove.source).spec.toLowerCase(); 			////////LOWERCASE!!!!!1111
		var destinationURL = ios.newFileURI(libmove.destination).spec.toLowerCase(); 
		dump("\nReplacing "+sourceURL+" with "+destinationURL); 
		libmove.queryDatabase("UPDATE media_items SET content_url = REPLACE(content_url,'"+sourceURL+"','"+destinationURL+"')", "content_url");

 		var end = libmove.getCurrentTime();
		alert(end-start);
		alert(this.movecomplete);

		var appStartup = Components.classes["@mozilla.org/toolkit/app-startup;1"]		//restart
                     .getService(Components.interfaces.nsIAppStartup);
		appStartup.quit(Components.interfaces.nsIAppStartup.eRestart |
         		        Components.interfaces.nsIAppStartup.eAttemptQuit);
	},

	filePickerSource: function()
	{
		const nsIFilePicker = Components.interfaces.nsIFilePicker;
		var fp = Components.classes["@mozilla.org/filepicker;1"]
			.createInstance(nsIFilePicker);
		fp.init(window,this.selectdir,nsIFilePicker.modeGetFolder);
		fp.appendFilters(nsIFilePicker.filterAll | nsIFilePicker.filterText);
		var rv = fp.show();
		if (rv == nsIFilePicker.returnOK || rv == nsIFilePicker.returnReplace)
		{
			var file = fp.file;

			libmove.source = file;
			return file.path;
		}
		if (rv == nsIFilePicker.returnCancel)
		{
			return "";
		}
	},

	filePickerDestination: function()
	{
		const nsIFilePicker = Components.interfaces.nsIFilePicker;
		var fp = Components.classes["@mozilla.org/filepicker;1"]
			.createInstance(nsIFilePicker);
		fp.init(window,this.selectdir,nsIFilePicker.modeGetFolder);
		fp.appendFilters(nsIFilePicker.filterAll | nsIFilePicker.filterText);
		var rv = fp.show();
		if (rv == nsIFilePicker.returnOK || rv == nsIFilePicker.returnReplace)
		{
			var files = fp.file;
			libmove.destination = files;
			return files.path;
		}
		if (rv == nsIFilePicker.returnCancel)
		{
			return "";
		}
	},

	getContent: function(file)
	{
		var entries = file.directoryEntries;
		var array = [];
		while(entries.hasMoreElements())
		{
			var entry = entries.getNext();
			entry.QueryInterface(Components.interfaces.nsIFile);
			array.push(entry);
		}
		return array;
	},
	
	getCurrentTime: function() {
		var jetzt = new Date();
		return jetzt.getTime();
	},

	queryDatabase: function(query, column)
	{
		dump("\nDBQuery: "+query);
		var file = Components.classes["@mozilla.org/file/directory_service;1"]
			.getService(Components.interfaces.nsIProperties)
			.get("ProfD", Components.interfaces.nsIFile);
		file.append("db");
		file.append("main@library.songbirdnest.com.db");

		var storageService = Components.classes["@mozilla.org/storage/service;1"]
			.getService(Components.interfaces.mozIStorageService);
		// Will also create the file if it does not exist
		var dbConn = storageService.openUnsharedDatabase(file);
		
		var statement = dbConn.createStatement(query);
		var result = new Array();
		var counter=0;

			while (statement.executeStep())
			{
				result[counter] = statement.row[column];
				counter++;
			}

			statement.reset();
		
		return result;
	},
};
