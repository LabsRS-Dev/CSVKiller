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
    c$.go = function(){
        // 启动Python服务器
        c$.python.registerPyWSMessageCB(function(data){
            var jsonObj = JSON.parse(data);
            var msgType = jsonObj['msg_type'];

            //
            if(msgType == 's_get_id_Info'){
                console.info('server getting the client id');
                c$.jCallback.fire({type:'python_server_get_id_info', data:{}});
            }

            // 核心处理部分
            if(msgType == 's_task_exec_running'){
                c$.jCallback.fire({type:'python_task_running',data:jsonObj})
            }else if(msgType == 's_task_exec_result'){
                c$.jCallback.fire({type:'python_task_finished',data:jsonObj})
            }else if(msgType == 's_err_progress'){
                c$.jCallback.fire({type:'python_task_error', data:jsonObj, error:jsonObj.content})
            }

        });
        c$.python.startPyWebServer();
    };

    // 回调处理函数
    c$.jcallback_process = function(obj){
        var fireType = obj.type;

        // Python的处理部分，将转移到各自的回调函数中
        if(fireType.indexOf('python_',0) > -1){
            console.log('##RecivePythonMessage:\n' + $.obj2string(obj));
            try{
                var callback = obj.data['cb'];
                if (typeof callback != 'undefined' && callback.length > 0){
                    var jsString = callback + '(obj)';
                    try{
                        eval(jsString)
                    }catch(e){console.error(e)}
                }
            }catch(e){}
        }

        ///本地内置任务部分
        if(fireType == '_native_task_added'){

        }else if(fireType == '_native_task_started'){
            // 检查PythonServer服务是否正常开启
            var queueID = obj.data.queueInfo.id;
            var reg = new RegExp('^' + c$.global.PyServerPrefix +'','i');
            if (reg.test(queueID)){
                setTimeout(function(){
                    c$.python.createPyWS();
                },3500);
            }

        }else if(fireType == '_native_task_error'){

        }else if(fireType == '_native_task_finished'){

        }else if(fireType == '_native_task_canceled'){

        }

    };


    window.UI.c$ = $.extend(window.UI.c$,c$);

})();





