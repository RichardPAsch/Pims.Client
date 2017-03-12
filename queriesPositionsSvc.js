(function () {
    "use strict";

    angular
        .module("incomeMgmt.core")
        .factory("queriesPositionsSvc", queriesPositionsSvc);

    queriesPositionsSvc.$inject = ["$resource", "appSettings"];


    function queriesPositionsSvc($resource, appSettings) {
        return $resource(appSettings.serverPath + "/Pims.Web.Api/api/Positions/Summary");
    };


}());