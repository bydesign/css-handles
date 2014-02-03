// Copyright (c) 2011 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

// Called when the user clicks on the browser action.
chrome.browserAction.onClicked.addListener(function(tab) {
	// No tabs or host permissions needed!
	console.log('Turning ' + tab.url + ' red!');
	/*chrome.tabs.executeScript({
		code: 'document.body.style.backgroundColor="red"'
	});*/
	
	chrome.runtime.onMessage.addListener(
		function(request, sender, sendResponse) {
			chrome.extension.getURL('template.html');
			console.log(request.greeting);
			if (request.greeting == "hello") {
				mnsendResponse({farewell: "goodbye"});
			}
	});
	
	chrome.tabs.insertCSS(null, {file: "default.css"});
	chrome.tabs.executeScript(null, { file: "jquery.js" }, function() {
	    chrome.tabs.executeScript(null, { file: "angular.js" }, function() {
	    	chrome.tabs.executeScript(null, { file: "content_script.js" });
	    });
	});
});