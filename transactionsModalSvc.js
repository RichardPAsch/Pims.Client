(function () {

   "use strict";

    angular
       .module("incomeMgmt.core")
       .factory("transactionsModalSvc", transactionsModalSvc);

    transactionsModalSvc.$inject = ["$resource", 'appSettings'];


    function transactionsModalSvc($resource, appSettings) {

        var vm = this;
        vm.baseUrl = appSettings.serverPath + "/Pims.Web.Api/api/";



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
        





        // API
        return {
            calculateValuation: calculateValuation,
            calculateCostBasis: calculateCostBasis,
            calculateUnitCost: calculateUnitCost
        }

    }



}());