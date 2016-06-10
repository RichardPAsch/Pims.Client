(function () {

    /* 
        Application-wide generic common services.
    */

    "use strict";

    angular
        .module("incomeMgmt.core")
        .factory("incomeMgmtSvc", incomeMgmtSvc);

    incomeMgmtSvc.$inject = ['$resource', 'appSettings', '$filter'];
    

    function incomeMgmtSvc($resource, appSettings, $filter) {

        var vm = this;
        vm.tickerRegExpr = "^[a-zA-Z0-9-]+$";
        vm.currentTicker = "";
        // Matches currency with, or without commas and/or $.
        vm.currencyPattern = new RegExp(/^\$?[\d+,]+(\.\d*)?$/); 

        

        function isValidTickerSymbolFormat(ticker) {

            vm.currentTicker = ticker;
            return ticker == undefined ||
                             ticker.match(vm.tickerRegExpr) == null ||
                             ticker.length > 5 ||
                             ticker == ""
                ? false
                : true;
        }


        function isValidCurrencyFormat(currencyToCheck) {
 
            return currencyToCheck.match(vm.currencyPattern) == null || currencyToCheck.length > 9 
                ? false
                : true;
        }
                

        function checkTickerSymbolValidity(tickerToCheck, controller) {
            // Until a better solution is learned:
            // ** All controllers using this method MUST have the same postback function: 'postValidationTickerCheck()' **

            // Validate existence against NYSE.
            var assetByTickerUrl = appSettings.serverPath + "/Pims.Web.Api/api/Profile/" + tickerToCheck;
            var resourceObj = $resource(assetByTickerUrl);

            resourceObj.get().$promise.then(function (response) {
                // Success 
                var profile = response;
                if (profile.tickerDescription == "N/A" && profile.price == 0) {
                    controller.postValidationTickerCheck(false);
                    return;
                }
                controller.postValidationTickerCheck(true);

            }, function () {
                // Error fetching data.
                controller.postValidationTickerCheck(false);
            });
        }


        function getAllPositions(ticker, controller) {

            var positionsByAssetUrl = appSettings.serverPath + "/Pims.Web.Api/api/Asset/" + ticker + "/Position";
            var resourceObj = $resource(positionsByAssetUrl);

            resourceObj.query().$promise.then(function (response) {
                // Success - at minimum 1 Position returned.
                var positions = response;
                controller.getPositions(positions);
            }, function () {
                // Error fetching data.
                controller.getPositions(null);
            });
            

        }


        function checkRevenueDuplicate(ticker, acctType, dateRecvd, amtRecvd, controller) {

            /*  ------- Sample return data ------
                [
                  {"ticker":"CB","dateReceived":"12/8/2015","amountReceived":37.11,"accountType":"IRA"}, 
                  {"ticker":"CB","dateReceived":"1/14/2016","amountReceived":38.09,"accountType":"IRA"}
                ]
            */

            //  desired path: http://localhost/Pims.Web.Api/api/Asset/CB/Income/IRA
            var revenueByAcctTypeUrl = appSettings.serverPath + "/Pims.Web.Api/api/Asset/" + ticker + "/Income/" + acctType;

            var existingRevenue = [];
            var resourceObj = $resource(revenueByAcctTypeUrl);
            resourceObj.query().$promise.then(function(records) {
                    existingRevenue = records;
                    if (existingRevenue.length == 0) {
                        controller.postCheckRevenueDuplicate(false);
                    } else {
                        // callback executed for each element in collection.
                        angular.forEach(existingRevenue, function(value) {
                            if (value.amountReceived == amtRecvd && value.dateReceived == dateRecvd) {
                                controller.postCheckRevenueDuplicate(true);
                            } else {
                                controller.postCheckRevenueDuplicate(false);
                            }
                        });
                    }
                }, function () {
                // Mimic duplicate found, due to error executing query().
                controller.postCheckRevenueDuplicate(true);
            });
        }


        function isValidIncomeDateVsPositionAndTodayDate(revenueDate, positionDate) {

            var revenueDateFormatted = new Date($filter('date')(revenueDate, 'M/dd/yyyy'));
            var positionDateFormatted = new Date($filter('date')(positionDate, 'M/dd/yyyy'));

            // Date comparisons in js REQUIRE getTime().
            return revenueDateFormatted.getTime() >= positionDateFormatted.getTime() && revenueDateFormatted.getTime() <= new Date();
        }

        
        

        // API
        return {
            isValidTickerSymbolFormat: isValidTickerSymbolFormat,
            checkTickerSymbolValidity: checkTickerSymbolValidity,
            getAllPositions: getAllPositions,
            checkRevenueDuplicate: checkRevenueDuplicate,
            isValidIncomeDateVsPositionAndTodayDate: isValidIncomeDateVsPositionAndTodayDate,
            isValidCurrencyFormat: isValidCurrencyFormat

        }


    }


}());