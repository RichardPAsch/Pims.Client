(function() {

    "use strict";

    angular
        .module("incomeMgmt.activitySummary")
        .controller("activitySummaryCtrl", activitySummaryCtrl);    

    activitySummaryCtrl.$inject = ['activitySummarySvc'];



    function activitySummaryCtrl(activitySummarySvc) {
        var vm = this;
        vm.currentYear = getCurrentYear();

        activitySummarySvc.query(function (responseData) {
            vm.incomeActivitySummaryData = responseData;
            vm.incomeTotal = calculateTotal(responseData);

        });
     }


    function getCurrentYear() {
        var date = new Date();
        return date.getFullYear();
    }


    function calculateTotal(dataToSum) {
        var sum = 0;
        for (var amt=0; amt < dataToSum.length; amt++) {
            sum += dataToSum[amt].amountRecvd;
        }
        return sum;
    }


   
    

}());