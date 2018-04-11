(function() {

    /*
        All column definitions/customizations for pimsGrid template contexts to be built here 
        and returned to calling pimsGridCtrl.
    */

    "use strict";

    angular
        .module("incomeMgmt.core")
        .factory("pimsGridColumnSvc", pimsGridColumnSvc);

    pimsGridColumnSvc.$inject = ['uiGridConstants'];



    function pimsGridColumnSvc(uiGridConstants) {

        var vm = this;
        vm.colDefinitions = [];
        vm.columnObj = [];
        vm.totalFooterCellTemplate = '<div class="ui-grid-cell-contents" style="text-align:right; color: chocolate"><em>Total:</em>&nbsp;&nbsp;' +
                                     '${{col.getAggregationValue() | number:2}}</div>';
        


        function initializeActivitySummaryColDefs(responseDataColKeys) {
            vm.colDefinitions = [];
            for (var key = 0; key < responseDataColKeys.length; key++) {
                if (responseDataColKeys[key] == "monthRecvd") {
                                    vm.columnObj = {
                                        field: responseDataColKeys[key],
                                        headerCellClass: 'myGridHeaders',
                                        cellClass: "grid-align",
                                        width: '20%'
                                    };
                                }
                if (responseDataColKeys[key] == "amountRecvd") {
                                    vm.columnObj = {
                                        field: responseDataColKeys[key],
                                        headerCellClass: 'myGridHeaders',
                                        cellClass: "grid-align",
                                        cellFilter: 'number: 2',  // limit to 2 decimal places
                                        aggregationType: uiGridConstants.aggregationTypes.sum,
                                        footerCellTemplate: vm.totalFooterCellTemplate,
                                        width: '20%'
                                    };
                                }
                if (responseDataColKeys[key] == "ytdAverage" || responseDataColKeys[key] == "rolling3MonthAverage") {
                                    vm.columnObj = {
                                        field: responseDataColKeys[key],
                                        cellFilter: 'number: 2',
                                        headerCellClass: 'myGridHeaders',
                                        cellClass: "grid-align",
                                        width: '20%'
                                    };
                }


                if (vm.columnObj != null)
                    vm.colDefinitions.push(vm.columnObj);
             }
            
            return vm.colDefinitions;
        }
        

        function initializeRevenueColDefs(responseDataColKeys, stateContext) {
            vm.colDefinitions = [];
            for (var key = 0; key < responseDataColKeys.length; key++) {

                switch (stateContext) {
                    case "R1":
                        if (responseDataColKeys[key] == "beginningDate" || responseDataColKeys[key] == "revenueAmount" ||
                            responseDataColKeys[key] == "endingDate") {
                                    vm.columnObj = {
                                        field: responseDataColKeys[key],
                                        headerCellClass: 'myGridHeaders',
                                        cellClass: "grid-align",
                                        cellFilter: 'date: "M/dd/yyyy"',
                                        width: '20%'
                                    };
                        }
                        break;
                    case "R2":
                    case "R3":  // combination leverages like-named keys/columns.
                        if (responseDataColKeys[key] == "amountReceived" ) {
                            vm.columnObj = {
                                field: responseDataColKeys[key],
                                headerCellClass: 'myGridHeaders',
                                aggregationType: uiGridConstants.aggregationTypes.sum,
                                cellClass: "grid-align",
                                cellFilter: 'number: 2',
                                footerCellTemplate: vm.totalFooterCellTemplate,
                                width: '20%'
                            };
                        }
                        if (responseDataColKeys[key] == "dateReceived") {
                            vm.columnObj = {
                                field: responseDataColKeys[key],
                                headerCellClass: 'myGridHeaders',
                                cellClass: "grid-align",
                                cellFilter: 'date: "M/dd/yyyy"',
                                width: '20%'
                            };
                        }
                        if (responseDataColKeys[key] == "ticker" || responseDataColKeys[key] == "accountType") {
                            vm.columnObj = {
                                field: responseDataColKeys[key],
                                cellClass: "grid-align",
                                headerCellClass: 'myGridHeaders',
                                width: '20%'
                            };
                        }
                        break;
                    case "R4":
                        if (responseDataColKeys[key] == "totalReceived") {
                            vm.columnObj = {
                                field: responseDataColKeys[key],
                                headerCellClass: 'myGridHeaders',
                                aggregationType: uiGridConstants.aggregationTypes.sum,
                                footerCellTemplate: vm.totalFooterCellTemplate,
                                cellClass: "grid-align",
                                cellFilter: 'number: 2',
                                width: '20%'
                            };
                        }
                        if (responseDataColKeys[key] == "yearReceived" || responseDataColKeys[key] == "monthReceived") {
                            vm.columnObj = {
                                field: responseDataColKeys[key],
                                cellClass: "grid-align",
                                headerCellClass: 'myGridHeaders',
                                width: '16%'
                            };
                        }
                        if (responseDataColKeys[key] == "assetCount") {
                            vm.columnObj = {
                                field: responseDataColKeys[key],
                                cellClass: "grid-align",
                                headerCellClass: 'myGridHeaders',
                                displayName: 'Contributing Asset Count',
                                width: '25%'
                            };
                        }
                        break;
                    case "R5":
                        if (responseDataColKeys[key] == "revenue") {
                            vm.columnObj = {
                                field: responseDataColKeys[key],
                                headerCellClass: 'myGridHeaders',
                                aggregationType: uiGridConstants.aggregationTypes.sum,
                                footerCellTemplate: vm.totalFooterCellTemplate,
                                cellClass: "grid-align",
                                cellFilter: 'number: 2',
                                width: '20%'
                            };
                        }
                        if (responseDataColKeys[key] == "frequency" || responseDataColKeys[key] == "tickerSymbol") {
                            vm.columnObj = {
                                field: responseDataColKeys[key],
                                cellClass: "grid-align",
                                headerCellClass: 'myGridHeaders',
                                width: '15%'
                            };
                        }
                        if (responseDataColKeys[key] == "revenueDate") {
                            vm.columnObj = {
                                field: responseDataColKeys[key],
                                headerCellClass: 'myGridHeaders',
                                cellClass: "grid-align",
                                cellFilter: 'date: "M/dd/yyyy"',
                                width: '20%'
                            };
                        }
                        break;
                    case "R6":
                        if (responseDataColKeys[key] == "year" || responseDataColKeys[key] == "period") {
                            vm.columnObj = {
                                field: responseDataColKeys[key],
                                cellClass: "grid-align",
                                headerCellClass: 'myGridHeaders',
                                width: '20%'
                            };
                        }
                        if (responseDataColKeys[key] == "revenue") {
                            vm.columnObj = {
                                field: responseDataColKeys[key],
                                headerCellClass: 'myGridHeaders',
                                aggregationType: uiGridConstants.aggregationTypes.sum,
                                footerCellTemplate: vm.totalFooterCellTemplate,
                                cellClass: "grid-align",
                                cellFilter: 'number: 2',
                                width: '20%'
                            };
                        }
                        break;
                    case "RE": 
                        if (responseDataColKeys[key] == "amountReceived") {
                            vm.columnObj = {
                                field: responseDataColKeys[key],
                                headerCellClass: 'myGridHeaders',
                                aggregationType: uiGridConstants.aggregationTypes.sum,
                                cellClass: "grid-align",
                                cellFilter: 'number: 2',
                                footerCellTemplate: vm.totalFooterCellTemplate,
                                width: '15%',
                            };
                        }
                        if (responseDataColKeys[key] == "dateReceived") {
                            vm.columnObj = {
                                field: responseDataColKeys[key],
                                headerCellClass: 'myGridHeaders',
                                cellClass: "grid-align",
                                cellFilter: 'date: "M/dd/yyyy"',
                                width: '14%'
                            };
                        }
                        if (responseDataColKeys[key] == "ticker" || responseDataColKeys[key] == "accountType") {
                            vm.columnObj = {
                                field: responseDataColKeys[key],
                                cellClass: "grid-align",
                                headerCellClass: 'myGridHeaders',
                                width: '15%'
                            };
                        }
                        if (responseDataColKeys[key] == "revenuePositionId") {
                            vm.columnObj = {
                                visible: false,
                                field: responseDataColKeys[key],
                                cellClass: "grid-align",
                                headerCellClass: 'myGridHeaders',
                                width: '15%'
                            };
                        }
                        if (responseDataColKeys[key] == "revenueId") {
                            vm.columnObj = {
                                visible: false,
                                field: responseDataColKeys[key],
                                cellClass: "grid-align",
                                headerCellClass: 'myGridHeaders',
                                width: '15%'
                            };
                        }
                        break;
                }

                if (vm.columnObj != null)
                    vm.colDefinitions.push(vm.columnObj);
            }

            return vm.colDefinitions;

        }
        

        function initializeProfileProjectionColDefs(columnKeys) {
            vm.colDefinitions = [];
            for (var key = 0; key < columnKeys.length; key++) {
                if (columnKeys[key] === "ticker" ) {
                    vm.columnObj = {
                        field: columnKeys[key],
                        cellClass: "grid-align",
                        headerCellClass: 'myGridHeaders',
                        enableCellEdit: true,
                        headerTooltip: 'Enter asset ticker symbol.',
                        width: '8%'
                    };
                }
                if (columnKeys[key] === "capital") {
                    vm.columnObj = {
                        field: columnKeys[key],
                        displayName: 'Capital ($)',
                        cellClass: "grid-align",
                        headerCellClass: 'myGridHeaders',
                        headerTooltip: 'Enter investment amount for projection.',
                        enableCellEdit: true,
                        width: '11%'
                    };
                }
                if (columnKeys[key] === "price") { 
                    vm.columnObj = {
                        field: columnKeys[key],
                        cellClass: "grid-align",
                        headerCellClass: 'myGridHeaders',
                        cellFilter: 'number: 3',
                        headerTooltip: ' Displays current market share price. ',
                        width: '9%'
                    };
                }
                // Deferred for possible future use.
                //if (columnKeys[key] == "pE_Ratio") {
                //    vm.columnObj = {
                //        field: columnKeys[key],
                //        displayName: 'P/E',
                //        cellClass: "grid-align",
                //        headerCellClass: 'myGridHeaders',
                //        cellFilter: 'number: 2',
                //        headerTooltip: ' Displays current price/earnings ratio. ',
                //        width: '8%'
                //    };
                //}
                if (columnKeys[key] === "divFreq") {
                    vm.columnObj = {
                        field: columnKeys[key],
                        displayName: ' Div.Freq ',
                        enableCellEdit: true,
                        cellClass: "grid-align",
                        headerCellClass: 'myGridHeaders',
                        headerTooltip: "Enter dividend distribution frequency. ",
                        width: "9%"
                    };
                }
                if (columnKeys[key] === "divYield" ) {
                    vm.columnObj = {
                        field: columnKeys[key],
                        displayName: 'Div.Yield',
                        cellClass: "grid-align",
                        headerCellClass: 'myGridHeaders',
                        cellFilter: 'number: 3',
                        headerTooltip: ' Displays annual or TTM yield. ',
                        width: '10%'
                    };
                }
                if (columnKeys[key] === "divDate") {
                    vm.columnObj = {
                        field: columnKeys[key],
                        displayName: 'Div.Date',
                        headerCellClass: 'myGridHeaders',
                        cellClass: "grid-align",
                        cellFilter: 'date: "M/dd/yyyy"',
                        headerTooltip: 'Displays date dividend is to be paid',
                        width: '12%'
                    };
                }
                if (columnKeys[key] === "divRate" ) {
                    vm.columnObj = {
                        field: columnKeys[key],
                        enableCellEdit: true,
                        displayName: "Div.Rate",
                        cellClass: "grid-align",
                        headerCellClass: 'myGridHeaders',
                        headerTooltip: "Enter available dividend rate",
                        width: '11%'
                    };
                }
                if (columnKeys[key] === "projectedRevenue") {
                    vm.columnObj = {
                        field: columnKeys[key],
                        displayName: "Monthly income (projected)",
                        aggregationType: uiGridConstants.aggregationTypes.sum,
                        footerCellTemplate: vm.totalFooterCellTemplate,
                        cellClass: "grid-align",
                        headerCellClass: 'myGridHeaders',
                        cellFilter: 'number: 2',
                        headerTooltip: 'Displays approximate projected monthly revenue.',
                        width: '20%'
                    };
                }


                if (vm.columnObj != null)
                    vm.colDefinitions.push(vm.columnObj);

            }

            return vm.colDefinitions;

        }


        function initializePositionEditColDefs(columnKeys) {
            vm.colDefinitions = [];
            for (var key = 0; key < columnKeys.length; key++) {
                if (columnKeys[key] == "referencedTickerSymbol" ) {
                    vm.columnObj = {
                        field: columnKeys[key],
                        displayName: 'Ticker',
                        cellClass: "grid-align",
                        headerCellClass: 'myGridHeaders',
                        enableCellEdit: false,
                        width: '10%'
                    };
                }
                if (columnKeys[key] == "preEditPositionAccount") {
                    vm.columnObj = {
                        field: columnKeys[key],
                        displayName: 'Account',
                        cellClass: "grid-align",
                        headerCellClass: 'myGridHeaders',
                        enableCellEdit: false,
                        width: '12%'
                    };
                }
                if (columnKeys[key] == "qty") {
                    vm.columnObj = {
                        field: columnKeys[key],
                        cellClass: "grid-align",
                        displayName: 'Qty',
                        headerCellClass: 'myGridHeaders',
                        cellFilter: 'number: 0',
                        enableCellEdit: false,
                        width: '9%'
                    };
                }
                if (columnKeys[key] == "unitCost") {
                    vm.columnObj = {
                        field: columnKeys[key],
                        displayName: 'Unit Cost',
                        cellClass: "grid-align",
                        headerCellClass: 'myGridHeaders',
                        cellFilter: 'number: 2',
                        enableCellEdit: false,
                        width: '12%'
                    };
                }
                if (columnKeys[key] == "dateOfPurchase") {
                    vm.columnObj = {
                        field: columnKeys[key],
                        displayName: 'Buy Date',
                        cellClass: "grid-align",
                        headerCellClass: 'myGridHeaders',
                        cellFilter: 'date: "M/dd/yyyy"',
                        headerTooltip: 'Date asset purchased',
                        enableCellEdit: false,
                        width: '15%'
                    };
                }
                if (columnKeys[key] == "datePositionAdded") {
                    vm.columnObj = {
                        field: columnKeys[key],
                        displayName: 'Pos.Add Date',
                        headerCellClass: 'myGridHeaders',
                        cellClass: "grid-align",
                        cellFilter: 'date: "M/dd/yyyy"',
                        headerTooltip: 'Date position added',
                        enableCellEdit: false,
                        width: '12%'
                    };
                }
                if (columnKeys[key] == "lastUpdate") {
                    vm.columnObj = {
                        field: columnKeys[key],
                        enableCellEdit: false,
                        cellFilter: 'date: "M/dd/yyyy"',
                        displayName: 'Last update',
                        cellClass: "grid-align",
                        headerCellClass: 'myGridHeaders',
                        headerTooltip: ' Date position was last updated',
                        width: '16%'
                    };
                }
                if (columnKeys[key] == "positionId") {
                    vm.columnObj = {
                        field: columnKeys[key],
                        visible: false,
                        cellClass: "grid-align",
                        headerCellClass: 'myGridHeaders',
                        width: '14%'
                    };
                }
               


                if (vm.columnObj != null)
                    vm.colDefinitions.push(vm.columnObj);

            }

            return vm.colDefinitions;

        }


        function initializePositionSummaryColDefs(columnKeys) {
            vm.colDefinitions = [];
            for (var key = 0; key < columnKeys.length; key++) {
                if (columnKeys[key] == "positionSummaryTickerSymbol") {
                    vm.columnObj = {
                        field: columnKeys[key],
                        displayName: 'Ticker',
                        cellClass: "grid-align",
                        headerCellClass: 'myGridHeaders',
                        enableCellEdit: false,
                        width: '10%'
                    };
                }
                if (columnKeys[key] == "positionSummaryAccountType") {
                    vm.columnObj = {
                        field: columnKeys[key],
                        displayName: 'Account',
                        cellClass: "grid-align",
                        headerCellClass: 'myGridHeaders',
                        enableCellEdit: false,
                        width: '15%'
                    };
                }
                if (columnKeys[key] == "positionSummaryQty") {
                    vm.columnObj = {
                        field: columnKeys[key],
                        cellClass: "grid-align",
                        displayName: 'Units',
                        headerCellClass: 'myGridHeaders',
                        cellFilter: 'number: 0',
                        enableCellEdit: false,
                        width: '10%'
                    };
                }
                if (columnKeys[key] == "positionSummaryValuation") {
                    vm.columnObj = {
                        field: columnKeys[key],
                        displayName: '($) Valuation',
                        cellClass: "grid-align",
                        headerCellClass: 'myGridHeaders',
                        cellFilter: 'number: 2',
                        headerTooltip: 'Approximate Position value',
                        enableCellEdit: false,
                        width: '15%'
                    };
                }
                if (columnKeys[key] == "positionSummaryGainLoss") {
                    vm.columnObj = {
                        field: columnKeys[key],
                        displayName: '($) Gain / Loss',
                        cellClass: "grid-align",
                        headerCellClass: 'myGridHeaders',
                        cellFilter: 'number: 2',
                        headerTooltip: 'Approximate profit/loss since inception',
                        enableCellEdit: false,
                        width: '18%'
                    };
                }
              
                if (vm.columnObj != null)
                    vm.colDefinitions.push(vm.columnObj);

            }

            return vm.colDefinitions;

        }


        function initializeAssetSummaryColDefs(responseDataColKeys) {
            vm.colDefinitions = [];
            for (var key = 0; key < responseDataColKeys.length; key++) {
                if (responseDataColKeys[key] == "tickerSymbol") {
                    vm.columnObj = {
                        field: responseDataColKeys[key],
                        headerCellClass: 'myGridHeaders',
                        cellClass: "grid-align",
                        displayName: 'Ticker Symbol',
                        width: '13%'
                    };
                }
                if (responseDataColKeys[key] == "tickerDescription") {
                    vm.columnObj = {
                        field: responseDataColKeys[key],
                        headerCellClass: 'myGridHeaders',
                        cellClass: 'grid-align',
                        displayName: 'Description',
                        width: '55%'
                    };
                }
                if (responseDataColKeys[key] == "assetClassification") {
                    vm.columnObj = {
                        field: responseDataColKeys[key],
                        displayName: 'Asset class',
                        headerCellClass: 'myGridHeaders',
                        cellClass: "grid-align",
                        width: '20%'
                    };
                }
                
                if (vm.columnObj != null)
                    vm.colDefinitions.push(vm.columnObj);
            }

            return vm.colDefinitions;
        }


        // API
        return {
            initializeActivitySummaryColDefs: initializeActivitySummaryColDefs,
            initializeRevenueColDefs: initializeRevenueColDefs,
            initializeProfileProjectionColDefs: initializeProfileProjectionColDefs,
            initializePositionEditColDefs: initializePositionEditColDefs,
            initializePositionSummaryColDefs: initializePositionSummaryColDefs,
            initializeAssetSummaryColDefs: initializeAssetSummaryColDefs
        }



    }


}());