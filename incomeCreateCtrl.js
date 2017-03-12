(function () {

    "use strict";

    angular
        .module("incomeMgmt.incomeCreate")
        .controller("incomeCreateCtrl", incomeCreateCtrl);

    incomeCreateCtrl.$inject = ['$state', '$filter', 'incomeMgmtSvc', 'incomeCreateSvc', 'positionData', 'createAssetWizardSvc', 'positionCreateSvc'];

    function incomeCreateCtrl($state, $filter, incomeMgmtSvc, incomeCreateSvc, positionData, createAssetWizardSvc, positionCreateSvc) {

        var vm = this;

        vm.opened = false;
        vm.currentAssetId = "";
        vm.incomeIsSaved = false;
        vm.isDuplicateIncome = false;
        vm.assetTickerSymbol = "";
        vm.incomeDateReceived = "";
        vm.incomeAmtReceived = 0;
        vm.showDateRecvdValidationMsg = false;

        vm.positionsByTicker = positionCreateSvc.getUniqueTickers(positionData);
        vm.selectedTicker = vm.positionsByTicker[0];
        vm.positionsByAccount = positionCreateSvc.getMatchingAccounts(vm.selectedTicker, positionData);
        vm.selectedAccountType = vm.positionsByAccount[0];
        


        vm.updateAccounts = function () {
            vm.positionsByAccount = positionCreateSvc.getMatchingAccounts(vm.selectedTicker, positionData);
            vm.selectedAccountType = vm.positionsByAccount[0];
        }


        vm.isMinimumIncomeData = function () {
            // Validate that required minimum data has been entered.
            if (vm.selectedAccountType != undefined &&
                vm.incomeDateReceived != "" &&
                vm.incomeDateReceived != undefined &&
                incomeMgmtSvc.isValidCurrencyFormat(vm.incomeAmtReceived))
            {
                return true;
            } else {
                return false;
            }
        }
        

        vm.saveIncome = function () {
            var datePositionCreated = positionCreateSvc.getPositionAddDate(positionData, vm.selectedTicker, vm.selectedAccountType);
            var okToAddRevenue = incomeCreateSvc.validateRevenueDateAgainstPositionDate(datePositionCreated, $filter('date')(vm.incomeDateReceived, 'M/dd/yyyy'));

            if (!okToAddRevenue) {
                alert("Unable to save new income; \nentered date may not precede date Position was added, nor \nexceed todays' date.");
                return null;
            }

            // Async call resolves to postCheckRevenueDuplicate().
            incomeMgmtSvc.checkRevenueDuplicate(vm.selectedTicker,
                                                vm.selectedAccountType,
                                                $filter('date')(vm.incomeDateReceived, 'M/dd/yyyy'),
                                                createAssetWizardSvc.formatCurrency(vm.incomeAmtReceived, 2),
                                                this);

        }
        

        vm.clearRevenue = function () {
           location.reload(true);
        }


        vm.calendarOpen = function ($event) {
            $event.preventDefault(); // prevent any default action triggered
            $event.stopPropagation();

            vm.opened = !vm.opened;
        }



        /* Async WebApi service calls */
        vm.postCheckRevenueDuplicate = function (duplicateFound) {

            if (duplicateFound) {
                vm.isDuplicateIncome = duplicateFound;
                alert("Unable to save revenue; duplicate entry found for Asset: \n" +
                       vm.selectedTicker.trim().toUpperCase() +
                       "\n using account: " + vm.selectedAccountType +
                      "\n on: " + $filter('date')(vm.incomeDateReceived, 'M/dd/yyyy'));
                return null;
            }


            // TODO: Fx name above should reflect save. Duplicate code - move to service.
            var incomeBuild = createAssetWizardSvc.getBaseRevenue(); // fetch new instance to avoid duplicates.
            var today = new Date();
            
            incomeBuild.AcctType = vm.selectedAccountType;
            incomeBuild.AmountRecvd = createAssetWizardSvc.formatCurrency(vm.incomeAmtReceived, 2);
            incomeBuild.DateReceived = $filter('date')(vm.incomeDateReceived, 'M/dd/yyyy');
            incomeBuild.AssetId = positionCreateSvc.getAssetId(positionData, vm.selectedTicker);
            incomeBuild.AmountProjected = 0;
            incomeBuild.DateUpdated = incomeMgmtSvc.formatDate(today);
            incomeBuild.Url = createAssetWizardSvc.getBasePath
                                                    + "Asset/"
                                                    + vm.selectedTicker.trim().toUpperCase()
                                                    + "/Income/"
                                                    + incomeBuild.AcctType.toUpperCase();

            // Extended properties needed for validation checking in saveRevenue().
            incomeBuild.TickerSymbol = vm.selectedTicker.trim().toUpperCase();
            
            var datePositionAdded = positionCreateSvc.getPositionAddDate(positionData, incomeBuild.TickerSymbol, incomeBuild.AcctType);
            var formattedPosDate = new Date(datePositionAdded.toString());

            incomeBuild.PositionAddDate = incomeMgmtSvc.formatDate(formattedPosDate);

            incomeCreateSvc.saveRevenue(incomeBuild, vm);
            return null;
        }


        vm.postAsyncSave = function (isSaved) {
            if (!vm.isDuplicateIncome) {
                if (isSaved) {
                    vm.incomeIsSaved = isSaved;
                    alert("Successfully saved  $" + vm.incomeAmtReceived + "\nfor " + vm.selectedTicker + "\n on account " + vm.selectedAccountType);
                } else {
                    if (!vm.incomeIsSaved)
                        alert("Error saving income.");
                }
            }
        }




        /* ---- SQL for identifying assets with (I)nactive positions ---
            SELECT pf.TickerSymbol, at.AccountType
            FROM Profile AS pf
                INNER JOIN Asset AS A ON pf.ProfileId = a.ProfileId
                INNER JOIN Position AS P ON p.PositionAssetId = a.AssetId
                INNER JOIN AccountType AS AT on at.accountTypeId = p.positionAccountTypeId
            WHERE p.Status = 'I'
        */

    }


}());