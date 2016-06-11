(function() {

    /* 
        Sharable component for all income-related functionality. 
    */

    "use strict";

    angular
        .module("incomeMgmt.core")
        .factory("incomeSvc", incomeSvc);

    incomeSvc.$inject = ["appSettings", "$filter", "$resource", 'incomeMgmtSvc'];


    function incomeSvc(appSettings, $filter, $resource, incomeMgmtSvc) {

        var vm = this;

        // Playing with getter/setters, although adding new 'incomeRecords' property adds no new functionality that 
        // 'currentIncomeAdditions' doesn't already have.
        vm.revenueCache = {
            lastUpdate: $filter('date')(new Date(), 'M/dd/yyyy'),
            currentIncomeAdditions: [],

            get incomeRecords() {
                return this.currentIncomeAdditions;
            },
            set incomeRecords(revenueToAdd) {
                this.currentIncomeAdditions.push(revenueToAdd);
            }
        };


        function saveRevenue() {
            
            var mostRecentRevenue = vm.revenueCache.incomeRecords;
            if (!incomeMgmtSvc.isValidIncomeDateVsPositionAndTodayDate(mostRecentRevenue[mostRecentRevenue.length - 1].DateReceived,
                                                                       mostRecentRevenue[mostRecentRevenue.length - 1].PositionAddDate)) {
                alert("Invalid entry: date may not precede date 'Position' was added, or exceed today's, date.");
                return;
            }

            var incomeUrl = appSettings.serverPath + "/Pims.Web.Api/api/Asset/" + mostRecentRevenue[mostRecentRevenue.length - 1].TickerSymbol + "/Income";
            $resource(incomeUrl).save(mostRecentRevenue[mostRecentRevenue.length -1], function() {
                // success
                alert("Successfully saved $" + mostRecentRevenue[mostRecentRevenue.length - 1].AmountRecvd
                    + " to "
                    + mostRecentRevenue[mostRecentRevenue.length - 1].TickerSymbol
                    + "/" + mostRecentRevenue[mostRecentRevenue.length - 1].AcctType);
            }, function() {
                // error
                alert("Error saving income.");
            });
            
        }

        // API
        return {
            saveRevenue: saveRevenue,
            revenueCache: vm.revenueCache

        }

    }
        


}());