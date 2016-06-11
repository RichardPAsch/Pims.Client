(function() {
    "use strict";

    angular
        .module('incomeMgmt')                   // look up referencing module
        .controller("MainCtrl", MainCtrl);      // register ctrl 

    MainCtrl.$inject = ["currentInvestorSvc", "appLocalStorageSvc"];
 
    // ReSharper disable once InconsistentNaming
    function MainCtrl(currentInvestorSvc, appLocalStorageSvc) {

        var vm = this;
        vm.investorProfile = currentInvestorSvc.profile;
        vm.oneAtATime = true;
        vm.loggedInStatus = vm.investorProfile.IsLoggedIn;

        vm.loggedInStatus = function () {
            return vm.investorProfile.IsLoggedIn;
        }

        vm.showGreeting = function () {
            return vm.investorProfile.investorName;
        }

        vm.logoutInvestor = function() {
            if (this.loggedInStatus) {
                appLocalStorageSvc.deleteItem(currentInvestorSvc.profile.localStorageKey);
                currentInvestorSvc.setProfile(vm.investorProfile.investorName, "");
            }
             
        }

    };


}());