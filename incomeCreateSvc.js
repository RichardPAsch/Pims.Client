(function () {

    /* 
        Sharable component for all income-related CRUD functionality. 
    */

    "use strict";

    angular
        .module("incomeMgmt.core")
        .factory("incomeCreateSvc", incomeCreateSvc);

    incomeCreateSvc.$inject = ["$resource", 'appSettings', 'incomeMgmtSvc', '$filter'];


    function incomeCreateSvc($resource, appSettings, incomeMgmtSvc, $filter) {

        var vm = this;
        vm.baseUrl = appSettings.serverPath + "/Pims.Web.Api/api/";
        vm.accountTypes = [];
        vm.investorPositionData = [];
        vm.investorTickers = [];
        vm.investorMatchingAccounts = [];


        
        function saveRevenue(incomeToSave, ctrl) {

            var incomeUrl = appSettings.serverPath + "/Pims.Web.Api/api/Asset/" + incomeToSave.TickerSymbol + "/Income";

            if (!incomeMgmtSvc.isValidIncomeDateVsPositionAndTodayDate(incomeToSave.DateReceived, incomeToSave.PositionAddDate)) {
                alert("Invalid entry; income date may not precede date 'Position' was created, \nnor exceed todays' date.");
                return;
            }

            // Properties now unnecessary.
            delete incomeToSave.TickerSymbol;
            delete incomeToSave.PositionAddDate;


            $resource(incomeUrl).save(incomeToSave).$promise.then(function () {
                ctrl.postAsyncSave(true);
            }, function () {
                ctrl.postAsyncSave(false);
            });
        }

        
        function updateRevenue(editedIncome, ctrl) {

            var incomeUpdateUrl =  appSettings.serverPath + "/Pims.Web.Api/api/Income/" + editedIncome.incomeId;

            delete editedIncome.incomeId;

            var resourceObj = $resource(incomeUpdateUrl,
                                    null, // NO default parameter values necessary.
                                    {
                                        'update': { method: 'PATCH' }
                                    });
            
            resourceObj.update(null, editedIncome).$promise.then(function (response) {
                ctrl.postAsyncIncomeUpdate(response);
            }, function (ex) {
                ctrl.postAsyncIncomeUpdate(ex.data.message);
            });

        }


        function deleteRevenue(revenueId, ctrl) {

            var deleteUpdateUrl = appSettings.serverPath + "/Pims.Web.Api/api/Income/" + revenueId;
            var resourceObj = $resource(deleteUpdateUrl);

            resourceObj.delete().$promise.then(function (response) {
                ctrl.postAsyncIncomeDelete(response);
            }, function (ex) {
                ctrl.postAsyncIncomeDelete(ex.data.message);
            });

        }
        

        function getAccountTypeId(accountTypes, descSearch) {

            for (var i = 0; i < accountTypes.length - 1; i++) {
                if (accountTypes[i].accountTypeDesc == descSearch) {
                    return accountTypes[i].keyId;
                }
            }
            return 0;
        }


        function validateRevenueDateAgainstPositionDate(positionDate, revenueDate) {
            var currentDate = new Date();
            currentDate = $filter('date')(currentDate, 'M/dd/yyyy');
            positionDate = $filter('date')(positionDate, 'M/dd/yyyy');

            if (revenueDate < positionDate || revenueDate > currentDate) {
                return false;
            } else {
                return true;
            }
        }


        

        // API
        return {
            saveRevenue: saveRevenue,
            getAccountTypeId: getAccountTypeId,
            updateRevenue: updateRevenue,
            deleteRevenue: deleteRevenue,
            validateRevenueDateAgainstPositionDate: validateRevenueDateAgainstPositionDate
        }

    }



}());