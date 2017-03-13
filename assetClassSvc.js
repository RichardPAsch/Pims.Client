(function () {

    /* 
        Sharable component for all income-related CRUD functionality. 
    */

    "use strict";

    angular
        .module("incomeMgmt.core")
        .factory("assetClassSvc", assetClassSvc);

    assetClassSvc.$inject = ["$resource", 'appSettings'];


    function assetClassSvc($resource, appSettings) {

        var vm = this;
        vm.accountTypes = [];
        vm.investorPositionData = [];
        vm.investorTickers = [];
        vm.investorMatchingAccounts = [];



        function saveAssetClass(assetClassToSave, ctrl) {

            var incomeUrl = appSettings.serverPath + "/Pims.Web.Api/api/Asset/AssetClass";

            //if (!incomeMgmtSvc.isValidIncomeDateVsPositionAndTodayDate(incomeToSave.DateReceived, incomeToSave.PositionAddDate)) {
            //    alert("Invalid entry; income date may not precede date 'Position' was created, \nnor exceed todays' date.");
            //    return;
            //}

            //// Properties now unnecessary.
            //delete incomeToSave.TickerSymbol;
            //delete incomeToSave.PositionAddDate;


            //$resource(incomeUrl).save(incomeToSave).$promise.then(function () {
            //    ctrl.postAsyncSave(true);
            //}, function () {
            //    ctrl.postAsyncSave(false);
            //});
        }


        function getAssetClasses() {
            //TODO: to be implemented - 3.14.2017

        }


        //function updateRevenue(editedIncome, ctrl) {

        //    var incomeUpdateUrl = appSettings.serverPath + "/Pims.Web.Api/api/Income/" + editedIncome.incomeId;

        //    delete editedIncome.incomeId;

        //    var resourceObj = $resource(incomeUpdateUrl,
        //                            null, // NO default parameter values necessary.
        //                            {
        //                                'update': { method: 'PATCH' }
        //                            });

        //    resourceObj.update(null, editedIncome).$promise.then(function (response) {
        //        ctrl.postAsyncIncomeUpdate(response);
        //    }, function (ex) {
        //        ctrl.postAsyncIncomeUpdate(ex.data.message);
        //    });

        //}


        //function deleteRevenue(revenueId, ctrl) {

        //    var deleteUpdateUrl = appSettings.serverPath + "/Pims.Web.Api/api/Income/" + revenueId;
        //    var resourceObj = $resource(deleteUpdateUrl);

        //    resourceObj.delete().$promise.then(function (response) {
        //        ctrl.postAsyncIncomeDelete(response);
        //    }, function (ex) {
        //        ctrl.postAsyncIncomeDelete(ex.data.message);
        //    });

        //}


       


        //function validateRevenueDateAgainstPositionDate(positionDate, revenueDate) {
        //    var currentDate = new Date();
        //    currentDate = $filter('date')(currentDate, 'M/dd/yyyy');
        //    positionDate = $filter('date')(positionDate, 'M/dd/yyyy');

        //    if (revenueDate < positionDate || revenueDate > currentDate) {
        //        return false;
        //    } else {
        //        return true;
        //    }
        //}




        // API
        return {
            saveAssetClass: saveAssetClass,
            getAssetClasses: getAssetClasses
           
        }

    }



}());