(function () {

    "use strict";

    angular
        .module("incomeMgmt.incomeEditDelete")
        .controller("incomeEditDeleteCtrl", incomeEditDeleteCtrl);

    incomeEditDeleteCtrl.$inject = ['$state', 'incomeMgmtSvc', 'createAssetWizardSvc', 'allPositions', 'incomeCreateSvc', '$filter', 'positionCreateSvc', '$window'];

    function incomeEditDeleteCtrl($state, incomeMgmtSvc, createAssetWizardSvc, allPositions, incomeCreateSvc, $filter, positionCreateSvc, $window) {

        var vm = this;
        var preEditState = true;
        vm.ticker = $state.params.revenueSelectionObj.TickerSymbol;
        vm.preEditAccountType = $state.params.revenueSelectionObj.AcctType;
        vm.incomeDateReceived = $state.params.revenueSelectionObj.RevenueDate;
        vm.preEditDateReceived = vm.incomeDateReceived;
        vm.incomeAmtRecorded = $state.params.revenueSelectionObj.Revenue.toFixed(2);
        vm.preEditAmtRecorded = vm.incomeAmtRecorded;

        vm.matchingAccountTypes = positionCreateSvc.getMatchingAccounts(vm.ticker, allPositions);
        vm.selectedAccountType = vm.matchingAccountTypes[positionCreateSvc.getMatchingAccountTypeIndex(vm.matchingAccountTypes, vm.preEditAccountType)];
        vm.matchingPositionId = $state.params.revenueSelectionObj.RevenuePositionId;
        vm.matchingIncomeId = $state.params.revenueSelectionObj.RevenueId;
        vm.allAccountTypes = [];
        


        // Initialize collection for use in possible account type edit.
        incomeMgmtSvc.getAllAccountTypes(vm);


        vm.enableUpdateBtn = function () {
            if (vm.preEditDateReceived != vm.incomeDateReceived || vm.preEditAmtRecorded != vm.incomeAmtRecorded || vm.preEditAccountType != vm.selectedAccountType) {
                preEditState = false;
                vm.isMinimumIncomeData();
            }
                
        }

        vm.isMinimumIncomeData = function () {
            if (preEditState)
                return false;

            if (vm.selectedAccountType != undefined &&
                vm.incomeDateReceived != "" &&
                vm.incomeDateReceived != undefined &&
                incomeMgmtSvc.isValidCurrencyFormat(vm.incomeAmtRecorded)) {
                return true;
            } else {
                return false;
            }
        }


        vm.updateIncome = function () {
            var datePositionCreated = positionCreateSvc.getPositionAddDate(allPositions, vm.ticker, vm.selectedAccountType);
            var okToUpdateRevenue = incomeCreateSvc.validateRevenueDateAgainstPositionDate(datePositionCreated, $filter('date')(vm.incomeDateReceived, 'M/dd/yyyy'));

            if (!okToUpdateRevenue) {
                alert("Unable to update existing income; \nentered date may not precede date Position was added, nor \nexceed todays' date.");
                return null;
            }

            // Async callback: postCheckRevenueDuplicate().
            incomeMgmtSvc.checkRevenueDuplicate(vm.ticker,
                                                vm.selectedAccountType,
                                                $filter('date')(vm.incomeDateReceived, 'M/dd/yyyy'),
                                                createAssetWizardSvc.formatCurrency(vm.incomeAmtRecorded, 2),
                                                this);
        }



        /* Async postback service calls */
        vm.postAsyncAcctTypes = function(response) {
            vm.allAccountTypes = response;
        }


        vm.postCheckRevenueDuplicate = function (duplicateFound) {

            if (duplicateFound) {
                vm.isDuplicateIncome = duplicateFound;
                alert("Unable to update revenue; duplicate entry found for Asset: \n" +
                       vm.selectedTicker.toUpperCase() +
                       "\n using account: " + vm.selectedAccountType +
                      "\n on: " + $filter('date')(vm.incomeDateReceived, 'M/dd/yyyy'));
                return null;
            }

            // TODO: Deferred NHibernate fix/solution.
            // Update modified account type manually, if applicable. Workaround due to inability to cascade update
            // at this time via Position-AccountType association in IncomeMap.cs in Pims.Infrastructure.
            if (vm.preEditAccountType != vm.selectedAccountType) {
                var acctTypeId = incomeCreateSvc.getAccountTypeId(vm.allAccountTypes, vm.selectedAccountType);
                var modifiedInfo = {
                    KeyId: acctTypeId,
                    AccountTypeDesc: vm.selectedAccountType,
                    tempTicker: vm.ticker,
                    tempAcctType: vm.selectedAccountType,
                    URL: ""  
                }

                positionCreateSvc.updateRevenueAcctType(vm.matchingPositionId, modifiedInfo, vm);
            }


            if (vm.preEditAmtRecorded != vm.incomeAmtRecorded || vm.preEditDateReceived != vm.incomeDateReceived) {

                var today = new Date();
                var modifiedInfo2 = {
                    amountRecvd: vm.incomeAmtRecorded,
                    dateReceived: $filter('date')(vm.incomeDateReceived, 'M/dd/yyyy'),
                    dateUpdated: incomeMgmtSvc.formatDate(today),
                    acctType: vm.selectedAccountType,
                    incomeId: vm.matchingIncomeId
                };

                incomeCreateSvc.updateRevenue(modifiedInfo2, vm);
            }

            return null;
        }


        vm.postAsyncAcctTypeUpdate = function(resultStatus) {
            if (resultStatus[0] == "1")
                alert("Account type update successful.");
            else {
                alert("Error updating Account type.");
            }
        }


        vm.postAsyncIncomeUpdate = function (results) {
            if (results.$resolved)
                alert("Income record update successful.");
            else {
                alert("Error updating Income record.");
            }
        }


        vm.postAsyncIncomeDelete = function (results) {
            if (results.$resolved) {
                alert("Income record successfully deleted.");
                $window.location.href = $window.location.origin + "/App/Layout/Main.html#/";
            }
            else {
                alert("Error deleting Income record.");
            }
        }



        vm.deleteRevenue = function () {

            var okToDelete = confirm("The following income data will be permanently deleted: \n\tIncome: " 
                + vm.incomeAmtRecorded + "\n\tAccount: " 
                + vm.selectedAccountType + "\n\tDate Received: "
                + $filter('date')(vm.incomeDateReceived, 'MMM d, yyyy') + "\n\nOk to proceed?");

            if(okToDelete)
                incomeCreateSvc.deleteRevenue(vm.matchingIncomeId, vm);
            else {
                return false;
            }

            return null;
        }

        
        // TODO: duplicate with incomeCreateCtrl.js.
        vm.calendarOpen = function ($event) {
            $event.preventDefault(); // prevent any default action triggered
            $event.stopPropagation();

            vm.opened = !vm.opened;
        }

        
    }


}());