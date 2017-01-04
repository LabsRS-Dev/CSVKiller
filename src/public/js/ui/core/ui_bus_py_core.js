/**
 * Created by Ian on 2015/1/15.
 */


(function(){
    window['UI'] = window['UI'] || {};
    window.UI.c$ = window.UI.c$ || {};
})();


(function() {
    var c$ = {};
    c$ = $.extend(window.UI.c$, {});

    c$.python = {
        // 启动Python Web服务
        startPyWebServer: function (e) {
            var b$ = BS.b$ || {};
            if(b$.pNative){
                var copyPlugin = $.objClone(c$.corePluginsMap.PythonCLIPlugin); // 复制一个插件副本

                var workDir = b$.pNative.path.resource() + "/data/python";
                var resourceDir = b$.pNative.path.appDataHomeDir();
                var configFile = "Resources/config.plist";
                var pythonCommand = " --port=" + b$.pNative.app.getHttpServerPort();

                var regCommand = '["-i","pythonCLI","-c","%config%","-r","%resourceDir%","-w","%workDir%","-m","%command%"]';

                var formatCommonStr = regCommand.replace(/%config%/g, configFile);
                formatCommonStr = formatCommonStr.replace(/%resourceDir%/g, resourceDir);
                formatCommonStr = formatCommonStr.replace(/%workDir%/g, workDir);
                formatCommonStr = formatCommonStr.replace(/%command%/g, pythonCommand);

                var command = eval(formatCommonStr); // 转换成command
                copyPlugin.tool.command = command;
                var taskID = c$.global.PyServerPrefix + (new Date()).getTime();
                b$.createTask(copyPlugin.callMethod, taskID, [copyPlugin.tool]);
            }else{
                c$.python.createPyWS();
            }
        },

        // 建立Py Web socket 客户端
        createPyWS: function () {
            var url = "ws://localhost:" + BS.b$.App.getServerPort() + "/websocket";
            var WebSocket = window.WebSocket || window.MozWebSocket;

            try{
                c$.pyWS = new WebSocket(url); //启动监听服务 'ws://localhost:8124/';
                c$.pyWS_ID = 'ws' + (new Date()).getTime();
                if (c$.pyWS) {

                    c$.pyWS.onopen = function(evt){
                        // 注册自己的ID
                        console.log("[PyWS] 已经连接上...");
                        c$.pyWS.send(JSON.stringify({'user_id': c$.pyWS_ID, 'msg_type': 'c_notice_id_Info'}));
                    };

                    c$.pyWS.onmessage = function(evt){
                        if (typeof c$.pyWS_cb === 'undefined') {
                            alert(evt.data);
                        }
                        console.log(evt.data);
                        c$.pyWS_cb && c$.pyWS_cb(evt.data);
                    };

                    c$.pyWS.onerror = function(evt){
                        console.log(evt.data);
                    };

                    c$.pyWS.onclose = function(evt){
                        console.log(evt.data);
                        var id = 'pyTime'+ (new Date()).getTime();
                        window[id] = setInterval(function () {
                            if (c$.pyWS.readyState == 3) {
                                //尝试新的连接
                                console.log('[PyWS] 重新连接 localhost socket server...');
                                c$.python.createPyWS();
                            } else {
                                clearInterval(window[id]);
                            }
                        }, 3000);
                    };
                }
            }catch(e){console.warn(e)}


        },

        // 注册PythonWS的回调句柄
        registerPyWSMessageCB: function (cb) {
            c$.pyWS_cb = cb;
        }
    };



    window.UI.c$ = $.extend(window.UI.c$,c$);
})();