/**
 * Created by Ian on 2014/8/23.
 * 优化
 */
(function(){
    window['UI'] = window['UI'] || {};
    window.UI.c$ = window.UI.c$ || {};
})();


(function() {
    var c$ = {};
    c$ = $.extend(window.UI.c$, {});


    /**
     * 根据文件名，查找Profile
     * @param profileFileName  eg. 'profile.convert.av.default'
     * @param cb               eg. 'findCallback'
     */
    c$.getProfileJsonData = function(profileFileName, cb){
        // 第一种方案，从本地文件中搜索得到,第二种方案，从文件规则中获取位置
        var enableLocalFind = false;


        // 声明获取JSON Data的处理函数
        var startGetJsonData = function(url, cb){
            $.ajax({
                async: true,
                type: "get",
                url: url,
                dataType:'json',
                success: function(obj, textStatus){
                    cb(obj);
                }

            });
        };

        if(enableLocalFind){
            // 向本地发送查找处理消息，给定发送初始化Dir
            var dir = BS.b$.getAppResourcePublicDir() + "/data";
            var jsonStr = BS.b$.findFile(dir, profileFileName);
            var jsonObj = JSON.parse(jsonStr);

            if(jsonObj.success){
                var fileList = jsonObj.files;
                if(fileList.length > 1){
                    console.warn("查找的相应的Prfile数据文件不是唯一一个" );
                }

                var fileUrl = "data/" + fileList[0] + ".json";
                startGetJsonData(fileUrl, cb);

            }else{
                console.warn("[Warning]没有找到相应的Prfile数据文件" + profileFileName);
            }
        }else{
            var profileUrl = null;
            if(profileFileName.indexOf("profile.convert.av.") > -1){
                profileUrl = "data/av/profiles/" + profileFileName + ".json";
            }

            if(profileUrl){
                startGetJsonData(profileUrl, cb);
            }
        }

    };

})();