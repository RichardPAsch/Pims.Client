(function () {

    "use strict";

    /*
        Reference: Plunker template testing via: http://plnkr.co/edit/E2x39J0uLIrdZeqXyC66
    */

    angular
        .module("incomeMgmt.positionTransactions")
        .controller("transactionsModalCtrl", transactionsModalCtrl);


    transactionsModalCtrl.$inject = ['$modal', '$scope', '$state', 'incomeMgmtSvc', '$stateParams'];


    function transactionsModalCtrl($modal, $scope, $state, incomeMgmtSvc, $stateParams) {

        $scope.trxsModel = [];

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
            var postEditModel = $scope.trxsModel; // ok - reflects edited data.
            //$state.go("positions_edit");
        };


        $scope.buildColumnDefs = function () {

            $scope.transactionsGrid.columnDefs = [
                    { field: 'dateCreated', displayName: 'Created', enableCellEdit: false, width: '15%', type: 'date', cellFilter: 'date:\'MM-dd-yyyy\'', headerCellClass: 'headerAlignment' },
                    { field: 'units', displayName: 'Qty', enableCellEdit: true, width: '10%', headerCellClass: 'headerAlignment' },
                    { field: 'mktPrice', displayName: 'Price', enableCellEdit: true, width: '12%', cellFilter: 'number: 3', headerTooltip: 'Current market price', headerCellClass: 'headerAlignment' },
                    { field: 'fees', displayName: 'Fees', enableCellEdit: true, width: '12%', cellFilter: 'number: 2', headerCellClass: 'headerAlignment' },
                    { field: 'costBasis', displayName: 'Cost Basis', enableCellEdit: false, width: '17%', cellFilter: 'number: 2', headerCellClass: 'headerAlignment' },
                    { field: 'unitCost', displayName: 'Unit Cost', enableCellEdit: false, width: '16%', cellFilter: 'number: 3', headerCellClass: 'headerAlignment' },
                    { field: 'valuation', displayName: 'Value', enableCellEdit: false, width: '18%', cellFilter: 'number: 2', headerCellClass: 'headerAlignment' }
            ];

        };


        $scope.transactionsGrid = {
            enableRowSelection: true,
            enableRowHeaderSelection: false
        };


        $scope.gridTitle = "Position transaction(s) for account:  " + $stateParams.accountParam;
        $scope.positionId = $stateParams.positionIdParam;

        incomeMgmtSvc.getAllTransactions($scope.positionId, $scope);



        /* 
            Call-back processing.
        */ 
        $scope.postAsyncGetAllTransactions = function (resultData) {

            if (resultData.$resolved) {
                $scope.trxsModel = resultData;
                $scope.buildColumnDefs();
                $scope.transactionsGrid.data = resultData;
                //alert("reoord count is: " + positionTrxs.length); // 1 - tested Ok!
            } else {
                alert("Unable to fetch associated transactions for editing.");
                return false;
            }

            return null;
        }

    }

}());