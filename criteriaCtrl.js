(function() {

    "use strict";

    /* 
        Reference queriesIncomeSvc.buildCriteriaEntries() for $scope.entries[] legend.
    */

    angular
        .module("incomeMgmt.pimsGrid")
        .controller("criteriaCtrl", criteriaCtrl);

    criteriaCtrl.$inject = ['$modalInstance', '$scope', 'queryCriteria', 'incomeMgmtSvc', '$window','$location', 'createAssetWizardSvc'];


    function criteriaCtrl($modalInstance, $scope, queryCriteria, incomeMgmtSvc, $window, $location, createAssetWizardSvc) {

        $scope.fromDate = new Date();
        $scope.toDate = new Date();
        $scope.entries = queryCriteria;
        $scope.rowsDisplay = [true, false, false];
        $scope.incomeDistributionFrequencyAndReportingPeriods = initializeIncomeDistributionFrequenciesAndReportingPeriods();
        $scope.selectedFrequencyOrPeriod = $scope.incomeDistributionFrequencyAndReportingPeriods[0]; // Select...


        toggleRowDisplay();



        function toggleRowDisplay() {
            // Determine which criteria rows, & entry fields to display, based on users' query selection.

            /* Row indices with associated label/value designations: 
                [0] - Dedicated to user-selected read-only QUERY DESCRIPTION.
                      * row  : rowsDisplay[0]. Always true = display.
                      * label: $scope.entries[2].Description
                [1] - Dedicated to date criteria entries ONLY.
                      * row  : rowsDisplay[1]
                      * label: $scope.entries[0].Label_1; $scope.entries[0].Label_2;
                      * value: inputFromDate(fromDate); inputToDate(toDate) [ id (ngModel) ]
                [2] - Dynamic  // TODO: document ! for 12.1.16
                [3] - * row  : rowsDisplay[2] // TODO: re-evaluate & document ! for 12.1.16
                      * label: entries[0].Label_3; entries[0].Label_4;
                      * value: inputR2a/incomeDistributionFreqOrPeriod; inputR2b/3b //TODO: refactor use of dedicated inputR3a as "incomeDistributionFreq"
            */

            switch ($scope.entries[1].Group) {
                case 'RE':
                case 'R1':
                case 'R3':
                case 'R4':                          // date prompts
                    $scope.rowsDisplay[1] = true;   
                    $scope.rowsDisplay[2] = false;
                    $scope.rowsDisplay[3] = false;
                    break;
                case 'R2':                          // date & Asset ticker prompts
                    $scope.showInputR2b = false;
                    $scope.rowsDisplay[1] = true;
                    $scope.rowsDisplay[2] = true;
                    $scope.rowsDisplay[3] = false;
                    break;
                case 'R5':                          // date & frequency/reporting prompts
                case 'R6':
                    $scope.showInputR3b = false;
                    $scope.rowsDisplay[1] = true;
                    $scope.rowsDisplay[2] = false;
                    $scope.rowsDisplay[3] = true;
                    break;
                case 'P':                           // Position -edit; ticker prompt
                    $scope.showInputR2b = false;
                    $scope.rowsDisplay[1] = false;
                    $scope.rowsDisplay[2] = true;
                    $scope.rowsDisplay[3] = false;

                default:
                    $scope.rowsDisplay[0] = true;
            }

        }


        $scope.ok = function () {
            // Process promise results.
            if ($scope.entries[1].Group == "R1" || $scope.entries[1].Group == "R3" || $scope.entries[1].Group == "R4" || $scope.entries[1].Group == "RE") {

                if (!incomeMgmtSvc.isValidCalendarDate($scope.fromDate, $scope.toDate)) {
                    alert("Invalid date range entered.");
                    redirectToQueryMenu();
                }

                $scope.entries[0].Value_1 = createAssetWizardSvc.formatDate($scope.fromDate);
                $scope.entries[0].Value_2 = createAssetWizardSvc.formatDate($scope.toDate);
           }
            if ($scope.entries[1].Group == "R2") {

                if (!incomeMgmtSvc.isValidCalendarDate($scope.fromDate, $scope.toDate) || !incomeMgmtSvc.isValidTickerSymbolFormat($scope.inputRow2a)) {
                   alert("Invalid entry(ies), check dates and/or ticker symbol.");
                   redirectToQueryMenu();
               }

               $scope.entries[0].Value_1 = createAssetWizardSvc.formatDate($scope.fromDate);
               $scope.entries[0].Value_2 = createAssetWizardSvc.formatDate($scope.toDate);
               $scope.entries[0].Value_3 = $scope.inputRow2a;

            }
            if ($scope.entries[1].Group == "R5" || $scope.entries[1].Group == "R6") {
 
                if (!incomeMgmtSvc.isValidCalendarDate($scope.fromDate, $scope.toDate) || $scope.selectedFrequencyOrPeriod.frequencyCode.trim() == "X") {
                    alert("Invalid or incomplete entry(ies), check dates and/or frequency/period data.");
                    redirectToQueryMenu();
                }

                $scope.entries[0].Value_1 = createAssetWizardSvc.formatDate($scope.fromDate);
                $scope.entries[0].Value_2 = createAssetWizardSvc.formatDate($scope.toDate);
                $scope.entries[0].Value_5 = $scope.selectedFrequencyOrPeriod.frequencyCode.trim();
                //alert("selected: " + $scope.entries[0].Value_5);
            }
            if ($scope.entries[1].Group == "P" ) {

                if (!incomeMgmtSvc.isValidTickerSymbolFormat($scope.inputRow2a)) {
                    alert("Invalid entry, check ticker symbol.");
                    redirectToQueryMenu();
                }

                $scope.entries[0].Value_3 = $scope.inputRow2a;
            }

            $modalInstance.close($scope.entries);
        }
                

        $scope.cancel = function () {
            $modalInstance.dismiss('cancel');
            redirectToQueryMenu();
        }


        $scope.calendarOpenFrom = function ($event) {
            $event.preventDefault(); // prevent any default action triggered
            $event.stopPropagation();

            $scope.openedFrom = !$scope.openedFrom;
        }


        $scope.calendarOpenTo = function ($event) {
            $event.preventDefault(); // prevent any default action triggered
            $event.stopPropagation();

            $scope.openedTo = !$scope.openedTo;
        }
        

        function redirectToQueryMenu() {
            var path = $location.$$protocol + "://" + $location.$$host + ":" + $location.$$port + "/App/Layout/Main.html#/Queries";
            $window.location.href = path;
        }


        function initializeIncomeDistributionFrequenciesAndReportingPeriods() {

            return [
                {
                    "frequencyDescription": "Select...",
                    "frequencyCode": "X"
                },
                {
                    "frequencyDescription" : "(A)nnual",
                    "frequencyCode": "A"
                },
                {
                    "frequencyDescription": "(S)emi-Annual",
                    "frequencyCode": "S"
                },
                {
                    "frequencyDescription": "(Q)uarterly",
                    "frequencyCode": "Q"
                },
                {
                    "frequencyDescription": "(M)onthly",
                    "frequencyCode": "M"
                }];
        }
        


    }


}());