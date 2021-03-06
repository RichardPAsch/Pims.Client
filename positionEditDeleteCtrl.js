﻿(function () {

    "use strict";

    angular
        .module("incomeMgmt.positionEditDelete")
        .controller("positionEditDeleteCtrl", positionEditDeleteCtrl);

    positionEditDeleteCtrl.$inject = ['$state', '$filter', 'positionCreateSvc', 'allPositions', 'incomeMgmtSvc', 'incomeCreateSvc',
                                      'uiGridConstants', '$modal', '$location', '$interval', 'transactionsModalSvc'];


    function positionEditDeleteCtrl($state, $filter, positionCreateSvc, allPositions, incomeMgmtSvc, incomeCreateSvc, uiGridConstants,
                                    $modal, $location, $interval, transactionsModalSvc) {

        var vm = this;
        var today = new Date();
        vm.ticker = $state.params.positionSelectionObj.TickerSymbol;
        vm.trxDataEdits = transactionsModalSvc.createTransactionVm();
        

        // Encapsulate individual preEdit & postEdit position changes--where applicable--in one or both temp objects.
        // vm.positionFrom/positionTo objects -> mapped to positionInfo (vm) object for WebApi calls.
        // ** 'positionTo' initialized only in new, or rollover to existing Position scenarios. **
        vm.positionFrom = {
            mktPrice: positionCreateSvc.getCurrentMarketUnitPrice(vm, vm.ticker.toUpperCase().trim()),
            originalMktPrice: 0,    // Cached Profile price before adjustment
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
            costBasis: 0,
            transactions: []
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
            costBasis: 0,
            transactions: []
        };


        // UI data-binding & flags.
        vm.dbUpdateOk = false;
        vm.matchingAccountChanged = false;
        vm.newAccountAdded = false;
        vm.showNewAccountInput = false;
        vm.matchingAccountsDisabled = false;
        vm.newAccountDisabled = false;
        vm.mktPriceDisabled = false;
        vm.adjDateDisabled = false;
        vm.updateBtnDisabled = true;
        vm.accountPlaceHolder = "Enter a new Position account for " + vm.ticker.toUpperCase().trim() + "...";
        vm.adjustedOption = "";
        vm.selectedAccountType = $state.params.positionSelectionObj.AcctType;
        vm.currentQty = $state.params.positionSelectionObj.Qty;
        vm.adjustedQty = 0; // changed from 1, check this doesn't cause bugs
        vm.adjustedMktPrice = 0;
        vm.positionDate = $state.params.positionSelectionObj.PositionAddDate;
        vm.positionAdjDate = $filter('date')(vm.positionDate, 'M/dd/yyyy');
        vm.lastUpdate = incomeMgmtSvc.formatDate($state.params.positionSelectionObj.LastUpdate);
        vm.matchingAccountTypes = positionCreateSvc.getMatchingAccounts(vm.ticker, allPositions);
        vm.selectedAccountType = vm.matchingAccountTypes[positionCreateSvc.getMatchingAccountTypeIndex(vm.matchingAccountTypes, vm.selectedAccountType)];
        vm.adjustedFees = 0;
        // Existing fees as currently recorded for this Position/Account Type.
        vm.currentFees = positionCreateSvc.getPositionFees(allPositions, vm.ticker.trim(), vm.selectedAccountType.trim());


        // Cache: 1) applicable pre-edit Position attributes, and 
        //        2) existing Position Guids for selected ticker.
        vm.positionFrom.accountType = vm.selectedAccountType;
        vm.positionFrom.currentQty = $state.params.positionSelectionObj.Qty;
        vm.positionFrom.originalQty = vm.positionFrom.currentQty;
        vm.positionFrom.positionId = $state.params.positionSelectionObj.PositionId;
        vm.positionFrom.positionDate = $state.params.positionSelectionObj.PositionAddDate;
        vm.positionFrom.purchaseDate = $state.params.positionSelectionObj.PurchDate;
        vm.positionTo.purchaseDate = "";
        vm.positionFrom.originalFees = vm.currentFees;
        // Capture Asset, Account, & Investor Guids.
        var currentPositionGuids = positionCreateSvc.getGuidsForPosition(allPositions, vm.positionFrom.positionId);
        vm.positionFrom.accountTypeId = currentPositionGuids.accountTypeId;
        vm.positionFrom.originalFees = vm.currentFees;
        vm.positionFrom.originalMktPrice = vm.positionFrom.mktPrice;
        vm.positionFrom.assetId = currentPositionGuids.assetId;
        vm.positionFrom.investorId = currentPositionGuids.investorId;
        vm.positionFrom.tickerSymbol = vm.ticker.trim().toUpperCase();
        transactionsModalSvc.getAllTransactionsPostEdit(vm.positionFrom.positionId, vm, true);


       
        var allPositionsForAsset = [];

        // VM for WebApi call. All "from"-related properties will always be initialized,
        // while "to"-related properties may/may not be initialized, depending upon 
        // whether a Position change has taken place, e.g., rollover.
        var positionInfo = {};
               
      
        /* -- UI processing & event handling -- */
        function updateDisplayUponPositionChange(targetAccount) {

            // Update data bindings & position objects upon account type/position change.
            allPositionsForAsset = positionCreateSvc.getInvestorMatchingAccounts();
            
            for (var pos = 0; pos <= allPositionsForAsset.length; pos++) {
                if (allPositionsForAsset[pos].preEditPositionAccount.toUpperCase().trim() == targetAccount.toUpperCase().trim() &&
                    allPositionsForAsset[pos].referencedTickerSymbol.toUpperCase().trim() == vm.ticker.toUpperCase().trim()) {
                        // Though not currently displayed, we'll use the opportunity to update positionId for 'update' scenarios.
                        vm.positionTo.positionId = allPositionsForAsset[pos].positionId;
                        transactionsModalSvc.getAllTransactionsPostEdit(vm.positionTo.positionId, vm, false);
                        vm.positionTo.accountType = targetAccount;
                        vm.positionTo.originalQty = allPositionsForAsset[pos].qty;
                        vm.positionTo.currentQty = allPositionsForAsset[pos].qty;
                        vm.positionTo.positionDate = allPositionsForAsset[pos].datePositionAdded;
                        vm.positionDate = vm.positionTo.positionDate;
                        vm.positionTo.purchaseDate = allPositionsForAsset[pos].dateOfPurchase;
                        vm.currentQty = vm.positionTo.originalQty;
                        vm.positionFrom.accountTypeId = currentPositionGuids.accountTypeId;
                        var newPositionGuids = positionCreateSvc.getGuidsForPosition(allPositions, vm.positionTo.positionId);
                        vm.positionTo.accountTypeId = newPositionGuids.accountTypeId;
                        break;
                }
            }
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
            vm.mktPriceDisabled = vm.adjustedOption === "edit" ? false : true;
            vm.adjDateDisabled = vm.adjustedOption === "edit" ? false : true;
            vm.updateBtnDisabled = false;

            // Enable inline editing of Position transaction(s).
            if (vm.adjustedOption === 'edit') {
                var origPosDate = $filter('date')(vm.positionFrom.positionDate, 'M/dd/yyyy');
                var adjustedPosDate = $filter('date')(vm.positionAdjDate, 'M/dd/yyyy');
                // Unadjusted Position date indicates process for transaction edit(s).
                // TODO: 1st 3 params may now not be needed after addition of currentPositionParam?
                if (origPosDate === adjustedPosDate) {
                        $state.go("position_transactions_edit",
                           {
                               positionIdParam: vm.positionFrom.positionId,
                               accountParam: vm.selectedAccountType,
                               mktPriceParam: vm.adjustedMktPrice,
                               currentPositionParam: vm.positionFrom
                           });
                }
            }

            if (vm.adjustedOption === 'rollover') {
                // Obtain currently persisted transactions; useful in calculating source & target position 
                // total values, as necessary via updatePosition().
                // TODO: check if vm.positionFrom.transactions not already initialized (~line 123)
                transactionsModalSvc.getAllTransactionsPostEdit(vm.positionFrom.positionId, vm, true);
                transactionsModalSvc.getAllTransactionsPostEdit(vm.positionTo.positionId, vm, false);
            }
        }


        vm.toggleNewAccountCheckBox = function () {
            updateDisplayUponPositionChange(vm.selectedAccountType);
            if (vm.positionFrom.accountType != vm.selectedAccountType) {
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
                alert("Error: Existing account already found for : " + vm.newAccount + ".\nPlease enter a different account type.");
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
            vm.currentFees = 0;
            vm.unitCost = 0;

            return null;
        }
        

        vm.calculateProfitLossAndValuation = function (units, costBasis)
        {
            vm.valuation = parseFloat(units * vm.positionFrom.mktPrice).toFixed(2);
            vm.gainLoss = (vm.valuation - parseFloat(costBasis)).toFixed(2);
        }


        vm.refreshUiValuesFromPosAndTrxs = function (scenario, qty, adjOption) {

            // Position 'Current' UI values reflect saved *aggregate* Transaction data, resulting from latest transaction(s).
            // Utilize varying useage scenarios for calculations.
            switch(scenario) {
                case "initialPageLoad":
                    vm.valuation = parseFloat(transactionsModalSvc.calculateValuation(vm.positionFrom.currentQty, vm.positionFrom.mktPrice)).toFixed(2);
                    vm.costBasis = parseFloat(positionCreateSvc.sumCostBasisFromPersistedTransactions(vm.positionFrom.transactions)).toFixed(2);
                    vm.unitCost = parseFloat(transactionsModalSvc.calculateUnitCost(vm.costBasis, vm.positionFrom.originalQty)).toFixed(3);
                    vm.adjustedMktPrice = vm.positionFrom.mktPrice;
                    vm.positionFrom.originalMktPrice = vm.adjustedMktPrice;
                    vm.gainLoss = parseFloat(vm.valuation - vm.costBasis).toFixed(2);
                    break;
                case "positionChange":
                    // New account, or selection from existing 'Matching accounts'.
                    vm.valuation = parseFloat(transactionsModalSvc.calculateValuation(vm.positionTo.currentQty, vm.positionFrom.mktPrice)).toFixed(2);
                    vm.currentFees = parseFloat(positionCreateSvc.sumFeesFromPersistedTransactions(vm.positionTo.transactions)).toFixed(2);
                    vm.costBasis = parseFloat(positionCreateSvc.sumCostBasisFromPersistedTransactions(vm.positionTo.transactions)).toFixed(2);
                    vm.unitCost = parseFloat(transactionsModalSvc.calculateUnitCost(vm.costBasis, vm.positionTo.currentQty)).toFixed(3);
                    vm.gainLoss = parseFloat(vm.valuation - vm.costBasis).toFixed(2);
                    vm.calculateProfitLossAndValuation(vm.positionTo.currentQty, vm.costBasis);
                    break;
                case "postDbUpdate":
                    // Refresh vm.positionFrom.transactions.
                    incomeMgmtSvc.getAllTransactions(vm.positionFrom.positionId, vm);

                    if (adjOption == "sell") {
                        vm.costBasis = qty > 0 ? (vm.positionFrom.unitCost * qty).toFixed(2) : 0;
                        vm.calculateProfitLossAndValuation(qty, vm.costBasis);
                        break;
                    } else {
                        vm.currentQty = positionCreateSvc.sumQuantityFromPersistedTransactions(vm.positionFrom.transactions, true);
                        vm.valuation = parseFloat(transactionsModalSvc.calculateValuation(vm.currentQty, vm.positionFrom.mktPrice)).toFixed(2);
                        vm.currentFees = parseFloat(positionCreateSvc.sumFeesFromPersistedTransactions(vm.positionFrom.transactions)).toFixed(2);
                        vm.costBasis = parseFloat(positionCreateSvc.sumCostBasisFromPersistedTransactions(vm.positionFrom.transactions)).toFixed(2);
                        vm.unitCost = parseFloat(transactionsModalSvc.calculateUnitCost(vm.costBasis, vm.currentQty)).toFixed(3);
                        vm.gainLoss = parseFloat(vm.valuation - vm.costBasis).toFixed(2);
                        break;
                    }
            }
        }
                

        vm.adjustUnitCost = function (optionSelected) {

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

            return null;
        }


        vm.initializeTransactionVm = function(newPositionPersisted) {
            // When creating a new Position FIRST, then newPositionPersisted = true
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
                // Necessary 'Position' values for upcoming update, e.g., 'Buy', 'Sell', for new Position - no 'Rollover'
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

            // During Position 'edit' scenarios where a new Position is required, i.e., Buy, Rollover,
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
            vm.refreshUiValuesFromPosAndTrxs("initialPageLoad");
        }


        vm.postAsyncPositionUpdates = function (results) {

            if (results.$resolved && !vm.dbUpdateOk) {

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

                vm.refreshUiValuesFromPosAndTrxs("postDbUpdate", 0);

                alert("Position updated successfully.");
                // Temp fix: avoid infinite loop; due to  nested async calls ?
                vm.dbUpdateOk = true;

                // TODO: update with new fixes 5.15.17
                //updateDisplayPostDbUpdate(positionInfo);


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
            // TODO: why is this fx here ?

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

                //var today = new Date();
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
            }

            if (vm.adjustedOption == 'sell') {
                if (responseData.valuation == 0 && responseData.costBasis == 0) {
                    // Full sale.
                    responseData.ReferencedTickerSymbol = vm.positionFrom.tickerSymbol;
                    var posVm = positionCreateSvc.processPositionSale(responseData);
                    positionCreateSvc.processPositionUpdates2(posVm, vm, true);
                } else {
                    // Partial sale.
                    incomeMgmtSvc.getAllTransactions(responseData.transactionPositionId, vm);
                }
            }
            
            return false;
        }


        vm.postAsyncGetAllTransactions = function (allCurrentPosTrxs) {

            // TODO: how does this differ from transactionModalSvc.getAllTransactionsPostEdit() ?
            var updatedPositionVm = positionCreateSvc.calculatePositionTotalsFromTransactions(allCurrentPosTrxs, vm.trxDataEdits);

            if (vm.adjustedOption == "buy")
                updatedPositionVm.Status = "A";

            // Refresh cache post Transaction insert/update.
            vm.positionFrom.transactions = allCurrentPosTrxs;

            positionCreateSvc.processPositionUpdates2(updatedPositionVm, vm);
           
        }


        vm.postAsyncTransactionUpdates = function (status, responseData) {

            if (!status) {
                alert("Error inserting or updating Transaction.");
                return false;
            }

            // Proceed with Position update now.
            //var posVm = positionCreateSvc.getPositionVm();
            //posVm.PositionId = vm.positionFrom.positionId;
            //posVm.UnitCost = 0;
            //posVm.Fees = 0;
            //posVm.Quantity = 0;
            //posVm.LastUpdate = $filter('date')(today, 'M/dd/yyyy');
            //posVm.Status = "A";

            //positionCreateSvc.processPositionUpdates2(posVm, vm, true);

            return false;
        }


        vm.postAsyncGetAllTransactionsPostEdit = function(currentTrxs, isSourceTrxs) {
            if (isSourceTrxs)
                vm.positionFrom.transactions = currentTrxs;
            else {
                vm.positionTo.transactions = currentTrxs;
                vm.refreshUiValuesFromPosAndTrxs("positionChange");
            }
        }


        vm.postAsyncRolloverPostPut = function(response) {
            if (response != null)
                alert("Position rollover processed successfully.");
            else {
                alert("Error processing Position rollover.");
            }
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
                    alert("Invalid quantity entered; \nminimum required entry : 1.");
                    return null;
                }
                vm.newAccountAdded = true;
                vm.positionTo.dBAction = 'insert';
            }
            else {
                // Use existing account from drop down listing.
                vm.positionTo.accountType = vm.selectedAccountType;
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

           
            // Initialize static vm attributes.
            positionInfo.fromPosId = vm.positionFrom.positionId;
            positionInfo.positionFromAccountId = vm.positionFrom.accountTypeId;
            positionInfo.positionAssetId = currentPositionGuids.assetId;
            positionInfo.positionInvestorId = currentPositionGuids.investorId;
            positionInfo.toPurchaseDate = vm.positionFrom.purchaseDate;
            positionInfo.fromPurchaseDate = vm.positionFrom.purchaseDate;
            positionInfo.fromPositionDate = $filter('date')(vm.positionFrom.positionDate, 'M/dd/yyyy');
            positionInfo.toPositionDate = $filter('date')(vm.positionTo.positionDate, 'M/dd/yyyy');

            switch (vm.adjustedOption) {
                case 'rollover':
                    // Handle full or partial conversions.
                    if (vm.adjustedQty <= 0) {
                        alert("Invalid quantity adjustment for rollover. \nMinimum required value: 1.");
                        return null;
                    }

                    if (vm.positionFrom.transactions.length == 0 || vm.positionTo.transactions.length == 0) {
                        alert("Error: Unable to fetch source and/or target transactions for Positions: \n" +
                            vm.positionFrom.positionId + "\n" + vm.positionTo.positionId);
                        return null;
                    }

                    var rolloverData = [];
                    var sourceTrx = positionCreateSvc.getTransactionVm();
                    var sourcePos = positionCreateSvc.getPositionVm();
                    var targetTrx = positionCreateSvc.getTransactionVm();
                    var targetPos = positionCreateSvc.getPositionVm();
                    var persistedCostBasisTotal = 0; 
                    var persistedQtyTotal = 0; 

                    sourceTrx.PositionId = vm.positionFrom.positionId;
                    targetTrx.PositionId = vm.positionTo.positionId;
                    sourceTrx.TransactionId = incomeMgmtSvc.createGuid();
                    targetTrx.TransactionId = incomeMgmtSvc.createGuid();
                    sourceTrx.TransactionEvent = "R";
                    targetTrx.TransactionEvent = "R";
                    sourceTrx.MktPrice = vm.positionFrom.mktPrice;
                    targetTrx.MktPrice = vm.positionFrom.mktPrice;
                    sourceTrx.Fees = 0;
                    targetTrx.Fees = 0;
                    sourceTrx.Units = vm.adjustedQty;
                    targetTrx.Units = vm.adjustedQty; 
                    sourcePos.LoggedInInvestor = vm.positionFrom.investorId;
                    targetPos.LoggedInInvestor = vm.positionFrom.investorId;
                    if (vm.positionFrom.originalQty == vm.adjustedQty) {
                        // Full conversion.
                        sourceTrx.Valuation = 0;
                        sourceTrx.CostBasis = 0;
                        sourceTrx.UnitCost = 0;
                        sourcePos.Qty = 0;
                        sourcePos.UnitCost = 0;
                        sourcePos.Status = "I";
                    } else {
                        // Partial conversion.
                        sourceTrx.Valuation = transactionsModalSvc.calculateValuation(sourceTrx.Units, sourceTrx.MktPrice);
                        sourceTrx.CostBasis = sourceTrx.Valuation;
                        sourceTrx.UnitCost = transactionsModalSvc.calculateUnitCost(sourceTrx.CostBasis, sourceTrx.Units);
                        // We haven't POSTED new source transactions yet, so update with new current values.
                        sourcePos.Qty = vm.positionFrom.originalQty - vm.adjustedQty;
                        persistedCostBasisTotal = positionCreateSvc.sumCostBasisFromPersistedTransactions(vm.positionFrom.transactions);
                        persistedQtyTotal = positionCreateSvc.sumQuantityFromPersistedTransactions(vm.positionFrom.transactions, true);
                        sourcePos.UnitCost = (persistedCostBasisTotal + sourceTrx.CostBasis) / (persistedQtyTotal - vm.adjustedQty);
                    }
                    targetTrx.Valuation = transactionsModalSvc.calculateValuation(vm.adjustedQty, sourceTrx.MktPrice);
                    targetTrx.CostBasis = sourceTrx.Valuation;
                    targetTrx.UnitCost = transactionsModalSvc.calculateUnitCost(targetTrx.CostBasis, vm.adjustedQty);
                    targetPos.Status = "A";
                    targetPos.Qty = vm.positionTo.originalQty + vm.adjustedQty;

                    sourcePos.TransactionFees = positionCreateSvc.sumFeesFromPersistedTransactions(vm.positionFrom.transactions);
                    targetPos.TransactionFees = positionCreateSvc.sumFeesFromPersistedTransactions(vm.positionTo.transactions);
                    persistedCostBasisTotal = positionCreateSvc.sumCostBasisFromPersistedTransactions(vm.positionTo.transactions);
                    persistedQtyTotal = positionCreateSvc.sumQuantityFromPersistedTransactions(vm.positionTo.transactions, false);
                    targetPos.UnitCost = (persistedCostBasisTotal + targetTrx.CostBasis) / (persistedQtyTotal + vm.adjustedQty);
                    sourceTrx.DateCreated = $filter('date')(today, 'M/dd/yyyy');
                    targetTrx.DateCreated = $filter('date')(today, 'M/dd/yyyy');
                    sourcePos.LastUpdate = $filter('date')(today, 'M/dd/yyyy');
                    targetPos.LastUpdate = $filter('date')(today, 'M/dd/yyyy');
                    sourcePos.CreatedPositionId = vm.positionFrom.positionId;
                    targetPos.CreatedPositionId = vm.positionTo.positionId;
                    sourcePos.DateOfPurchase = vm.positionFrom.purchaseDate;
                    targetPos.DateOfPurchase = vm.positionTo.purchaseDate; 
                    sourcePos.DatePositionAdded = vm.positionFrom.positionDate;
                    targetPos.DatePositionAdded = vm.positionFrom.positionDate;
                    sourcePos.PostEditPositionAccount = vm.positionFrom.accountTypeId;
                    targetPos.PostEditPositionAccount = vm.positionTo.accountTypeId;
                    sourcePos.ReferencedAssetId = vm.positionFrom.assetId;
                    targetPos.ReferencedAssetId = vm.positionFrom.assetId;

                    rolloverData.push(sourceTrx);
                    rolloverData.push(sourcePos);
                    rolloverData.push(targetTrx);
                    rolloverData.push(targetPos);

                    positionCreateSvc.processPositionRollover(rolloverData, vm);
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
                    } else {
                        // Adding shares to an EXISTING account w/o involving a 'rollover'.
                        if (parseInt(vm.adjustedQty) == 0) {
                            alert("Invalid quantity; \nminimum purchase quantity required: 1.");
                            return null;
                        }

                        // 5.9.17 - Revision due to new transactions functionality.
                        this.initializeTransactionVm(false);
                        transactionsModalSvc.insertTransactionTable(vm.trxDataEdits, vm);
                    }
                    positionInfo.adjustedOption = vm.adjustedOption;
                    vm.refreshUiValuesFromPosAndTrxs("postDbUpdate", 0, "buy"); 
                    break;
                case 'sell':
                    if (parseInt(vm.adjustedQty) == 0 || parseInt(vm.adjustedQty) < 0 ) {
                        alert("Invalid quantity; \nminimum sell quantity must be at least 1 or /may not exceed total shares.");
                        return null;
                    }
                    var trxUnitsBalance = vm.positionFrom.currentQty - vm.adjustedQty;
                    /*  Valid transaction model for POST.
                        {
                            PositionId: "a916caca-0df4-4bd5-8fc8-a73f00f0eb02",
                            TransactionId: "fe5772e4-19ae-4acc-9a5b-a7820106d864",
                            TransactionEvent: "S",
                            Units: 26,   
                            MktPrice: 152.850, 
                            Fees: 72.11, 
                            UnitCost: 155.623,
                            CostBasis: 4046.21,
                            Valuation: 3974.10
                        }
                    */

                    this.initializeTransactionVm(false);
                    vm.trxDataEdits.TransactionEvent = "S";
                    vm.trxDataEdits.Units = vm.adjustedQty;
                    if (trxUnitsBalance > 0) {
                        vm.trxDataEdits.Valuation = transactionsModalSvc.calculateValuation(vm.trxDataEdits.Units, vm.trxDataEdits.MktPrice);
                        vm.trxDataEdits.CostBasis = transactionsModalSvc.calculateCostBasis(vm.trxDataEdits.Valuation, vm.trxDataEdits.Fees);
                        vm.trxDataEdits.UnitCost = transactionsModalSvc.calculateUnitCost(vm.trxDataEdits.CostBasis, vm.trxDataEdits.Units);
                        vm.trxDataEdits.PositionStatus = "A";
                    } else {
                        vm.trxDataEdits.Valuation = 0;
                        vm.trxDataEdits.CostBasis = 0;
                        vm.trxDataEdits.UnitCost = 0;
                        vm.trxDataEdits.PositionStatus = "I";
                    }

                    // Now send trx to be persisted; afterward, Position values should be assigned.
                    transactionsModalSvc.insertTransactionTable(vm.trxDataEdits, vm);
                    break;
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

            return null;
        }


        
    }
  

}());