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
        var dir = obj.filesArray[0].filePath;
        c$.global.tmp_selectOutDir = dir;

        //触发任务处理消息
        c$.jCallback.fire({type:'selected_dir', data:dir});
    };

    // 通用选择输出文件回调处理方式
    c$.common_cb_selectOutFile = function(obj){
        var filePath = obj.filePath;
        c$.global.tmp_selectOutFile =  filePath;
        //触发任务处理消息
        c$.jCallback.fire({type:'selected_save_file', data:filePath});
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
                console.info(data);
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
        c$.init_angularApp();
        c$.go();
    };

    window.UI.c$ = $.extend(window.UI.c$,c$);
})($);