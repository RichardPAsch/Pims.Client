(function () {

    "use strict";

    angular
        .module("incomeMgmt.profileRetreive")
        .controller("profileRetreiveCtrl", profileRetreiveCtrl);

    profileRetreiveCtrl.$inject = ['createAssetWizardSvc', '$state', '$filter', '$resource', 'appSettings', 'profileCreateSvc'];


    function profileRetreiveCtrl(createAssetWizardSvc, $state, $filter, $resource, appSettings, profileCreateSvc) {

        var vm = this;
        vm.assetTickerSymbol = "";
        vm.assetDivRate = 0;
        vm.assetDivYield = 0;
        vm.assetDivFreq = "M"
        vm.assetPeRatio = 0;
        vm.assetEPS = 0;
        vm.assetUnitPrice = 0;
        vm.assetDivPayDate = "1/1/1900";
        vm.assetExDivDate = "1/1/1900";

        vm.createProfileBtnDisabled = true;
        vm.isReadOnlyInput = true;
        vm.profileControllerUrl = "";



        vm.getProfile = function () {

            vm.profileControllerUrl = appSettings.serverPath + "/Pims.Web.Api/api/Profile/" + vm.assetTickerSymbol.trim();

            $resource(vm.profileControllerUrl).get().$promise.then(
                function (profileResponse) {
                    vm.createProfileBtnDisabled = true;
                    vm.isReadOnlyInput = true;
                    vm.initializeUI(profileResponse);
                    vm.refreshDateTime = $filter("date")(new Date(), "MM/d/yyyy-hh:mm:ss a");
                    vm.showDateTime = true;
                },
                function () {
                    if (!vm.fetchPersistedProfile()) {
                        vm.createProfileBtnDisabled = false;
                       
                        vm.isReadOnlyInput = false;
                    }
                }
            );
        } // end fx


        vm.createProfile = function() {

            var profileToSave = buildProfileVm();
            var exceptions = profileCreateSvc.validateProfileVm(profileToSave);
            if (exceptions === "") {
                vm.assetTickerSymbol = profileToSave.TickerSymbol;
                alert("Profile validations Ok, ready to save " + vm.assetTickerSymbol.toUpperCase());
                // TODO: now persist Profile
                profileCreateSvc.saveProfile(profileToSave, vm);
            }
            else
                alert("Unable to save Profile; invalid data found for : \n" + exceptions);
        }


        vm.initializeUI = function(profileResponse) {

            vm.assetDivRate = profileResponse.dividendRate;
            vm.assetDivYield = profileResponse.dividendYield;
            vm.assetDescription = profileResponse.tickerDescription;
            if(createAssetWizardSvc.isValidDividendFrequency(profileResponse.dividendFreq))
                vm.assetDivFreq = profileResponse.dividendFreq;
            else 
                vm.assetDivFreq = "TBA";
            
            vm.assetPeRatio = profileResponse.pE_Ratio;
            vm.assetEPS = profileResponse.earningsPerShare;
            vm.assetUnitPrice = profileResponse.price;
            vm.assetDivPayDate = profileResponse.DividendPayDate === null ? "N/A" : $filter("date")(profileResponse.dividendPayDate, "M/dd/yyyy");
            vm.assetExDivDate = profileResponse.exDividendDate === null ? "N/A" : $filter("date")(profileResponse.exDividendDate, "M/dd/yyyy");
        }


        vm.postAsyncSave = function(isOkResponse) {

            if (isOkResponse)
                alert("Profile successfully saved for: " + vm.assetTickerSymbol.toUpperCase());
            else
                alert("Error saving Profile for: " + vm.assetTickerSymbol.toUpperCase());
        }


        vm.fetchPersistedProfile = function()
        {
            vm.profileControllerUrl = appSettings.serverPath + "/Pims.Web.Api/api/Profile/persisted/" + vm.assetTickerSymbol.trim().toUpperCase();
            $resource(vm.profileControllerUrl).get().$promise.then(
                function (profileResponse) {
                    vm.initializeUI(profileResponse);
                    alert("Custom Profile retreived - available for edit(s).");
                },
                function (err) {
                    alert("No Profile found for : \n" + vm.assetTickerSymbol.toUpperCase() + ".\nCheck ticker symbol validity, or create customized Profile.");
                    return false;
                }
            );

        }



        function buildProfileVm() {
            
            // Fetched Profile schema maps to WebApi 'ProfileVm'.
            var baseProfile = createAssetWizardSvc.getBaseProfile();
            var currentDate = new Date();
            var test = $filter("date")(currentDate, "M/d/yyyy hh:mm a");

            // + Minimum required data.
            baseProfile.TickerSymbol = vm.assetTickerSymbol;
            baseProfile.TickerDescription = vm.assetDescription;
            baseProfile.Price = vm.assetUnitPrice;
            baseProfile.LastUpdate = $filter("date")(currentDate, "M/d/yyyy hh:mm a");
            baseProfile.Url = createAssetWizardSvc.getBasePath + "Profile/" + vm.assetTickerSymbol.trim();
            // -

            baseProfile.DividendRate = vm.assetDivRate;
            baseProfile.DividendFreq = vm.assetDivFreq; 
            baseProfile.DividendYield = vm.assetDivYield;
            baseProfile.PE_Ratio = vm.assetPeRatio;
            baseProfile.EarningsPerShare = vm.assetEPS;
            baseProfile.ExDividendDate = vm.assetExDivDate;
            baseProfile.DividendPayDate = vm.assetDivPayDate;
            
            return baseProfile;

        }

        
        
        
    }


}());