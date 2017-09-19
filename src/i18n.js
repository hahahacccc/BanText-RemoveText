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

//jQuery required.
//
var i18n = {
    messages: null,
    load: function(fn) {

        var supported_lang = ["zh_cn", "en"];
        var uilang = chrome.i18n.getUILanguage(); //
        uilang = uilang.toLowerCase().replace("-", "_");
        if ($.inArray(uilang, supported_lang) == -1) {
            uilang = "en";
        };

        /*chrome.i18n.getAcceptLanguages(function(lang_arr){
			//alert(lang_arr.toString());
		});*/

        $.getJSON(chrome.extension.getURL("_locales/" + uilang + "/messages.json"), {},
        function(data) {
            this.message = {};
            for (var p in data) {
                this.message[p] = data[p].message;
            }
            if (fn) {
                fn(this.message);
            }
        });

    }
};