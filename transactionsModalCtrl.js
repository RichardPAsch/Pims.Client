(function () {

    "use strict";

    /*
        Reference: Plunker template testing via: http://plnkr.co/edit/E2x39J0uLIrdZeqXyC66
    */

    angular
        .module("incomeMgmt.positionTransactions")
        .controller("transactionsModalCtrl", transactionsModalCtrl);


    transactionsModalCtrl.$inject = ['$modal', '$scope', '$state', 'incomeMgmtSvc', '$stateParams', 'transactionsModalSvc'];


    function transactionsModalCtrl($modal, $scope, $state, incomeMgmtSvc, $stateParams, transactionsModalSvc) {

        $scope.preOrPostEditTrxs = [];
        $scope.editedTrxRowKeys = [];   // cache rows edited.
        $scope.dirtyRows = 0;
        $scope.gridOptions = {};

        $scope.openUserModal = function () {
            $modal.open({
                templateUrl: 'userModalContent.html',
                size: 'dd',
                scope: $scope
            });
        };


        $scope.cancel = function () {
            // Return to modal prompt for ticker & its'
            // unmodified Position(s) data.
            $state.go("positions_edit");
        };


        $scope.update = function () {
            // WIP
            //$scope.preOrPostEditTrxs; // ok - contains edited data.
            //$state.go("positions_edit");
            // Multiple edits may exist on same transaction record.
            $scope.editedTrxRowKeys = incomeMgmtSvc.removeArrayDuplicates($scope.editedTrxRowKeys);
            alert("dirty row data count is: " + $scope.editedTrxRowKeys.length);
            $scope.sortTrxCollections();
            $scope.updateTransactionCalculations();

        };


        $scope.sortTrxCollections = function () {
            // Only edited preOrPostEditTrxs rows will require re-calculations of: valuations, cost basis, & unit costs.
            // All preOrPostEditTrxs rows are processed independently of one another.
            $scope.editedTrxRowKeys = $scope.editedTrxRowKeys.sort();

            $scope.preOrPostEditTrxs.sort(function (obj1, obj2) {
                var trxA = obj1.transactionId.toUpperCase();
                var trxB = obj2.transactionId.toUpperCase();
                if (trxA < trxB) {
                    return -1;
                }
                if (trxA > trxB) {
                    return 1;
                }

                return 0;
            });

            /* sample data
                [
                    {costBasis : 5023.68, dateCreated : "2017-04-10T00:00:00", fees : 210, mktPrice : 30.07, positionId : "64f24181-0fdc-4804-9b37-a741011178de", 
                         transactionId : "00000000-0000-0000-0000-000000000000", unitCost : 31.398, units : 160, valuation : 4811.20},
                    {costBasis : 1569.56, dateCreated : "2017-03-20T00:00:00", fees : 74.71, mktPrice : 25, positionId : "64f24181-0fdc-4804-9b37-a741011178de", 
                         transactionId : "00000000-0000-0000-0000-000000000000", unitCost : 31.391, units : 50, valuation : 1494.85}
                ]
            */
        }
 

        $scope.buildColumnDefs = function () {

            $scope.gridOptions.columnDefs = [
                    { field: 'dateCreated', displayName: 'Created', enableCellEdit: false, width: '15%', type: 'date', cellFilter: 'date:\'MM-dd-yyyy\'', headerCellClass: 'headerAlignment' },
                    { field: 'units', displayName: 'Qty', enableCellEdit: true, width: '10%', headerCellClass: 'headerAlignment' },
                    { field: 'mktPrice', displayName: 'Price', enableCellEdit: true, width: '12%', cellFilter: 'number: 3', headerTooltip: 'Current market price', headerCellClass: 'headerAlignment' },
                    { field: 'fees', displayName: 'Fees', enableCellEdit: true, width: '12%', cellFilter: 'number: 2', headerCellClass: 'headerAlignment' },
                    { field: 'costBasis', displayName: 'Cost Basis', enableCellEdit: false, width: '17%', cellFilter: 'number: 2', headerCellClass: 'headerAlignment' },
                    { field: 'unitCost', displayName: 'Unit Cost', enableCellEdit: false, width: '16%', cellFilter: 'number: 3', headerCellClass: 'headerAlignment' },
                    { field: 'valuation', displayName: 'Value', enableCellEdit: false, width: '18%', cellFilter: 'number: 2', headerCellClass: 'headerAlignment' }
            ];

            //$scope.transactionsGrid.columnDefs = [
            //        { field: 'dateCreated', displayName: 'Created', enableCellEdit: false, width: '15%', type: 'date', cellFilter: 'date:\'MM-dd-yyyy\'', headerCellClass: 'headerAlignment' },
            //        { field: 'units', displayName: 'Qty', enableCellEdit: true, width: '10%', headerCellClass: 'headerAlignment' },
            //        { field: 'mktPrice', displayName: 'Price', enableCellEdit: true, width: '12%', cellFilter: 'number: 3', headerTooltip: 'Current market price', headerCellClass: 'headerAlignment' },
            //        { field: 'fees', displayName: 'Fees', enableCellEdit: true, width: '12%', cellFilter: 'number: 2', headerCellClass: 'headerAlignment' },
            //        { field: 'costBasis', displayName: 'Cost Basis', enableCellEdit: false, width: '17%', cellFilter: 'number: 2', headerCellClass: 'headerAlignment' },
            //        { field: 'unitCost', displayName: 'Unit Cost', enableCellEdit: false, width: '16%', cellFilter: 'number: 3', headerCellClass: 'headerAlignment' },
            //        { field: 'valuation', displayName: 'Value', enableCellEdit: false, width: '18%', cellFilter: 'number: 2', headerCellClass: 'headerAlignment' }
            //];

        };

       
        //$scope.transactionsGrid = {
        //    enableRowSelection: true,
        //    enableRowHeaderSelection: false
        //};

        $scope.msg = {};

        $scope.gridTitle = "Position transaction(s) for account:  " + $stateParams.accountParam;
        $scope.positionId = $stateParams.positionIdParam;
       // $scope.gridOptions = {};
        //$scope.gridOptions = { rowEditWaitInterval: -1 }
        $scope.gridOptions.onRegisterApi = function(gridApi) {
            $scope.gridApi = gridApi;
            gridApi.edit.on.afterCellEdit($scope, function (rowEntity, colDef, newValue, oldValue) {
                $scope.msg.lastCellEdited = 'Column:' + colDef.displayName + ' New Value:' + newValue + ' Old Value:' + oldValue;
                $scope.$apply();
                $scope.captureRowEdits(rowEntity);
            });
        };
        

        //incomeMgmtSvc.getAllTransactions($scope.positionId, $scope);
        incomeMgmtSvc.getAllTransactions($stateParams.positionIdParam, $scope);



        /* 
            Service call-back processing.
        */ 
        $scope.postAsyncGetAllTransactions = function (resultData) {

            if (resultData.$resolved) {
                $scope.preOrPostEditTrxs = resultData;
                $scope.buildColumnDefs();
                $scope.gridOptions.data = resultData;

            } else {
                alert("Unable to fetch associated transactions for editing.");
                return false;
            }

            return null;
        }


        $scope.captureRowEdits = function (currentRow) {
            // Each edited row transactionId = PK. Event fired upon EACH cell edit.
            $scope.editedTrxRowKeys.push(currentRow.transactionId);
        }


        $scope.updateTransactionCalculations = function () {

            //angular.forEach($scope.preOrPostEditTrxs, function(value, key) {
            //    console.log("value: " + value); // [Object object]
            //});

            // Totals to be updated in Positions table as result of edit(s).
            var unitsTotal = 0;
            var costBasisTotal = 0;
            var unitCostQuotient = 0;

            for (var e = 0; e < $scope.editedTrxRowKeys.length; e++) {
                
                for (var t = 0; t < $scope.preOrPostEditTrxs.length; t++) {

                    if ($scope.preOrPostEditTrxs[t].transactionId == $scope.editedTrxRowKeys[e]) {
                        $scope.preOrPostEditTrxs[t].valuation = transactionsModalSvc.calculateValuation($scope.preOrPostEditTrxs[t].units, $scope.preOrPostEditTrxs[t].mktPrice);
                        $scope.preOrPostEditTrxs[t].costBasis = transactionsModalSvc.calculateCostBasis($scope.preOrPostEditTrxs[t].valuation, $scope.preOrPostEditTrxs[t].fees);
                        $scope.preOrPostEditTrxs[t].unitCost = transactionsModalSvc.calculateUnitCost($scope.preOrPostEditTrxs[t].costBasis, $scope.preOrPostEditTrxs[t].units);

                        //console.log("V: " + $scope.preOrPostEditTrxs[t].valuation + " CB: "
                        //    + $scope.preOrPostEditTrxs[t].costBasis + " UC: "
                        //    + $scope.preOrPostEditTrxs[t].unitCost + " TRXid: "
                        //    + $scope.preOrPostEditTrxs[t].transactionId);
                    }

                    unitsTotal += $scope.preOrPostEditTrxs[t].units;
                    costBasisTotal += $scope.preOrPostEditTrxs[t].costBasis;
                }
            }
            // TODO: test
            unitCostQuotient = costBasisTotal / unitsTotal;
            alert("total units: \n" + unitsTotal + " total CB: \n" + costBasisTotal + " finalUC: \n" + unitCostQuotient);
        }
  
    }

}());