(function () {

   "use strict";

    angular
       .module("incomeMgmt.core")
       .factory("transactionsModalSvc", transactionsModalSvc);

    transactionsModalSvc.$inject = ["$resource", 'appSettings'];


    function transactionsModalSvc($resource, appSettings) {

        var vm = this;
        vm.baseUrl = appSettings.serverPath + "/Pims.Web.Api/api/";
        vm.transactionData = createTransactionVm();


        function createTransactionVm() {

            return {
                PositionId: "",
                TransactionId: "",
                TransactionEvent: "",
                Units: 0,
                MktPrice: 0,
                Fees: 0,
                UnitCost: 0,
                CostBasis: 0,
                Valuation: 0,
                Date: "",
                PositionQty: 0,         //  Cumlative value to be persisted in Position table   
                PositionCostBasis: 0,   //  Cumlative value to be persisted in Position table 
                PositionUnitCost: 0     //  Cumlative value to be persisted in Position table   
            };
        }


        function updateTransaction(editedTrxs, ctrl) {

            // Ex: http://localhost/Pims.Web.Api/api/PositionTransactions/a96f7eb2-feef-458d-950b-183d97458315
            var transactionsUpdateUrl = vm.baseUrl + "PositionTransactions/";

            for (var i = 0; i < editedTrxs.length; i++) {
                transactionsUpdateUrl += editedTrxs[i].TransactionId;

                var resourceObj = $resource(transactionsUpdateUrl,
                           null,
                           {
                               'update': { method: 'PATCH' }
                           });

                resourceObj.update(null, editedTrxs[i]).$promise.then(function (response) {
                    ctrl.postAsyncTransactionUpdates(response);
                }, function (ex) {
                    ctrl.postAsyncTransactionUpdates(ex.data.messageDetail);
                });
            }
        }


        function updateTransactions(editedTrxs, ctrl) {

            // One or more 'edit' trxs to be updated.
            // Ex: http://localhost/Pims.Web.Api/api/PositionTransactions
            var transactionsUpdateUrl = vm.baseUrl + "PositionTransactions";
            
            var resourceObj = $resource(transactionsUpdateUrl,
                        null,
                        {
                            'update': { method: 'PATCH' }
                        });

            resourceObj.update(null, editedTrxs).$promise.then(function (response) {
                ctrl.postAsyncTransactionUpdates(response);
            }, function (ex) {
                ctrl.postAsyncTransactionUpdates(ex.data.messageDetail);
            });
        }


        function insertTransactionTable(trxDataEdits, ctrl) {
            
            // Ex: http://localhost/Pims.Web.Api/api/PositionTransactions
            var transactionsCreateUrl = vm.baseUrl + "PositionTransactions/";

            // Position 'Buy'/'Sell' mode - one or more trx records.
            if (trxDataEdits.length == undefined) {
                    var singleResourceObj = $resource(transactionsCreateUrl);

                    singleResourceObj.save(null, trxDataEdits).$promise.then(function(resultData) {
                        ctrl.postAsyncTransactionInsert(true, resultData); 
                    }, function () {
                        ctrl.postAsyncTransactionInsert(false);
                    });
            } else {
                // Position 'edit' mode - one or more trx records.
                for (var i = 0; i < trxDataEdits.length; i++) {
                    var oneOfManyresourceObj = $resource(transactionsCreateUrl);

                    oneOfManyresourceObj.save(null, trxDataEdits[i]).$promise.then(function() {
                        ctrl.postAsyncTransactionInsert(true);
                    }, function () {
                        ctrl.postAsyncTransactionInsert(false);
                    });
                }
            }
        }


        function calculateValuation(units, unitPrice) {
            // Current market price used when conducting buy, sell, or rollover transactions.
            return units * unitPrice;
        }


        function calculateCostBasis(valuation, fees) {
            return valuation + fees;
        }


        function calculateUnitCost(netAmount, qty) {
            return netAmount / qty;
        }


        function updateTransactionCalculations(trxData, trxKeys) {

            // Totals to be updated in Positions table as result of edit(s).
            var unitsTotal = 0;
            var costBasisTotal = 0;
            var postCalculationTrxs = [];

            // trxKeys represent existing trx ids of EDITED records to be processed, and are
            // relevant only in Position 'edit' mode scenarios.
            if (trxKeys != undefined) {
                for (var e = 0; e < trxKeys.length; e++) {
                    for (var t = 0; t < trxData.length; t++) {
                        if (trxData[t].transactionId == trxKeys[e]) {
                            trxData[t].valuation = calculateValuation(trxData[t].units, trxData[t].mktPrice);
                            trxData[t].costBasis = calculateCostBasis(trxData[t].valuation, trxData[t].fees);
                            trxData[t].unitCost = calculateUnitCost(trxData[t].costBasis, trxData[t].units);

                            var trx = createTransactionVm();
                            trx.PositionId = trxData[t].positionId;
                            trx.TransactionId = trxData[t].transactionId;
                            trx.Units = trxData[t].units;
                            trx.MktPrice = trxData[t].mktPrice;
                            trx.Fees = trxData[t].fees;
                            trx.Valuation = trxData[t].valuation;
                            trx.CostBasis = trxData[t].costBasis;
                            trx.UnitCost = trxData[t].unitCost;
                            trx.TransactionEvent = trxData[t].transactionEvent;

                            postCalculationTrxs.push(trx);
                        }

                        unitsTotal += trxData[t].units;
                        costBasisTotal += trxData[t].costBasis;

                        if (t == trxData.length - 1) {
                            var lastEditedRecordIndex = postCalculationTrxs.length - 1;
                            postCalculationTrxs[lastEditedRecordIndex].PositionQty = unitsTotal;
                            postCalculationTrxs[lastEditedRecordIndex].PositionCostBasis = costBasisTotal;
                            postCalculationTrxs[lastEditedRecordIndex].PositionUnitCost = calculateUnitCost(postCalculationTrxs[lastEditedRecordIndex].PositionCostBasis,
                                                                                                            postCalculationTrxs[lastEditedRecordIndex].PositionQty);
                        }
                    }
                }
                return postCalculationTrxs;
            } else {
                return false;
            }
            

        }


        function getAllTransactionsPostEdit(positionId, ctrl, isSrcTransactions) {

            // isSrcTransactions = true if trxs to be fetched are for source Position, as in a 'rollover' scenario.
            var trxsByPositionUrl = appSettings.serverPath + "/Pims.Web.Api/api/PositionTransactions/" + positionId;
            var resourceObj = $resource(trxsByPositionUrl);

            resourceObj.query().$promise.then(function (response) {
                var trxs = response;
                ctrl.postAsyncGetAllTransactionsPostEdit(trxs, isSrcTransactions); 
            }, function (exception) {
                ctrl.postAsyncGetAllTransactionsPostEdit(exception);
            });
        }
        





        // API
        return {
            calculateValuation: calculateValuation,
            calculateCostBasis: calculateCostBasis,
            calculateUnitCost: calculateUnitCost,
            updateTransactionCalculations: updateTransactionCalculations,
            updateTransaction: updateTransaction,
            createTransactionVm: createTransactionVm,
            insertTransactionTable: insertTransactionTable,
            getAllTransactionsPostEdit: getAllTransactionsPostEdit,
            updateTransactions: updateTransactions
        }

    }



}());