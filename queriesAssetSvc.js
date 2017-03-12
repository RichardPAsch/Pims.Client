(function () {

    "use strict";

    angular
        .module("incomeMgmt.core")
        .factory("queriesAssetSvc", queriesAssetSvc);

    queriesAssetSvc.$inject = ["$resource", "appSettings"];

    function queriesAssetSvc($resource, appSettings) {
        //return $resource(appSettings.serverPath + "/Pims.Web.Api/api/Assets/:status");
        var vm = this;
        vm.assetSummaryData = [];


        function getAssetSummaryData(assetsWithPositionStatus, ctrl) {
            var assetSummaryUrl = appSettings.serverPath + "/Pims.Web.Api/api/Assets/" + assetsWithPositionStatus;

            $resource(assetSummaryUrl).query().$promise.then(function (response) {
                vm.assetSummaryData = response;
                ctrl.postAsyncGetAssetSummaryData(vm.assetSummaryData);
            }, function (err) {
                if (err.status == 400 || err.status == 500) {
                    alert("Error retreiving portfolio asset summary data.");
                }
            });
        }
       

        return {
            getAssetSummaryData: getAssetSummaryData
        }
        

    }

}());