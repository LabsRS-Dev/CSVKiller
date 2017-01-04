/**
 * Created with JetBrains WebStorm.
 * User: Ian
 * Date: 7/10/13
 * Time: 3:32 PM
 * To change this template use File | Settings | File Templates.
 *
 * 对engine.io.js 的再一次封装
 *
 * 变更日志：
 * 1. Version 1.0  整理方便插件级别调用
 *
 *优化
 */

(function(){
    window['CI'] = window['CI'] || {};
    window.CI.IM$ = window.CI.IM$ || {};
})();



(function(){
    var IM$ = {
        version: '1.0',
        description: 'websocket编程部分, 实时通讯接口',

        debugLog: true, // 日志输出
        log: function(obj){
            var t = this;
            if (t.debugLog)
                console.info("[CI.IM]数据类型:" +typeof(obj) + ", 值为:" + $.toJSON(obj));
        },

        // 回调函数
        cb_onOpenCall:null,


        // 初始化
        socket: null, // socket对象
        init: function(ip, port){
            var t = this;
            t.log('call init');

            var url = 'ws://' + ip + ":" + port + "/";
            t.log('尝试连接: '+url);
            t.socket = new eio.Socket(url); //启动监听服务 'ws://localhost:8124/';
        },

        initWithUrl:function(url){
            var t = this;
            t.log('call initWithUrl');

            t.log('尝试连接: '+url);
            t.socket = new eio.Socket(url); //启动监听服务 'ws://localhost:8124/';
        },


        // 设置当连接成功后的处理
        setOpenedListen: function(message, onOpenCall){
            var t = this;
            t.log('call setOpenedListen');

            // 当连接已经建立,告知服务器
            t.socket.on('open', function () {

                //发送消息给服务器
                t.log('已经连接上，发送消息');
                onOpenCall || t.socket.send(message);
                onOpenCall && onOpenCall(t.socket);

            });
        },

        // 设置监听服务器发送过来的消息
        setReceiveMessageListen: function(onMessageCall) {
            var t = this;
            t.log('call setOnMessageListen');

            //监听服务器发送过来的消息
            t.socket.on('message', function (data) {
                t.log('======= 接收到服务器发送过来的消息');
                onMessageCall && onMessageCall(data, t.socket);
            });
        },

        // 设置当关闭的时候
        setCloseListen:function(onCloseCall){
            var t = this;
            t.log('call setCloseListen');

            t.socket.on('close', function () {
                t.log('======= 与服务器断开');
                onCloseCall && onCloseCall(t.socket);

            });
        },

        // 发送消息
        sendMessage: function(message){
            var t = this;
            t.log('call sendMessage');

            //发送消息给服务器
            t.socket && t.socket.send(message);
        },

        // 关闭连接
        close: function(){
            var t = this;
            t.log('call close');

            //向服务器发送关闭连接的指令
            t.socket.close();
        }
    };

    window.CI.IM$ = $.extend(window.CI.IM$,IM$);
})();




