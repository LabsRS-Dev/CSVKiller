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

    // 初始化AngularJS
    c$.AppCtrlScope = null;

    c$.init_angularApp = function(){
        var angularApp = angular.module('MainApp', ['ngMaterial', 'pascalprecht.translate', 'ngCookies']);
        angularApp.config(['$translateProvider',function ($translateProvider){
            $translateProvider.useStaticFilesLoader(({
                prefix: 'l10n/',
                suffix: '.json'
            }));

            // Tell the module what language to use by default
            $translateProvider.preferredLanguage('en');
            $translateProvider.fallbackLanguage('en');

            // Tell the module to store the language in the cookie
            $translateProvider.useCookieStorage();
            $translateProvider.useMissingTranslationHandlerLog();

        }]);


        angularApp.controller('AppCtrl', function($scope, $http, $translate, $mdDialog){
            c$.AppCtrlScope = $scope;
            c$.AppTranslate = $translate;
            c$.AppHttp = $http;

            //外部进行关联处理
            c$.link_AngularActionsInject && c$.link_AngularActionsInject($scope, $http, $translate, $mdDialog);

        });
    };
    window.UI.c$ = $.extend(window.UI.c$,c$);
})();