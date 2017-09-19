/***************************************************************************
MIT License

Copyright (c) 2017 ohsorry (https://github.com/ohsorry/BlockText)

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
***************************************************************************/


var STORAGE_KEY_keyword = "Keyword";
var STORAGE_KEY_replacement = "replacement";

var Keyword = {

	add: function(kw, fnSuccess, fnFailed) {
		var v = $.trim(kw.toString());
		if (v.length == 0) {
			if (fnFailed) {
				fnFailed(chrome.i18n.getMessage("keyword_required"), v);
			}
			return;
		}
		this.query(function(db) {
			if ($.inArray(v, db) > -1) {
				if (fnFailed) {
					fnFailed(chrome.i18n.getMessage("keyword_exists"), v);
				}
			} else {
				db.push(v);				
				var o = new Object();
				o[STORAGE_KEY_keyword] = db;				
				chrome.storage.sync.set(o,
				function(args) {
					if (fnSuccess) {
						fnSuccess(db);
					}					
				});

			}
		});
	},
	remove: function(kw, fnSuccess, fnFailed) {
		var v = $.trim(kw.toString());
		if (v.length == 0) {
			return;
		}

		this.query(function(db) {
			var idx = $.inArray(v, db);
			if (idx == -1) {
				if(fnFailed){
					fnFailed(chrome.i18n.getMessage("keyword_not_found"), v);
				}
				return;
			} else {
				db.splice(idx, 1);		
				var o = new Object();
				o[STORAGE_KEY_keyword] = db;
				chrome.storage.sync.set(o,
				function(args) {
					if (fnSuccess) {
						fnSuccess(db);
					}
				});

			}
		});
	},
	query: function(fn) {
		chrome.storage.sync.get(STORAGE_KEY_keyword,
		function(value) {
			var v = value[STORAGE_KEY_keyword] || [];
			fn(v);
		});
	}
};

var Settings = {
	replacement: {
		get: function(fn) {
			chrome.storage.sync.get(STORAGE_KEY_replacement,
			function(value) {
				if (fn) {
					var v = value[STORAGE_KEY_replacement] || "";
					fn(v);
				}
			});
		},
		set: function(r, fn) {
			var v = $.trim(r.toString());
			var o = new Object();
			o[STORAGE_KEY_replacement] = v;			
			chrome.storage.sync.set(o,
			function(args) {
				if (fn) {
					fn(v);
				}
			});
		}
	},
	//end of replacement
};

function htmlEncode(str) {
	if (str.length == 0) return "";
	var s = str.replace(/&/g, "&amp;");
	s = s.replace(/</g, "&lt;");
	s = s.replace(/>/g, "&gt;");
	s = s.replace(/ /g, "&nbsp;");
	s = s.replace(/\'/g, "&#39;");
	s = s.replace(/\"/g, "&quot;");
	s = s.replace(/\n/g, "<br>");
	return s;
}

function htmlDecode(str) {
	if (str.length == 0) return "";
	var s = str.replace(/&amp;/g, "&");
	s = s.replace(/&lt;/g, "<");
	s = s.replace(/&gt;/g, ">");
	s = s.replace(/&nbsp;/g, " ");
	s = s.replace(/&#39;/g, "\'");
	s = s.replace(/&quot;/g, "\"");
	s = s.replace(/<br>/g, "\n");
	return s;
}