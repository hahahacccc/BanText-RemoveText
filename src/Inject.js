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

!(function() {

    var TextNodesFetcher = {

        ignore: ['meta', 'link', 'script', 'style', 'img', 'hr', 'br'],
        //,'ul','ol','dl'],
        getNodeHasText: function(array, node) {
            if ($.inArray(node.tagName.toLowerCase(), this.ignore) > -1) {
                return;
            }

            if (node.hasAttribute("value")) { //input
                if ($.trim(node["value"]).length > 0) {
                    array.push(node); //repeat ok                                             
                }
            }

            var ch = node.childNodes;
            if (ch.length > 0) {
                for (var i = 0; i < ch.length; i++) {
                    var c = ch[i];

                    if (c.nodeType == 1) {
                        this.getNodeHasText(array, c);
                    } else if (c.nodeType == 3) { //nodeName == #text
                        if ($.trim(c.nodeValue).length > 0) { //find a #text node
                            array.push(node); //repeat ok                            
                        }
                    }
                }
            }

        },
        fetch: function(node) {
            var textNodes = new Array();
            console.time("BlockText- fetch");
            this.getNodeHasText(textNodes, node);
            console.timeEnd("BlockText-fetch");
            return textNodes;
        }
    };

    var Replacer = {

        replace: function(dom, keyword_RegExp, newword) {
            var j = $(dom);
            if (dom.hasAttribute("alt")) {
                var v = j.attr("alt");
                if (keyword_RegExp.test(v)) {
                    j.attr("alt", v.replace(keyword_RegExp, newword));
                }
            }
            if (dom.hasAttribute("title")) {
                var v = j.attr("title");
                if (keyword_RegExp.test(v)) {
                    j.attr("title", v.replace(keyword_RegExp, newword));
                }
            }

            //<input>
            if (dom.hasAttribute("value")) {

                var v = j.val();
                if (keyword_RegExp.test(v)) {
                    j.val( htmlDecode( v.replace(keyword_RegExp, newword)) );
                }
            }
            //
            if (dom.nodeType == 1) {
                var txt = j.text();
                if (keyword_RegExp.test(txt)) {
                    //j.text(txt.replace(keyword_RegExp, newword));
                    j.html(txt.replace(keyword_RegExp, newword));//htmlencode safe
                }
            }

        }
    };

    function kw_to_regexp(kwlist) {
        if (!$.isArray(kwlist)) {
            return new Array();
        }

        var kw_regexp_list = new Array();
        $.each(kwlist,
        function(idx, kw) {
            var reg = new RegExp(kw, "gim");
            kw_regexp_list.push(reg);
        });
        return kw_regexp_list;
    }

    function replaceDom(rules, nodes, replacement) {
        if (!$.isArray(rules) || 0 == rules.length || !$.isArray(nodes)) {
            return;
        }

        console.time("BlockText- replace");
        nodes.forEach(function(nodeEle) {
            $.each(rules,
            function(regIdx, regEle) {
                Replacer.replace(nodeEle, regEle, replacement);
            });
        });
        console.timeEnd("BlockText- replace");
    }

    function watchDom(rules, replacement) {
        $(document).off();

        $(document).on('change', ':input',
        function() {
            var n = $(this)[0];
            var nodes = TextNodesFetcher.fetch(n);
            if (nodes.length > 0) {
                //console.log("BlockText-change,<%s>. value=[%s]" , n.tagName,$(this).val());
                replaceDom(rules, nodes, replacement);
            }
        });

        $(document).on("DOMNodeInserted",
        function(evt) {
            var nodes = TextNodesFetcher.fetch(evt.target);
            if (nodes.length > 0) {
                //console.log("BlockText-DOMNodeInserted,<%s>, %d children found." , evt.target.tagName , nodes.length);
                replaceDom(rules, nodes, replacement);
            }

        });

    }

    var rules = [];
    var replacement = "[X]";

    function init(){
        chrome.storage.sync.get([STORAGE_KEY_keyword, STORAGE_KEY_replacement],
        function(value) {
            var kwlist = value[STORAGE_KEY_keyword] || [];            
            replacement =  value[STORAGE_KEY_replacement] || "[X]" ;//htmlencode safe         
            rules = kw_to_regexp(kwlist);

            console.log("BlockText- rules count=%d", rules.length);
            var nodes = TextNodesFetcher.fetch(document.body);
            nodes.push.apply(nodes, document.getElementsByTagName("title"));
            console.log("BlockText- document nodes count=%d", nodes.length);

            replaceDom(rules, nodes, replacement);
            watchDom(rules, replacement);

        });
    }



    chrome.runtime.onMessage.addListener(function(msg, sender, fnSend) {        
        switch (msg.name.toLowerCase()) {
        case "settingchanged":
            {
                init();
                console.log("BlockText- settingchanged");
                break;
            }

        }

    });


    init();
    
})();