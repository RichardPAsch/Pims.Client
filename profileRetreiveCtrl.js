﻿(function () {

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


        vm.setCtrlFocus = function(controlId) {
            var ctrl = $window.document.getElementById(controlId);
            ctrl.focus();
        }


        vm.getProfile = function () {

            vm.profileControllerUrl = appSettings.serverPath + "/Pims.Web.Api/api/Profile/" + vm.assetTickerSymbol.trim();
            $resource(vm.profileControllerUrl).get().$promise.then(
                function (profileResponse) {
                    if (profileResponse.tickerSymbol !== "" && profileResponse.tickerDescription !== "") {
                        vm.isReadOnlyInput = false;
                        vm.initializeUI(profileResponse);
                        vm.refreshDateTime = $filter("date")(new Date(), "MM/d/yyyy-hh:mm:ss a");
                        vm.showDateTime = true;
                        if (profileResponse.dividendRate > 0 && profileResponse.price > 0)
                            vm.createProfileBtnDisabled = true;
                        else {
                            if (profileResponse.price === 0) vm.isReadOnlyInputPrice = false;
                            if (profileResponse.dividendRate === 0) vm.isReadOnlyInputDivRate = false;
                            vm.createProfileBtnDisabled = false;
                            vm.isReadOnlyInput = false;
                        }
                    } else 
                        vm.fetchPersistedProfile();
                },
                function () {
                    if (!vm.fetchPersistedProfile()) {
                        vm.createProfileBtnDisabled = false;
                        vm.isReadOnlyInput = false;
                        //vm.setCtrlFocus("btnNewProfile"); // TODO: 1.29.18 - not working
                    }
                }
            );
        } // end getProfile()


        vm.createProfile = function() {

            var profileToSave = buildProfileVm();
            var exceptions = profileCreateSvc.validateProfileVm(profileToSave);
            if (exceptions === "") {
                vm.assetTickerSymbol = profileToSave.TickerSymbol;
                profileCreateSvc.saveProfile(profileToSave, vm);
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
                function (savedProfileResponse) {
                    vm.initializeUI(savedProfileResponse);
                    alert("Custom Profile retreived for edit(s).");
                    vm.isReadOnlyInputPrice = false;
                    vm.isReadOnlyInputDivRate = false;
                    vm.createProfileBtnDisabled = false;
                },
                function (err) {
                    alert("No saved Profile found for : \n" + vm.assetTickerSymbol.toUpperCase() + ".\nCheck ticker symbol validity, or create custom Profile.");
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