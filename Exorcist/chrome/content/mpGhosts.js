if (typeof(Cc) == "undefined")
  var Cc = Components.classes;
if (typeof(Ci) == "undefined")
  var Ci = Components.interfaces;
if (typeof(Cu) == "undefined")
  var Cu = Components.utils;
if (typeof(Cr) == "undefined")
  var Cr = Components.results;

window.mediaPage = {

    // The sbIMediaListView that this page is to display
  _mediaListView: null,

    // The sb-playlist XBL binding
  _playlist: null, 

  onPlaylistSelectionChanged: function(e) {
    var item = this.mediaListView.selection.currentMediaItem;
    if (item != null) {
      var pathLabel = document.getElementById("file-path-label");
      pathLabel.value = unescape(item.getProperty(SBProperties.contentURL));
    }
  },

  get mediaListView() {
    return this._mediaListView;
  },

  set mediaListView(value) {
    this._mediaListView = value;

    dump("\n\nmpGhosts: window.mediaPage - set mediaListView(value = "+value+")\n");
    // var mlvState = this._mediaListView.getState();
    // dump("    mlvState.toString() = "+mlvState.toString()+"\n\n");

    var deck = document.getElementById("exorcist-deck");
    var progress = document.getElementById("scanning-progress");

    deck.selectedIndex = 0;
    var ghosts = Ghostbusters.findGhosts(value.mediaList, progress);
    var builder;
    var killButton = document.getElementById("kill-ghosts-button");
    var strings = document.getElementById("exorcist-strings");
    if (ghosts.length == 0) {
      alert(strings.getString("noGhostsMessage"));
      killButton.disabled = true;

      dump("\n\nmpGhosts: ghosts.length = 0\n");

      try {
        var pageMgr = Cc["@songbirdnest.com/Songbird/MediaPageManager;1"]
                      .getService(Ci.sbIMediaPageManager);
        // get the media list we were applied to
        var mediaList = this._mediaListView.mediaList;

        dump("\n\nmpGhosts: mediaList.name = "+mediaList.name+", mediaList.type = "+mediaList.type+"\n");

        var listView = null;

        if (mediaList.name != "Library") { 
          // get the first media page registered and switch to that
          var pages = pageMgr.getAvailablePages(mediaList);
          dump("\n\nmpGhosts: getting available pages....\n");
          while (pages.hasMoreElements()) {
            var pageInfo = pages.getNext();
            pageInfo.QueryInterface(Ci.sbIMediaPageInfo);
            dump("    pageInfo.contentTitle = "+pageInfo.contentTitle+", pageInfo.contentUrl = "+pageInfo.contentUrl+"\n");
            if (pageInfo.contentUrl ==
                "chrome://songbird/content/mediapages/playlistPage.xul") {
              listView = pageInfo;
            }
          }
          pageMgr.setPage(mediaList, listView);
          var ngaleWindow = Cc["@mozilla.org/appshell/window-mediator;1"]
                            .getService(Ci.nsIWindowMediator)
                            .getMostRecentWindow("Songbird:Main");
          ngaleWindow.gBrowser.loadMediaList(mediaList,
                                             null, null, null, null);
        } else {
          listView = window.LibraryUtils.createStandardMediaListView(mediaList);
          var ngaleWindow = Cc["@mozilla.org/appshell/window-mediator;1"]
                            .getService(Ci.nsIWindowMediator)
                            .getMostRecentWindow("Songbird:Main");
          ngaleWindow.gBrowser.loadMediaList(mediaList,
                                             null, null, listView, null);
        }
      } catch (e) {
        alert(e);
      }
    } else {
      builder = Cc["@songbirdnest.com/Songbird/Library/ConstraintBuilder;1"]
                .createInstance(Ci.sbILibraryConstraintBuilder);
      for (var i=0; i < ghosts.length; i++) {
        builder = builder.include(SBProperties.GUID, ghosts[i].guid);
      }
      killButton.disabled = false;
      if (this._mediaListView) {
        this._mediaListView.filterConstraint = builder.get();
      }
      deck.selectedIndex = 1;
    }
  },


  onLoad: function(e) {
    // Make sure we have the javascript modules we're going to use
    if (!window.SBProperties) 
      Cu.import("resource://app/jsmodules/sbProperties.jsm");
    if (!window.LibraryUtils) 
      Cu.import("resource://app/jsmodules/sbLibraryUtils.jsm");
    if (!window.kPlaylistCommands) 
      Cu.import("resource://app/jsmodules/kPlaylistCommands.jsm");
    
    if (!this._mediaListView) {
      Components.utils.reportError("Media Page did not receive  " + 
                                   "a mediaListView before the onload event!");
      return;
    } 

    this._playlist = document.getElementById("playlist");

    // Get playlist commands (context menu, keyboard shortcuts, toolbar)
    // Note: playlist commands currently depend on the playlist widget.
    var mgr = Cc["@songbirdnest.com/Songbird/PlaylistCommandsManager;1"]
              .createInstance(Ci.sbIPlaylistCommandsManager);
    var cmds = mgr.request(kPlaylistCommands.MEDIAITEM_DEFAULT);

    // Set up the playlist widget
    this._playlist.bind(this._mediaListView, cmds);

    // Add a playlist selection click listener
    this._playlist.addEventListener("playlist-selchange",
            this.onPlaylistSelectionChanged, false);
  },

  onUnload: function(e) {
    // if we're being unloaded, reset the filterConstraint so it doesn't show
    // just the ghosts still
    if (this._mediaListView)
      this._mediaListView.filterConstraint = null;
    if (this._playlist) {
      this._playlist.destroy();
      this._playlist = null;
    }
  },

  highlightItem: function(aIndex) {
    this._playlist.highlightItem(aIndex);
  },

  canDrop: function(aEvent, aSession) {
    return this._playlist.canDrop(aEvent, aSession);
  },

  onDrop: function(aEvent, aSession) {
    return this._playlist._dropOnTree(this._playlist.mediaListView.length,
                Ci.sbIMediaListViewTreeViewObserver.DROP_AFTER);
  }
} // End window.mediaPage 


