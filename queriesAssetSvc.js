(function () {

    "use strict";

    angular
        .module("incomeMgmt.core")
        .factory("queriesAssetSvc", queriesAssetSvc);

    queriesAssetSvc.$inject = ["$resource", "appSettings"];

    function queriesAssetSvc($resource, appSettings) {

        var vm = this;
        vm.assetSummaryData = [];
        vm.assetTypes = [];
        vm.baseUrl = appSettings.serverPath + "/Pims.Web.Api/api/";


        function getAssetSummaryData(assetsWithPositionStatus, ctrl) {
            // Fetch all current assets for logged investor.
            // e.g.,assetsWithPositionStatus = (A)ctive
            var assetSummaryUrl = appSettings.serverPath + "/Pims.Web.Api/api/Assets/" + assetsWithPositionStatus;

            $resource(assetSummaryUrl).query().$promise.then(function (response) {
                vm.assetSummaryData = response;
                ctrl.postAsyncGetAssetSummaryData(vm.assetSummaryData);
            }, function (err) {
                if (err.status === 400 || err.status === 500) {
                    alert("Error retreiving portfolio asset summary data.");
                }
            });
        }
       

        function getAvailableAssetTypes(ctrl) {
            // http://localhost//Pims.Web.Api/api/AssetClass
            var assetTypesUrl = appSettings.serverPath + "/Pims.Web.Api/api/AssetClass";

            $resource(assetTypesUrl).query().$promise.then(function (response) {
                vm.assetTypes = response;
                ctrl.postAsyncGetAvailableAssetTypes(vm.assetTypes);
            }, function (err) {
                if (err.status === 400 || err.status === 500) {
                    alert("Error retreiving asset types data.");
                }
            });
        }


        function updateAssetTypes(editedAssetTypes, ctrl) {

            // One or more edited assets to be updated.
            // Ex: http://localhost/Pims.Web.Api/api/AssetTypeUpdates/Asset
            var assetsUpdateUrl = vm.baseUrl + "AssetTypeUpdates/Asset";
            
            var resourceObj = $resource(assetsUpdateUrl,
                null,
                {
                    'update': { method: "PATCH" }
                });


            resourceObj.update(null, editedAssetTypes).$promise.then(function (response) {
                ctrl.postAsyncAssetTypeUpdates(response);
            }, function (ex) {
                ctrl.postAsyncAssetTypeUpdates(ex.data.messageDetail);
            });

        }


        function getAssetTypeEditsVm() {

            return {
                tickerSymbol        : "",
                assetClassId        : "", // to be renamed as 'asset type'
                lastUpdate          : "",
                profileId           : "",
                investorId          : "",
                assetId             : ""
            }
        }



        // API
        return {
            getAssetSummaryData: getAssetSummaryData,
            getAvailableAssetTypes: getAvailableAssetTypes,
            updateAssetTypes: updateAssetTypes,
            getAssetTypeEditsVm: getAssetTypeEditsVm
        }
        

    }

}());