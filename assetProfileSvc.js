(function () {

    "use strict";

    angular
        .module("incomeMgmt.core")
        .factory("assetProfileSvc", assetProfileSvc);

    assetProfileSvc.$inject = ["$resource", "appSettings"];


    function assetProfileSvc($resource, appSettings) {
        return $resource(appSettings.serverPath + "/Pims.Web.Api/api/Profile/:tickerSymbol");

    };



}());