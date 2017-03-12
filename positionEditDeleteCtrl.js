﻿(function () {

    "use strict";

    angular
        .module("incomeMgmt.positionEditDelete")
        .controller("positionEditDeleteCtrl", positionEditDeleteCtrl);

    positionEditDeleteCtrl.$inject = ['$state', '$filter', 'positionCreateSvc', 'incomeMgmtSvc', 'allPositions', 'incomeCreateSvc'];


    function positionEditDeleteCtrl($state, $filter, positionCreateSvc, incomeMgmtSvc, allPositions, incomeCreateSvc) {

        var vm = this;
        vm.ticker = $state.params.positionSelectionObj.TickerSymbol;
        

        // Encapsulate individual position changes--where applicable. 
        // vm.positionFrom/positionTo -> mapped to positionInfo (vm) for WebApi calls.
        // ** 'positionTo' initialized only in new, or rollover to existing Position scenarios. **
        vm.positionFrom = {
            mktPrice: positionCreateSvc.getCurrentMarketUnitPrice(vm, vm.ticker.toUpperCase().trim()),
            dBAction: "",
            accountType: $state.params.positionSelectionObj.AcctType,
            originalQty: $state.params.positionSelectionObj.Qty,
            adjustedQty: 0,  // units to increment/decrement
            currentQty: 0,   // aka qty balance, post-edit
            unitCost: 0,
            lastUpdate: "",
            positionId: "",
            status: "A", // (A)ctive / (I)nactive
            positionDate: "",
            dateUpdated: "",
            purchaseDate: "",
            accountTypeId: ""
        };
        vm.positionTo = {
            mktPrice: 0,
            dBAction: "",
            accountType: $state.params.positionSelectionObj.AcctType,
            originalQty: 0,
            adjustedQty: 0,  
            currentQty: 0, //originalQty + adjustedQty
            unitCost: 0,
            lastUpdate: "",
            positionId: "",
            status: "A",
            positionDate: "",
            dateUpdated: "",
            purchaseDate: "",
            accountTypeId: ""
        };
        
        // Data-binding & flags.
        vm.matchingAccountChanged = false;
        vm.newAccountAdded = false;
        vm.showNewAccountInput = false;
        vm.matchingAccountsDisabled = false;
        vm.newAccountDisabled = false;
        vm.unitCostDisabled = false;
        vm.adjDateDisabled = false;
        vm.updateBtnDisabled = true;
        vm.accountPlaceHolder = "Enter a new Position account for " + vm.ticker.toUpperCase().trim() + "...";
        vm.originalPositionDbAction = "";
        vm.newPositionDbAction = "";
        vm.adjustedOption = ""; // edit
        vm.selectedAccountType = $state.params.positionSelectionObj.AcctType;
        vm.currentQty = $state.params.positionSelectionObj.Qty;
        vm.adjustedQty = 0; // changed from 1, check this doesn't cause bugs
        vm.adjustedUnitCost = 0;
        vm.unitCost = $state.params.positionSelectionObj.UnitCost.toFixed(2);
        vm.positionDate = $state.params.positionSelectionObj.PositionAddDate;
        vm.positionAdjDate = $filter('date')(vm.positionDate, 'M/dd/yyyy');
        vm.lastUpdate = incomeMgmtSvc.formatDate($state.params.positionSelectionObj.LastUpdate);
        vm.allValidAccountTypes = [];
        vm.matchingAccountTypes = positionCreateSvc.getMatchingAccounts(vm.ticker, allPositions);
        vm.selectedAccountType = vm.matchingAccountTypes[positionCreateSvc.getMatchingAccountTypeIndex(vm.matchingAccountTypes, vm.selectedAccountType)];


        // Cache: 1) applicable pre-edit Position attributes, and 
        //        2) existing Position Guids for selected ticker.
        vm.positionFrom.accountType = vm.selectedAccountType.matchedAccountType;
        vm.positionFrom.currentQty = $state.params.positionSelectionObj.Qty;
        vm.positionFrom.originalQty = vm.positionFrom.currentQty;
        vm.positionFrom.positionId = $state.params.positionSelectionObj.PositionId;
        vm.positionFrom.unitCost = vm.unitCost;
        vm.positionFrom.positionDate = $state.params.positionSelectionObj.PositionAddDate;
        vm.positionFrom.purchaseDate = $state.params.positionSelectionObj.PurchDate;
        // Asset, account, & investor Guids.
        var currentPositionGuids = positionCreateSvc.getGuidsForPosition(allPositions, vm.positionFrom.positionId);
        vm.positionFrom.accountTypeId = currentPositionGuids.accountTypeId;

       
        var allPositionsForAsset = [];
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
                        vm.unitCost = allPositionsForAsset[pos].unitCost;
                        vm.positionTo.unitCost = vm.unitCost;
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
            switch(positionVm.adjustedOption) {
                case "buy":
                    if (positionVm.dbActionNew == "insert") {
                        vm.positionTo.currentQty = positionVm.toQty;
                        vm.positionTo.unitCost = positionVm.toUnitCost;
                        vm.calculateCostBasis("positionChange", vm.currentQty, positionVm.adjustedOption);
                        vm.positionDate = positionVm.toPositionDate;
                    } else {
                        // update
                        vm.positionFrom.mktPrice = positionVm.fromUnitCost;
                        vm.currentQty = positionVm.fromQty;
                        vm.calculateCostBasis("postDbUpdate", vm.currentQty, positionVm.adjustedOption);
                        vm.positionDate = positionVm.fromPositionDate;
                    }
                    break;
                case "rollover":
                        vm.positionTo.currentQty = positionVm.toQty;
                        vm.currentQty = positionVm.toQty;
                        vm.positionTo.unitCost = positionVm.toUnitCost;
                        vm.calculateCostBasis("positionChange", vm.currentQty, positionVm.adjustedOption);
                        vm.positionDate = positionVm.toPositionDate;
                    break;
                case "edit":
                case "sell":
                    vm.positionFrom.unitCost = positionVm.fromUnitCost;
                    vm.currentQty = positionVm.fromQty;
                    vm.calculateCostBasis("postDbUpdate", vm.currentQty, positionVm.adjustedOption);
                    break;
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
            vm.unitCostDisabled = vm.adjustedOption == 'edit' ? false : true;
            vm.adjDateDisabled = vm.adjustedOption == 'edit' ? false : true;
            vm.updateBtnDisabled = false;
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
            // Utilize varying useage scenarios for calculations.
            switch(scenario) {
                case "initialPageLoad":
                    vm.costBasis = (vm.positionFrom.unitCost * vm.positionFrom.originalQty).toFixed(2);
                    vm.calculateProfitLossAndValuation(vm.positionFrom.currentQty, vm.costBasis);
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
                        vm.costBasis = (vm.positionFrom.unitCost * qty).toFixed(2);
                        vm.calculateProfitLossAndValuation(qty, vm.costBasis);
                        break;
                    }
            }
        }


        vm.positionEditContainsAccountChange = function () {
            return vm.selectedAccountType.matchedAccountType.toUpperCase().trim() == vm.positionFrom.accountType.toUpperCase().trim() && vm.showNewAccountInput == false
                ? false
                : true;
        }
        
        
        vm.checkUnitCost = function (optionSelected) {

            if ((optionSelected == 'rollover' || optionSelected == 'sell')) {
                if (vm.adjustedQty > vm.positionFrom.originalQty) {
                    alert("Invalid entry; \quantity adjustment nmay not exceed original quantity.");
                    return false;
                }
            }
           
            if (optionSelected == 'rollover') {
                // Unit cost MUST equal current market price in this scenarion, and
                // is therefore read-only - per SEC rules.
                vm.adjustedUnitCost = vm.positionFrom.mktPrice;
                vm.unitCostDisabled = true;
                vm.positionTo.adjustedQty = vm.adjustedQty;
            } else {
                vm.unitCostDisabled = false;
                if(optionSelected == 'edit') {
                    vm.adjustedUnitCost = vm.positionFrom.unitCost;
                } else {
                    vm.adjustedUnitCost = vm.positionFrom.mktPrice; // added 1.17.2017
                }
            }
            var today = new Date();
            vm.positionAdjDate = incomeMgmtSvc.formatDate(today);
            return null;
        }





        /* -- Service async callbacks -- */
        vm.postAyncProfileFetch = function (profileData) {
            vm.positionFrom.mktPrice = parseFloat(profileData.price).toFixed(2);
            vm.calculateCostBasis("initialPageLoad");
        }


        vm.postAsyncPositionUpdate = function (results) {
            if (results.$resolved)
                alert("Position(s) updated successfully.");
            else {
                alert("Error updating Position(s).");
            }
        }


        vm.postAsyncPositionUpdates = function (results, actionsRequested) {
            if (results.$resolved) {

                // actionsRequested : "fromPosition + toPosition" regarding
                // successful db record action(s) to be taken.
                switch (actionsRequested) {
                    case "update-update":
                        alert("Positions updated successfully.");
                        break;
                    case "update-insert":
                        alert("Positions updated & created successfully.");
                        break;
                    case "update-na":
                        alert("Position edit updated successfully.");
                        break;
                    case "insert-na":
                        alert("Position created successfully.");
                        break;
                }
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

            if (accountTypeDescriptions.indexOf(vm.newAccount.trim().toUpperCase()) == -1 || vm.newAccount.trim().toUpperCase() == "Select...")
                alert("Invalid account type entry; check spelling.");

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

            // In all scenarios except "Buy/Sell", we'll be updating the original Position.
            if (vm.adjustedOption != 'buy') {
                vm.positionFrom.dBAction = "update";
            } 

            // Initialize static vm attributes.
            var today = new Date();
            positionInfo.fromPosId = vm.positionFrom.positionId;
            positionInfo.positionFromAccountId = vm.positionFrom.accountTypeId;
            positionInfo.positionAssetId = currentPositionGuids.assetId;
            positionInfo.positionInvestorId = currentPositionGuids.investorId;
            positionInfo.toPurchaseDate = vm.positionFrom.purchaseDate;
            positionInfo.fromPurchaseDate = vm.positionFrom.purchaseDate;
            positionInfo.fromPositionDate = $filter('date')(vm.positionFrom.positionDate, 'M/dd/yyyy');
            positionInfo.toPositionDate = $filter('date')(vm.positionTo.positionDate, 'M/dd/yyyy');


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
                        // Adding shares to a NEW account w/o involving a 'rollover'.
                        positionInfo.positionFromAccountId = incomeMgmtSvc.createGuid();
                        positionInfo.positionToAccountId = vm.positionTo.accountTypeId;
                        positionInfo.dbActionOrig = "na";
                        positionInfo.toQty = parseInt(vm.adjustedQty);
                        vm.currentQty = positionInfo.toQty;
                        positionInfo.toUnitCost = vm.positionFrom.mktPrice;
                        positionInfo.toPositionStatus = "A";
                        positionInfo.toPositionDate = $filter('date')(today, 'M/dd/yyyy');
                        positionInfo.dbActionNew = "insert";
                        positionInfo.toPosId = incomeMgmtSvc.createGuid();
                        positionInfo.fromPositionStatus = "na";
                        positionInfo.fromUnitCost = 0;
                        positionInfo.fromQty = 0;
                    } else {
                        // Adding shares to an EXISTING account w/o involving a 'rollover'.
                        if (parseInt(vm.adjustedQty) == 0) {
                            alert("Invalid quantity; \nminimum purchase quantity required = 1.");
                            return null;
                        }
                        vm.positionFrom.dBAction = 'update';
                        vm.positionTo.dBAction = 'na';
                        vm.positionFrom.originalQty = vm.currentQty;
                        vm.positionFrom.currentQty = vm.positionFrom.originalQty + parseInt(vm.adjustedQty);
                        positionInfo.fromQty = vm.positionFrom.currentQty;
                        positionInfo.toQty = 0;
                        positionInfo.fromUnitCost = vm.positionFrom.mktPrice;
                        positionInfo.fromPositionStatus = "A";
                        positionInfo.toPositionStatus = "na";
                        positionInfo.dbActionOrig = vm.positionFrom.dBAction;
                        positionInfo.dbActionNew = "na";
                        positionInfo.toPositionDate = "na";
                        positionInfo.toPosId = "na";
                        positionInfo.positionToAccountId = "na";
                        positionInfo.toUnitCost = 0;
                    }
                    positionInfo.adjustedOption = vm.adjustedOption;
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
                    positionInfo.dbActionOrig = "update";
                    positionInfo.fromPositionStatus = "A";
                    positionInfo.toPositionStatus = "na";
                    positionInfo.fromUnitCost = vm.positionFrom.unitCost;
                    positionInfo.toUnitCost = 0;
                    // Quantity increments/decrements to original quantity.
                    positionInfo.fromQty = vm.currentQty + parseInt(vm.adjustedQty);
                    if (positionInfo.fromQty <= 0) {
                        alert("Invalid quantity adjustment; \nresulting calculated quantity: " + parseInt(positionInfo.fromQty));
                        return null;
                    }
                    positionInfo.fromPositionDate = $filter('date')(vm.positionFrom.positionDate, 'M/dd/yyyy');
                    positionInfo.toPositionDate = $filter('date')(today, 'M/dd/yyyy');
                    positionInfo.positionToAccountId = "na";
                    positionInfo.toQty = 0;
                    positionInfo.adjustedOption = vm.adjustedOption;
                    positionInfo.dbActionNew = "na";
                    positionInfo.toPosId = incomeMgmtSvc.createGuid();
                    positionInfo.positionToAccountId = incomeMgmtSvc.createGuid();
                    break;
            }

          
            // Initialize to satisfy WebApi model-state validation. 
            if (positionInfo.toPosId == "na" && positionInfo.dbActionNew == "na") {
                positionInfo.toPosId = incomeMgmtSvc.createGuid();
                positionInfo.positionToAccountId = incomeMgmtSvc.createGuid();
                positionInfo.toPositionDate = $filter('date')(today, 'M/dd/yyyy');
            }
                

            /* Debug info */

            //alert("positionInfo Confirmation Results: "
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
            //   );


            positionCreateSvc.processPositionUpdates(positionInfo, vm);

            return null;
        }


        
    }
  

}());