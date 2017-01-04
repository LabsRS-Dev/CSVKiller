/**
 * Created by Ian on 8/18/14.
 * 优化
 */

(function(){
    window['UI'] = window['UI'] || {};
    window.UI.c$ = window.UI.c$ || {};
})();


(function(){
    var c$ = {};
    c$ = $.extend(window.UI.c$,{});

    // 插件(核心插件) 映射表
    c$.corePluginsMap = {
        PythonHelperPlugin:{
            callMethod:"call",
            tool:{
                key:"pythonHelper",
                path:"pythonHelper.dylib",
                method:"CLI",
                type:"dylib",
                mainThread:true
            }
        },

        PythonCLIPlugin:{
            callMethod:"task",
            type:"calltask",
            tool:{
                appPath:BS.b$.getAppPluginDir() + "/pythonCLI",
                command:[],
                mainThread:false
            }
        }
    };

    window.UI.c$ = $.extend(window.UI.c$,c$);
})();