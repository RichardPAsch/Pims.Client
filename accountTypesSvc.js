(function () {

    "use strict";

    angular
        .module("incomeMgmt.core")
        .factory("accountTypesSvc", getAccountTypes);

    getAccountTypes.$inject = ["$resource", "appSettings"];


    function getAccountTypes($resource, appSettings) {
        return $resource(appSettings.serverPath + "/Pims.Web.Api/api/AccountType");
    };



}());