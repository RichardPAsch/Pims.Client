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

            var submittedTicker = vm.assetTickerSymbol;
            // $resource(url, [paramDefaults], [actions], options);
            var referencedProfile = $resource(appSettings.serverPath + "/Pims.Web.Api/api/Profile/:tickerSymbol");

            referencedProfile.get({ tickerSymbol: submittedTicker}, function(response) {
                // success
                vm.assetDivRate = response.dividendRate === "N/A"
                    ? 0
                    : response.dividendRate;
                vm.assetDivYield = response.dividendYield;
                vm.assetDivFreq = createAssetWizardSvc.isValidDividendFrequency(response.dividendFreq) ? response.dividendFreq.trim() : "TBD";
                vm.assetPeRatio = response.pE_Ratio == null ? 0 : response.pE_Ratio;
                vm.assetEPS = response.earningsPerShare;
                vm.assetUnitPrice = response.price;
                vm.assetDivPayDate = response.dividendPayDate.indexOf("1900") === 0
                    ? "Not available"
                    : $filter('date')(response.dividendPayDate, 'M/dd/yyyy');
                vm.assetExDivDate = response.exDividendDate.indexOf("1900") === 0
                    ? "Not available"
                    : $filter('date')(response.exDividendDate, 'M/dd/yyyy');
                vm.assetDescription = response.tickerDescription;
                vm.refreshDateTime = $filter('date')(new Date(), 'MM/d/yyyy-hh:mm:ss a');
                vm.showDateTime = true;
            }, function(err) {
                // error
                alert("Error retreiving Profile for " + submittedTicker + " due to "  + err.message);
            });

        }
        
    }


}());