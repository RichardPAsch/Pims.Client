(function () {

    "use strict";

    angular
        .module("incomeMgmt.profileRetreive")
        .controller("profileRetreiveCtrl", profileRetreiveCtrl);

    profileRetreiveCtrl.$inject = ['createAssetWizardSvc', '$state', '$filter', '$resource', 'appSettings'];


    function profileRetreiveCtrl(createAssetWizardSvc, $state, $filter, $resource, appSettings) {

        var vm = this;
        vm.assetTickerSymbol = "";


        vm.getProfile = function () {

            vm.profileControllerUrl = appSettings.serverPath + "/Pims.Web.Api/api/Profile/" + vm.assetTickerSymbol.trim();

            $resource(vm.profileControllerUrl).get().$promise.then(
                function (profileResponse) {
                    vm.assetDivRate = profileResponse.dividendRate;
                    vm.assetDivYield = profileResponse.dividendYield;
                    vm.assetDescription = profileResponse.tickerDescription;
                    vm.assetDivFreq = profileResponse.dividendFreq === null ? "TBD" : createAssetWizardSvc.isValidDividendFrequency(profileResponse.dividendFreq)
                    vm.assetPeRatio = profileResponse.pE_Ratio;
                    vm.assetEPS = profileResponse.earningsPerShare;
                    vm.assetUnitPrice = profileResponse.price;
                    vm.assetDivPayDate = profileResponse.DividendPayDate === null ? "N/A" : $filter("date")(profileResponse.dividendPayDate, "M/dd/yyyy");
                    vm.assetExDivDate = profileResponse.exDividendDate === null ? "N/A" : $filter("date")(profileResponse.exDividendDate, "M/dd/yyyy");
                    
                    vm.refreshDateTime = $filter('date')(new Date(), "MM/d/yyyy-hh:mm:ss a");
                    vm.showDateTime = true;
                },
                function () {
                    alert("Unable to fetch Profile data for : \n" + vm.assetTickerSymbol + ".\nCheck ticker symbol validity.");
                }
            );
           
        } // end fx


        
        
    }


}());