(function () {

    "use strict";

    angular
        .module("incomeMgmt.assetClass")
        .controller("assetClassCtrl", assetClassCtrl);

    assetClassCtrl.$inject = ['assetClassSvc'];


    function assetClassCtrl(assetClassSvc) {

        var vm = this;
        assetClassSvc.getAssetClassifications(vm);
        vm.assetClasses = [];
        vm.newAssetClass = "";
        vm.selectedAssetClass = "";

       
        vm.postAsyncGetAssetClasses = function(data) {
            vm.assetClasses = data;
            vm.selectedAssetClass = vm.assetClasses[0];
        }


        //vm.updateAccounts = function () {
        //    vm.positionsByAccount = positionCreateSvc.getMatchingAccounts(vm.selectedTicker, positionData);
        //    vm.selectedAccountType = vm.positionsByAccount[0];
        //}


       
      
        vm.clearRevenue = function () {
            location.reload(true);
        }


       



      


        //vm.postAsyncSave = function (isSaved) {
        //    if (!vm.isDuplicateIncome) {
        //        if (isSaved) {
        //            vm.incomeIsSaved = isSaved;
        //            alert("Successfully saved  $" + vm.incomeAmtReceived + "\nfor " + vm.selectedTicker + "\n on account " + vm.selectedAccountType);
        //        } else {
        //            if (!vm.incomeIsSaved)
        //                alert("Error saving income.");
        //        }
        //    }
        //}




    }


}());