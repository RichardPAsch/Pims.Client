(function () {

    /* 
        Component for all position-related CRUD functionality. 
    */

    // TODO: 12.2.16 -  ALL functionality related to Positions should be moved here from incomeCreateSvc. RETEST incrementally.

    "use strict";

    angular
       .module("incomeMgmt.core")
       .factory("positionCreateSvc", positionCreateSvc);

    positionCreateSvc.$inject = ["$resource", 'appSettings', '$filter', 'transactionsModalSvc'];


    function positionCreateSvc($resource, appSettings, $filter, transactionsModalSvc) {

        var vm = this;
        var today = new Date();
        vm.baseUrl = appSettings.serverPath + "/Pims.Web.Api/api/";
        vm.accountTypes = [];
        vm.investorPositionData = [];
        vm.investorTickers = [];
        vm.investorMatchingAccounts = [];

        

        function getPositionsForTicker(searchTicker, ctrl) {
            // Positions fetch via modal dialog submitted ticker symbol search.
            // ctrl parameter = pimsGridCtrl.
            var positionsUrl = appSettings.serverPath + "/Pims.Web.Api/api/Asset/" + searchTicker + "/Position/Edit";

            $resource(positionsUrl).query().$promise.then(function (response) {
                vm.investorPositionData = response;
                ctrl.initializePositionsGrid(vm.investorPositionData);
            }, function (err) {
                if (err.status == 400 || err.status == 500) {  
                    alert("No position(s) found matching ticker: " + searchTicker);
                    ctrl.clearPosition();
                }
            });

        }
        

        function updateRevenueAcctType(currentPositionId, editedIncome, ctrl) {

            var incomeAcctTypeUpdateUrl = appSettings.serverPath + "/Pims.Web.Api/api/Position/" + currentPositionId;
            editedIncome.URL = appSettings.serverPath + "/Pims.Web.Api/api/Asset/" + editedIncome.tempTicker + "/Position/" + editedIncome.tempAcctType;

            delete editedIncome.tempAcctType;
            delete editedIncome.tempTicker;

            // Create 'update' method.
            var resourceObj = $resource(incomeAcctTypeUpdateUrl,
                                    null, // NO default parameter values necessary.
                                    {
                                        'update': { method: 'PATCH' }
                                    });

            resourceObj.update(null, editedIncome).$promise.then(function (response) {
                ctrl.postAsyncAcctTypeUpdate(response);
            }, function (ex) {
                ctrl.postAsyncAcctTypeUpdate(ex.data.message);
            });

        }
        
    
        function getPositionData() {

            // All Positions for all Assets per investor.
            var positionsUrl = vm.baseUrl + "Positions";

            // Returns expected promise to ui-routers' resolve().
            return $resource(positionsUrl).query().$promise;
            
        }


        function getUniqueTickers(positions) {

            var tickerSymbolsOnly = [];
            var uniqueTickers = [];

            for (var x = 0; x <= positions.length - 1; x++) {
                tickerSymbolsOnly.push(positions[x].positionTickerSymbol);
            }

            tickerSymbolsOnly.sort();

            for (var i = 0; i <= tickerSymbolsOnly.length - 1; i++) {
                if (i >= 1 && tickerSymbolsOnly[i] != tickerSymbolsOnly[i-1] ) {
                    uniqueTickers.push(tickerSymbolsOnly[i]);
                } else {
                    if (i == 0)
                        uniqueTickers.push(tickerSymbolsOnly[i]);
                }
            }

            return uniqueTickers;
        }


        function getMatchingAccounts(tickerToMatch, positionsCollection) {
            var filteredAccounts = [];
            var lastAccountTypeAdded = "";
            positionsCollection = sortObjectArray(positionsCollection);

            for (var i = 0; i <= positionsCollection.length - 1; i++) {
                if (positionsCollection[i].positionTickerSymbol == tickerToMatch) {
                    if (filteredAccounts.length == 0 || positionsCollection[i].positionAccountType != lastAccountTypeAdded) {
                        lastAccountTypeAdded = positionsCollection[i].positionAccountType;
                        filteredAccounts.push(positionsCollection[i].positionAccountType.trim().toUpperCase());
                    }
                }
            }
            return filteredAccounts;
        }


        function getAssetId(positions, ticker) {
            for (var i = 0; i < positions.length - 1; i++) {
                if (positions[i].positionTickerSymbol == ticker) {
                    return positions[i].positionAssetId;
                }
            }
            return 0;
        }


        function getPositionAddDate(positionsToSearch, ticker, acctType) {
            // positionsToSearch passed via getPositionData() in controller.
            var posDate = "";

            for (var pos = 0; pos < positionsToSearch.length; pos++) {
                if (positionsToSearch[pos].positionTickerSymbol == ticker && positionsToSearch[pos].positionAccountType == acctType) {
                    posDate = positionsToSearch[pos].positionAddDate;
                    break;
                }
            }
            return posDate;
        }


        function getPositionFees(positionsToSearch, ticker, acctType) {
            var posFees = 0;

            for (var pos = 0; pos < positionsToSearch.length; pos++) {
                if (positionsToSearch[pos].positionTickerSymbol == ticker && positionsToSearch[pos].positionAccountType == acctType) {
                    posFees = positionsToSearch[pos].positionFees;
                    break;
                }
            }
            return posFees;
        }

        
        function getMatchingAccountTypeIndex(acctTypesToSearch, acctTypeSelected) {

            for (var i = 0; i <= acctTypesToSearch.length - 1; i++) {
                if (acctTypesToSearch[i].trim().toUpperCase() == acctTypeSelected.trim().toUpperCase())
                    return i;
            }
            return -1;
        }


        function getCurrentMarketUnitPrice(ctrl, tickerSearch) {
            // TODO: Consolidate functionality into incomeMgmtSvc; used here & via asset create profile.
            // $resource(appSettings.serverPath + "/Pims.Web.Api/api/Profile/:tickerSymbol");
            var profileUrl = appSettings.serverPath + "/Pims.Web.Api/api/Profile/" + tickerSearch;
            var resourceObj = $resource(profileUrl);

            resourceObj.get().$promise.then(function (response) {
                var profile = response;
                ctrl.postAyncProfileFetch(profile);
            }, function () {
                ctrl.postAyncProfileFetch(null);
            });

        }


        function sortObjectArray(items) {
            // sort by account type
            items.sort(function (obj1, obj2) {
                var acctA = obj1.positionAccountType.toUpperCase(); 
                var acctB = obj2.positionAccountType.toUpperCase(); 
                if (acctA < acctB) {
                    return -1;
                }
                if (acctA > acctB) {
                    return 1;
                }

                // names must be equal
                return 0;
            });
            return items;
        }


        function setInvestorMatchingAccounts(positionsForTicker) {
            vm.investorMatchingAccounts = positionsForTicker;
        }


        function getInvestorMatchingAccounts() {
            return vm.investorMatchingAccounts;
        }


        function checkIsValidAccountChange(oldAccount, newAccount) {
            // TODO: 'ML-CMA' should be 'CMA' to allow for generic non-ML use.
            // Includes check for no change in Position account type.
            if ( (oldAccount.toUpperCase().trim() == "IRA" && newAccount.toUpperCase().trim() == "ROTH-IRA") ||
                 (oldAccount.toUpperCase().trim() == newAccount.toUpperCase().trim()) ||
                 (oldAccount.toUpperCase().trim() == "401(k)" && newAccount.toUpperCase().trim() == "IRA") || 
                 (oldAccount.toUpperCase().trim() == "ML-CMA" && newAccount.toUpperCase().trim() == "ROTH-IRA") ||
                 (oldAccount.toUpperCase().trim() == "ML-CMA" && newAccount.toUpperCase().trim() == "IRA") ||
                 (oldAccount.toUpperCase().trim() == "SEP" && newAccount.toUpperCase().trim() == "ROTH-IRA") ||
                 (oldAccount.toUpperCase().trim() == "SEP" && newAccount.toUpperCase().trim() == "IRA") ||
                 (oldAccount.toUpperCase().trim() == "SIMPLE IRA" && newAccount.toUpperCase().trim() == "ROTH-IRA") ||
                 (oldAccount.toUpperCase().trim() == "SIMPLE IRA" && newAccount.toUpperCase().trim() == "IRA") ||
                 (oldAccount.toUpperCase().trim() == "403(b)" && newAccount.toUpperCase().trim() == "IRA"))
                return true;
            else {
                return false;
            }
        }


        function getGuidsForPosition(positions, positionId) {
            var guidInfo = {};
            for (var i = 0; i < positions.length; i++) {
                if (positions[i].positionId == positionId) {
                    guidInfo.accountTypeId = positions[i].positionAccountTypeId;
                    guidInfo.assetId = positions[i].positionAssetId;
                    guidInfo.investorId = positions[i].positionInvestorId;
                    break;
                }
            }
            return guidInfo;
        }


        function processPositionUpdates(newAndOrEditedPositions, ctrl) {

            var actionsTaken = "";
            var positionCreateUpdateUrl;
            var resourceObj;

            switch (newAndOrEditedPositions.dbActionOrig, newAndOrEditedPositions.dbActionNew) {
                case "update", "update":
                    actionsTaken = "update-update";
                    break;
                case "update", "insert":
                    actionsTaken = "update-insert";
                    break;
                case "update", "na":
                    actionsTaken = "update-na";
                    break;
                case "insert", "na":
                    actionsTaken = "insert-na";
                    break;
            }

            positionCreateUpdateUrl = appSettings.serverPath + "/Pims.Web.Api/api/Positions/UpdateCreate";
            resourceObj = $resource(positionCreateUpdateUrl,
                            null,
                            {
                                'update': { method: 'PATCH' }
                            });

            resourceObj.update(null, newAndOrEditedPositions).$promise.then(function (response) {
                ctrl.postAsyncPositionUpdates(response, actionsTaken);
            }, function (ex) {
                ctrl.postAsyncPositionUpdatesError(ex.statusText);
            });
        }


        function getMatchingAccountTypeId(accountTypes, searchAccountType) {
            
            for (var acct = 0; acct < accountTypes.length; acct++) {
                if (accountTypes[acct].accountTypeDesc.toUpperCase().trim() == searchAccountType.toUpperCase().trim()) {
                    return accountTypes[acct].keyId;
                }
            }
        }


       
        /*  == 5.3.2017 ==
            New (simplified ?) functions reflecting existence of Transactions implementation.
        */

        function getPositionVm() {

            return {
                PreEditPositionAccount: "",
                PostEditPositionAccount: "",
                Qty: 0,
                UnitCost: 0,
                DateOfPurchase: "",
                LastUpdate: "",
                Url: "",
                LoggedInInvestor: "",
                ReferencedAccount: null,
                CreatedPositionId: "",
                ReferencedAssetId: "",
                ReferencedTickerSymbol: "",
                DatePositionAdded: "",
                Status: "A",
                TransactionFees: 0
            }
        }

        function getPositionModel() {

            // TODO: Position.UpdatePosition(position) is inconsistent re: WebApi signature for the ctrl.
            // 5.31.2017: Updated to match WebApi expected Position parameter; may be
            // extended, as minimum required data for update is as follows:
            return {
                PositionId: "",
                UnitCost: 0,
                Fees: 0,
                Quantity: 0,
                Status: ""
            }
        }


        function processPositionUpdates2(positionData, ctrl, useTickerSymbol) {

            var resourceObj; 
            var positionCreateUpdateUrl; 
            
            if (useTickerSymbol) {
                // WebApi: PositionController.UpdatePosition().
                positionCreateUpdateUrl = appSettings.serverPath + "/Pims.Web.Api/api/Asset/"
                                                                 + positionData.ReferencedTickerSymbol
                                                                 + "/Position/" + positionData.PositionId;
            } else {
                // WebApi: PositionController.UpdateCreateEditedPositions().
                positionCreateUpdateUrl = appSettings.serverPath + "/Pims.Web.Api/api/Positions/UpdateCreate";
            }

            resourceObj = $resource(positionCreateUpdateUrl,
                            null,
                            {
                                'update': { method: 'PATCH' }
                            });

            resourceObj.update(null, positionData).$promise.then(function (response) {
                ctrl.postAsyncPositionUpdates(response);
            }, function (ex) {
                ctrl.postAsyncPositionUpdates(ex.statusText);
            });
        }


        function processPositionSale(postSaveTrxData) {

            var positionViewModel = this.getPositionModel();
            positionViewModel.PositionId = postSaveTrxData.transactionPositionId;
            positionViewModel.ReferencedTickerSymbol = postSaveTrxData.ReferencedTickerSymbol; // extended
            positionViewModel.LastUpdate = $filter('date')(today, 'M/dd/yyyy');

            if (postSaveTrxData.valuation == 0 && postSaveTrxData.costBasis == 0) {
                // Position units: full sale
                positionViewModel.Quantity = 0;
                positionViewModel.Fees = 0;
                positionViewModel.UnitCost = 0;
                positionViewModel.Status = "I";
            } else {
                // Position units: partial sale
                positionViewModel.Quantity = postSaveTrxData.units;
                positionViewModel.Fees = postSaveTrxData.fees;
                positionViewModel.UnitCost = postSaveTrxData.unitCost;
                positionViewModel.Status = "A";
            }

            return positionViewModel;
        }


        function savePosition(vmToSave, ctrl) {
                        
            var positionUrl = vm.baseUrl + "Asset/" + vmToSave.ReferencedTickerSymbol + "/Position";

            $resource(positionUrl).save(vmToSave).$promise.then(function (responseData) {
                ctrl.postAsyncPositionSave(true, responseData.positionId);
            }, function () {
                ctrl.postAsyncPositionSave(false);
            });
        }

        
        function calculatePositionTotalsFromTransactions(positionTransactions, transactionVm) {
            var qtySubTotal = 0;
            var feesSubTotal = 0;
            var costBasisSubTotal = 0;
            var positionViewModel = this.getPositionVm();

            for (var t = 0; t < positionTransactions.length; t++) {
                if (positionTransactions[t].transactionEvent.trim() == "B") // 'Buy'
                    qtySubTotal += positionTransactions[t].units;
                else {
                    qtySubTotal -= positionTransactions[t].units;
                }
                feesSubTotal += positionTransactions[t].fees;
                costBasisSubTotal += positionTransactions[t].costBasis;
            }

            positionViewModel.Quantity = qtySubTotal;
            positionViewModel.Fees = feesSubTotal;
            positionViewModel.LastUpdate = $filter('date')(today, 'M/dd/yyyy');
            positionViewModel.UnitCost = transactionsModalSvc.calculateUnitCost(costBasisSubTotal, qtySubTotal);

            if (transactionVm != undefined) {
                // Initialize from 'transactionVm' for upcoming 'Position' persistence. 'transactionVm' represents
                // a saved transaction resulting from a 'Buy' operation, where shares were added to an existing account.
                positionViewModel.MarketPrice = transactionVm.MktPrice;    // req'd for ModelState validation.
                positionViewModel.PurchaseDate = transactionVm.PositionPurchaseDate;
                positionViewModel.PositionDate = transactionVm.PositionDate;
                positionViewModel.PositionId = transactionVm.PositionId;
                positionViewModel.PositionAssetId = transactionVm.PositionAssetId;
                positionViewModel.AcctTypeId = transactionVm.PositionAcctTypeId;
                positionViewModel.ReferencedTickerSymbol = transactionVm.PositionTickerSymbol;
                positionViewModel.InvestorKey = transactionVm.PositionInvestorId;
            } else {
                // Initialization resulting from transaction 'Edit' mode.
                positionViewModel.PositionId = positionTransactions[0].positionId;
                positionViewModel.Status = "A";
                positionViewModel.ReferencedTickerSymbol = positionTransactions[0].tickerSymbol;
            }

            return positionViewModel;
        }


        

        // API
        return {
            updateRevenueAcctType: updateRevenueAcctType,
            getPositionData: getPositionData,
            getUniqueTickers: getUniqueTickers,
            getMatchingAccounts: getMatchingAccounts,
            getAssetId: getAssetId,
            getPositionAddDate: getPositionAddDate,
            getPositionsForTicker: getPositionsForTicker,
            getMatchingAccountTypeIndex: getMatchingAccountTypeIndex,
            getCurrentMarketUnitPrice: getCurrentMarketUnitPrice,
            checkIsValidAccountChange: checkIsValidAccountChange,
            setInvestorMatchingAccounts: setInvestorMatchingAccounts,
            getInvestorMatchingAccounts: getInvestorMatchingAccounts,
            getGuidsForPosition: getGuidsForPosition,
            processPositionUpdates: processPositionUpdates,
            getMatchingAccountTypeId: getMatchingAccountTypeId,
            getPositionFees: getPositionFees,
            getPositionVm: getPositionVm,
            getPositionModel: getPositionModel,
            processPositionUpdates2: processPositionUpdates2,
            savePosition: savePosition,
            calculatePositionTotalsFromTransactions: calculatePositionTotalsFromTransactions,
            processPositionSale: processPositionSale
        }

    }



}());