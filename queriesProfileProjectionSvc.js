(function() {

    "use strict";

    angular
        .module("incomeMgmt.core")
        .factory("queriesProfileProjectionSvc", queriesProfileProjectionSvc);

    // TODO: Re-eval need for incomeMgmtSvc dependency
    queriesProfileProjectionSvc.$inject = ['incomeMgmtSvc', 'appSettings', '$resource'];


    function queriesProfileProjectionSvc(incomeMgmtSvc, appSettings, $resource) {

        var vm = this;
        vm.queryBaseUrl = appSettings.serverPath + "/Pims.Web.Api/api/";
        vm.recvdInput = [];
        vm.recvdProfilesWithProjections = [];

       

        function isValidTickerOrCapitalEdit(currentCol, valueToCheck) {

            if (currentCol == "ticker") {
                if (valueToCheck.length == 0)
                    return false;

                return incomeMgmtSvc.isValidTickerSymbolFormat(valueToCheck);
            } else {
                return incomeMgmtSvc.isValidCurrencyFormat(valueToCheck);
            }
        }
        
        

        function getProfiles(tickersAndCapitalData, ctrl) {
            vm.recvdInput = tickersAndCapitalData;
            var queryFinalUrl = vm.queryBaseUrl + "Profiles" + buildUrl();
            var profilesReference = $resource(queryFinalUrl);

            profilesReference.query(function (response) {
                vm.recvdProfilesWithProjections = response;
                initializeWithProjections();
                ctrl.postAsyncInitializeProfileProjectionGrid(vm.recvdProfilesWithProjections);
            },function(err) {
                alert(err.statusText);
            });
        }


        function buildUrl() {
            var tickerParams = "";
            for (var i = 0; i < vm.recvdInput.length; i++) {
                tickerParams += "/" + vm.recvdInput[i].tickerSymbol;
            }
            return tickerParams;
        }


        function calculateRevenueProjectionPerMonth(divRate, unitPrice, distributionFreq, capitalInvested)
        {
            if(divRate <= 0 || unitPrice <= 0 || distributionFreq === null || distributionFreq === "" || distributionFreq === undefined)
                return 0;

            var projectedMonthlyRevenue = 0;
            switch (distributionFreq.toUpperCase()) {
                case "M":
                   projectedMonthlyRevenue = (capitalInvested / unitPrice) * divRate;
                   break;
                case "Q":
                    projectedMonthlyRevenue = ((capitalInvested / unitPrice) * divRate) / 3;
                    break;
                case "S":
                    projectedMonthlyRevenue = ((capitalInvested / unitPrice) * divRate) / 6;
                    break;
                case "A":
                    projectedMonthlyRevenue = ((capitalInvested / unitPrice) * divRate) / 12;
                    break;
            }
            return projectedMonthlyRevenue;
        }

       
        function initializeWithProjections() {

            // 7.10.18 - Input order should already match fetched profile order: regarding ticker symbols.
            // Synchronize 'recvdInput' sorting with received Profile(s) data.
            //if (vm.recvdInput.length > 1)
            //    vm.recvdInput = vm.recvdInput.sort(sortTickers); 

           for (var row = 0; row < vm.recvdProfilesWithProjections.length; row++) {
               vm.recvdProfilesWithProjections[row].capital = parseFloat(vm.recvdInput[row].capitalToInvest);
               vm.recvdProfilesWithProjections[row].divDate = "";

               vm.recvdProfilesWithProjections[row].divRate = vm.recvdProfilesWithProjections[row].divRate > 0
                   ? vm.recvdProfilesWithProjections[row].divRate
                   : 0;
               vm.recvdProfilesWithProjections[row].divYield = vm.recvdProfilesWithProjections[row].divYield !== null
                   ? vm.recvdProfilesWithProjections[row].divYield
                   : 0;
               vm.recvdProfilesWithProjections[row].divFreq = vm.recvdInput[row].divFreq !== null
                   ? vm.recvdInput[row].divFreq
                   : "NA";
               vm.recvdProfilesWithProjections[row].price = vm.recvdProfilesWithProjections[row].price > 0
                   ? vm.recvdProfilesWithProjections[row].price
                   : 0;
               vm.recvdProfilesWithProjections[row].projectedRevenue = calculateRevenueProjectionPerMonth(
                                                                           vm.recvdProfilesWithProjections[row].divRate,
                                                                           vm.recvdProfilesWithProjections[row].price,
                                                                           vm.recvdProfilesWithProjections[row].divFreq,
                                                                           vm.recvdProfilesWithProjections[row].capital);
           }

            return vm.recvdProfilesWithProjections;
        }



        function sortTickers(obj1, obj2) {
            if (obj1.tickerSymbol < obj2.tickerSymbol)
                return -1;
            if (obj1.tickerSymbol > obj2.tickerSymbol)
                return 1;

            return 0;
        }

        



        // API
        return {
            getProfiles: getProfiles,
            isValidTickerOrCapitalEdit: isValidTickerOrCapitalEdit,
            calculateRevenueProjectionPerMonth:  calculateRevenueProjectionPerMonth
        }


    }




}());