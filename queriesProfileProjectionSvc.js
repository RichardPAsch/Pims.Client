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
        vm.recvdTickersAndCapital = [];
        vm.initializedProfiles = [];

       

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
            vm.recvdTickersAndCapital = tickersAndCapitalData;
            var queryFinalUrl = vm.queryBaseUrl + "Profiles" + buildUrl();
            var profilesReference = $resource(queryFinalUrl);

            profilesReference.query(function (response) {
                vm.initializedProfiles = response;
                initializeWithProjections();
                ctrl.postAsyncInitializeProfileProjectionGrid(vm.initializedProfiles);
            },function(err) {
                alert(err.data.message);
            });
        }


        function buildUrl() {
            var tickerParams = "";
            for (var i = 0; i < vm.recvdTickersAndCapital.length; i++) {
                tickerParams += "/" + vm.recvdTickersAndCapital[i].tickerSymbol;
            }
            return tickerParams;
        }


        function initializeWithProjections() {

            // Synchronize 'recvdTickersAndCapital' sorting with received Profiles, as returned via $resource WebApi LINQ call.
            if (vm.recvdTickersAndCapital.length > 1)
                vm.recvdTickersAndCapital = vm.recvdTickersAndCapital.sort(sortTickers);

           for (var row = 0; row < vm.initializedProfiles.length; row++) {
                // Strip delimiting quotes on ticker.
                vm.initializedProfiles[row].ticker = vm.initializedProfiles[row].ticker.substring(1, vm.initializedProfiles[row].ticker.length - 1);
                // ReSharper disable once UsageOfPossiblyUnassignedValue
                if (vm.initializedProfiles[row].ticker == vm.recvdTickersAndCapital[row].tickerSymbol && parseFloat(vm.recvdTickersAndCapital[row].capitalToInvest) >= 1) {
                    vm.initializedProfiles[row].capital = vm.recvdTickersAndCapital[row].capitalToInvest;

                    // For error correction or greater accuracy, dividend rates maybe overriden via user input that includes
                    // an ANNUALIZED rate appended with frequency expectation, e.g., "0.9743-Q". The returned figure will 
                    // represent a MONYHLY rate, matching calculated monthly projections.
                    if (vm.recvdTickersAndCapital[row].dividendRateInput.indexOf("-") >= 0) {
                        // Process user inputs. Designated frequency will determine which divisor to use.
                        var divRateAsString = vm.recvdTickersAndCapital[row].dividendRateInput;
                        var frequencyInput = divRateAsString.substr(divRateAsString.indexOf("-") + 1, 1);
                        var divRateInput = divRateAsString.substring(0, divRateAsString.indexOf("-"));
                        var monthlyDivRate = (parseFloat(divRateInput) / 12);

                        vm.initializedProfiles[row].projectedRevenue = (vm.initializedProfiles[row].capital / vm.initializedProfiles[row].price) * monthlyDivRate;
                        switch (frequencyInput) {
                            case "M":
                                vm.initializedProfiles[row].divRate = monthlyDivRate.toString().substring(0,6) + "-M";
                                break;
                            case "Q":
                                vm.initializedProfiles[row].divRate = monthlyDivRate.toString().substring(0, 6) + "-Q";
                                break;
                            case "S":
                                vm.initializedProfiles[row].divRate = monthlyDivRate.toString().substring(0, 6) + "-S";
                                break;
                            case "A":
                                vm.initializedProfiles[row].divRate = monthlyDivRate.toString().substring(0, 6) + "-A";
                                break;
                            default:
                        }
                    } else {
                        // TODO: 1. Thresholds should be data-driven, 2. semi-annual & annual cases.
                        if (parseFloat(vm.initializedProfiles[row].divRate) <= 0.5) {  
                            vm.initializedProfiles[row].projectedRevenue = (vm.initializedProfiles[row].capital / vm.initializedProfiles[row].price) * parseFloat(vm.initializedProfiles[row].divRate);
                            vm.initializedProfiles[row].divRate = vm.initializedProfiles[row].divRate.toString() +  "-M";  // monthly
                        }
                        if (parseFloat(vm.initializedProfiles[row].divRate) >= 0.6) {
                            vm.initializedProfiles[row].projectedRevenue = (vm.initializedProfiles[row].capital / vm.initializedProfiles[row].price) * (parseFloat(vm.initializedProfiles[row].divRate) / 12);
                            vm.initializedProfiles[row].divRate = vm.initializedProfiles[row].divRate.toString() + "-Q";   // quarterly
                        }
                    }
               }
            }

            return vm.initializedProfiles;
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
            isValidTickerOrCapitalEdit: isValidTickerOrCapitalEdit

        }


    }




}());