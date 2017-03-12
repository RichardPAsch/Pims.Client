(function() {

    /* 
        Sharable component for all INCOME-related query functionality. 
    */

    "use strict";

    angular
        .module("incomeMgmt.core")
        .factory("queriesIncomeSvc", queriesIncomeSvc);

    queriesIncomeSvc.$inject = ["$resource", "$filter", "appSettings", 'incomeMgmtSvc', '$location', '$window'];


    function queriesIncomeSvc($resource, $filter, appSettings, incomeMgmtSvc, $location, $window) {

        var vm = this;
        vm.queryGroup = "";
        vm.queryBaseUrl = appSettings.serverPath + "/Pims.Web.Api/api/";
        vm.queryResults = [];
        vm.querySelection = "";
        
       
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


        function getRevenue(stateUrl, queryCriteria, ctrl) {
   
            vm.queryGroup = getQueryGroup(stateUrl);
            //var submittedCriteria = queryCriteria;  // never used ?
            var url = buildUrlByQueryGroup(queryCriteria); 

            $resource(url).query().$promise.then(function (response) {
                vm.queryResults = response;
                ctrl.initializeGrid(); 
            }, function (err) {
                //  FROM: " + submittedCriteria[0].Value_1 + " TO : " + submittedCriteria[0].Value_2
                if (err.status == 400 || err.status == 500) {  // Bad Request (no data) || Internal Server Error 
                    alert("No income found matching submitted criteria");
                }

                // Redirect Url must contain 'state' reference for proper routing, not a modal dialog reference.
                $window.location.href = $location.$$protocol + "://" + $location.$$host + ":" + $location.$$port + "/App/Layout/Main.html#/Queries";
            });
            
        }


        function getQueryResults() {
            return vm.queryResults; 
        }


        function getQuerySelection() {
            return vm.querySelection;
        }


        function getQueryGroup(pathToParse) {
            // Assumes routing 'state' base of : '/grid/'.
            if (pathToParse == undefined)
                return vm.queryGroup;

            return pathToParse.substr(6);
        }


        function formatCurrency(amount) {
            return "$" + amount.toFixed(2);
        }


        function formatUrlDate(dateToFormat) {
            // Use regex (g)lobal flag for multiple replacements.
            return dateToFormat.replace(/\//g, "-");
        }


        var buildUrlByQueryGroup = function (enteredCriteria) {
            // Post criteria entry.
            /* Indices: 
                    0 - user entered criteria entry(ies) {labels/values}, 
                    1 - group designation, 
                    2 - selected query text.
            */

            var queryFinalUrl = "";
            vm.querySelection = enteredCriteria[2].Description;

            switch (vm.queryGroup) {
                case 'R1':
                    // Ex: http://localhost/Pims.Web.Api/api/Income/1-1-2016/9-1-2016
                    queryFinalUrl = vm.queryBaseUrl + "Income/" + enteredCriteria[0].Value_1 + "/" + enteredCriteria[0].Value_2;
                    break;
                case 'R2': 
                    // Ex: http://localhost/Pims.Web.Api/api/Asset/IBM/Income/1-1-2016/7-13-2016 
                    queryFinalUrl = vm.queryBaseUrl + enteredCriteria[0].Label_3 + "/" + enteredCriteria[0].Value_3 + "/Income/"
                                                    + enteredCriteria[0].Value_1 + "/" + enteredCriteria[0].Value_2; 
                    break;
                case 'R3':
                    // Ex: http://localhost/Pims.Web.Api/api/Income/All/2-1-2016/3-31-2016 
                    queryFinalUrl = vm.queryBaseUrl + "Income/All/" + enteredCriteria[0].Value_1 + "/" + enteredCriteria[0].Value_2;
                    break;
                case 'R4':
                    // Ex: http://localhost/Pims.Web.Api/api/Income/All/Monthly/3-1-2016/3-31-2016 
                    queryFinalUrl = vm.queryBaseUrl + "Income/All/Monthly/" + enteredCriteria[0].Value_1 + "/" + enteredCriteria[0].Value_2;
                    break;
                case 'R5':
                    // Ex: http://localhost/Pims.Web.Api/api/Income/All/{frequency}/3-1-2016/3-31-2016 
                    queryFinalUrl = vm.queryBaseUrl + "Income/All/" + enteredCriteria[0].Value_5 + "/" + enteredCriteria[0].Value_1 + "/" + enteredCriteria[0].Value_2;
                    break;
                case 'R6':
                    // Ex: http://localhost/Pims.Web.Api/api/Income/{period}/1-1-2015/6-30-2016 
                    queryFinalUrl = vm.queryBaseUrl + "Income/" + enteredCriteria[0].Value_5 + "/" + enteredCriteria[0].Value_1 + "/" + enteredCriteria[0].Value_2;
                    break;
                case 'RE':
                    // Ex: http://localhost/Pims.Web.Api/api/Income/All/WithAcctTypes/1-1-2015/6-30-2016 
                    queryFinalUrl = vm.queryBaseUrl + "Income/All/WithAcctTypes" + "/" + enteredCriteria[0].Value_1 + "/" + enteredCriteria[0].Value_2;
                    // Modify title to accomodate revenue editing.
                    vm.querySelection = enteredCriteria[3].Description2;
                    break;
            }
            return queryFinalUrl;
        }
  

        // Criteria needs to be defined BEFORE modalCriteriaInstance.resolve().
        function buildCriteriaEntries() {
            // TODO: 'Description' exists in TWO places (here & queriesMenuView.html) - refactor!
            // TODO: Case 'P' is NOT income-related functionality, & breaks SRP! Refactor
            var currentQuery = getQueryGroup($location.$$path);
            var builtCriteria = [];

            switch (currentQuery) {
                case 'R1':
                    builtCriteria = [
                                      {
                                          'Label_1': 'From', 'Value_1': null,
                                          'Label_2': 'To', 'Value_2': null
                                      },
                                      {
                                           'Group': 'R1'
                                      },
                                      {
                                          'Description': 'Show revenue total by date range'
                                      }
                    ];
                    break;
                case 'R2':
                    builtCriteria = [
                                      {
                                          'Label_1': 'From', 'Value_1': null,
                                          'Label_2': 'To', 'Value_2': null,
                                          'Label_3': 'Asset', 'Value_3': null
                                      },
                                      {
                                          'Group': 'R2'
                                      },
                                      {
                                          'Description': 'Show revenue total by date range & Asset'
                                      }
                    ];
                    break;
                case 'R3':
                    builtCriteria = [
                                      {
                                          'Label_1': 'From', 'Value_1': null,
                                          'Label_2': 'To', 'Value_2': null
                                      },
                                      {
                                          'Group': 'R3'
                                      },
                                      {
                                          'Description': 'Show revenue history by date range'
                                      }
                    ];
                    break;
                case 'R4':
                    builtCriteria = [
                                      {
                                          'Label_1': 'From', 'Value_1': null,
                                          'Label_2': 'To', 'Value_2': null
                                      },
                                      {
                                          'Group': 'R4'
                                      },
                                      {
                                          'Description': 'Show revenue totals for each month by date range'
                                      }
                    ];
                    break;
                case 'R5':
                    builtCriteria = [
                                      {
                                          'Label_1': 'From', 'Value_1': null,
                                          'Label_2': 'To', 'Value_2': null,
                                          'Label_5': 'Frequency', 'Value_5': null
                                      },
                                      {
                                          'Group': 'R5'
                                      },
                                      {
                                          'Description': 'Show revenue based on income distribution frequency & date range'
                                      }
                    ];
                    break;
                case 'R6':
                    builtCriteria = [
                                      {
                                          'Label_1': 'From', 'Value_1': null,
                                          'Label_2': 'To', 'Value_2': null,
                                          'Label_5': 'Period', 'Value_5': null
                                      },
                                      {
                                          'Group': 'R6'
                                      },
                                      {
                                          'Description': 'Show revenue totals based on comparative reporting period(s) & date range'
                                      }
                    ];
                    break;
                case 'RE':
                    builtCriteria = [
                                      {
                                          'Label_1': 'From', 'Value_1': null,
                                          'Label_2': 'To', 'Value_2': null
                                      },
                                      {
                                          'Group': 'RE' // (R)evenue (E)dit
                                      },
                                      {
                                          'Description': 'Show revenue history via dates, for edits/deletes.'
                                      },
                                      {
                                          'Description2': 'Revenue history - select, via checkmark column, any income record for edit / delete.'
                                      }
                    ];
                    break;
                case 'P':
                    builtCriteria = [
                                      {
                                         'Label_3': 'Ticker', 'Value_3': null
                                      },
                                      {
                                          'Group': 'P'
                                      },
                                      {
                                          'Description': 'Show detailed Position data via Asset search.'
                                      },
                                      {
                                          'Description2': 'Existing positions - select (via checkmark column) any position for editing.'
                                      }
                    ];
            }
            return builtCriteria;
        };



        // API
        return {
            saveRevenue: saveRevenue,
            revenueCache: vm.revenueCache,
            getRevenue: getRevenue,
            getQueryGroup: getQueryGroup,
            buildCriteriaEntries: buildCriteriaEntries,
            getQueryResults: getQueryResults,
            formatUrlDate: formatUrlDate,
            formatCurrency: formatCurrency,
            getQuerySelection: getQuerySelection

        }

    }
        


}());