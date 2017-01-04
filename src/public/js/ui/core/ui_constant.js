/**
 * Created by Ian on 2014/12/9.
 */

(function(){
    window['UI'] = window['UI'] || {};
    window.UI.c$ = window.UI.c$ || {};
})();

(function(){
    var c$ = {};
    c$ = $.extend(window.UI.c$,{});

    c$.global = {};

    var gl = c$.global;

    gl.includeExt = new RegExp('.(zip|rar)$','i');   // 全局允许导入的格式
    gl.enableImportMultipleFiles = false; // 是否允许导入多个文件
    gl.saveFileExts = ['csv'];            // 文件保存的格式

    gl.PyServerPrefix = 'PyWebServer';      // Python服务器任务的前缀

    gl.tmp_importFilesList = [];          // 导入文件的列表（临时存储）
    gl.tmp_selectOutDir = null;           // 选择的输出目录（临时存储）
    gl.tmp_selectOutFile = null;          // 选择的输出文件（临时存储）


    window.UI.c$ = $.extend(window.UI.c$,c$);
})();