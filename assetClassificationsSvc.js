(function () {

    "use strict";

    angular
        .module("incomeMgmt.core")
        .factory("assetClassificationsSvc", getClassifications);

    getClassifications.$inject = ["$resource", "appSettings"];


    function getClassifications($resource, appSettings) {
        return $resource(appSettings.serverPath + "/Pims.Web.Api/api/AssetClass");
    };



}());