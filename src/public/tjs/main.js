/**
 * Created by Ian on 2015/2/12.
 */


require.config({
    "baseUrl": "tjs",
    "paths": {
        "jquery": "../common/jquery/jquery.min",
        "underscore": "../common/underscore/1.7.0/underscore-min.js",
        "react": "../common/react/0.12.2/react.min",
        "JSXTransformer": "../common/react/0.12.2/JSXTransformer",
        "jsx": "../common/react/plugin/jsx",
        "BS.b$": "../js/bs.min",
        "BS.util": "../js/util.min"
    },
    "shim": {
        "jquery": {
            "exports": "$"
        },
        "underscore":{
            "exports" : "_"
        },
        "react":{
            "exports": "React"
        },
        "JSXTransformer": {
            exports: "JSXTransformer"
        },
        "BS.b$":{
            exports: "b$"
        }
    }
});

require(["react", "jsx!List"], function (React, List) {

    alert(typeof react)
    setInterval(function(){
        "use strict";
        React.renderComponent(
            List({date:new Date()}),
            //List(null),
            document.getElementById('example')
        );
    }, 500)

});

require(["BS.b$", "BS.util"], function(b$, u){
    console.log(b$.App.getAppName())
    console.log(u.ConfigClass.domain)
});




