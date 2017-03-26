(function() {

    "use strict";

    angular
        .module("incomeMgmt.assetCreateIncome")
        .controller("assetCreateIncomeCtrl", assetCreateIncomeCtrl);

    assetCreateIncomeCtrl.$inject = ['createAssetWizardSvc', '$state', '$filter', '$interval', 'incomeMgmtSvc'];


    function assetCreateIncomeCtrl(createAssetWizardSvc, $state, $filter, $interval, incomeMgmtSvc) {

        var vm = this;
        var revenueCount = 0;

        vm.accountTypesCollection = createAssetWizardSvc.getCreatedPositionsAccountTypes();
        vm.isOneOfManyIncomes = false;
        vm.isLastIncome = true;
        vm.currentAsset = createAssetWizardSvc.processAsset();
        vm.notOkToSaveAsset = true;
        vm.isDuplicateIncome = false;
        vm.inClearMode = false;
        vm.hasIncomeData = false;
        vm.assetTickerSymbol = "";
   
        // TODO: Why do we NOT need 'LoggedInInvestor' for 'RevenueCreated', as opposed to 'PositionsCreated' ?  Retest asset POST via Fiddler.
        // Ans: because income is tied to a Position, which is already tied to an Asset mapped to an investor ??
        // TODO: commented '[Authorize]' in Web.API 'AssetController' for testing via Fiddler !


        if (vm.currentAsset.RevenueCreated != undefined) {
            // Always the most recently added revenue will be available for REVISIT viewing.
            revenueCount = vm.currentAsset.RevenueCreated.length - 1;
            var idx = createAssetWizardSvc.getAccountTypeIndex(vm.currentAsset.RevenueCreated[revenueCount].AcctType.accountTypeDesc, vm.accountTypesCollection);
            vm.selectedAccountType = vm.accountTypesCollection[idx];
            vm.incomeAmtReceived = vm.currentAsset.RevenueCreated[revenueCount].AmountRecvd;
            vm.incomeAmtProjected = vm.currentAsset.RevenueCreated[revenueCount].AmountProjected;
            vm.incomeDateReceived = vm.currentAsset.RevenueCreated[revenueCount].DateReceived;
            vm.incomeLastUpdate = vm.currentAsset.RevenueCreated[revenueCount].DateUpdated;
            vm.assetTickerSymbol = vm.currentAsset.AssetTicker.toUpperCase();
            if (vm.inClearMode) vm.inClearMode = false;
        } else {
            vm.assetTickerSymbol = vm.currentAsset.AssetTicker;
            vm.selectedAccountType = vm.accountTypesCollection == null ? "" : vm.accountTypesCollection[0];
            vm.incomeDateReceived = "";
            vm.incomeAmtReceived = 0;
            vm.incomeAmtProjected = 0;
            vm.incomeLastUpdate = $filter('date')(new Date(), 'MM/d/yyyy');
            // Account for new asset creation WIP.
            vm.notOkToSaveAsset = vm.assetTickerSymbol != undefined && vm.assetTickerSymbol != "" ? false : true;
            vm.showDateRecvdValidationMsg = false;
        }




        vm.isMinimumIncomeData = function () {
            if (vm.inClearMode) {
                vm.inClearMode = false;
                return false;
            }
                

            // Validate that required minimum data has been entered.
            if (vm.selectedAccountType.accountTypeDesc != "Select..." &&
                vm.incomeDateReceived != "" &&
                vm.incomeDateReceived != undefined &&
                incomeMgmtSvc.isValidCurrencyFormat(vm.incomeAmtReceived) &&
                vm.assetTickerSymbol != undefined) {
                    vm.notOkToSaveAsset = true;
                    return true;
            } else {
                    vm.notOkToSaveAsset = false;
                    return false;
            }
        }
        


        vm.isValidReceivedDate = function () {
            
            if (!createAssetWizardSvc.checkIncomeDateVsPurchaseDate($filter('date')(vm.incomeDateReceived, 'M/dd/yyyy'), vm.selectedAccountType)) {
                return false;
            }

            return true;
        }

       
        vm.saveAssetIncome = function () {

            // We DON'T need to check for revenue duplicates against the **Db**, as this is a new Asset entry!
            // Single service call allows for asynchronous processing; checks against backend db.
            if (!vm.isValidReceivedDate()) {
                vm.showDateRecvdValidationMsg = true;
                $interval(function () {
                    vm.showDateRecvdValidationMsg = false;
                }, 7000);
                return null;
            }

          
            // One or more income records may be added to a Position during the creation process.
            if (vm.currentAsset.RevenueCreated != undefined) {
                revenueCount = vm.currentAsset.RevenueCreated.length;
            } else {
                vm.currentAsset.RevenueCreated = [];
            }

            var incomeBuild = createAssetWizardSvc.getBaseRevenue(); // fetch new instance to avoid duplicates.

            incomeBuild.AcctType = vm.selectedAccountType.ReferencedAccount.AccountTypeDesc; 
            incomeBuild.AmountRecvd = createAssetWizardSvc.formatCurrency(vm.incomeAmtReceived, 2);
            incomeBuild.AmountProjected = vm.incomeAmtProjected;
            incomeBuild.DateReceived = $filter('date')(vm.incomeDateReceived, 'M/dd/yyyy');
            incomeBuild.DateUpdated = vm.incomeLastUpdate;
            incomeBuild.Url = createAssetWizardSvc.getBasePath
                                                    + "Asset/"
                                                    + vm.assetTickerSymbol.trim()
                                                    + "/Income/"
                                                    + incomeBuild.AcctType;

            vm.currentAsset.RevenueCreated.push(incomeBuild);

            if (revenueCount > 0) {
                if (createAssetWizardSvc.checkNewRevenueDuplicate(vm.currentAsset.RevenueCreated)) {
                    alert("Latest income entry not saved, duplicate income data found.");
                    vm.clearRevenue();
                    vm.currentAsset.RevenueCreated.pop();
                }
            }
            

            // Update service with new Revenue.
            createAssetWizardSvc.processAsset(vm.currentAsset);

            if (vm.isOneOfManyIncomes) {
                vm.clearRevenue();
            } else {
                this.saveAsset();
            }

            return null;
        }

        
        vm.clearRevenue = function () {
            vm.incomeDateReceived = "";
            vm.incomeAmtReceived = 0;
            vm.inClearMode = true;
        }


        vm.saveAsset = function () {
            vm.hasIncomeData = vm.currentAsset.RevenueCreated == undefined ? false : true;
            vm.assetTickerSymbol = vm.currentAsset.AssetTicker.trim().toUpperCase();
            createAssetWizardSvc.saveNewAsset(vm.currentAsset,vm);
        }


        vm.postAsyncSaveAsset = function (isSaved, exceptionMsg) {
            // TODO: Embellish with nice looking globally accessible messages, via 'Envato-Square'.
            if (isSaved) {
                if (vm.hasIncomeData) {
                    alert("Asset, Profile, Position(s), and Revenue successfully saved for : \n" + vm.assetTickerSymbol);
                } else {
                    alert("Asset, Profile, and Position(s) successfully saved for : \n" + vm.assetTickerSymbol);
                }
            } else {
                alert("Error: \nUnable to save Asset due to - " + exceptionMsg);
            }
            
        }


        vm.calendarOpen = function($event) {
            $event.preventDefault(); // prevent any default action triggered
            $event.stopPropagation();

            vm.opened = !vm.opened;
        }


    }

    



}());

