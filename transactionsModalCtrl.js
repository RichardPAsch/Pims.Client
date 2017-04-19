(function () {

    "use strict";

    /*
        Reference: Plunker template testing via: http://plnkr.co/edit/E2x39J0uLIrdZeqXyC66
    */

    angular
        .module("incomeMgmt.positionTransactions")
        .controller("transactionsModalCtrl", transactionsModalCtrl);


    transactionsModalCtrl.$inject = ['$scope', '$modal'];

    function transactionsModalCtrl($scope, $modal) {

        $scope.userRolesGrid = { enableRowSelection: true, enableRowHeaderSelection: false };

        $scope.userRolesGrid.columnDefs = [
                            { name: 'id' },
                            { name: 'rolename' }
        ];

        $scope.gridTitle = "Position transaction(s)";

        $scope.userRolesGrid.data = [
            { id: 0, rolename: 'admin' },
            { id: 1, rolename: 'superuser' },
            { id: 2, rolename: 'username' }
          ];

      
        $scope.openUserModal = function () {
            $modal.open({
                templateUrl: 'userModalContent.html',
                size: 'dd',
                scope: $scope
            });
        };

    }

}());