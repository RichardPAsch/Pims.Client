(function () {

    "use strict";

    angular
        .module("incomeMgmt.pimsGrid")
        .controller("pimsGridCtrl", pimsGridCtrl);

    pimsGridCtrl.$inject = ['uiGridConstants', '$modal', '$location',
                            'queriesIncomeSvc', 'activitySummarySvc', 'pimsGridColumnSvc',
                            'queriesProfileProjectionSvc', '$state', 'positionCreateSvc',
                            'queriesPositionsSvc','queriesAssetSvc', '$stateParams'];
    

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

    function pimsGridCtrl(uiGridConstants, $modal, $location, queriesIncomeSvc, activitySummarySvc, pimsGridColumnSvc, queriesProfileProjectionSvc, $state, positionCreateSvc, queriesPositionsSvc, queriesAssetSvc, $stateParams) {
        
        var vm = this;
        // Contexts based on current routing 'state' & their URLs.
        var currentContext = getCurrentContextFromUrl($location.$$url);
        var isValidCapitalEntry = false;

        vm.gridTitle = "";
        vm.showRefreshBtn = false;
        vm.showToggle = true;
        vm.showProfilesBtn = false;
        vm.showRefreshGridBtn = true;
        vm.showProjectionsBtn = false;
        vm.disableProfilesBtn = true;
        vm.disableProjectionsBtn = true;
        vm.isUnInitializedProfileProjection = false;
        vm.isProfileOnlyRequest = true;
        vm.enteredGridTickersCapital = [];
        vm.gridOptions = {
            enableFiltering: false,
            enableCellEdit: false, 
            enableGridMenu: true,
            showGridFooter: true, 
            showColumnFooter: true,
            //enableSelectAll: true,
            exporterCsvFilename: 'testGridDataFile.csv',
            exporterMenuPdf: false, // for possible future use.
            // 'data' MUST be initialized for filtering to work--at this time. Bug or async call & grid display, design timing issue? Revisit ?
            data: [{ ".": "." }],
            onRegisterApi: function (gridApi) {
                vm.gridApi = gridApi;
                
                gridApi.edit.on.afterCellEdit(null, function (rowEntity, colDef, newValue, oldValue) {
                    if (colDef.name == 'ticker') {
                        vm.disableProfilesBtn = queriesProfileProjectionSvc.isValidTickerOrCapitalEdit(colDef.name, newValue);
                    }
                    if (colDef.name == 'capital') {
                        isValidCapitalEntry = queriesProfileProjectionSvc.isValidTickerOrCapitalEdit(colDef.name, newValue);
                    }
                    if (colDef.name == 'divRate') {
                        var exprMatch = new RegExp("[.0-9-ASQM]", "g");
                        var hyphenPos = parseInt(newValue.indexOf("-"));
                        if (hyphenPos == -1 || hyphenPos + 1 != parseInt(newValue.match(exprMatch).length) - 1) {
                            alert("Invalid dividend rate entry; \ncheck format example via column heading tooltip.");
                            rowEntity.divRate = oldValue != "0" ? "0" : oldValue;
                        }
                        // Enable 'Projection(s)' button only if capital & dividend rate entries are ok.
                        if (isValidCapitalEntry)
                            vm.disableProjectionsBtn = false;
                        
                    }
                });
                // Revenue Edit.
                if (currentContext == "RE") {
                    vm.gridOptions.multiSelect = false;
                    gridApi.selection.on.rowSelectionChanged(null, function (row) {
                        var revenueSelected = {
                            TickerSymbol: row.entity.ticker,
                            AcctType: row.entity.accountType,
                            Revenue: row.entity.amountReceived,
                            RevenueDate: row.entity.dateReceived,
                            RevenuePositionId: row.entity.revenuePositionId,
                            RevenueId: row.entity.revenueId
                        }
                        $state.go("income_edit", { revenueSelectionObj: revenueSelected });
                    });
                }
                // Position(s) Edit.
                if (currentContext == "P") {
                    vm.gridOptions.multiSelect = false;
                    gridApi.selection.on.rowSelectionChanged(null, function (row) {
                        // Row data columns used for mapping defined via 
                        // WebApi call from positionCreateSvc.getPositionsForTicker().
                        var positionSelected = {
                            TickerSymbol: row.entity.referencedTickerSymbol,
                            AcctType: row.entity.preEditPositionAccount,
                            Qty: row.entity.qty,
                            UnitCost: row.entity.unitCost,
                            PurchDate: row.entity.dateOfPurchase,
                            PositionAddDate: row.entity.datePositionAdded,
                            LastUpdate: row.entity.lastUpdate,
                            PositionId: row.entity.positionId
                        }
                        $state.go("position_edit", { positionSelectionObj: positionSelected });
                    });
                }
            }
        };



        var modalCriteriaInstance = {};
        var queryResults = [];
        var today = new Date();

        // Available generic grid heading message container when needed.
        vm.showMsg = false;

        switch (currentContext) {
            case "AS":
                vm.showToggle = false;
                vm.gridTitle = "YTD Income Activity Summary for  " + today.getFullYear();

                activitySummarySvc.query(function (responseData) {
                      queryResults = responseData;
                      buildGridColDefs();
                }, function(err) {
                    alert("Unable to fetch Activity Summary data due to: \n" + err.data.message);
                    $state.go("home");
                });
                break;
            case "R1":
            case "R2":
            case "R3":
            case "R4":
            case "R5":
            case "R6":
            case "RE":
            case "P":
                vm.criteriaEntries = queriesIncomeSvc.buildCriteriaEntries();
                vm.templatePath = $location.$$protocol +
                                    "://" + $location.$$host +
                                    ":" + $location.$$port +
                                    "/app/Queries/Criteria.Dialog/criteriaView.html";
                open();
                break;
            case "PP":
                vm.showProfilesBtn = true;
                vm.showProjectionsBtn = true;
                vm.showToggle = false;
                vm.gridTitle = "Asset Profiles - Projections  [ max: 5 ]";
                vm.isUnInitializedProfileProjection = true;
                buildGridColDefs();
                break;
            case "PO":
                vm.gridTitle = " Portfolio Position Summary for " + today.toDateString();
                vm.showMsg = true;
                vm.gridMsg = " *Note - Valuation & Gain/Loss figures are approximations only.";
                queriesPositionsSvc.query(function(results) {
                    queryResults = results;
                    buildGridColDefs();
                });
                break;
            // Asset summary results via 'Queries' menu.
            case "AA":
                vm.gridTitle = " Portfolio asset summary ";
                queriesAssetSvc.getAssetSummaryData($stateParams.status, vm);
                break;
        }




        
        function getCurrentContextFromUrl(currentPath) {
            var builtContext = "";

            // currentPath ex: "/grid/AA/I"
            for (var i = 6; i < currentPath.length; i++) {
                if (currentPath[i] == '/') {
                    break;
                }

                builtContext += currentPath[i];
            };
            return builtContext;
        }
        

        // Modal dialog - query criteria entry(ies) entered.
        function open() {
            modalCriteriaInstance = $modal.open({
                templateUrl: vm.templatePath,
                controller: 'criteriaCtrl',
                size: 'md',
                // Members that will be resolved & PASSED to criteriaCtrl
                // (via injection), as locals (of type object).
                resolve: {
                    queryCriteria: function () {
                        return vm.criteriaEntries;
                    }
                }
            });

            // Promise
            modalCriteriaInstance.result.then(
                // Success
                function (criteriaData) {
                    switch (criteriaData[1].Group) {
                        case 'R1':
                        case 'R2':
                        case 'R3':
                        case 'R4':
                        case 'R5':
                        case 'R6':
                        case 'RE':
                            criteriaData[0].Value_1 = queriesIncomeSvc.formatUrlDate(criteriaData[0].Value_1);
                            criteriaData[0].Value_2 = queriesIncomeSvc.formatUrlDate(criteriaData[0].Value_2);
                            vm.enteredCriteria = criteriaData;
                            queriesIncomeSvc.getRevenue($location.$$path, vm.enteredCriteria, vm);
                            break;
                        case 'P':
                           positionCreateSvc.getPositionsForTicker(criteriaData[0].Value_3.toUpperCase().trim(), vm);
                           break;
                    }
                },
                function (ex) {
                    if (ex != "cancel")
                        alert("Error obtaining query criteria.");

                });
        };
        
        
        // Post-async getRevenue() queries processing.
        vm.initializeGrid = function () {
            queryResults = queriesIncomeSvc.getQueryResults(); // 11.22.16 - now includes revenuePositionId
            vm.gridTitle = queriesIncomeSvc.getQuerySelection();
            //vm.gridOptions.data = data; //Bug ? -  Disables filtering 
            buildGridColDefs();
        }


        // Post-async getPositionsForTicker() processing.
        vm.initializePositionsGrid = function (responsePositions) {
            queryResults = responsePositions;
            // Make all ticker Position(s) available for possible Position (account type) editing.
            positionCreateSvc.setInvestorMatchingAccounts(queryResults);
            vm.gridTitle = vm.criteriaEntries[3].Description2.trim();
            buildGridColDefs();
        }


        vm.postAsyncGetAssetSummaryData = function (initializedSummary) {
            queryResults = initializedSummary;
            buildGridColDefs();
            vm.showRefreshBtn = true;
            vm.showRefreshGridBtn = false;
        }
        

        function buildGridColDefs() {
            // Template ref for columnDefs: [  { field: 'revenueMonth', headerCellClass: 'myGridHeaders' }, ...]
            var queryResultKeys = [];
            if (currentContext != "PP") {
                queryResultKeys = Object.keys(queryResults[0]).toString().split(",");  // column headers
            }
            
            var colDefs = [];
            
            switch(currentContext) {
                case "AS":
                    colDefs = pimsGridColumnSvc.initializeActivitySummaryColDefs(queryResultKeys);
                    break;
                case "R1":  
                case "R2":
                case "R3":
                case "R4":
                case "R5":
                case "R6":
                case "RE":
                    // Reorder columns manually, despite attempt via WebApi: GetAssetRevenueHistoryByDatesWithAcctTypes().
                    if (currentContext == "RE") {
                        queryResultKeys[0] = "ticker";
                        queryResultKeys[1] = "accountType";
                        queryResultKeys[2] = "dateReceived";
                        queryResultKeys[3] = "amountReceived";
                        queryResultKeys[4] = "revenuePositionId"; 
                        queryResultKeys[5] = "revenueId";        
                    }
                    colDefs = pimsGridColumnSvc.initializeRevenueColDefs(queryResultKeys, currentContext);
                    break;
                case "PP":
                    if (vm.isUnInitializedProfileProjection) {
                        // Template only; pre-ticker symbol entry.
                        queryResultKeys = ["ticker", "capital", "price", "divRate", "divYield", "divDate", "pE_Ratio", "projectedRevenue"];
                        colDefs = pimsGridColumnSvc.initializeProfileProjectionColDefs(queryResultKeys);
                        vm.gridOptions.data = [
                                { ticker: "Enter ticker", capital: "(optional)", divRate: "0" }, { ticker: "Enter ticker", capital: "(optional)", divRate: "0" },
                                { ticker: "Enter ticker", capital: "(optional)", divRate: "0" }, { ticker: "Enter ticker", capital: "(optional)", divRate: "0" },
                                { ticker: "Enter ticker", capital: "(optional)", divRate: "0" }];
                    } 
                    break;
                case "P":
                    queryResultKeys[0] = "referencedTickerSymbol";
                    queryResultKeys[1] = "preEditPositionAccount";
                    queryResultKeys[2] = "qty";
                    queryResultKeys[3] = "unitCost";
                    queryResultKeys[4] = "dateOfPurchase"; 
                    queryResultKeys[5] = "datePositionAdded";
                    queryResultKeys[6] = "lastUpdate";
                    queryResultKeys[7] = "positionId";

                    colDefs = pimsGridColumnSvc.initializePositionEditColDefs(queryResultKeys);
                    break;
                case "PO":  // POsition summary
                    queryResultKeys[0] = "positionSummaryTickerSymbol";
                    queryResultKeys[1] = "positionSummaryAccountType";
                    queryResultKeys[2] = "positionSummaryQty";
                    queryResultKeys[3] = "positionSummaryValuation";
                    queryResultKeys[4] = "positionSummaryGainLoss";

                    colDefs = pimsGridColumnSvc.initializePositionSummaryColDefs(queryResultKeys);
                    break;
                case "AA":
                    queryResultKeys[0] = "tickerSymbol";
                    queryResultKeys[1] = "tickerDescription";
                    queryResultKeys[2] = "assetClassification";

                    colDefs = pimsGridColumnSvc.initializeAssetSummaryColDefs(queryResultKeys);
                    break; 
            }



            vm.gridOptions.columnDefs = colDefs;
            if (currentContext == "R1")
                queryResults[0].revenueAmount = queriesIncomeSvc.formatCurrency(queryResults[0].revenueAmount);



            if (!vm.isUnInitializedProfileProjection)
                vm.gridOptions.data = queryResults;

        }
        

        vm.toggleFiltering = function () {
            vm.gridOptions.enableFiltering = !vm.gridOptions.enableFiltering;
            vm.gridApi.core.notifyDataChange(uiGridConstants.dataChange.COLUMN);
        };


        // 'Profiles', 'Projections' button event handler.
        vm.preAsyncInitializeProfileProjectionGrid = function (includeProjections, gridData) {
            for (var row = 0; row < 5; row++) {
                if (gridData.grid.rows[row].entity.ticker != "Enter ticker") {
                    var tickerAndCapital = {
                                                tickerSymbol: gridData.grid.rows[row].entity.ticker,
                                                dividendRateInput: gridData.grid.rows[row].entity.divRate != "0"
                                                                        ? gridData.grid.rows[row].entity.divRate
                                                                        : "0",
                                                capitalToInvest: includeProjections == true
                                                                 ? gridData.grid.rows[row].entity.capital
                                                                 : 0
                                            };

                    vm.enteredGridTickersCapital.push(tickerAndCapital);
                }
            }
            
           queriesProfileProjectionSvc.getProfiles(vm.enteredGridTickersCapital, vm);
        }


        vm.postAsyncInitializeProfileProjectionGrid = function(initializedProfiles) {
            vm.gridOptions.data = initializedProfiles;
            vm.disableProfilesBtn = true;
            vm.disableProjectionsBtn = true;

        }




        vm.refreshGrid = function () {
            // Also clears browser cache ?
            location.reload(true);
        }

        // TODO: Duplicate found in positionEditDeleteCtrl; consolidate into service?
        vm.clearPosition = function () {
            var backlen = history.length;
            history.go(-backlen);
            window.location.href = "http://localhost:5969/App/Layout/Main.html#/grid/P";

        }


    }



}());