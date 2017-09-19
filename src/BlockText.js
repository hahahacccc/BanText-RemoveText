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


chrome.browserAction.onClicked.addListener(function(ctab) {
    //chrome.tabs.executeScript(null, {code:"document.body.bgColor='red'"});
    var opt_url = chrome.extension.getURL("options.html");

    chrome.tabs.query({
        url: opt_url
    },
    function(tabs) {

        if (tabs.length == 0) {
            chrome.tabs.create({
                url: opt_url
            },
            null);
        } else {
            var tb = tabs[0];
            //chrome.tabs.highlight()
            chrome.tabs.update(tb.id, {
                highlighted: true,
                active: true
            });
        }
    });

    // var views = chrome.extension.getViews();
    // views.forEach(function(wnd){
    //     if(wnd.location.href == chrome.extension.getURL("popup.html")){
    //         //wnd.fnSample();
    //     }
    // });
});

