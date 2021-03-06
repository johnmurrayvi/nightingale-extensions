	/*export_03.js
	Playlist export script for the Songbird 0.3/0.4
	version of the Playlist Export Tool
	Last updated on November 7, 2007 by compugeek32
	CONTRIBUTORS:
	-goofy <locale support>
	
	ORIGINAL COPYRIGHT compugeek32 (c) 2007
	Modifications by Wilco (Alex Wilkinson) (AW) (c) 2010
	
	Wilco:
	added support for relative file paths. All links are URI's (so ./.../.../)
	updated to work with 
	*/
	var gplaylistexportBundle = Components.classes["@mozilla.org/intl/stringbundle;1"].getService(Components.interfaces.nsIStringBundleService);
	var mystrings = gplaylistexportBundle.createBundle("chrome://playlistexport/locale/export.properties");
	var petplaylistexporttool = mystrings.GetStringFromName("petplaylistexporttool");
	var petyoudidnotcheckat3 = mystrings.GetStringFromName("petyoudidnotcheckat3");
	var pettheplaylistexport4 = mystrings.GetStringFromName("pettheplaylistexport4");
	var petexportofplaylists5 = mystrings.GetStringFromName("petexportofplaylists5");
	var petplsplaylist = mystrings.GetStringFromName("petplsplaylist");
	var petm3uplaylist = mystrings.GetStringFromName("petm3uplaylist");
	var petexportplaylist = mystrings.GetStringFromName("petexportplaylist");
	var petto = mystrings.GetStringFromName("petto");
	var petexportallselected7 = mystrings.GetStringFromName("petexportallselected7");
	var petnotitle = mystrings.GetStringFromName("petnotitle");
	var petexperrp1 = mystrings.GetStringFromName("petexperrorp1");
	var petexperrp2 = mystrings.GetStringFromName("petexperrorp2");
	var petexperr2p1 = mystrings.GetStringFromName("petexperror2p1");
	var petexperr2p2 = mystrings.GetStringFromName("petexperror2p2");
	var petchangepath = mystrings.GetStringFromName("petchangepath");
	var petstatus_exporting = mystrings.GetStringFromName("petstatusexporting");
	var petstatus_failed = mystrings.GetStringFromName("petstatusfailed");
	var petstatus_done = mystrings.GetStringFromName("petstatusdone");
	var pet_error_title = mystrings.GetStringFromName("peterrtitle");
	var petclose = mystrings.GetStringFromName("petclose");

	const pb=Components.classes["@mozilla.org/preferences;1"].createInstance(Components.interfaces.nsIPrefBranch);
	const prefpre="addons.playlistexport.";
	
	var def_exp_loc=pb.getCharPref(prefpre+"exportLocation");
	var defext=pb.getIntPref(prefpre+"exportFormat");
	//AW preference for relative links
	var defrelative = pb.getBoolPref(prefpre+"relativePaths");
	var defbackslash = pb.getBoolPref(prefpre+"useBackslash");
	var defcorrectcase = pb.getBoolPref(prefpre+"correctCase");
	
	var exts=new Array("m3u","m3u8","pls");
	var prompt_srv=Components.classes["@mozilla.org/embedcomp/prompt-service;1"].getService(Components.interfaces.nsIPromptService);
	function load0(){
		if(def_exp_loc==""){
			var fileBrowser = Components.interfaces.nsIFilePicker;
			var filePicker=Components.classes["@mozilla.org/filepicker;1"].createInstance(fileBrowser);
			//filePicker.filterIndex=fmt;
			filePicker.init(window, petexportallselected7,fileBrowser.modeGetFolder);
			res = filePicker.show();
			if (res == fileBrowser.returnOK){
				def_exp_loc=filePicker.file.path;
				pb.setCharPref(prefpre+"exportLocation",def_exp_loc);
			}else{
				window.close();
			}
		}
		var sbILibraryManager=Components.classes["@getnightingale.com/Nightingale/library/Manager;1"].getService(Components.interfaces.sbILibraryManager);
		var libraries=sbILibraryManager.getLibraries();
		var foundLibrary;
		var libraryResource;
		var libraryPlList;
		var tempView;
		var filters;
		var filterID;
		//Main Library goes first...
		foundLibrary=sbILibraryManager.mainLibrary;
		libraryPlList=foundLibrary.QueryInterface(Components.interfaces.sbIMediaList);
		addPlaylistToBox(libraryPlList.guid,libraryPlList.guid,libraryPlList.name,true,libraryPlList.isEmpty);
		tempView=libraryPlList.createView();
		filters=tempView.cascadeFilterSet;
		filters.clearAll();
		filters.appendSearch(new Array("*"),1);
		filters.appendFilter("http://getnightingale.com/data/1.0#isList");
		filters.set(1,new Array("1"),1);
		//AW filter hidden items
		filterID = filters.appendFilter("http://getnightingale.com/data/1.0#hidden");
		filters.set(filterID,new Array("0"),1);
		for(i=0;i<tempView.length;i++){
			try{
				plList=tempView.getItemByIndex(i);
				plList.QueryInterface(Components.interfaces.sbIMediaList);
				if(plList.name!=" "&&plList.name!=" "&&plList.name!="undefined"&&plList.name!=null){
					addPlaylistToBox(plList.guid,foundLibrary.guid,plList.name,false,plList.isEmpty);
				}
			}catch(e){
				if(e.name=="NS_NOINTERFACE"){
					//alert("An invalid playlist was found.");
				}
			}
		}
		while(libraries.hasMoreElements()){
			foundLibrary=libraries.getNext();
			if(foundLibrary.guid!=sbILibraryManager.mainLibrary.guid){
				libraryPlList=foundLibrary.QueryInterface(Components.interfaces.sbIMediaList);
				addPlaylistToBox(libraryPlList.guid,libraryPlList.guid,libraryPlList.name,true,libraryPlList.isEmpty);
				tempView=libraryPlList.createView();
				filters=tempView.cascadeFilterSet;
				filters.clearAll();
				filters.appendSearch(new Array("*"),1);
				filters.appendFilter("http://getnightingale.com/data/1.0#isList");
				filters.set(1,new Array("1"),1);
				for(i=0;i<tempView.length;i++){
					plList=tempView.getItemByIndex(i).QueryInterface(Components.interfaces.sbIMediaList);
					if(plList.name!=""&&plList.name!=" "&&plList.name!="undefined"&&plList.name!=null){
						addPlaylistToBox(plList.guid,foundLibrary.guid,plList.name,false,plList.isEmpty);
					}
				}
			}
		}
	}function addPlaylistToBox(GUID,libGUID,plName,isLibrary,isEmpty){
		var pl_picker=document.getElementById("playlistpicker3");
		var pl_listItem=document.createElement("listitem");
		pl_listItem.setAttribute("allowevents",true);
		var pl_cell1=document.createElement("listcell");
		var li_num=document.getElementsByClassName("pathText").length;

		var theCheckBox=document.createElement("checkbox");
		theCheckBox.setAttribute("class","pl_checkbox");
		theCheckBox.setAttribute("id","pl_"+GUID+"_"+libGUID);
		theCheckBox.setAttribute("label",plName);	
		if(isEmpty) theCheckBox.setAttribute("disabled","true");
		if(isLibrary) theCheckBox.style.fontWeight="bold";
		else	theCheckBox.style.paddingLeft="15px";
		
		var pl_cell2=document.createElement("listcell");
		var pl_button=document.createElement("textbox");
		var pl_button2=document.createElement("button");
		pl_button2.setAttribute("class","changePath");
		pl_button2.setAttribute("label","...");
		pl_button.setAttribute("class","pathText");
		var pl_path=Components.classes["@mozilla.org/file/local;1"].createInstance(Components.interfaces.nsILocalFile);
		pl_path.initWithPath(def_exp_loc);
		pl_path.appendRelativePath(plName+"."+exts[defext]);
		pl_button.setAttribute("value",pl_path.path);
		pl_button2.setAttribute("tooltiptext",petchangepath);
		pl_button2.addEventListener("command",function(){eval("var chgd_path=changeExportPath("+li_num+");if(chgd_path){document.getElementsByClassName(\"pathText\")[li_num].setAttribute(\"value\",chgd_path);}");},true);
		pl_cell2.appendChild(pl_button);
		pl_cell2.appendChild(pl_button2);
		var pl_cell3=document.createElement("listcell");
		pl_cell3.setAttribute("class","pl_export_status");
		pl_cell3.setAttribute("id","status_"+GUID);
		pl_cell1.appendChild(theCheckBox);
		pl_listItem.appendChild(pl_cell1);
		pl_listItem.appendChild(pl_cell2);
		pl_listItem.appendChild(pl_cell3);	
		pl_picker.appendChild(pl_listItem);
	}function savePlaylist(){
		try{
				
			this.def_exp_loc=pb.getCharPref(prefpre+"exportLocation");
			this.defext=pb.getIntPref(prefpre+"exportFormat");
			this.defrelative = pb.getBoolPref(prefpre+"relativePaths");
			this.defbackslash = pb.getBoolPref(prefpre+"useBackslash");
			this.defcorrectcase = pb.getBoolPref(prefpre+"correctCase");
			
			document.getElementById("export_dialog").setAttribute("label",petstatus_exporting);
			var pl_chkboxes=document.getElementsByClassName("pl_checkbox");
			var pl_textPaths=document.getElementsByClassName("pathText");
			var GUIDArray=new Array();
			var i2=0;
			var guidset;
			var theLibrary;
			var pl_paths=new Array();
			for(i=0;i<pl_chkboxes.length;i++){
				if(pl_chkboxes[i].checked){
					guidset=(pl_chkboxes[i].id).split("_")
					GUIDArray[i2]=new Array(guidset[1],guidset[2]);
					pl_paths[i2]=pl_textPaths[i].value;
					i2++;
				}
			}
			var pl_Array=new Array(GUIDArray.length);
			var pl_NameArray=new Array(GUIDArray.length);
			if(pl_Array.length==0){
				prompt_srv.alert(window, petplaylistexporttool,petyoudidnotcheckat3);
				return false;
			}
			var sbILibraryManager=Components.classes["@getnightingale.com/Nightingale/library/Manager;1"].getService(Components.interfaces.sbILibraryManager);
			for(i=0;i<GUIDArray.length;i++){
				if(GUIDArray[i][1]!=GUIDArray[i][0]){
					var theLibrary=sbILibraryManager.getLibrary(GUIDArray[i][1]);
					thePlaylist=theLibrary.getMediaItem(GUIDArray[i][0]).QueryInterface(Components.interfaces.sbIMediaList);
				}else{
					var thePlaylist=sbILibraryManager.getLibrary(GUIDArray[i][0]).QueryInterface(Components.interfaces.sbIMediaList);					
				}
				pl_NameArray[i]=thePlaylist.name;
				pl_Array[i]=thePlaylist;
			}
			var pl_stat_elem;
			var pl_stat;
			for(i2=0;i2<pl_Array.length;i2++){
				pl_stat_elem=document.getElementById("status_"+GUIDArray[i2][0]);
				pl_stat_elem.setAttribute("label",petstatus_exporting);
				switch(getExt(pl_paths[i2]).toLowerCase()){
					case "m3u":
						pl_stat=saveM3U(pl_paths[i2],pl_Array[i2]);
					break;
                    case "m3u8":
                        pl_stat=saveM3U8(pl_paths[i2],pl_Array[i2]);
                    break;
					case "pls":
						pl_stat=savePLS(pl_paths[i2],pl_Array[i2]);
					break;
				}
				if(!pl_stat){
					pl_stat_elem.setAttribute("label",petstatus_failed);
				}else{
					pl_stat_elem.setAttribute("label",petstatus_done);
				}
			}
			document.getElementById("export_dialog").getButton("cancel").setAttribute("label",petclose);
			return false;
		}catch(e){
			alert(pettheplaylistexport4+e.message+"\n");
			return false;
		}
	}function saveM3U(plsPath,thePlaylist){
		try{
		var plsFile=Components.classes["@mozilla.org/file/local;1"].createInstance(Components.interfaces.nsILocalFile);
		plsFile.initWithPath(plsPath);
		//AW need parent directory file to make relative links correct
		var plsParent = plsFile.parent;
		
		var dataSource="http://getnightingale.com/data/1.0#";
		var nsIIOService=Components.classes["@mozilla.org/network/io-service;1"].getService(Components.interfaces.nsIIOService);
		
		var nsIFileProtocolHandler=Components.classes["@mozilla.org/network/protocol;1?name=file"].createInstance(Components.interfaces.nsIFileProtocolHandler);
		var outputStream=Components.classes["@mozilla.org/network/file-output-stream;1"].createInstance(Components.interfaces.nsIFileOutputStream);
		outputStream.init(plsFile,0x02|0x08|0x20,0666,0);
		var aaa1;
		var mmss;
		var itemLoc;
		var itemFile;
		var relLoc;
		var playlist_txt="#EXTM3U\r\n";
		var theMediaView=thePlaylist.createView();
		var mv_filters=theMediaView.cascadeFilterSet;
		mv_filters.clearAll();
		mv_filters.appendSearch(new Array("*"),1);
		mv_filters.appendFilter(dataSource+"hidden");
		mv_filters.set(1,new Array("0"),1);
		mv_filters.appendFilter(dataSource+"isList");
		mv_filters.set(2,new Array("0"),1);
		for(i=0;i<theMediaView.length;i++){
			aaa1=theMediaView.getItemByIndex(i).QueryInterface(Components.interfaces.sbILibraryResource);
			//mmss=getMMSS(aaa1.getProperty(dataSource+petduration));
			itemLoc=aaa1.getProperty(dataSource+"contentURL");
			
			if(nsIIOService.extractScheme(itemLoc)=="file"){
				//AW convert file URLs to relative links (Add an option for this?)
				if (defrelative)
				{
					itemFile = nsIFileProtocolHandler.getFileFromURLSpec(itemLoc).QueryInterface(Components.interfaces.nsILocalFile);
					if (defcorrectcase)
					{
						itemFile = correctCase(itemFile).QueryInterface(Components.interfaces.nsILocalFile);
					}
					itemLoc = itemFile.getRelativeDescriptor(plsParent);
					//AW: Replace with \ if set in preferences
					if (defbackslash) {
						dump('PET: replacing / with \\' + '\n');
						itemLoc = itemLoc.replace(new RegExp('/','g'),'\\');
					}
				}
				else
				{
					itemLoc=nsIFileProtocolHandler.getFileFromURLSpec(itemLoc).path;
				}
				
			}
			playlist_txt+="#EXTINF:"+Math.round(aaa1.getProperty(dataSource+"duration")/1000000)+","+
			validateValue(aaa1.getProperty(dataSource+"artistName"),0)+
			""+validateValue(aaa1.getProperty(dataSource+"trackName"),1)+"\r\n"+
			itemLoc+"\r\n";
		}
		outputStream.write(playlist_txt,playlist_txt.length);
		outputStream.close();
		return true;
		}catch(e){
			getError(e,thePlaylist.name);
			return false;
		}
	}function saveM3U8(plsPath,thePlaylist){
		try{
		var plsFile=Components.classes["@mozilla.org/file/local;1"].createInstance(Components.interfaces.nsILocalFile);
		plsFile.initWithPath(plsPath);
		//AW need parent directory file to make relative links correct
		var plsParent = plsFile.parent;
		
		var dataSource="http://getnightingale.com/data/1.0#";
		var nsIIOService=Components.classes["@mozilla.org/network/io-service;1"].getService(Components.interfaces.nsIIOService);
		
		var nsIFileProtocolHandler=Components.classes["@mozilla.org/network/protocol;1?name=file"].createInstance(Components.interfaces.nsIFileProtocolHandler);
		var outputStream=Components.classes["@mozilla.org/network/file-output-stream;1"].createInstance(Components.interfaces.nsIFileOutputStream);
		outputStream.init(plsFile,0x02|0x08|0x20,0666,0);
        
        var converter = Components.classes["@mozilla.org/intl/converter-output-stream;1"].createInstance(Components.interfaces.nsIConverterOutputStream);
        converter.init(outputStream, "UTF-8", 0, 0);
        
		var aaa1;
		var mmss;
		var itemLoc;
		var itemFile;
		var relLoc;
		var playlist_txt="#EXTM3U\r\n";
		var theMediaView=thePlaylist.createView();
		var mv_filters=theMediaView.cascadeFilterSet;
		mv_filters.clearAll();
		mv_filters.appendSearch(new Array("*"),1);
		mv_filters.appendFilter(dataSource+"hidden");
		mv_filters.set(1,new Array("0"),1);
		mv_filters.appendFilter(dataSource+"isList");
		mv_filters.set(2,new Array("0"),1);
		for(i=0;i<theMediaView.length;i++){
			aaa1=theMediaView.getItemByIndex(i).QueryInterface(Components.interfaces.sbILibraryResource);
			//mmss=getMMSS(aaa1.getProperty(dataSource+petduration));
			itemLoc=aaa1.getProperty(dataSource+"contentURL");
			
			if(nsIIOService.extractScheme(itemLoc)=="file"){
				//AW convert file URLs to relative links (Add an option for this?)
				if (defrelative)
				{
					itemFile = nsIFileProtocolHandler.getFileFromURLSpec(itemLoc).QueryInterface(Components.interfaces.nsILocalFile);
					if (defcorrectcase)
					{
						itemFile = correctCase(itemFile).QueryInterface(Components.interfaces.nsILocalFile);
					}
					itemLoc = itemFile.getRelativeDescriptor(plsParent);
					//AW: Replace with \ if set in preferences
					if (defbackslash) {
						dump('PET: replacing / with \\' + '\n');
						itemLoc = itemLoc.replace(new RegExp('/','g'),'\\');
					}
				}
				else
				{
					itemLoc=nsIFileProtocolHandler.getFileFromURLSpec(itemLoc).path;
				}
				
			}
			playlist_txt+="#EXTINF:"+Math.round(aaa1.getProperty(dataSource+"duration")/1000000)+","+
			validateValue(aaa1.getProperty(dataSource+"artistName"),0)+
			""+validateValue(aaa1.getProperty(dataSource+"trackName"),1)+"\r\n"+
			itemLoc+"\r\n";
		}
        converter.writeString(playlist_txt);
        converter.close();
		return true;
		}catch(e){
			getError(e,thePlaylist.name);
			return false;
		}
	}function savePLS(plsPath,thePlaylist){
		try{
		var plsFile=Components.classes["@mozilla.org/file/local;1"].createInstance(Components.interfaces.nsILocalFile);
		plsFile.initWithPath(plsPath);
		//AW need parent directory file to make relative links correct
		var plsParent = plsFile.parent;
		var dataSource="http://getnightingale.com/data/1.0#";
		var nsIIOService=Components.classes["@mozilla.org/network/io-service;1"].getService(Components.interfaces.nsIIOService);
		var nsIFileProtocolHandler=Components.classes["@mozilla.org/network/protocol;1?name=file"].createInstance(Components.interfaces.nsIFileProtocolHandler);
		var outputStream=Components.classes["@mozilla.org/network/file-output-stream;1"].createInstance(Components.interfaces.nsIFileOutputStream);
		outputStream.init(plsFile,0x02|0x08|0x20,0666,0);
		var aaa1;
		var mmss;
		var itemLoc;
		var theMediaView=thePlaylist.createView();
		var mv_filters=theMediaView.cascadeFilterSet;
		mv_filters.clearAll();
		mv_filters.appendSearch(new Array("*"),1);
		mv_filters.appendFilter(dataSource+"hidden");
		mv_filters.set(1,new Array("0"),1);
		mv_filters.appendFilter(dataSource+"isList");
		mv_filters.set(2,new Array("0"),1);
		var pls_len=theMediaView.length;
		var playlist_txt="[playlist]\r\nNumberOfEntries="+pls_len+"\r\n\r\n";
		for(i=0;i<pls_len;i++){
			aaa1=theMediaView.getItemByIndex(i).QueryInterface(Components.interfaces.sbILibraryResource);
			//mmss=getMMSS(aaa1.getProperty(dataSource+petduration));
			itemLoc=aaa1.getProperty(dataSource+"contentURL");
			if(nsIIOService.extractScheme(itemLoc)=="file"){
				
				//AW convert file URLs to relative links
				if (defrelative)
				{
					itemFile = nsIFileProtocolHandler.getFileFromURLSpec(itemLoc).QueryInterface(Components.interfaces.nsILocalFile);
					if (defcorrectcase)
					{
						itemFile = correctCase(itemFile).QueryInterface(Components.interfaces.nsILocalFile);
					}
					itemLoc = itemFile.getRelativeDescriptor(plsParent);
						
					//AW: Replace with \ if set in preferences
					if (defbackslash) {
						dump('PET: replacing / with \\' + '\n');
						itemLoc = itemLoc.replace(new RegExp('/','g'),'\\');
					}
				}
				else
				{
					itemLoc=nsIFileProtocolHandler.getFileFromURLSpec(itemLoc).path;
				}
			}
			playlist_txt+="File"+(i+1)+"="+itemLoc+"\r\n"+
			"Title"+(i+1)+"="+validateValue(aaa1.getProperty(dataSource+"artistName"),0)+
			validateValue(aaa1.getProperty(dataSource+"trackName"),1)+"\r\n"+
			"Length"+(i+1)+"="+Math.round(aaa1.getProperty(dataSource+"duration")/1000000)+"\r\n\r\n";
		}
		playlist_txt+="Version=2";
		outputStream.write(playlist_txt,playlist_txt.length);
		outputStream.close();
		return true;
		}catch(e){
			getError(e,thePlaylist.name);
			return false;
		}
	}
	//AW: function to get Case Matching directories
	//For reasons unknown Songbird stores content URLs in lower case if in windows
	//This function converts it back to it's proper case, important for case sensitive linux
	//Important if porting playlists from windows to linux
	//A hack by basically scanning each directory for the correct name
	function correctCase(file)
	{
		var leaf = file.leafName;
		if (file.parent == null)
			return file;	//if we can't go further up go with what we have
		else
			file = correctCase(file.parent)
			
		var dirEntries = file.directoryEntries;
		while (dirEntries.hasMoreElements())
		{
			var entry = dirEntries.getNext().QueryInterface(Components.interfaces.nsIFile);
			if (entry.leafName.toLowerCase() == leaf.toLowerCase())
				return entry;
		}
		
		//if we get here then we have a problem!
		file.append(leaf);
		return file;
	}
	function getMMSS(ssss){
		aaa4=ssss/1000000;
		fullss2=aaa4/60;  //00.0000_ hours
		mm=parseInt(Math.floor(fullss2));//Hours
		ss=Math.floor((((fullss2)-mm)*0.6)*100);
		if(ss<10){
			ss="0"+ss;
		}
		return new Array(mm,ss);
	}function getSSS(sss){
		return sss/1000000;
	}function validateValue(val, valtype){
		if(val==""||val==" "||val==null||val=="undefined"){
			switch (valtype){
				case 0: return "";
				case 1: return petnotitle;
			}
		}else{
			switch(valtype){
				case 0:return val+" - ";
				case 1:return val;
			}
		}
	}function showAbout(){
		window.openDialog("chrome://playlistexport/content/about/about.xul","pet_about_window","alwaysLowered=no,centerscreen=yes,resizable=no");
	}function showOptions(){
		window.openDialog("chrome://playlistexport/content/options.xul","pet_about_window","alwaysLowered=no,centerscreen=yes,resizable=no,modal=yes");
	}function updateStatus(status0){
		if(status0!=null){
			document.getElementById("export_stat").value=status0;
		}
	}function changeExportPath(li_num){
		var pathbox=document.getElementsByClassName("pathText")[li_num];
		var plName=document.getElementsByClassName("pl_checkbox")[li_num].label;
		var path=pathbox.value;
		var pl_file=Components.classes["@mozilla.org/file/local;1"].createInstance(Components.interfaces.nsILocalFile);
		var pl_target=Components.classes["@mozilla.org/file/local;1"].createInstance(Components.interfaces.nsILocalFile);
		try{
			pl_file.initWithPath(path);
		}catch(e){
			//Error occured. Switch to default path
			pl_file.initWithPath(def_exp_loc);
			pl_file.appendRelativePath(plName+".pls");
		}
		pl_target.initWithFile(pl_file.parent);
		fileBrowser = Components.interfaces.nsIFilePicker;
		var filePicker=Components.classes["@mozilla.org/filepicker;1"].createInstance(fileBrowser);
		filePicker.displayDirectory=pl_target;
		filePicker.appendFilter(petplsplaylist,"*.pls");
		filePicker.appendFilter(petm3uplaylist,"*.m3u8");
		filePicker.appendFilter(petm3uplaylist,"*.m3u");
		var leafNm=(pl_file.leafName);
		var leafNm_a=leafNm.split(".")
		var ext=leafNm_a[leafNm_a.length-1];
		leafNm=leafNm.substr(0,leafNm.length-ext.length-1);
 		filePicker.defaultString=leafNm;
		filePicker.defaultExtension=ext;
		switch(ext.toLowerCase()){
			case "pls":
				filePicker.filterIndex=0;
			break;
			case "m3u":
				filePicker.filterIndex=1;
			break;
			case "m3u":
				filePicker.filterIndex=2;
			break;
		}
		//I know there's more besides PLS and m3u...
		filePicker.init(window, petexportplaylist+plName+ petto, fileBrowser.modeSave);
		var res = filePicker.show();
		if (res == fileBrowser.returnOK||res == fileBrowser.returnReplace){
			return filePicker.file.path;
		}else{
			return false;
		}
	}function getExt(fileName){
		var fn=fileName;
		var fn_a=fn.split(".")
		var ext=fn_a[fn_a.length-1];
		fn=fn.substr(0,fn.length-ext.length-1);
		return ext;
	}function getError(errobj,plName){
		switch(errobj.name){
			case "NS_ERROR_FILE_NOT_FOUND":
				prompt_srv.alert(window,pet_error_title,petexperr2p1+plName+petexperr2p2);
			break;
			default:
				prompt_srv.alert(window,pet_error_title,petexperrp1+plName+petexperrp2+"\n"+errobj.message);
			break;
		}
	}function selectAll() {
		var pl_chkboxes=document.getElementsByClassName("pl_checkbox");
		for(i=0;i<pl_chkboxes.length;i++){
			if(!pl_chkboxes[i].disabled){
				pl_chkboxes[i].checked=true;
			}
		}
	}
