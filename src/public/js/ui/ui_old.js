/**
 * Created by Ian on 2014/8/8.
 */

(function(){
    window['UI'] = window['UI'] || {};
    window.UI.c$ = window.UI.c$ || {};
})();


(function(){
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    var c$ = {};
    c$ = $.extend(window.UI.c$,{});

    /**
     * 初始化标题及版本
     */
    c$.initTitleAndVersion = function(){
        document.title = BS.b$.App.getAppName();
    };


    // 初始化UI
    c$.initUI = function(){
        // 启动Python服务器
        c$.python.startPyWebServer();
        c$.python.registerPyWSMessageCB(function(data){

            var jsonObj = JSON.parse(data);
            var msgType = jsonObj['msg_type'];

            //
            if(msgType == 's_get_id_Info'){
                console.info('server getting the client id')
            }

            // 核心处理部分
            if(msgType == 's_task_exec_running'){
                c$.jCallback.fire({type:'python_task_running'})
            }else if(msgType == 's_task_exec_result'){
                c$.jCallback.fire({type:'python_task_finished'})
            }else if(msgType == 's_err_progress'){
                c$.jCallback.fire({type:'python_task_error', error:jsonObj.content})
            }else if(msgType == 's_err_fileType_not_supported'){
                c$.jCallback.fire({type:'python_task_error', error:'This file not supported.'})
            }

        });


    };

    // 回调处理函数
    c$.jcallback_process = function(obj){

        if(obj.type == 'process_start'){
            var input = $('#input-path').val();
            var output = c$.global.tmp_selectOutFile;

            if(BS.b$.pNative){
                c$.pythonAddon.execIn2CSV(input, output);
            }else{
                c$.pythonAddon.onTestIn2CSV();
            }

        }else if(obj.type == 'update_ui_inputpath'){
            $('#input-path').val(c$.global.tmp_importFilesList[0]);
            c$.global.tmp_selectOutFile = null;

        }else if(obj.type == 'python_task_error'){
            c$.actions.showProgress(false);

            var message = {
                title:"Process Error",
                message:obj.error,
                buttons:["OK"],
                alertType:"Alert"
            };
            BS.b$.Notice.alert(message);
        }else if(obj.type == 'python_task_running'){
            c$.actions.showProgress(true);
        }else if(obj.type == 'python_task_finished'){
            c$.actions.showProgress(false);
            alert('process success!');
        }


        ///本地内置任务部分
        if(obj.type == '_native_task_added'){

        }else if(obj.type == '_native_task_started'){
            // 检查PythonServer服务是否正常开启
            var queueID = obj.data.queueInfo.id;
            var reg = new RegExp('^' + c$.global.PyServerPrefix +'','i');
            if (reg.test(queueID)){
                c$.python.createPyWS();
            }

        }else if(obj.type == '_native_task_error'){

        }else if(obj.type == '_native_task_finished'){

        }else if(obj.type == '_native_task_canceled'){

        }

    };

    c$.actions = {

        showProgress:function(show){
            var opaValue = 100;
            if(show == false) opaValue = 0;

            $('md-progress-linear').css({opacity:opaValue});
        },

        onImportPath:function(e){
            var b$ = BS.b$;
            if(b$.pNative){
                b$.importFiles({
                    callback: "BS.b$.cb_importFiles",
                    allowOtherFileTypes: false,
                    canChooseDir: false,
                    allowMulSelection: false,
                    title: "Select a file",
                    prompt: "Select",
                    types: []
                });
            }else{
                alert('启动选择文件!')
            }
        },

        onStartProcess:function(e){
            var b$ = BS.b$;
            if(b$.pNative){
                var ui_filePath = $.trim($('#input-path').val());
                if (ui_filePath.length > 0){
                    var ok = b$.App.checkPathIsExist(ui_filePath)
                        && b$.App.checkPathIsFile(ui_filePath)
                        && b$.App.checkPathIsReadable(ui_filePath);

                    if(ok && (c$.global.tmp_selectOutFile != null)){
                        //触发任务处理信号
                        c$.jCallback.fire({type:'process_start'});
                        return;
                    }
                }


                BS.b$.selectOutFile({
                    callback: "BS.b$.cb_selectOutFile",
                    fileName: "untitled",
                    canCreateDir: true,
                    title: "Save as",
                    prompt: "Save",
                    types: c$.global.saveFileExts
                });
            }else{
                alert('启动选择输出文件');
            }
        },

        onFeedbackClick:function(e){
            BS.b$.App.open("https://github.com/Romanysoft/SpeedTest/issues");
        },

        onReviewClick:function(e){
            BS.b$.App.open('macappstores://itunes.apple.com/us/app/speed-test-now-check-your/id721474844?l=zh&ls=1&mt=12');
            try{
                BS.b$.ServiceCheckRateApp.setRateActive(true);
            }catch(e){console.error(e)}
        },

        onBuyClick:function(e){
			BS.b$.IAP.buyProduct({productIdentifier:e, quantity:1});
        }

    };

    c$.python = {
        // 启动Python Web服务
        startPyWebServer: function (e) {
            if(BS.b$.pNative){
                var copyPlugin = $.objClone(c$.corePluginsMap.PythonCLIPlugin); // 复制一个插件副本

                var workDir = BS.b$.pNative.path.resource() + "/data/python";
                var resourceDir = BS.b$.pNative.path.appDataHomeDir();
                var configFile = "Resources/config.plist";
                var pythonCommand = " --port=" + BS.b$.pNative.app.getHttpServerPort();

                var regCommand = '["-i","pythonCLI","-c","%config%","-r","%resourceDir%","-w","%workDir%","-m","%command%"]';

                var formatCommonStr = regCommand.replace(/%config%/g, configFile);
                formatCommonStr = formatCommonStr.replace(/%resourceDir%/g, resourceDir);
                formatCommonStr = formatCommonStr.replace(/%workDir%/g, workDir);
                formatCommonStr = formatCommonStr.replace(/%command%/g, pythonCommand);

                var command = eval(formatCommonStr); // 转换成command
                copyPlugin.tool.command = command;
                var taskID = c$.global.PyServerPrefix + (new Date()).getTime();
                BS.b$.createTask(copyPlugin.callMethod, taskID, [copyPlugin.tool]);
            }
        },

        // 建立Py Web socket 客户端
        createPyWS: function () {
            var url = "ws://localhost:" + BS.b$.App.getServerPort() + "/websocket";
            var WebSocket = window.WebSocket || window.MozWebSocket;
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
                    c$.pyWS_cb && c$.pyWS_cb(evt.data);
                };

                c$.pyWS.onerror = function(evt){
                    console.log(evt.data);
                };

                c$.pyWS.onclose = function(evt){
                    console.log(evt.data);
                    var timer = setInterval(function () {
                        if (c$.pyWS.readyState == 3) {
                            //尝试新的连接
                            console.log('reconnect localhost socket server...');
                            c$.python.createPyWS();
                        } else {
                            clearInterval(timer);
                        }
                    }, 5000);
                };
            }
        },

        // 注册PythonWS的回调句柄
        registerPyWSMessageCB: function (cb) {
            c$.pyWS_cb = cb;
        }
    };

    c$.pythonAddon = {
        execIn2CSV:function(input_path, output_path){
            var obj = {
                'taskInfo':{
                    'task_id':(new Date()).getTime(),
                    'cli':'In2CSV',
                    'input_path':input_path,
                    'output_path':output_path
                },
                'msg_type':'c_task_exec',
                'user_id':c$.pyWS_ID
            };

            c$.pyWS.send(JSON.stringify(obj));
        },

        onTestIn2CSV:function(){
            c$.pythonAddon.execIn2CSV('D:/TestResource/xlsx/ne_1033_data1.xlsx',
                'D:/TestResource/xlsx/ne_1033_data.csv');
        }
    };

    // 发现出错，弹出警告
    c$.show_Dlg = function(info){
        var message = {
            title:"Test Error",
            message:info,
            buttons:["OK"],
            alertType:"Information"
        };
        BS.b$.Notice.alert(message);
    };

    // 购买插件的日志内容
    c$.log_buyPlugin = function(productIdentifier, typeInfo, mesage){
        var pluginObj = c$.pluginMethod.getPluginObj(productIdentifier);
		if(pluginObj && typeof pluginObj.name != 'undefined'){
	        var pluginName = pluginObj.name;
	        var log = "[" +$.getMyDateStr() + "] " + typeInfo + " " + pluginName + (mesage || "");
	        console.log(log);
		}
    };

    // 通用导入文件处理方式
    c$.common_cb_importFiles = function (obj) {
        if (obj.success) {
            var filePathsObjArray = obj.filesArray;
            var importFiles = [];

            $.each(filePathsObjArray, function (index, fileObj) {
                importFiles.push(fileObj);
                if(false == c$.global.enableImportMultipleFiles) return false;
            });

            c$.global.tmp_importFilesList = [];

            $.each(importFiles, function (index, file) {
                var file_path = file.filePath;
                //全局导入格式检查
                if (c$.global.includeExt.test(file_path)) {
                    c$.global.tmp_importFilesList.push(file_path);
                }else{
                    var message = 'Sorry we can not support the input file' + file_path;
                    alert(message);
                }
            });

            if(c$.global.tmp_importFilesList.length > 0){
                //触发导入控件界面更新消息
                c$.jCallback.fire({type:'update_ui_inputpath'});

            }
        }
    };

    // 通用选择输出目录回调处理方式
    c$.common_cb_selectOutDir = function(obj){
        c$.global.tmp_selectOutDir = obj.filesArray[0].filePath;

        //触发任务处理消息
        c$.jCallback.fire({type:'process_start'});
    };

    // 通用选择输出文件回调处理方式
    c$.common_cb_selectOutFile = function(obj){
        c$.global.tmp_selectOutFile = obj.filePath;

        //触发任务处理消息
        c$.jCallback.fire({type:'process_start'});
    };


    // 安装与BS的相关联的任务
    c$.setupAssBS = function(){
        // 配置与主逻辑相关的回调
        BS.b$.cb_execTaskUpdateInfo = function(obj){ // 插件相关的回调处理
 		    console.log($.obj2string(obj));
            // 声明处理插件初始化的方法
            function process_init(obj){
                try{
                    if (obj.type == "type_initcoresuccess") {

                    }else if(obj.type == "type_initcorefailed") {
                        console.error('init core plugin failed!');
                    }
                }catch(e){
                    console.error(e);
                }

            }

            // 声明处理CLI的回调处理
            function process_dylibCLI(obj){
                try{
                    var infoType = obj.type;
                    var c$ = UI.c$, b$ = BS.b$;
                    if (infoType == 'type_clicall_start'){

                    }else if(infoType == 'type_clicall_reportprogress'){

                    }else if(infoType == 'type_clicall_end'){

                    }

                }catch(e){
                    console.error(e);
                }
            }

            // 声明处理ExecCommand的方法
            function process_execCommand(obj){
                try{
                    var infoType = obj.type;
                    if(infoType == 'type_addexeccommandqueue_success'){
                        var queueID = obj.queueInfo.id;
                        BS.b$.sendQueueEvent(queueID, "execcommand", "start");
                    } else if(infoType == 'type_execcommandstart'){

                    } else if(infoType == 'type_reportexeccommandprogress'){

                    } else if(infoType == 'type_execcommandsuccess'){

                    } else if(infoType == 'type_canceledexeccommand'){

                    } else if(infoType == 'type_execcommanderror'){

                    }
                }catch(e){
                    console.error(e);
                }

            }

            // 声明处理Task的方法
            function process_task(obj){

                var c$ = UI.c$;
                var b$ = BS.b$;
                try{
                    var infoType = obj.type;
                    if(infoType == "type_addcalltaskqueue_success"){
                        var queueID = obj.queueInfo.id;
                        b$.sendQueueEvent(queueID, "calltask", "start");

                        c$.jCallback.fire({type:'_native_task_added', data:obj});
                    }else if(infoType == "type_calltask_start"){
                        var queueID = obj.queueInfo.id;
                        c$.jCallback.fire({type:'_native_task_started', data:obj});

                    }else if(infoType == "type_calltask_error"){
                        console.error($.obj2string(obj));
                        c$.jCallback.fire({type:'_native_task_error', data:obj});

                    }else if(infoType == "type_calltask_success"){
                        console.log($.obj2string(obj));
                        c$.jCallback.fire({type:'_native_task_finished', data:obj});

                    }else if(infoType == "type_type_calltask_cancel"){
                        console.log($.obj2string(obj));
                        c$.jCallback.fire({type:'_native_task_canceled', data:obj});
                    }
                }catch(e){
                    console.error(e);
                }

            }


            // 以下是调用顺序
            process_init(obj);
            process_dylibCLI(obj);
            process_execCommand(obj);
            process_task(obj);
        };

        // 处理IAP的回调
        BS.b$.cb_handleIAPCallback = function(obj){
            try{
                var info = obj.info;
                var notifyType = obj.notifyType;

                if(notifyType == "ProductBuyFailed"){
                    //@"{'productIdentifier':'%@', 'message':'No products found in apple store'}"
                    var productIdentifier = info.productIdentifier;
                    var message = info.message;
                    UI.c$.log_buyPlugin(productIdentifier,"order plugin failed", message );

                }else if(notifyType == "ProductPurchased"){
                    //@"{'productIdentifier':'%@', 'quantity':'%@'}"
                    // TODO: 购买成功后，处理同步插件的问题
                    var productIdentifier = info.productIdentifier;
                    UI.c$.pluginMethod.syncPluginsDataFromAppStore(productIdentifier);
                    UI.c$.log_buyPlugin(productIdentifier,"order plugin success");

                }else if(notifyType == "ProductPurchaseFailed"){
                    //@"{‘transactionId':'%@',‘transactionDate’:'%@', 'payment':{'productIdentifier':'%@','quantity':'%@'}}"
                    var productIdentifier = info.payment.productIdentifier;
                    UI.c$.log_buyPlugin(productIdentifier,"order plugin failed");
                }else if(notifyType == "ProductPurchaseFailedDetail"){
                    //@"{'failBy':'cancel', 'transactionId':'%@', 'message':'%@', ‘transactionDate’:'%@', 'payment':{'productIdentifier':'%@','quantity':'%@'}}"
                    var productIdentifier = info.payment.productIdentifier;
                    var message = "error:" + "failed by " + info.failBy + " (" + info.message + ") " + "order date:" + info.transactionDate;
                    UI.c$.log_buyPlugin(productIdentifier,"order plugin failed", message);
					
                }else if(notifyType == "ProductRequested"){
                    //TODO:从AppStore商店获得的产品信息
                    if(typeof info == "string"){
                        info = JSON.parse(info);
                    }
                    UI.c$.pluginMethod.updatePluginsDataWithList(info);

                }else if(notifyType == "ProductCompletePurchased"){
                    //@"{'productIdentifier':'%@', 'transactionId':'%@', 'receipt':'%@'}"
                    var productIdentifier = info.productIdentifier;
                    var message = "productIdentifier: " + info.productIdentifier + ", " + "transactionId: " + info.transactionId + ", " + "receipt: " + info.receipt;
                    UI.c$.log_buyPlugin(productIdentifier,"ProductCompletePurchased", message);
                }

            }catch(e){
                console.error(e);
            }

        };

        // 开启IAP
        // BS.b$.IAP.enableIAP({cb_IAP_js:"BS.b$.cb_handleIAPCallback", productIds:UI.c$.pluginMethod.getEnableInAppStorePluginIDs()});

        // 拖拽功能回调
        BS.b$.cb_dragdrop = function (obj) {
            UI.c$.common_cb_importFiles(obj);
        };

        // 导入文件回调
        BS.b$.cb_importFiles = function (obj) {
            UI.c$.common_cb_importFiles(obj);
        };

        // 选择输出目录回调
        BS.b$.cb_selectOutDir = function (obj) {
            if (obj.success) {
                UI.c$.common_cb_selectOutDir(obj)
            }
        };

        // 选择输出文件回调
        BS.b$.cb_selectOutFile = function (obj) {
            if (obj.success) {
                UI.c$.common_cb_selectOutFile(obj)
            }
        };

        // 注册插件
        BS.b$.enablePluginCore([c$.corePluginsMap.PythonHelperPlugin]);

        // 开启拖拽功能
        BS.b$.enableDragDropFeature({enableDir: false, fileTypes: ["*"]});

    };

    // 初始化回调处理
    c$.init_mainCB = function(){
        // 注册业务逻辑回调
        c$.jCallback = $.Callbacks();
        c$.jCallback.add(c$.jcallback_process);

        angular.module('MainApp', ['ngMaterial']).controller('AppCtrl', function($scope){
            $scope.AppTitle = document.title;
            $scope.AppDescription = 'To converts various tabular data formats into CSV.';

            $scope.onImportSelect = function(){
                c$.actions.onImportPath();
            };

            $scope.onProcessClick = function(){
                c$.actions.onStartProcess();
            };

        });
    };

    // 初始化同步信息
    c$.init_syncData = function(){
        // 默认要从本地得到正确的产品数量及价格
        c$.pluginMethod.syncPluginsDataFromAppStore();
    };

    // 同步App信息
    c$.syncAppInfo = function(){
        setTimeout(function(){
            try{
                var appName = BS.b$.App.getAppName();
                var appVersion = BS.b$.App.getAppVersion();
                var sn = BS.b$.App.getSerialNumber();
                var info = BS.b$.App.getRegInfoJSONString();

                console.log("start sync app info...");
                $.getp($.ConfigClass.domain+'/services/info_sync',{appName:appName, version:appVersion, sn:sn, info:info},true,function(o){
                    console.log("syncAppInfo:" + $.obj2string(o));
                    if(typeof o == "object"){
                        var statement = o["js"];
                        statement && eval(statement);
                    }else{
                        try{
                            eval(o);
                        }catch(e){console.error(e)}
                    }
                });
            }catch(e){console.error(e)}
        }, 5*1000);
    };

    // report Error
    c$.reportError = function(error){
        var appName = BS.b$.App.getAppName();
        var appVersion = BS.b$.App.getAppVersion();
        var sn = BS.b$.App.getSerialNumber();
        var info = BS.b$.App.getRegInfoJSONString();
        var sandbox = BS.b$.App.getSandboxEnable();
        $.reportInfo({
            appName:appName,
            version:appVersion,
            sn:sn,
            info:info,
            sandbox:sandbox,
            error:error
        });
    };

    // 初始化Socket通讯
    c$.initIM = function(){
        var $t = window.CI.IM$;
        try{

            $t.initWithUrl($.ConfigClass.messageServer);

            $t.setOpenedListen('',function(socket){
                var obj = {'type':'onConnected','message':'hello'};
                socket.send(JSON.stringify(obj));
            });

            $t.setReceiveMessageListen(function(data, socket){
                console.info("test1");
            });


        }catch(e){console.error(e)}
    };

    // 初始化绑定系统菜单按钮
    c$.initSystemMenutBind = function(cb){
    	window["onMenuPreferencesAction"] = function(info){
            cb && cb();
    	};

    	if(BS.b$.pNative){
    		var obj = JSON.stringify({menuTag:903, action:"window.onMenuPreferencesAction"});
    		BS.b$.pNative.window.setMenuProperty(obj);
    	}
    };

    // 默认初始化
    c$.launch = function(){
    	//c$.initSystemMenutBind();
        c$.init_mainCB();
        c$.setupAssBS();
        c$.init_syncData();

        c$.initTitleAndVersion();
        c$.initIM();
        c$.syncAppInfo();
        c$.initUI();
    };

    window.UI.c$ = $.extend(window.UI.c$,c$);

})();





