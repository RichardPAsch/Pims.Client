(function () {

    "use strict";

    /*
        Reference: Plunker template testing via: http://plnkr.co/edit/E2x39J0uLIrdZeqXyC66
    */

    angular
        .module("incomeMgmt.positionTransactions")
        .controller("transactionsModalCtrl", transactionsModalCtrl);


    transactionsModalCtrl.$inject = ['$modal', '$scope', '$state', 'incomeMgmtSvc', '$stateParams', 'transactionsModalSvc', 'positionCreateSvc', '$filter'];


    function transactionsModalCtrl($modal, $scope, $state, incomeMgmtSvc, $stateParams, transactionsModalSvc, positionCreateSvc, $filter) {

        $scope.preOrPostEditTrxs = [];  // for either edited (pre-calculations) or post-calculation trxs.
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
            //$state.go("positions_edit");
            // Multiple edits may exist on same transaction record.
            $scope.editedTrxRowKeys = incomeMgmtSvc.removeArrayDuplicates($scope.editedTrxRowKeys);
            $scope.sortTrxCollections();
            $scope.preOrPostEditTrxs = transactionsModalSvc.updateTransactionCalculations($scope.preOrPostEditTrxs, $scope.editedTrxRowKeys);
            transactionsModalSvc.updateTransactionsTable($scope.preOrPostEditTrxs, $scope);  // 5.2.17 - Ok
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
        $scope.gridOptions.onRegisterApi = function(gridApi) {
            $scope.gridApi = gridApi;
            gridApi.edit.on.afterCellEdit($scope, function (rowEntity, colDef, newValue, oldValue) {
                $scope.msg.lastCellEdited = 'Column:' + colDef.displayName + ' New Value:' + newValue + ' Old Value:' + oldValue;
                $scope.$apply();
                $scope.captureRowEdits(rowEntity);
            });
        };
        

        incomeMgmtSvc.getAllTransactions($stateParams.positionIdParam, $scope);



        /* 
            Services call-back processing.
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

        $scope.postAsyncTransactionUpdates = function(response, isLastTrxRecord) {
            if (!response.$resolved) {
                alert("Error updating transaction due to: " + response);
                return false;
            }

            if (isLastTrxRecord) {
                // TODO: 5.3.17 - update Position table; reconfirm design is ok for buy,sell,rollover, & position/create fx.
                var positionData = $scope.initializePositionVm(response);
                positionCreateSvc.processPositionUpdates2(positionData, $scope);  // 5.5.17 - Ok.
            }

            return null;
        }

        $scope.postAsyncPositionUpdates = function(results) {
            if (!results.$resolved) {
                alert("Error updating Position due to: " + results);
                return false;
            } else {
                alert("Position & Transaction(s) successfully updated.");
            }

            return null;
        }







        $scope.captureRowEdits = function (currentRow) {
            // Each edited row transactionId = PK; event fired upon EACH cell edit.
            $scope.editedTrxRowKeys.push(currentRow.transactionId);
        }


        $scope.initializePositionVm = function (trxResponseData) {
            var today = new Date();
            var currentPosition = positionCreateSvc.getPositionVm();

            // Satisfies server model state; no mapping necessary.
            currentPosition.TickerSymbol = $stateParams.currentPositionParam.tickerSymbol;
            currentPosition.PositionId = $stateParams.currentPositionParam.positionId;
            currentPosition.PositionAssetId = $stateParams.currentPositionParam.assetId;
            currentPosition.AcctTypeId = $stateParams.currentPositionParam.accountTypeId;
            currentPosition.Status = "A";
            currentPosition.PurchaseDate = $stateParams.currentPositionParam.purchaseDate;
            currentPosition.PositionDate = $stateParams.currentPositionParam.positionDate;
            currentPosition.MarketPrice = trxResponseData.MktPrice;
            currentPosition.Quantity = trxResponseData.Units;
            currentPosition.UnitCost = trxResponseData.UnitCost;
            currentPosition.Fees = trxResponseData.Fees;
            currentPosition.LastUpdate = $filter('date')(today, 'M/dd/yyyy');
            currentPosition.InvestorKey = $stateParams.currentPositionParam.investorId;
            currentPosition.Url = "";

            return currentPosition;
        }


  
    }

}());