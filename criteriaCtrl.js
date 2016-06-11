(function () {

    "use strict";

    angular
        .module("incomeMgmt.pimsGrid")
        .controller("criteriaCtrl", criteriaCtrl);

    criteriaCtrl.$inject = ['$modalInstance', '$scope', 'queryCriteria'];


    function criteriaCtrl($modalInstance, $scope, queryCriteria) {

        $scope.entries = queryCriteria;
        // Available for data binding; most likely 5 criteria maximum needed.
        //$scope.entriesMapping = {
        //    entry0: $scope.entries[0],
        //    entry1: $scope.entries[1],
        //    entry2: $scope.entries[2],
        //    entry3: $scope.entries[3],
        //    entry4: $scope.entries[4]
        //};


        $scope.ok = function () {
            // Pass promise results.
            $modalInstance.close($scope.entries);
        }

        $scope.cancel = function () {
            $modalInstance.dismiss('cancel');
        }
        

    }


}());