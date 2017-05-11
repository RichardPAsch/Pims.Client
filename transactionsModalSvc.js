﻿(function () {

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
                Action: "",
                Units: 0,
                MktPrice: 0,
                Fees: 0,
                UnitCost: 0,
                CostBasis: 0,
                Valuation: 0,
                PositionQty: 0,         //  Cumlative value to be persisted in Position table   
                PositionCostBasis: 0,   //  Cumlative value to be persisted in Position table 
                PositionUnitCost: 0     //  Cumlative value to be persisted in Position table   
            };
        }


        function updateTransactionTable(editedTrxs, ctrl) {
            
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
                    ctrl.postAsyncTransactionUpdates(response, i == editedTrxs.length);
                }, function (ex) {
                    ctrl.postAsyncTransactionUpdates(ex.data.message, false);
                });

            }
        }


        function insertTransactionTable(trxDataEdits, ctrl) {
            
            // Ex: http://localhost/Pims.Web.Api/api/PositionTransactions
            var transactionsCreateUrl = vm.baseUrl + "PositionTransactions/";

            if (trxDataEdits.length == undefined) {
                    var singleResourceObj = $resource(transactionsCreateUrl);

                    singleResourceObj.save(null, trxDataEdits).$promise.then(function(resultData) {
                        ctrl.postAsyncTransactionInsert(true, resultData); // trx record inserted
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
            } else {
                // Totals for all non-Edited trxs, i.e., buy, sell, & rollover.
                for (var t = 0; t < trxData.length; t++) {
                    trxData[t].valuation = calculateValuation(trxData[t].units, trxData[t].mktPrice);
                    trxData[t].costBasis = calculateCostBasis(trxData[t].valuation, trxData[t].fees);
                    trxData[t].unitCost = calculateUnitCost(trxData[t].costBasis, trxData[t].units);

                    var trx2 = createTransactionVm();
                    trx2.PositionId = trxData[t].positionId;
                    trx2.TransactionId = trxData[t].transactionId;
                    trx2.Units = trxData[t].units;
                    trx2.MktPrice = trxData[t].mktPrice;
                    trx2.Fees = trxData[t].fees;
                    trx2.Valuation = trxData[t].valuation;
                    trx2.CostBasis = trxData[t].costBasis;
                    trx2.UnitCost = trxData[t].unitCost;

                    postCalculationTrxs.push(trx2);
                 

                unitsTotal += trxData[t].units;
                costBasisTotal += trxData[t].costBasis;

                if (t == trxData.length - 1) {
                    var lastEditedRecordIndex2 = postCalculationTrxs.length - 1;
                    postCalculationTrxs[lastEditedRecordIndex2].PositionQty = unitsTotal;
                    postCalculationTrxs[lastEditedRecordIndex2].PositionCostBasis = costBasisTotal;
                    postCalculationTrxs[lastEditedRecordIndex2].PositionUnitCost = calculateUnitCost(postCalculationTrxs[lastEditedRecordIndex2].PositionCostBasis,
                                                                                                    postCalculationTrxs[lastEditedRecordIndex2].PositionQty);
                    }
                }
            }
            
            return postCalculationTrxs;
        }
        





        // API
        return {
            calculateValuation: calculateValuation,
            calculateCostBasis: calculateCostBasis,
            calculateUnitCost: calculateUnitCost,
            updateTransactionCalculations: updateTransactionCalculations,
            updateTransactionTable: updateTransactionTable,
            createTransactionVm: createTransactionVm,
            insertTransactionTable: insertTransactionTable
        }

    }



}());