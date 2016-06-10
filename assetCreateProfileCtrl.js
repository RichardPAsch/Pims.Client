(function () {

    "use strict";

    angular
        .module("incomeMgmt.assetCreateProfile")
        .controller("assetCreateProfileCtrl", assetCreateProfileCtrl);

    // $promise returned, via 'routing.js' state;  key reference injected for initializing dropdown.
    assetCreateProfileCtrl.$inject = ['createAssetWizardSvc', 'assetProfile', '$state', '$filter'];


    function assetCreateProfileCtrl(createAssetWizardSvc, assetProfile, $state, $filter) {

        var vm = this;
        vm.currentProfile = assetProfile;
        vm.showDateTime = false;
        vm.assetDivFreq = "";

        // Existing Asset state before or after Profile addition.
        vm.currentAsset = createAssetWizardSvc.processAsset();

 
        if (assetProfile == null) {
            // Page REVISIT (post-Profile initialization- 'profileEmpty' state), or initial viewing [ProfileToCreate == undefined].
            vm.assetTickerSymbol = vm.currentAsset.AssetTicker == undefined ? "" : vm.currentAsset.AssetTicker.toUpperCase();
            vm.assetDivRate = vm.currentAsset.ProfileToCreate == undefined ? 0 : vm.currentAsset.ProfileToCreate.DividendRate;
            vm.assetDivYield = vm.currentAsset.ProfileToCreate == undefined ? 0 : vm.currentAsset.ProfileToCreate.DividendYield;
            vm.assetDivFreq = vm.currentAsset.ProfileToCreate == undefined ? "" : vm.currentAsset.ProfileToCreate.DividendFreq;
            vm.assetPeRatio = vm.currentAsset.ProfileToCreate == undefined ? 0 : vm.currentAsset.ProfileToCreate.PE_Ratio;
            vm.assetEPS = vm.currentAsset.ProfileToCreate == undefined ? 0 : vm.currentAsset.ProfileToCreate.EarningsPerShare;
            vm.assetUnitPrice = vm.currentAsset.ProfileToCreate == undefined ? 0 : vm.currentAsset.ProfileToCreate.Price;
            vm.assetDivPayDate = vm.currentAsset.ProfileToCreate == undefined ? "" : $filter('date')(vm.currentAsset.ProfileToCreate.DividendPayDate, 'MMM d, yyyy');
            vm.assetExDivDate = vm.currentAsset.ProfileToCreate == undefined ? "" : $filter('date')(vm.currentAsset.ProfileToCreate.ExDividendDate, 'MMM d, yyyy');
            vm.assetDescription = vm.currentAsset.ProfileToCreate == undefined ? "" : vm.currentAsset.ProfileToCreate.TickerDescription;
            if (vm.currentAsset.ProfileToCreate != undefined)
                vm.showDateTime = true;

            vm.refreshDateTime = vm.currentAsset.ProfileToCreate == undefined ? "" : $filter('date')(vm.currentAsset.ProfileToCreate.LastUpdate, 'MM/d/yyyy-hh:mm:ss a');
        } else {
            // Initialize view with fetched Profile data.
            vm.assetTickerSymbol = vm.currentAsset.AssetTicker; //.toUpperCase();
            vm.assetDivRate = assetProfile.dividendRate == "N/A" ? 0 : assetProfile.dividendRate;
            vm.assetDivYield = assetProfile.dividendYield;
            vm.assetDivFreq = createAssetWizardSvc.isValidDividendFrequency(vm.assetDivFreq) ? vm.assetDivFreq.trim() : "TBD";
            vm.assetPeRatio = assetProfile.pE_Ratio == null ? 0 : assetProfile.pE_Ratio;
            vm.assetEPS = assetProfile.earningsPerShare;
            vm.assetUnitPrice = assetProfile.price;
            vm.assetDivPayDate = assetProfile.dividendPayDate.indexOf("1900") == 0 ? "Not available" : $filter('date')(assetProfile.dividendPayDate, 'M/dd/yyyy');
            vm.assetExDivDate = assetProfile.exDividendDate.indexOf("1900") == 0 ? "Not available" : $filter('date')(assetProfile.exDividendDate, 'M/dd/yyyy');
            vm.assetDescription = assetProfile.tickerDescription;
            vm.refreshDateTime = $filter('date')(new Date(), 'MM/d/yyyy-hh:mm:ss a');
            vm.showDateTime = true;
        }

        


        vm.saveAssetProfile = function () {
            var profileBuild = createAssetWizardSvc.getBaseProfile();

            // Required 5 attributes:
            profileBuild.TickerSymbol = vm.assetTickerSymbol;
            profileBuild.TickerDescription = vm.assetDescription;
            profileBuild.Price = vm.assetUnitPrice;
            profileBuild.LastUpdate = $filter('date')(new Date(vm.refreshDateTime), 'M/dd/yyyy');
            profileBuild.Url = createAssetWizardSvc.getBasePath + "Profile/" + vm.assetTickerSymbol.trim();

            profileBuild.DividendRate = vm.assetDivRate == null ? 0 : vm.assetDivRate;
            profileBuild.DividendFreq = vm.assetDivFreq; 
            profileBuild.DividendYield = vm.assetDivYield == null ? 0 : vm.assetDivYield;
            profileBuild.PE_Ratio = vm.assetPeRatio == null ? 0 : vm.assetPeRatio;
            profileBuild.EarningsPerShare = vm.assetEPS == null ? 0 : vm.assetEPS;
            profileBuild.ExDividendDate = vm.assetExDivDate.trim() == "Not available"
                ? $filter('date')(new Date("1/1/1900"), 'M/dd/yyyy')
                : $filter('date')(new Date(vm.assetExDivDate), 'M/dd/yyyy');
            profileBuild.DividendPayDate = vm.assetDivPayDate.trim() == "Not available"
                ? $filter('date')(new Date("1/1/1900"), 'M/dd/yyyy')
                : $filter('date')(new Date(vm.assetDivPayDate), 'M/dd/yyyy');
            
            var assetBuild = createAssetWizardSvc.processAsset();
            assetBuild.ProfileToCreate = profileBuild;
            createAssetWizardSvc.processAsset(assetBuild);
            
            // Advance to next step (Position).
            $state.go("asset_create.position");
            createAssetWizardSvc.showActiveTab('steps clearfix', 'position');
       }


        vm.refreshProfile = function () {
            $state.go("asset_create.profile", { "tickerSymbol": vm.assetTickerSymbol.trim() });
            createAssetWizardSvc.showActiveTab('steps clearfix', 'profile');
            vm.refreshDateTime = $filter('date')(new Date(), 'MM/d/yyyy-hh:mm:ss a');
            vm.lastRefresh = vm.refreshDateTime;
            vm.showDateTime = true;
        }


    }


}());