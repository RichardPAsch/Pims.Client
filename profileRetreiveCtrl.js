(function () {

    "use strict";

    angular
        .module("incomeMgmt.profileRetreive")
        .controller("profileRetreiveCtrl", profileRetreiveCtrl);

    profileRetreiveCtrl.$inject = ["createAssetWizardSvc", "$state", "$filter", "$resource", "appSettings", "profileCreateSvc", "$window"];


    function profileRetreiveCtrl(createAssetWizardSvc, $state, $filter, $resource, appSettings, profileCreateSvc, $window) {

        var vm = this;
        vm.assetTickerSymbol = "";
        vm.assetDivRate = 0;
        vm.assetDivYield = 0;
        vm.assetDivFreq = "";// "M"
        vm.assetPeRatio = 0;
        vm.assetEPS = 0;
        vm.assetUnitPrice = 0;
        vm.assetDivPayDate = "1/1/1900";
        vm.assetExDivDate = "1/1/1900";

        vm.createProfileBtnDisabled = true;
        vm.isReadOnlyInput = true;
        vm.isReadOnlyInputPrice = true;
        vm.isReadOnlyInputDivRate = true;
        vm.profileControllerUrl = "";
        vm.createdBy = "";
        vm.profileId = "";


        vm.setCtrlFocus = function(controlId) {
            var ctrl = $window.document.getElementById(controlId);
            ctrl.focus();
        }


        vm.getProfile = function () {
            vm.profileControllerUrl = appSettings.serverPath + "/Pims.Web.Api/api/Profile/" + vm.assetTickerSymbol.trim();
            $resource(vm.profileControllerUrl).get().$promise.then(
                function (profileResponse) {
                    if (profileResponse.tickerSymbol !== "" && profileResponse.tickerDescription !== "" && profileResponse.tickerSymbol !== null ) {
                        vm.isReadOnlyInput = false;
                        vm.createdBy = profileResponse.createdBy;
                        vm.profileId = profileResponse.profileId;
                        vm.initializeUI(profileResponse);
                        vm.refreshDateTime = $filter("date")(new Date(), "MM/d/yyyy-hh:mm:ss a");
                        vm.showDateTime = true;
                        if (profileResponse.createdBy != null) {
                            alert("Custom Profile retreived; available for editing");
                            vm.createProfileBtnDisabled = false;
                        }
                        else {
                            if (profileResponse.price === 0) vm.isReadOnlyInputPrice = false;
                            if (profileResponse.dividendRate === 0) vm.isReadOnlyInputDivRate = false;
                            vm.createProfileBtnDisabled = true;
                            vm.isReadOnlyInput = true;
                        }
                    } else 
                        vm.fetchPersistedProfile();
                },
                function (responseMsg) {
                    //var msg = responseMsg.data.message; // deferred, if needed later.
                    // Check locally, if unable to find ticker via web.
                    vm.fetchPersistedProfile();
                    //    //vm.setCtrlFocus("btnNewProfile"); // TODO: 1.29.18 - not working
                }
            );
        } // end getProfile()


        vm.createProfile = function() {
            
            var profileToSave = buildProfileVm();
            var exceptions = profileCreateSvc.validateProfileVm(profileToSave);
            if (exceptions === "") {
                vm.assetTickerSymbol = profileToSave.TickerSymbol;
                if (profileToSave.CreatedBy !== null && profileToSave.CreatedBy !== "") {
                    profileCreateSvc.updateProfile(profileToSave, vm);
                } else {
                    profileCreateSvc.saveProfile(profileToSave, vm);
                }
            }
            else
                alert("Unable to save Profile; invalid data found for fields : \n" + exceptions);
        }


        vm.initializeUI = function(profileResponse) {

            vm.assetDivRate = profileResponse.dividendRate;
            vm.assetDivYield = profileResponse.dividendYield;
            vm.assetDescription = profileResponse.tickerDescription;
            if(createAssetWizardSvc.isValidDividendFrequency(profileResponse.dividendFreq))
                vm.assetDivFreq = profileResponse.dividendFreq;
            else 
                vm.assetDivFreq = "";

            vm.assetPeRatio = profileResponse.pE_Ratio;
            vm.assetEPS = profileResponse.earningsPerShare;
            vm.assetUnitPrice = profileResponse.price;
            vm.assetDivPayDate = profileResponse.DividendPayDate === null ? "N/A" : $filter("date")(profileResponse.dividendPayDate, "M/dd/yyyy");
            vm.assetExDivDate = profileResponse.exDividendDate === null ? "N/A" : $filter("date")(profileResponse.exDividendDate, "M/dd/yyyy");
        }


        vm.postAsyncSave = function(isOkResponse, errorMsg) {

            if (isOkResponse)
                alert("Profile successfully created/updated for: " + vm.assetTickerSymbol.toUpperCase());
            else
                alert("Error creating Profile for: " + vm.assetTickerSymbol.toUpperCase() + ".\n" + errorMsg.data.message);
        }


        vm.fetchPersistedProfile = function()
        {
            var cachedTickerSymbol = vm.assetTickerSymbol.trim().toUpperCase();
            vm.profileControllerUrl = appSettings.serverPath + "/Pims.Web.Api/api/Profile/persisted/" + vm.assetTickerSymbol.trim().toUpperCase();
            $resource(vm.profileControllerUrl).get().$promise.then(
                function (savedProfileResponse) {
                    vm.initializeUI(savedProfileResponse);
                    alert("Custom Profile retreived for edit(s).");
                    vm.isReadOnlyInputPrice = false;
                    vm.isReadOnlyInputDivRate = false;
                    vm.createProfileBtnDisabled = false;
                },
                function () {
                    alert("No Profile found, either saved or via web, for : \n" + vm.assetTickerSymbol.toUpperCase() 
                        + ".\nPlease check ticker symbol validity, or create a custom Profile.");
                    vm.assetTickerSymbol = cachedTickerSymbol;
                    vm.isReadOnlyInputPrice = false;
                    vm.isReadOnlyInputDivRate = false;
                    vm.createProfileBtnDisabled = false;
                    vm.isReadOnlyInput = false;
                    return null;
                }
            );
        }

        

        function buildProfileVm() {
            
            // Fetched Profile schema maps to WebApi 'ProfileVm'.
            var baseProfile = createAssetWizardSvc.getBaseProfile();
            var currentDate = new Date();
            //var test = $filter("date")(currentDate, "M/d/yyyy hh:mm a");

            // + Minimum required data.
            baseProfile.TickerSymbol = vm.assetTickerSymbol;
            baseProfile.TickerDescription = vm.assetDescription;
            baseProfile.CreatedBy = vm.createdBy;
            baseProfile.Price = vm.assetUnitPrice;
            baseProfile.LastUpdate = $filter("date")(currentDate, "M/d/yyyy hh:mm a");
            baseProfile.Url = createAssetWizardSvc.getBasePath + "Profile/" + vm.assetTickerSymbol.trim();
            // -

            baseProfile.ProfileId = vm.profileId;
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