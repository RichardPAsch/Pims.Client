(function() {

    "use strict";

    angular
        .module("incomeMgmt.pimsGrid")
        .controller("pimsGridCtrl", pimsGridCtrl);

    pimsGridCtrl.$inject = ['uiGridConstants', '$modal', '$location'];

    
    /* Customization considerations/parameters for upcoming gridDirective, per documentation:
       TODO: Sorting:  Sorting can be disabled at the column level by setting 'enableSorting: false' in the column def. 
                       EX: columnDefs: [  { field: 'company', enableSorting: false } }
       TODO: Filtering:  Filtering can be disabled at the column level by setting enableFiltering: false in the column def
       TODO: Footer:  Grid-footer set to always display; column-footer remains an option for customization if desired later
       TODO: Columns:  You can dynamically add and remove columns; you can dynamically change the display name on a column (along with some other column def properties
       TODO: Editing: The ui.grid.edit feature allows inline editing of grid data. To enable, you must include the 'ui.grid.edit' module and you must include the ui-grid-edit directive on your grid element
                       To be determined if we want 'editing' to be a dynamic feature?
       TODO: Data Importing - ** a feature to consider at a later time. **


    */

    function pimsGridCtrl(uiGridConstants, $modal, $location) {

        var vm = this;
        vm.criteriaEntries = [];
        var modalCriteriaInstance = {};
        vm.templatePath = $location.$$protocol +
                          "://" + $location.$$host +
                          ":" + $location.$$port +
                          "/app/Income/Queries/Criteria.Dialog/criteriaTemplate.html";
 

        // Modal dialog for query criteria entry(ies).
        vm.open = function() {
            modalCriteriaInstance = $modal.open({
                templateUrl: vm.templatePath,
                controller: 'criteriaCtrl',
                size: 'sm',
                // Members that will be resolved & passed to criteriaCtrl as locals (of type object).
                resolve: {
                    queryCriteria: function() {
                        return vm.criteriaEntries;
                    }
                }
            });
        };

        vm.open();

        // Promise
        modalCriteriaInstance.result.then(
            // Success
            function(criteriaData) {
                vm.enteredCriteria = criteriaData;
                // TODO: now that entered criteria is available, code for re-use and variable query conditions.
                alert("1st criteria entered :" + vm.enteredCriteria[0]); // Ok! 6.10.16
            },
            // Error
            function() {
                alert("Error with obtaining query criteria.");
            });


        
        

       
        // Header text is highlighted upon text entry in filter area.
        vm.highlightFilteredHeader = function( row, rowRenderIndex, col) {
            if( col.filters[0].term ){
                    return 'header-filtered';
                } else {
                    return '';
                }
            };

        //vm.columns = [{ field: 'fname'}, { field: 'lname' }, { field: 'gender' }];
        vm.gridOptions = {
            enableFiltering: false,
            enableGridMenu: true,
            showGridFooter: true,
            showColumnFooter: false,
            enableSelectAll: true,
            exporterCsvFilename: 'testGridDataFile.csv',
            exporterMenuPdf: false, // for possible future use.

            //data: [
            //        {
            //            "fname": "Richard",
            //            "lname": "Asch",
            //            "gender": "male"
            //        },
            //        {
            //            "fname": "Patricia",
            //            "lname": "Motheral",
            //            "gender": "female"
            //        }
            //],
            onRegisterApi: function (gridApi) { 
                vm.gridApi = gridApi;
            },
            //columnDefs: vm.columns
            columnDefs: [
                { field: 'fname', headerCellClass: 'myGridHeaders'} ,
                { field: 'lname', headerCellClass: 'myGridHeaders' },
                { field: 'gender', headerCellClass: 'myGridHeaders' }
            ]

        };


        vm.toggleFiltering = function() {
            vm.gridOptions.enableFiltering = !vm.gridOptions.enableFiltering;
            vm.gridApi.core.notifyDataChange(uiGridConstants.dataChange.COLUMN);
        };

        vm.gridOptions.data = [
            {
                "fname": "Richard",
                "lname": "Asch",
                "gender": "male"
            },
            {
                "fname": "Patricia",
                "lname": "Motheral",
                "gender": "female"
            }
        ];

       
       

    }

}());