(function () {

    "use strict";

    angular
        .module("incomeMgmt.assetCreateTicker")
        .controller("assetCreateTickerCtrl", assetCreateTickerCtrl);

    // $promise returned, via 'routing.js' state;  key reference injected for initializing dropdown.
    assetCreateTickerCtrl.$inject = ['assetClassifications', 'createAssetWizardSvc', '$state', '$interval', 'incomeMgmtSvc'];


    function assetCreateTickerCtrl(assetClassifications, createAssetWizardSvc, $state, $interval, incomeMgmtSvc) {

        var vm = this;
        vm.assetClasses = assetClassifications;
        vm.assetModel = createAssetWizardSvc.getBaseAsset();
        vm.assetModel.AssetTicker = "";
        vm.assetModel.AssetDescription = "";
        vm.assetModel.AssetClassification = vm.assetClasses[0]; // Select...
        vm.preTickerAsset = createAssetWizardSvc.processAsset();
        vm.initializedAsset = {};
        vm.tickerRegEx = "^[a-zA-Z0-9-]+$"; // letters,numbers,and/or hyphens allowed
        vm.showValidationMsg = false;
        vm.showAssetClassifcationValidationMsg = false;
        vm.isRevisit = false;

      

        // post-'Save' tab revisit.
        if (vm.preTickerAsset.AssetTicker != undefined) {
            vm.showValidationMsg = false;
            vm.assetModel.AssetTicker = vm.preTickerAsset.AssetTicker;
            vm.assetModel.AssetDescription = vm.preTickerAsset.AssetDescription;
            vm.initializedAsset = createAssetWizardSvc.getAsset();
            var idx = getAssetClassIndex(vm.initializedAsset.AssetClassification, vm.assetClasses);
            vm.assetModel.AssetClassification = vm.assetClasses[idx];
            vm.isRevisit = true;
        }

        /* 'Save' algorithm:
            1. saveBaseAttr()
            2. checkTickerSymbolValidity()
            3. postValidationTickerCheck()
        */


        // 1st level validation: togggling enable on 'Save'.
        vm.isMinimumAssetData = function () {
            if (vm.isRevisit)
                return false;

           if (vm.assetModel.AssetTicker != "" && vm.assetModel.AssetClassification.description != "Select..." ) {
                return true;
            } else {
                return false;
            }

        }

        // 2nd level of validation: post 'Save' event.
        vm.isValidTicker = function () {

            // Ticker FORMAT checking.
            return vm.assetModel.AssetTicker == undefined || vm.assetModel.AssetTicker.match(vm.tickerRegEx) == null
                                                          || vm.assetModel.AssetTicker.length > 5
                                                          || vm.assetModel.AssetTicker == ""
                ? false
                : true;
        }

        
        vm.postValidationTickerCheck = function (isOkToContinue)
        {
            if (isOkToContinue) {
                var assetBuild = createAssetWizardSvc.processAsset(); // fetch template
                assetBuild.AssetTicker = vm.assetModel.AssetTicker;
                assetBuild.AssetDescription = vm.assetModel.AssetDescription;
                assetBuild.AssetClassification = vm.assetModel.AssetClassification.code;
                vm.initializedAsset = assetBuild;

                // Duplicate check before caching new Asset-- via service.
                createAssetWizardSvc.checkAssetDuplicate(assetBuild, this);
            } else {
                var msgElement = document.getElementById("tickerErrMsg");
                msgElement.innerHTML = "Invalid ticker symbol entry, please check spelling.";
                vm.showValidationMsg = true;
                $interval(function () {
                    vm.showValidationMsg = false;
                }, 8000);
                return;
            }
        }
     

        vm.saveAssetBaseAttrPostDupCheck = function (isOkToContinue)
        {
            if (isOkToContinue) {
                createAssetWizardSvc.processAsset(vm.initializedAsset);
                $state.go("asset_create.profile", { "tickerSymbol": vm.assetModel.AssetTicker });
                createAssetWizardSvc.showActiveTab('steps clearfix', 'profile');
            } else {
                alert("Unable to proceed: an existing asset is already recorded by you for : " + vm.initializedAsset.AssetTicker.toUpperCase());
            }
            
            
        }
        

        vm.saveAssetBaseAttr = function () {

            if (!vm.isValidTicker()) {
                vm.showValidationMsg = true;
                $interval(function () {
                    vm.showValidationMsg = false;
                }, 8000);
                return;
            }

            incomeMgmtSvc.checkTickerSymbolValidity(vm.assetModel.AssetTicker, this);
            //createAssetWizardSvc.checkTickerSymbolValidity(vm.assetModel.AssetTicker, this);
        }


        vm.clearAssetBaseAttr = function () {
            vm.assetModel.AssetTicker = "";
            vm.assetModel.AssetDescription = "";
            vm.assetModel.AssetClassification = vm.assetClasses[0];
            $state.go("asset_create.profile", { "tickerSymbol": vm.assetModel.AssetTicker });
            createAssetWizardSvc.showActiveTab('steps clearfix', 'ticker');
        }




        function getAssetClassIndex(descriptionLookUp, classes) {
            var matchIndex = 0;
            for (var i = 0; i < classes.length; i++) {
                if (classes[i].description.trim() === descriptionLookUp) {
                    matchIndex = i;
                    //break;;
                }
            }
            return matchIndex;
        }





        // TODO: deferred
        vm.validateForm = function ($event) {
            $event.currentTarget.cssClass = 'has-error';
            

        }


       

    }
 

}());