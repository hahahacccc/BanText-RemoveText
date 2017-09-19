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

chrome.storage.onChanged.addListener(function(changes, areaName) {
    /*for (key in changes) {
        var storageChange = changes[key];
        console.log('Storage key "%s" in areaName "%s" changed. ' + 'Old value was "%s", new value is "%s".',
            key, areaName, storageChange.oldValue, storageChange.newValue);
    }*/
    chrome.runtime.sendMessage(undefined, {
        name: "settingchanged",
        data: null
    },
    undefined,
    function(response) {});

    chrome.tabs.query({
        /*active: true,*/
        currentWindow: true,
        url: ["http://*/*", "https://*/*"],
    },
    function(tabs) {
        if (tabs.length == 0) {
            return;
        }
        tabs.forEach(function(tab) {
            chrome.tabs.sendMessage(tab.id, {
                name: "settingchanged",
                data: null
            },
            function(response) {});
        });
    });
});

function bindDb_keywordlist() {
    var div = $("#div_kwlist");
    var show_kw_text = $("[lay-filter=switchShowKw]").prop("checked");
    div.empty();
    Keyword.query(function(db) {
        var regex = /\s|\S/gim;
        db.forEach(function(v) {

            var btn = $("<button class='layui-btn layui-btn-small layui-btn-primary'><span>" 
                + (show_kw_text ? htmlEncode(v) : v.replace(regex, "\u2736")) 
                + "</span><sup class='layui-icon'> &#xe640;</sup></button>");
            btn.attr("data-hidden", htmlEncode(v));
            btn.click(function() {
                var kw = htmlDecode(btn.attr("data-hidden"));
                Keyword.remove(kw,
                function(newdb) {
                    btn.remove();
                });

            });
            div.prepend(btn);
        });

    });
}

function toggle_keywordlist_display(display) {
    if (true == display) {
        $("#div_kwlist .layui-btn").each(function(btnIdx, btn) {
            var j = $(btn);
            j.children().first().html(j.attr("data-hidden"));
        });
    } else {
        var regex = /\s|\S/g;
        $("#div_kwlist .layui-btn").each(function(btnIdx, btn) {
            var jc = $(btn).children().first();
            jc.text(jc.text().replace(regex, "\u2736"));
        });
    }
}

function bindDb_replacement() {
    Settings.replacement.get(function(db) {
        $("#frm_settings [name='replacement']").val(htmlDecode(db.toString()));
    });
}

function bind_events() {

    $("#frm_kw").off();
    $("#frm_kw").submit(function() {
        var v = $.trim($("#frm_kw [name='kw']").val());
        if (v.length == 0) {
            return false;
        }
        Keyword.add(v,
        function(newdb) {
            layer.msg(chrome.i18n.getMessage("saved"), {
                time: 1500,
                offset: '10px'
            });
            bindDb_keywordlist();
        },
        function(msg, value) {
            layer.tips(msg, "#frm_kw [name='kw']", {
                tips: [1, '#000'],
                time: 2000
            });
        });
        return false;
    });

    //btnRemoveKw
    $("#frm_kw [lay-filter='btnRemoveKw']").off();
    $("#frm_kw [lay-filter='btnRemoveKw']").click(function() {
        var v = $.trim($("#frm_kw [name='kw']").val());
        if (v.length == 0) {
            return false;
        }
        Keyword.remove(v,
        function(newdb) {
            layer.msg(chrome.i18n.getMessage("saved"), {
                time: 1500,
                offset: '10px'
            });
            bindDb_keywordlist();
        },
        function(msg, value) {
            layer.tips(msg, "#frm_kw [name='kw']", {
                tips: [1, '#000'],
                time: 2000
            });
        });
        return false;
    });

    $("#frm_settings").off();
    $("#frm_settings").submit(function() {
        var v = $.trim($("#frm_settings [name='replacement']").val());
        v = htmlEncode(v);
        Settings.replacement.set(v,
        function(newValue) {
            layer.msg(chrome.i18n.getMessage("saved"), {
                time: 1500,
                offset: '10px'
            });
        });
        return false;
    });
}

function render_page(i18ndata, layform, layelement, laytpl) {
    var newhtml = laytpl($(".layui-tab").html()).render(i18ndata);
    $(".layui-tab").html(newhtml);
    document.title = i18ndata.options + " - " + i18ndata.chrome_extension_name;

    layelement.init();
    layform.render();
}

function bind_events_layui(i18ndata, layform, layelement, laytpl) {
    //监听指定开关
    layform.on('switch(switchShowKw)',
    function(data) {

        var ele = $("[lay-filter=switchShowKw]");
        if (ele.prop("checked")) {
            layer.confirm(i18ndata.confirm_display_keyword_text_question, {
                shade: 0.1,
                title: i18ndata.serious_tips || "tips",
                icon: 3,
                btn: [i18ndata.ok, i18ndata.cancel],
                cancel: function(index, layero) {
                    ele.prop("checked", false);
                    layform.render('checkbox');
                }
            },
            function(i) { //yes display
                layer.close(i);
                toggle_keywordlist_display(true);

            },
            function() { //cancel
                ele.prop("checked", false);
                layform.render('checkbox');
            });
        } //
        else { //hide
            toggle_keywordlist_display(false);
        }
        // layer.tips('123', data.othis)
    });
}

$(function() {

    layui.use(['form', 'layer', 'element', 'laytpl'],
    function() {        
        //layedit,laypage,laydate,laytable,upload,carousel,tree,flow,util,code
        var laytpl = layui.laytpl,
        layform = layui.form,
        layer = layui.layer,
        layelement = layui.element;

        i18n.load(function(i18ndata) {
            render_page(i18ndata, layform, layelement, laytpl);
            
            bindDb_keywordlist();
            bindDb_replacement();
            
            bind_events_layui(i18ndata, layform, layelement, laytpl);
            bind_events();
        });

    });

});