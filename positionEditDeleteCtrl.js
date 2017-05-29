(function () {

    "use strict";

    angular
        .module("incomeMgmt.positionEditDelete")
        .controller("positionEditDeleteCtrl", positionEditDeleteCtrl);

    positionEditDeleteCtrl.$inject = ['$state', '$filter', 'positionCreateSvc', 'allPositions', 'incomeMgmtSvc', 'incomeCreateSvc',
                                      'uiGridConstants', '$modal', '$location', '$interval', 'transactionsModalSvc'];


    function positionEditDeleteCtrl($state, $filter, positionCreateSvc, allPositions, incomeMgmtSvc, incomeCreateSvc, uiGridConstants, $modal, $location, $interval, transactionsModalSvc) {

        var vm = this;
        var dataReceptacle = incomeMgmtSvc.createCostBasisAndUnitCostData();
        var today = new Date();
        vm.ticker = $state.params.positionSelectionObj.TickerSymbol;
        vm.trxDataEdits = transactionsModalSvc.createTransactionVm();
        vm.trxsSubTotalsForNewPosition = [];


        

        // Encapsulate individual preEdit & postEdit position changes--where applicable--in one or both temp objects.
        // vm.positionFrom/positionTo objects -> mapped to positionInfo (vm) object for WebApi calls.
        // ** 'positionTo' initialized only in new, or rollover to existing Position scenarios. **
        vm.positionFrom = {
            mktPrice: positionCreateSvc.getCurrentMarketUnitPrice(vm, vm.ticker.toUpperCase().trim()),
            originalMktPrice: 0,    // Cached Profile price before adjustment
            dBAction: "",
            accountType: $state.params.positionSelectionObj.AcctType,
            originalQty: $state.params.positionSelectionObj.Qty,
            adjustedQty: 0,         // units to increment/decrement
            currentQty: 0,          // aka qty balance, post-edit
            unitCost: 0,
            lastUpdate: "",
            positionId: "",
            status: "A",            // (A)ctive / (I)nactive
            positionDate: "",
            dateUpdated: "",
            purchaseDate: "",
            accountTypeId: "",
            originalFees: 0,        // currently recorded
            adjustedTotalFees: 0,    // original + adjustments
            costBasis: 0,
            gainLoss: 0,
            valuation: 0
        };
        vm.positionTo = {
            mktPrice: 0,
            originalMktPrice: 0,
            dBAction: "",
            accountType: $state.params.positionSelectionObj.AcctType,
            originalQty: 0,
            adjustedQty: 0,  
            currentQty: 0,          // originalQty + adjustedQty
            unitCost: 0,
            lastUpdate: "",
            positionId: "",
            status: "A",
            positionDate: "",
            dateUpdated: "",
            purchaseDate: "",
            accountTypeId: "",
            originalFees: 0,
            adjustedTotalFees: 0,
            costBasis: 0,
            gainLoss: 0,
            valuation: 0
        };


        // UI data-binding & flags.
        vm.matchingAccountChanged = false;
        vm.newAccountAdded = false;
        vm.showNewAccountInput = false;
        vm.matchingAccountsDisabled = false;
        vm.newAccountDisabled = false;
        vm.mktPriceDisabled = false;
        vm.adjDateDisabled = false;
        vm.updateBtnDisabled = true;
        vm.accountPlaceHolder = "Enter a new Position account for " + vm.ticker.toUpperCase().trim() + "...";
        vm.originalPositionDbAction = "";
        vm.newPositionDbAction = "";
        vm.adjustedOption = ""; // edit
        vm.selectedAccountType = $state.params.positionSelectionObj.AcctType;
        vm.currentQty = $state.params.positionSelectionObj.Qty;
        vm.adjustedQty = 0; // changed from 1, check this doesn't cause bugs
        vm.adjustedMktPrice = 0;
        vm.positionDate = $state.params.positionSelectionObj.PositionAddDate;
        vm.positionAdjDate = $filter('date')(vm.positionDate, 'M/dd/yyyy');
        vm.lastUpdate = incomeMgmtSvc.formatDate($state.params.positionSelectionObj.LastUpdate);
        vm.allValidAccountTypes = [];
        vm.matchingAccountTypes = positionCreateSvc.getMatchingAccounts(vm.ticker, allPositions);
        vm.selectedAccountType = vm.matchingAccountTypes[positionCreateSvc.getMatchingAccountTypeIndex(vm.matchingAccountTypes, vm.selectedAccountType)];
        vm.adjustedFees = 0;
        // Existing fees as currently recorded for this Position/Acount Type.
        vm.currentFees = positionCreateSvc.getPositionFees(allPositions, vm.ticker.trim(), vm.selectedAccountType.trim());


        // Cache: 1) applicable pre-edit Position attributes, and 
        //        2) existing Position Guids for selected ticker.
        vm.positionFrom.accountType = vm.selectedAccountType.matchedAccountType;
        vm.positionFrom.currentQty = $state.params.positionSelectionObj.Qty;
        vm.positionFrom.originalQty = vm.positionFrom.currentQty;
        vm.positionFrom.positionId = $state.params.positionSelectionObj.PositionId;
        vm.positionFrom.positionDate = $state.params.positionSelectionObj.PositionAddDate;
        vm.positionFrom.purchaseDate = $state.params.positionSelectionObj.PurchDate;
        vm.positionFrom.originalFees = vm.currentFees;
        // Asset, account, & investor Guids.
        var currentPositionGuids = positionCreateSvc.getGuidsForPosition(allPositions, vm.positionFrom.positionId);
        vm.positionFrom.accountTypeId = currentPositionGuids.accountTypeId;
        vm.positionFrom.originalFees = vm.currentFees;
        vm.positionFrom.originalMktPrice = vm.positionFrom.mktPrice;
        vm.positionFrom.assetId = currentPositionGuids.assetId;
        vm.positionFrom.investorId = currentPositionGuids.investorId;
        vm.positionFrom.tickerSymbol = vm.ticker.trim().toUpperCase();


       
        var allPositionsForAsset = [];

        // VM for WebApi call. All "from"-related properties will always be initialized,
        // while "to"-related properties may/may not be initialized, depending upon 
        // whether a Position change has taken place, e.g., rollover.
        var positionInfo = {};
               
      
        /* -- UI processing & event handling -- */
        function updateDisplayUponPositionChange(targetAccount) {

            // Updates for data bindings  & position objects.
            allPositionsForAsset = positionCreateSvc.getInvestorMatchingAccounts();
            
            for (var pos = 0; pos <= allPositionsForAsset.length; pos++) {
                if (allPositionsForAsset[pos].preEditPositionAccount.toUpperCase().trim() == targetAccount.toUpperCase().trim() &&
                    allPositionsForAsset[pos].referencedTickerSymbol.toUpperCase().trim() == vm.ticker.toUpperCase().trim()) {
                        vm.positionTo.accountType = targetAccount;
                        vm.positionTo.originalQty = allPositionsForAsset[pos].qty;
                        vm.positionTo.currentQty = allPositionsForAsset[pos].qty;
                        vm.positionTo.positionDate = allPositionsForAsset[pos].datePositionAdded;
                        vm.positionDate = vm.positionTo.positionDate;
                        vm.currentQty = vm.positionTo.originalQty;
                        vm.calculateCostBasis("positionChange");
                        // Though not currently displayed, we'll use the opportunity to update positionId for 'update' scenarios.
                        vm.positionTo.positionId = allPositionsForAsset[pos].positionId;
                        vm.positionFrom.accountTypeId = currentPositionGuids.accountTypeId;
                        var newPositionGuids = positionCreateSvc.getGuidsForPosition(allPositions, vm.positionTo.positionId);
                        vm.positionTo.accountTypeId = newPositionGuids.accountTypeId;
                        break;
                }
            }
        }


        function updateDisplayPostDbUpdate(positionVm) {

            // Most buy or sell selections will not include "toXXX" Vm attributes, except
            // for adding shares to a NEW account w/o involving a rollover.
            //alert("in updateDisplayPostDbUpdate(positionVm)");
            //switch (positionVm.adjustedOption) {
            //    case "buy":
            //        if (positionVm.dbActionNew == "insert") {
            //            vm.positionTo.currentQty = positionVm.toQty;
            //            vm.positionTo.unitCost = positionVm.toUnitCost;
            //            vm.calculateCostBasis("positionChange", vm.currentQty, positionVm.adjustedOption);
            //            vm.positionDate = positionVm.toPositionDate;
            //        } else {
            //            // update existing Position.
            //            //vm.currentFees += vm.adjustedTotalFees;
            //            vm.positionFrom.mktPrice = positionVm.fromUnitCost;
            //            vm.currentQty = positionVm.fromQty;
            //            vm.calculateCostBasis("postDbUpdate", vm.currentQty, positionVm.adjustedOption);
            //            vm.positionDate = positionVm.fromPositionDate;
            //        }
            //        break;
            //    case "rollover":
            //            vm.positionTo.currentQty = positionVm.toQty;
            //            vm.currentQty = positionVm.toQty;
            //            vm.positionTo.unitCost = positionVm.toUnitCost;
            //            vm.calculateCostBasis("positionChange", vm.currentQty, positionVm.adjustedOption);
            //            vm.positionDate = positionVm.toPositionDate;
            //        break;
            //    case "edit":
            //    case "sell":
            //        vm.calculateCostBasis("postDbUpdate", vm.currentQty, positionVm.adjustedOption);
            //        vm.positionFrom.unitCost = vm.unitCost;
            //        vm.currentQty = vm.positionFrom.originalQty + vm.adjustedQty;
            //        vm.currentFees = vm.currentFees + vm.adjustedFees;
            //        vm.positionFrom.adjustedTotalFees = vm.currentFees;
            //        break;
            //}
  
        }


        function postUpdateRefreshUi() {
            vm.currentQty = vm.newAccountAdded ? vm.positionTo.currentQty : vm.positionFrom.currentQty;
            vm.currentFees = vm.newAccountAdded ? vm.positionTo.currentFees : vm.positionFrom.currentFees;
            vm.unitCost = vm.newAccountAdded ? vm.positionTo.unitCost : vm.positionFrom.unitCost;
            vm.positionDate = vm.newAccountAdded ? vm.positionTo.positionDate : vm.positionFrom.positionDate;
            vm.costBasis = vm.newAccountAdded ? vm.positionTo.costBasis : vm.positionFrom.costBasis;
        }
        

        function checkIsValidAdjustmentOption() {
            if ((!vm.matchingAccountChanged && !vm.newAccountAdded && vm.adjustedOption == 'rollover') ||
                 (vm.matchingAccountChanged && vm.adjustedOption != 'rollover') ||
                (!vm.matchingAccountChanged && vm.newAccountAdded && vm.adjustedOption == 'sell')) {
                return false;
            }
            return true;
        }


       
        vm.clearPosition = function () {
            var backlen = history.length;
            history.go(-backlen);
            window.location.href = "http://localhost:5969/App/Layout/Main.html#/grid/P";

            /*
                document.location.replace("http://localhost:5969/App/Layout/Main.html#/Position/EditDelete");
                window.location = "http://localhost:5969/App/Layout/Main.html#/grid/P";
                location.reload(true);
            */
        }


        vm.toggleAdjInputs = function () {
            vm.mktPriceDisabled = vm.adjustedOption == 'edit' ? false : true;
            vm.adjDateDisabled = vm.adjustedOption == 'edit' ? false : true;
            vm.updateBtnDisabled = false;

            // Enable inline editing of Position transaction(s).
            if (vm.adjustedOption == 'edit') {
                var origPosDate = $filter('date')(vm.positionFrom.positionDate, 'M/d/yyyy');
                var adjustedPosDate = $filter('date')(vm.positionAdjDate, 'M/d/yyyy');
                // Unadjusted Position date indicates process for transaction edit(s).
                // TODO: 1st 3 params may now not be needed after addition of currentPositionParam?
                if (origPosDate == adjustedPosDate) {
                        $state.go("position_transactions_edit",
                           {
                               positionIdParam: vm.positionFrom.positionId,
                               accountParam: vm.selectedAccountType,
                               mktPriceParam: vm.adjustedMktPrice,
                               currentPositionParam: vm.positionFrom
                           });
                }
            }
        }


        vm.toggleNewAccountCheckBox = function () {
            updateDisplayUponPositionChange(vm.selectedAccountType.matchedAccountType);
            if (vm.positionFrom.accountType != vm.selectedAccountType.matchedAccountType) {
                vm.newAccountDisabled = true;
                vm.matchingAccountChanged = true;
                vm.positionTo.dBAction = "update";
            }
            else {
                vm.newAccountDisabled = false;
                vm.matchingAccountChanged = false;
                vm.positionTo.dBAction = "insert";
            }
        }


        vm.calendarOpenAdjPosDate = function ($event) {
            $event.preventDefault(); // prevent any default action triggered
            $event.stopPropagation();

            vm.openedPosAdjDate = !vm.openedPosAdjDate;
        }


        vm.toggleNewAccountInput = function () {
            vm.showNewAccountInput = !vm.showNewAccountInput;
            vm.matchingAccountsDisabled = !vm.matchingAccountsDisabled;
        }


        vm.newAccountCheck = function () {
            vm.positionTo.accountType = vm.newAccount;

            var existingAccountTypeIdx = positionCreateSvc.getMatchingAccountTypeIndex(vm.matchingAccountTypes, vm.newAccount);
            if (existingAccountTypeIdx >= 0) {
                alert("Error: Duplicate account found for : " + vm.newAccount + ".\nPlease enter a different account type.");
                vm.newAccount = "";
                return null;
            }
            
            // Validation.
            incomeMgmtSvc.getAllAccountTypes(vm);

            // Clear fields to reflect new account addition.
            vm.currentQty = 0; 
            vm.costBasis = 0;
            vm.valuation = 0;
            vm.gainLoss = 0;
            vm.positionDate = "";

            return null;
        }
        

        vm.calculateProfitLossAndValuation = function (units, costBasis)
        {
            vm.valuation = parseFloat(units * vm.positionFrom.mktPrice).toFixed(2);
            vm.gainLoss = (vm.valuation - parseFloat(costBasis)).toFixed(2);
        }


        vm.calculateCostBasis = function (scenario, qty, adjOption) {
            dataReceptacle = incomeMgmtSvc.createCostBasisAndUnitCostData();
            // Utilize varying useage scenarios for calculations.
            switch(scenario) {
                case "initialPageLoad":
                    dataReceptacle.numberOfUnits = vm.positionFrom.originalQty;
                    dataReceptacle.totalTransactionFees = vm.currentFees;
                    dataReceptacle.currentMktPrice = vm.positionFrom.mktPrice;
                    vm.costBasis = incomeMgmtSvc.calculateCostBasis(dataReceptacle);
                    vm.unitCost = parseFloat(vm.costBasis / dataReceptacle.numberOfUnits).toFixed(3);
                    vm.adjustedMktPrice = dataReceptacle.currentMktPrice;
                    vm.positionFrom.originalMktPrice = vm.adjustedMktPrice;
                    vm.calculateProfitLossAndValuation(dataReceptacle.numberOfUnits, vm.costBasis);
                    break;
                case "positionChange":
                    // New account, or selection from existing 'Matching accounts'.
                    vm.costBasis = (vm.positionTo.unitCost * vm.positionTo.currentQty).toFixed(2);
                    vm.calculateProfitLossAndValuation(vm.positionTo.currentQty, vm.costBasis);
                    break;
                case "postDbUpdate":
                    if (adjOption == "sell") {
                        vm.costBasis = qty > 0 ? (vm.positionFrom.unitCost * qty).toFixed(2) : 0;
                        vm.calculateProfitLossAndValuation(qty, vm.costBasis);
                        break;
                    } else {
                        // Edit-Buy
                        //dataReceptacle.numberOfUnits = vm.positionFrom.originalQty + vm.adjustedQty;
                        //dataReceptacle.totalTransactionFees = vm.currentFees + vm.adjustedFees;
                        //dataReceptacle.currentMktPrice = vm.positionFrom.mktPrice;
                        //vm.costBasis = incomeMgmtSvc.calculateCostBasis(dataReceptacle);
                        //vm.unitCost = parseFloat(vm.costBasis / dataReceptacle.numberOfUnits).toFixed(3);
                        //vm.adjustedMktPrice = dataReceptacle.currentMktPrice;
                        //vm.calculateProfitLossAndValuation(dataReceptacle.numberOfUnits, vm.costBasis);
                        break;
                    }
            }
        }


        vm.positionEditContainsAccountChange = function () {
            return vm.selectedAccountType.matchedAccountType.toUpperCase().trim() == vm.positionFrom.accountType.toUpperCase().trim() && vm.showNewAccountInput == false
                ? false
                : true;
        }
        

        // TODO: Re-eval.
        vm.adjustUnitCost = function (optionSelected) {
            //alert("adjustUnitCost() in use.");

            if ((optionSelected == 'rollover' || optionSelected == 'sell')) {
                if (vm.adjustedQty > vm.positionFrom.originalQty) {
                    alert("Invalid entry; \quantity adjustment nmay not exceed original quantity.");
                    return false;
                }
            }
           
            if (optionSelected == 'rollover') {
                // Unit cost MUST equal current market price in this scenario, and
                // is therefore read-only - per SEC rules.
                vm.adjustedMktPrice = vm.positionFrom.mktPrice;
                vm.mktPriceDisabled = true;
                vm.positionTo.adjustedQty = vm.adjustedQty;
            }
            //var today = new Date();
            //vm.positionAdjDate = incomeMgmtSvc.formatDate(today);
            return null;
        }


        // TODO: Re-eval need here.
        vm.adjustFees = function (optionSelected) {
            //alert("adjustFees() in use.");

            // Update dynamically upon each 'vm.adjustedFees' lost focus.
            switch(optionSelected) {
                case "edit":
                //case  "buy":
                //    vm.positionFrom.adjustedTotalFees = vm.adjustedFees != 0
                //                            ? parseFloat(vm.currentFees + vm.adjustedFees)
                //                            : parseFloat(vm.currentFees);
                //    break;
            }

        }


        vm.initializeTransactionVm = function(newPositionPersisted) {
            // When creating a new Position first = newPositionPersisted = true
            vm.trxDataEdits.TransactionId = incomeMgmtSvc.createGuid();
            vm.trxDataEdits.TransactionEvent = "B";
            vm.trxDataEdits.Date = $filter('date')(new Date(), 'MM/d/yyyy-hh:mm:ss a');
            vm.trxDataEdits.Units = vm.adjustedQty;
            vm.trxDataEdits.MktPrice = vm.positionFrom.mktPrice;
            vm.trxDataEdits.Fees = vm.adjustedFees;
            vm.trxDataEdits.Valuation = transactionsModalSvc.calculateValuation(vm.trxDataEdits.Units, vm.trxDataEdits.MktPrice);
            vm.trxDataEdits.CostBasis = transactionsModalSvc.calculateCostBasis(vm.trxDataEdits.Valuation, vm.trxDataEdits.Fees);
            vm.trxDataEdits.UnitCost = transactionsModalSvc.calculateUnitCost(vm.trxDataEdits.CostBasis, vm.trxDataEdits.Units);

            if (!newPositionPersisted) {
                // Necessary 'Position' values for upcoming persistence, e.g., 'Buy' for new Position - no 'Rollover'
                vm.trxDataEdits.PositionId = vm.positionFrom.positionId;
                vm.trxDataEdits.PositionQty = 0;
                vm.trxDataEdits.PositionCostBasis = 0;
                vm.trxDataEdits.PositionUnitCost = 0;
                vm.trxDataEdits.PositionAcctTypeId = vm.positionFrom.accountTypeId;
                vm.trxDataEdits.PositionAssetId = vm.positionFrom.assetId;
                vm.trxDataEdits.PositionPurchaseDate = vm.positionFrom.purchaseDate;
                vm.trxDataEdits.PositionDate = vm.positionFrom.positionDate;
                vm.trxDataEdits.PositionTickerSymbol = vm.positionFrom.tickerSymbol;
                vm.trxDataEdits.PositionStatus = vm.positionFrom.status;
                vm.trxDataEdits.PositionFees = 0;
                vm.trxDataEdits.positionLastUpdate = "";
                vm.trxDataEdits.PositionInvestorId = vm.positionFrom.investorId;
            } else {
                vm.trxDataEdits.PositionId = vm.positionTo.positionId;
                vm.trxDataEdits.PositionAcctTypeId = vm.positionTo.accountTypeId;
                vm.trxDataEdits.PositionDate = $filter('date')(new Date(), 'MM/d/yyyy-hh:mm:ss a');
            }
        }


        vm.intializePositionVm = function () {

            // During Position edit scenarios where a new Position is required, i.e., Buy, Rollover,
            // we'll set up a pending Position POST first, due to FK Position-Transactions constraints,
            var positionVm = positionCreateSvc.getPositionVm();

            positionVm.PreEditPositionAccount = vm.positionFrom.accountTypeId;
            positionVm.PostEditPositionAccount = vm.positionTo.accountTypeId;
            positionVm.DateOfPurchase = vm.positionFrom.purchaseDate;
            positionVm.LastUpdate =  $filter('date')(today, "M/d/yyyy h:mm a");
            positionVm.Url = "";
            positionVm.LoggedInInvestor = vm.positionFrom.investorId;
            positionVm.ReferencedAccount = null;
            positionVm.CreatedPositionId = incomeMgmtSvc.createGuid();
            positionVm.ReferencedAssetId = vm.positionFrom.assetId;
            positionVm.ReferencedTickerSymbol = vm.positionFrom.tickerSymbol;
            positionVm.DatePositionAdded = $filter('date')(today, "M/d/yyyy h:mm a");
            positionVm.Status = "A";
            positionVm.Qty = parseInt(vm.adjustedQty);
            positionVm.TransactionFees = vm.adjustedFees;

            var valuation = transactionsModalSvc.calculateValuation(positionVm.Qty, vm.adjustedMktPrice);
            var costBasis = transactionsModalSvc.calculateCostBasis(valuation, positionVm.TransactionFees);
            positionVm.UnitCost = transactionsModalSvc.calculateUnitCost(costBasis, positionVm.Qty);

            return positionVm;
        }





        /* -- Service async callbacks -- */
        vm.postAsyncPositionSave = function(response, receivedPosId) {
            if (response) {
                if (receivedPosId != undefined) {
                    //alert("new PosId : " + receivedPosId);
                    vm.positionTo.positionId = receivedPosId;
                    vm.initializeTransactionVm(true);
                    transactionsModalSvc.insertTransactionTable(vm.trxDataEdits, vm);
                }
                alert("new Position with Transaction saved.");
            }else {
                alert("new Position save failed.");
            }
        }


        vm.postAyncProfileFetch = function (profileData) {
            vm.positionFrom.mktPrice = parseFloat(profileData.price).toFixed(2);
            vm.calculateCostBasis("initialPageLoad");
        }


        vm.postAsyncPositionUpdates = function (results, actionsRequested) {
            if (results.$resolved) {
                // For Position changes only.
                // actionsRequested : "fromPosition + toPosition" regarding
                // successful db record action(s) to be taken.
                //switch (actionsRequested) {
                //    case "update-update":
                //        alert("Positions updated successfully.");
                //        break;
                //    case "update-insert":
                //        alert("Positions updated & created successfully.");
                //        break;
                //    case "update-na":
                //        alert("Position edit updated successfully.");
                //        break;
                //    case "insert-na":
                //        alert("Position created successfully.");
                //        break;
                //}

                alert("Position updated successfully.");

                // TODO: update with new fixes 5.15.17
                updateDisplayPostDbUpdate(positionInfo);

                // Clear UI for display, as needed.
                if (positionInfo.dbActionNew == "na")
                    positionInfo.toPosId = "na";
            }
        }


        vm.postAsyncPositionUpdatesError = function(errorText) {
            alert("Error updating and/or creating Position(s) due to: \n" + errorText);
        }


        vm.postAsyncAcctTypes = function (response) {

            vm.allAccountTypes = response;
            var accountTypeDescriptions = [];
            
            // All existing account types validated against user entered data.
            for (var at = 0; at < vm.allAccountTypes.length; at++) {
                accountTypeDescriptions.push(vm.allAccountTypes[at].accountTypeDesc.toUpperCase().trim());
            }

            if (accountTypeDescriptions.indexOf(vm.newAccount.trim().toUpperCase()) == -1 || vm.newAccount.trim().toUpperCase() == "Select...") {
                alert("Invalid account type entry; check spelling.");
                return true;
            }
                

            vm.positionTo.accountTypeId = positionCreateSvc.getMatchingAccountTypeId(vm.allAccountTypes, vm.newAccount);

            return false;
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


        vm.postAsyncAcctTypeUpdate = function (resultStatus) {
            if (resultStatus[0] == "1")
                alert("Account type update successful.");
            else {
                alert("Error updating Account type.");
            }
        }
        

        vm.postAsyncIncomeDelete = function (results) {
            if (results.$resolved)
                alert("Income record successfully deleted.");
            else {
                alert("Error deleting Income record.");
            }
        }


        vm.postAsyncTransactionInsert = function(status, responseData) {
            if (!status) {
                alert("Error inserting new Position-Transaction");
                return false;
            }
            
            if (vm.adjustedOption == 'buy' && vm.positionTo.dBAction == "") {
                // Adding shares to an existing Position, e.g., 'buy'.
                incomeMgmtSvc.getAllTransactions(responseData.transactionPositionId, vm);
            } else {
                // to be implemented
            }
            
            return false;
        }


        vm.postAsyncGetAllTransactions = function (allCurrentPosTrxs) {
            
            var updatedPositionVm = positionCreateSvc.calculatePositionTotalsFromTransactions(allCurrentPosTrxs, vm.trxDataEdits);

            if (vm.adjustedOption == "buy")
                updatedPositionVm.Status = "A";

            positionCreateSvc.processPositionUpdates2(updatedPositionVm, vm);
           
        }




        /* -- WebApi call -- */
        vm.updatePosition = function () {

            vm.updateBtnDisabled = true;

            /* Validation checks */
            if (vm.adjustedOption != 'edit' && vm.adjustedQty < 0) {
                alert("Invalid quantity adjustment for non-'edit' mode, \nminimum required quantity = 1");
                return false;
            }

            if (vm.adjustedOption == 'edit' && vm.matchingAccountsDisabled) {
                alert("Invalid adjustment option selected for newly created account.");
                return false;
            }

            // Check for new account entry.
            if (vm.matchingAccountsDisabled) {
                if (vm.adjustedQty <= 0) {
                    alert("Invalid quantity entered; \nminimum required entry = 1.");
                    return null;
                }
                vm.newAccountAdded = true;
                vm.positionTo.dBAction = 'insert';
            }
            else {
                // Use existing account from drop down listing.
                vm.positionTo.accountType = vm.selectedAccountType.matchedAccountType;
                vm.newAccountAdded = false;
            }

            if (!checkIsValidAdjustmentOption()) {
                alert("Invalid adjustment option selected, \ncheck selected 'matching accounts'.");
                return false;
            }

            if ((vm.matchingAccountChanged || vm.newAccountAdded) && vm.adjustedOption == 'rollover') {
                if (!positionCreateSvc.checkIsValidAccountChange(vm.positionFrom.accountType, vm.positionTo.accountType)) {
                    alert("Invalid position transition submitted, \nplease check selected accounts.");
                }
            }

            if (vm.newAccountAdded) {
                vm.positionTo.dBAction = "insert";
            } else {
                vm.positionFrom.dBAction = "update";
            }
            

            // Initialize static vm attributes.
            positionInfo.fromPosId = vm.positionFrom.positionId;
            positionInfo.positionFromAccountId = vm.positionFrom.accountTypeId;
            positionInfo.positionAssetId = currentPositionGuids.assetId;
            positionInfo.positionInvestorId = currentPositionGuids.investorId;
            positionInfo.toPurchaseDate = vm.positionFrom.purchaseDate;
            positionInfo.fromPurchaseDate = vm.positionFrom.purchaseDate;
            positionInfo.fromPositionDate = $filter('date')(vm.positionFrom.positionDate, 'M/dd/yyyy');
            positionInfo.toPositionDate = $filter('date')(vm.positionTo.positionDate, 'M/dd/yyyy');

            dataReceptacle = incomeMgmtSvc.createCostBasisAndUnitCostData();


            // Coalesce each Positions' edits, if applicable, into a single vm for 
            // passing to positionCreateSvc for db trx processing. Any irrelevant positionInfo{} 
            // attributes will be intialized as 'na' [not applicable] or 0.
            switch (vm.adjustedOption) {
                case 'rollover':
                    // Handles full or partial conversions.
                    if (vm.adjustedQty <= 0) {
                        alert("Invalid quantity adjustment for rollover. \nMinimum required value: 1.");
                        return null;
                    }
                    vm.positionFrom.currentQty = vm.positionFrom.originalQty - vm.adjustedQty;
                    positionInfo.dbActionOrig = vm.positionFrom.dBAction;
                    positionInfo.toUnitCost = vm.positionFrom.mktPrice;
                    positionInfo.fromUnitCost = vm.positionFrom.unitCost;
                    positionInfo.dbActionNew = vm.positionTo.dBAction;
                    positionInfo.fromPositionStatus = vm.positionFrom.originalQty - vm.adjustedQty == 0 ? "I" : "A";
                    positionInfo.adjustedOption = vm.adjustedOption;
                    positionInfo.positionToAccountId = vm.positionTo.accountTypeId;
                    positionInfo.fromQty = vm.positionFrom.originalQty - parseInt(vm.adjustedQty);
                    positionInfo.toPositionStatus = vm.positionTo.currentQty > 0 && vm.adjustedOption == 'rollover' ? "A" : "I";


                    if (vm.positionTo.dBAction == "update") {
                        positionInfo.toQty = parseInt(vm.positionTo.currentQty) + parseInt(vm.positionTo.adjustedQty);
                        positionInfo.toPosId = vm.positionTo.positionId; 
                    } else {
                        // Insert
                        positionInfo.toQty = parseInt(vm.positionTo.adjustedQty);
                        positionInfo.toPositionStatus = "A";  // Override
                        positionInfo.dbActionOrig = vm.positionFrom.dBAction;
                        positionInfo.toPositionDate = $filter('date')(today, 'M/dd/yyyy');
                        positionInfo.toPosId = incomeMgmtSvc.createGuid();
                    }
                    break;
                case 'buy':
                    if (vm.positionTo.dBAction == 'insert') {
                        // Adding shares to a NEW account (Position) w/o involving a 'rollover'.
                        // 5.15.17 - Revision due to new transactions functionality.

                        /*   -------    Valid positionVm POST template ----
                            {
                                PreEditPositionAccount: "01bacffb-3727-4383-a0ec-f63e4cbdd1b1",
                                PostEditPositionAccount: "79f6f3f2-4701-4384-9d28-30296ccbda40",
                                Qty: 100,
                                UnitCost: 28.22,
                                DateOfPurchase: "10/30/2010",
                                LastUpdate: "5/17/2017",
                                Url : "",
                                LoggedInInvestor: "593cfa61-35e6-446e-bae3-48a460c0b4e6",
                                ReferencedAccount: null,

                                CreatedPositionId : "660142d6-cf7c-4e0d-a25a-91d9939b07f7",
                                ReferencedAssetId: "4ba3b760-e38c-4957-bf1f-a74101114904",
                                ReferencedTickerSymbol: "GE",
                                DatePositionAdded: "5/16/2017",
                                Status: "A",
                                TransactionFees: 175.16
                            }
                        */
                        var initializedPositionVm = this.intializePositionVm();
                        positionCreateSvc.savePosition(initializedPositionVm, vm);
                        

                        /* on hold until done with Position insert
                        this.initializeTransactionVm();
                        vm.trxDataEdits.PositionId = incomeMgmtSvc.createGuid();
                        vm.trxDataEdits.PositionAcctTypeId = vm.positionTo.accountTypeId;
                        vm.trxDataEdits.PositionDate = $filter('date')(today, 'M/dd/yyyy');
                        vm.trxDataEdits.PositionStatus = "A";

                        transactionsModalSvc.insertTransactionTable(vm.trxDataEdits, vm);
                        */


                        //positionInfo.positionFromAccountId = incomeMgmtSvc.createGuid();
                        //positionInfo.positionToAccountId = vm.positionTo.accountTypeId;
                        //positionInfo.dbActionOrig = "na";
                        //positionInfo.toQty = parseInt(vm.adjustedQty);
                        //vm.currentQty = positionInfo.toQty;
                        //positionInfo.toUnitCost = vm.positionFrom.mktPrice;
                        //positionInfo.toPositionStatus = "A";
                        //positionInfo.toPositionDate = $filter('date')(today, 'M/dd/yyyy');
                        //positionInfo.dbActionNew = "insert";
                        //positionInfo.toPosId = incomeMgmtSvc.createGuid();
                        //positionInfo.fromPositionStatus = "na";
                        //positionInfo.fromUnitCost = 0;
                        //positionInfo.fromQty = 0;
                        //positionInfo.fromFees = vm.adjustedTotalFees != 0
                        //       ? parseFloat(vm.currentFees + vm.adjustedTotalFees)
                        //       : parseFloat(vm.currentFees);
                    } else {
                        // Adding shares to an EXISTING account w/o involving a 'rollover'.
                        if (parseInt(vm.adjustedQty) == 0) {
                            alert("Invalid quantity; \nminimum purchase quantity required = 1.");
                            return null;
                        }

                        // 5.9.17 - Revision due to new transactions functionality.
                        this.initializeTransactionVm(false);
                        transactionsModalSvc.insertTransactionTable(vm.trxDataEdits, vm);
                        
                        //positionInfo.adjustedOption = vm.adjustedOption;
                        //positionInfo.dbActionNew = "na";
                        //positionInfo.toPosId = incomeMgmtSvc.createGuid();
                        //positionInfo.positionToAccountId = incomeMgmtSvc.createGuid();
                        //vm.positionFrom.dBAction = 'update';
                        //positionInfo.dbActionOrig = vm.positionFrom.dBAction;
                        //vm.positionTo.dBAction = 'na';
                        //positionInfo.fromPositionStatus = "A";
                        //positionInfo.toPositionStatus = "na";

                        ////vm.calculateCostBasis("postDbUpdate", 0, "buy");
                        //dataReceptacle.numberOfUnits = vm.positionFrom.originalQty + vm.adjustedQty;
                        //dataReceptacle.totalTransactionFees = vm.currentFees + vm.adjustedFees;
                        //dataReceptacle.currentMktPrice = vm.positionFrom.mktPrice;
                        //positionInfo.fromQty = dataReceptacle.numberOfUnits;
                        //vm.positionFrom.originalQty = vm.currentQty;
                        //vm.positionFrom.currentQty = positionInfo.fromQty;
                        //if (positionInfo.fromQty <= 0) {
                        //    alert("Invalid quantity adjustment; \nresulting calculated quantity: " + parseInt(positionInfo.fromQty));
                        //    return null;
                        //}
                        //positionInfo.toQty = 0;
                        //vm.positionTo.currentQty = 0;

                        //positionInfo.fromFees = dataReceptacle.totalTransactionFees;
                        //positionInfo.toFees = 0.00;
                        //vm.positionFrom.currentFees = positionInfo.fromFees;
                        //vm.positionTo.currentFees = 0.00;

                        //vm.costBasis = incomeMgmtSvc.calculateCostBasis(dataReceptacle);
                        //vm.positionFrom.costBasis = vm.costBasis;
                        //vm.positionTo.costBasis = 0.0;
                        
                        //positionInfo.fromUnitCost = parseFloat(vm.costBasis / dataReceptacle.numberOfUnits).toFixed(3);
                        //positionInfo.toUnitCost = 0;
                        //vm.positionFrom.unitCost = positionInfo.fromUnitCost;
                        //vm.positionTo.unitCost = 0.0;

                        //positionInfo.fromPositionDate = $filter('date')(vm.positionAdjDate, 'M/dd/yyyy');
                        //positionInfo.toPositionDate = $filter('date')(today, 'M/dd/yyyy');  // initialization needed for WebApi state validation
                        //vm.positionFrom.positionDate = positionInfo.fromPositionDate;
                        //vm.positionTo.positionDate = "n/a";
                        
                        //vm.adjustedMktPrice = dataReceptacle.currentMktPrice;

                        //vm.calculateProfitLossAndValuation(dataReceptacle.numberOfUnits, vm.positionFrom.costBasis);
                    }
                    positionInfo.adjustedOption = vm.adjustedOption;
                    postUpdateRefreshUi();
                    break;
                case 'sell':
                    vm.positionFrom.originalQty = vm.currentQty;
                    vm.positionFrom.currentQty = vm.positionFrom.originalQty - parseInt(vm.adjustedQty);
                    positionInfo.fromQty = vm.positionFrom.currentQty;
                    positionInfo.fromUnitCost = vm.positionFrom.mktPrice;
                    positionInfo.fromPositionStatus = vm.positionFrom.currentQty == 0 ? "I" : "A";
                    positionInfo.dbActionOrig = vm.positionFrom.dBAction;
                    positionInfo.adjustedOption = vm.adjustedOption;
                    positionInfo.toPositionDate = "na";
                    positionInfo.positionToAccountId = "na";
                    positionInfo.toPositionStatus = "na";
                    positionInfo.toUnitCost = 0;
                    positionInfo.toQty = 0;
                    positionInfo.toPosId = "na";
                    positionInfo.dbActionNew = "na";
                    break;
                case 'edit':
                    // TODO: 4.7.17 - cancelled functionality; will provide editing via new Position trx table & grid. - DONE.
                    //positionInfo.adjustedOption = vm.adjustedOption;
                    //positionInfo.dbActionNew = "na";
                    //positionInfo.toPosId = incomeMgmtSvc.createGuid();
                    //positionInfo.positionToAccountId = incomeMgmtSvc.createGuid();
                    //vm.positionFrom.dBAction = 'update';
                    //positionInfo.dbActionOrig = vm.positionFrom.dBAction;
                    //vm.positionTo.dBAction = 'na';
                    //positionInfo.fromPositionStatus = "A";
                    //positionInfo.toPositionStatus = "na";
                    //if (vm.adjustedQty != 0 || vm.adjustedMktPrice != vm.positionFrom.originalMktPrice || vm.adjustedFees != 0) {
                    //    dataReceptacle.numberOfUnits = vm.positionFrom.originalQty + vm.adjustedQty;
                    //    dataReceptacle.totalTransactionFees = vm.currentFees + vm.adjustedFees;
                    //    dataReceptacle.currentMktPrice = vm.positionFrom.mktPrice;
                    //    positionInfo.fromQty = dataReceptacle.numberOfUnits;
                    //    vm.positionFrom.originalQty = vm.currentQty;
                    //    vm.positionFrom.currentQty = positionInfo.fromQty;
                    //    if (positionInfo.fromQty <= 0) {
                    //        alert("Invalid quantity adjustment; \nresulting calculated quantity: " + parseInt(positionInfo.fromQty));
                    //        return null;
                    //    }
                    //    positionInfo.toQty = 0;
                    //    vm.positionTo.currentQty = 0;

                    //    positionInfo.fromFees = dataReceptacle.totalTransactionFees;
                    //    positionInfo.toFees = 0.00;
                    //    vm.positionFrom.currentFees = positionInfo.fromFees;
                    //    vm.positionTo.currentFees = 0.00;

                    //    vm.costBasis = incomeMgmtSvc.calculateCostBasis(dataReceptacle);
                    //    vm.positionFrom.costBasis = vm.costBasis;
                    //    vm.positionTo.costBasis = 0.0;

                    //    positionInfo.fromUnitCost = parseFloat(vm.costBasis / dataReceptacle.numberOfUnits).toFixed(3);
                    //    positionInfo.toUnitCost = 0;
                    //    vm.positionFrom.unitCost = positionInfo.fromUnitCost;
                    //    vm.positionTo.unitCost = 0.0;

                    //    if (vm.positionAdjDate != vm.positionDate) {
                    //        positionInfo.fromPositionDate = $filter('date')(vm.positionAdjDate, 'M/dd/yyyy');
                    //        positionInfo.toPositionDate = $filter('date')(today, 'M/dd/yyyy');  // initialization needed for WebApi state validation
                    //        vm.positionFrom.positionDate = positionInfo.fromPositionDate;
                    //        vm.positionTo.positionDate = "n/a";
                    //    }
                    //} else {
                    //    positionInfo.fromPositionDate = $filter('date')(vm.positionAdjDate, 'M/dd/yyyy');
                    //    positionInfo.toPositionDate = $filter('date')(today, 'M/dd/yyyy');  // initialization needed for WebApi state validation
                    //    vm.positionFrom.positionDate = positionInfo.fromPositionDate;
                    //    vm.positionTo.positionDate = "n/a";
                    //}
                    //vm.adjustedMktPrice = dataReceptacle.currentMktPrice;

                    //vm.calculateProfitLossAndValuation(dataReceptacle.numberOfUnits, vm.positionFrom.costBasis);

                    //positionInfo.dbActionOrig = "update";
                    //positionInfo.fromPositionStatus = "A";
                    //positionInfo.toPositionStatus = "na";
                    //vm.calculateCostBasis("postDbUpdate", 0, "edit");
                    //positionInfo.fromQty = dataReceptacle.numberOfUnits;
                    //if (positionInfo.fromQty <= 0) {
                    //    alert("Invalid quantity adjustment; \nresulting calculated quantity: " + parseInt(positionInfo.fromQty));
                    //    return null;
                    //}
                    //positionInfo.toQty = 0;
                    //positionInfo.fromFees = dataReceptacle.totalTransactionFees;
                    //positionInfo.toFees = 0.00;
                    //positionInfo.fromUnitCost = parseFloat(vm.costBasis / dataReceptacle.numberOfUnits).toFixed(3);
                    //positionInfo.toUnitCost = 0;
                    //positionInfo.fromPositionDate = $filter('date')(vm.positionAdjDate, 'M/dd/yyyy');
                    //vm.positionDate = positionInfo.fromPositionDate;
                    //positionInfo.toPositionDate = $filter('date')(today, 'M/dd/yyyy');
                    //positionInfo.positionToAccountId = "na";
                    //positionInfo.adjustedOption = vm.adjustedOption;
                    //positionInfo.dbActionNew = "na";
                    //positionInfo.toPosId = incomeMgmtSvc.createGuid();
                    //positionInfo.positionToAccountId = incomeMgmtSvc.createGuid();
                    //positionInfo.fromUnitCost = vm.unitCost;
                    break;
            }

          
            // Initialize to satisfy WebApi model-state validation. 
            if (positionInfo.toPosId == "na" && positionInfo.dbActionNew == "na") {
                positionInfo.toPosId = incomeMgmtSvc.createGuid();
                positionInfo.positionToAccountId = incomeMgmtSvc.createGuid();
                positionInfo.toPositionDate = $filter('date')(today, 'M/dd/yyyy');
            }
                

            /* Debug info */
            //alert("positionInfo VM confirmation results: "
            //   + "\n----------------------------------"
            //   + "\nfromQty: " + positionInfo.fromQty
            //   + "\ntoQty: " + positionInfo.toQty
            //   + "\ndbActionNew: " + positionInfo.dbActionNew
            //   + "\ndbActionOrig: " + positionInfo.dbActionOrig
            //   + "\nfromStatus: " + positionInfo.fromPositionStatus
            //   + "\ntoStatus: " + positionInfo.toPositionStatus
            //   + "\nfromPosId: " + positionInfo.fromPosId
            //   + "\ntoPosId: " + positionInfo.toPosId
            //   + "\nfromUnitCost: " + positionInfo.fromUnitCost
            //   + "\ntoUnitCost: " + positionInfo.toUnitCost
            //   + "\nfromPosDate: " + $filter('date')(positionInfo.fromPositionDate, 'M/dd/yyyy')
            //   + "\ntoPosDate: " + $filter('date')(positionInfo.toPositionDate, 'M/dd/yyyy')
            //   + "\nassetId: " + positionInfo.positionAssetId
            //   + "\nfromAccountTypeId: " + positionInfo.positionFromAccountId
            //   + "\ntoAccountTypeId: " + positionInfo.positionToAccountId
            //   + "\nlastUpdate: " + $filter('date')(today, 'M/dd/yyyy')
            //   + "\ninvestorId: " + positionInfo.positionInvestorId
            //   + "\nfromPurchaseDate: " + $filter('date')(positionInfo.fromPurchaseDate, 'M/dd/yyyy')
            //   + "\ntoPurchaseDate: " + $filter('date')(positionInfo.toPurchaseDate, 'M/dd/yyyy')
            //   + "\nfromFees: " + positionInfo.fromFees
            //   + "\ntoFees: " + positionInfo.toFees
            //   );

            // temp debug
            //positionCreateSvc.processPositionUpdates(positionInfo, vm);

            return null;
        }


        
    }
  

}());