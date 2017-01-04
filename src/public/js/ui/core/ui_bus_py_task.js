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

    c$.pythonAddon = {
        _pcb_idx: 0, // 回调函数
        getNewCallbackName:function(func, noDelete){
            window._pythonCallback = window._pythonCallback || {};
            var _pcb = window._pythonCallback;
            var r = 'pcb' + ++c$.pythonAddon._pcb_idx;
            _pcb[r] = function(){
                try{
                    if (!noDelete) delete _pcb[r];
                }catch(e){console.error(e)}
                func && func.apply(null, arguments);
            };

            return '_pythonCallback.' + r;
        },


        current_task_idx: 0, // 默认任务ID
        // 私有函数
        common_service:function(cli, command, cbFuncName){
            var currentTaskID = ++c$.pythonAddon.current_task_idx;
            var obj = {
                'taskInfo':{
                    'task_id': currentTaskID,
                    'callback': cbFuncName || c$.pythonAddon.getNewCallbackName(function(obj){
                        console.log($.toString(obj))
                    },false),
                    'cli':cli || '',
                    'command':command || ''
                },
                'msg_type':'c_task_exec',
                'user_id':c$.pyWS_ID
            };

            c$.pyWS.send(JSON.stringify(obj));
            return currentTaskID;
        }

        ,unknown:''
    };


    window.UI.c$ = $.extend(window.UI.c$,c$);
})();