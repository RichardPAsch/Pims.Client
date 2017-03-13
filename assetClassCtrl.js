(function () {

    "use strict";

    angular
        .module("incomeMgmt.assetClass")
        .controller("assetClassCtrl", assetClassCtrl);

    assetClassCtrl.$inject = [];

    function assetClassCtrl() {

        var vm = this;
        vm.assetClasses = [];
        vm.selectedAssetClass = "";
        vm.newAssetClass = "";

        //vm.positionsByTicker = positionCreateSvc.getUniqueTickers(positionData);
        //vm.selectedTicker = vm.positionsByTicker[0];




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