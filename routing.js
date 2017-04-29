
(function() {
        "use strict";

        var app = angular.module("incomeMgmt.core");
    /*
         Dependencies are registered, and the application is set up to run an anonymous function that executes during the configuration phase. 
         $stateProvider object features the "state" method that allows you to define granular application states that may or may not coincide with changes to the URL
         state() returns $stateProvider, therefore can chain state declarations.
    */
    
        app.config(["$stateProvider", "$urlRouterProvider", function ($stateProvider, $urlRouterProvider) {

            $urlRouterProvider.otherwise("/");  // default URL if no state match found

            $stateProvider
                .state("home", {
                // defined home state - state referenced via html 'sref=' (state reference)
                    url: "/",
                    templateUrl: "../Layout/welcomeView.html"
                })

                .state("signUp", {
                    url: "/Register",
                    templateUrl: "../RegistrationLogin/registerView.html",
                    controller: "RegisterCtrl as vm"
                })

                .state("signIn", {
                    url: "/Login",
                    templateUrl: "../RegistrationLogin/loginView.html",
                    controller: "LoginCtrl as vm"
                })

                .state("activitySummary", {
                    url: "/grid/AS",
                    templateUrl: "../Common.Templates/pimsGrid.html",
                    controller: "pimsGridCtrl",
                    controllerAs: "vm"
                })

                .state("logout", {
                    url: "/",
                    templateUrl: "../Layout/welcomeView.html"
                })


                // Parent state for 'Asset Creation'; contains panel & tabs.
                // Nested child states (4) will share controller from the parent.
                .state("asset_create", {
                    // ReSharper disable once UsingOfReservedWord
                    abstract: true, // prevent explicit activation of parent w/o child state being active.
                    url: "/AssetCreate",
                    templateUrl: "../Asset/Create/assetCreateView.html",
                    controller: "assetCreateCtrl as vm" // added 1.4.16
                })

                .state("asset_create.ticker", {
                // first of 4 nested views, noted via dot notation
                    url: "/Ticker",
                    templateUrl: "../Asset/Create/Ticker/assetCreateTickerView.html",
                    controller: "assetCreateTickerCtrl", // required 
                    controllerAs: "vm",
                    // have assetClassifications data asynchronously fetched/resolved & available before the controller is instantiated.
                    // Resolve = another property of state config object; provides custom data to defined ctrl; dependencies (listed as keys/properties)
                    // can be injected into the ctrl, & can be a promise--for which data is first fetched, as noted. Values (of key/value pairs)
                    // can be a string (service) or a fx (a promise).
                    resolve: {
                        assetClassificationsSvc: "assetClassificationsSvc",
                        assetClassifications: function(assetClassificationsSvc) {
                            return assetClassificationsSvc.query().$promise;
                        }
                    }
                })

                .state("asset_create.profile", {
                    url: "/Profile/:tickerSymbol",
                    templateUrl: "../Asset/Create/Profile/assetCreateProfileView.html",
                    controller: "assetCreateProfileCtrl", // required 
                    controllerAs: "vm",
                    resolve: {
                        assetProfileSvc: "assetProfileSvc",
                        assetProfile: function(assetProfileSvc, $stateParams) {
                            var tickerForProfile = $stateParams.tickerSymbol;
                            return assetProfileSvc.get({ tickerSymbol: tickerForProfile }).$promise;
                        }
                    }
                })

                .state("asset_create.profileEmpty", {
                    url: "/Profile",
                    templateUrl: "../Asset/Create/Profile/assetCreateProfileView.html",
                    controller: "assetCreateProfileCtrl", // required 
                    controllerAs: "vm",
                    resolve: {
                        assetProfileSvc: "assetProfileSvc",
                        assetProfile: function() {
                            return null;
                        }
                    }
                })

                .state("asset_create.position", {
                    url: "/Position",
                    templateUrl: "../Asset/Create/Position/assetCreatePositionView.html",
                    controller: "assetCreatePositionCtrl",
                    controllerAs: "vm",
                    resolve: {
                        accountTypesSvc: "accountTypesSvc",
                        accountTypes: function(accountTypesSvc) {
                            return accountTypesSvc.query().$promise;
                        }
                    }
                })

                .state("asset_create.income", {
                    url: "/Income",
                    templateUrl: "../Asset/Create/Income/assetCreateIncomeView.html",
                    controller: "assetCreateIncomeCtrl",
                    controllerAs: "vm"
                })


                // Expects a promise, & ensures promise is 
                // resolved before controller instantiation.
                // Income
                .state("income_create", {
                    url: "/Income",
                    templateUrl: "../Income/Create/incomeCreateView.html",
                    controller: "incomeCreateCtrl",
                    controllerAs: "vm",
                    resolve: {
                        positionCreateSvc: "positionCreateSvc",
                        positionData: function(positionCreateSvc) {
                            return positionCreateSvc.getPositionData();
                        }
                    }
                })

                // Available revenue candidates for edit/delete.
                .state("incomes_edit", {
                    url: "/grid/RE",
                    templateUrl: "../Common.Templates/pimsGrid.html",
                    controller: "pimsGridCtrl",
                    controllerAs: "vm"
                })

                // User-selected revenue detail for edit/delete.
                .state("income_edit", {
                    url: "/Income/EditDelete",
                    templateUrl: "../Income/UpdateDelete/incomeEditDeleteView.html",
                    controller: "incomeEditDeleteCtrl",
                    controllerAs: "vm",
                    params: {
                        // Initialized & passed to controller upon revenue/row selection in grid.
                        revenueSelectionObj: null
                    },
                    resolve: {
                        positionCreateSvc: "positionCreateSvc",
                        allPositions: function(positionCreateSvc) {
                            return positionCreateSvc.getPositionData();
                        }
                    }
                })

                .state("queries_menu", {
                    url: "/Queries",
                    templateUrl: "../Queries/queriesMenuView.html",
                    controllerAs: "vm"
                })


                // Profile - single detail info
                .state("profile_retreive", {
                    url: "/Profile",
                    templateUrl: "../Profile/Retreive/profileRetreiveView.html",
                    controller: "profileRetreiveCtrl",
                    controllerAs: "vm"
                })


                // Queries - Query by group [leading to -> template grid]
                // R  - Asset (R)evenue group
                // PP - (P)rofiles-(P)rojections group 
                // PO - Asset (PO)sitions group
                // A  - (A)ssets summary group
                .state("query_revenue_1", {
                    url: "/grid/R1",
                    templateUrl: "../Common.Templates/pimsGrid.html",
                    controller: "pimsGridCtrl",
                    controllerAs: "vm"
                })

                .state("query_revenue_2", {
                    url: "/grid/R2",
                    templateUrl: "../Common.Templates/pimsGrid.html",
                    controller: "pimsGridCtrl",
                    controllerAs: "vm"
                })

                .state("query_revenue_3", {
                    url: "/grid/R3",
                    templateUrl: "../Common.Templates/pimsGrid.html",
                    controller: "pimsGridCtrl",
                    controllerAs: "vm"
                })

                .state("query_revenue_4", {
                    url: "/grid/R4",
                    templateUrl: "../Common.Templates/pimsGrid.html",
                    controller: "pimsGridCtrl",
                    controllerAs: "vm"
                })

                .state("query_revenue_5", {
                    url: "/grid/R5",
                    templateUrl: "../Common.Templates/pimsGrid.html",
                    controller: "pimsGridCtrl",
                    controllerAs: "vm"
                })

                .state("query_revenue_6", {
                    url: "/grid/R6",
                    templateUrl: "../Common.Templates/pimsGrid.html",
                    controller: "pimsGridCtrl",
                    controllerAs: "vm"
                })

                .state("query_profile_projection", {
                    url: "/grid/PP",
                    templateUrl: "../Common.Templates/pimsGrid.html",
                    controller: "pimsGridCtrl",
                    controllerAs: "vm"
                })

                .state("query_positions", {
                    url: "/grid/PO",
                    templateUrl: "../Common.Templates/pimsGrid.html",
                    controller: "pimsGridCtrl",
                    controllerAs: "vm"
                })

                .state("query_assets_abridged", {
                    url: "/grid/AA/:status",
                    templateUrl: "../Common.Templates/pimsGrid.html",
                    controller: "pimsGridCtrl",
                    controllerAs: "vm",
                    params: {
                        status: null
                    }
                    // Relying on service call from ctrl to inject.
                    //,
                    //resolve: {
                    //    queriesAssetSvc: "queriesAssetSvc",
                    //    assetSummary: function (queriesAssetSvc, $stateParams) {
                    //        return queriesAssetSvc.query({ status: $stateParams.status }).$promise;
                    //    }
                    //}
                })

               

                // Positions - Update-Add; candidates available for edit/delete.
                .state("positions_edit", {
                    url: "/grid/P",
                    templateUrl: "../Common.Templates/pimsGrid.html",
                    controller: "pimsGridCtrl",
                    controllerAs: "vm"
                })

                // User-selected position detail for edit/delete.
                .state("position_edit", {
                    url: "/Position/EditDelete",
                    templateUrl: "../Position/UpdateDelete/positionEditDeleteView.html",
                    controller: "positionEditDeleteCtrl",
                    controllerAs: "vm",
                    // gridApi.selection.on.rowSelectionChanged event fired upon 
                    // user selecting a position for display & editing, hence,
                    // null param passed is then initialized upon ctrl instantiation.
                    params: {
                        positionSelectionObj: null
                    },
                    resolve: {
                        positionCreateSvc: "positionCreateSvc",
                        allPositions: function (positionCreateSvc) {
                            return positionCreateSvc.getPositionData();
                        }
                    }
                })


                // Asset Classifications
                .state("asset_classifications", {
                    url: "/AssetClass",
                    templateUrl: "../AssetClass/assetClassView.html",
                    controller: "assetClassCtrl",
                    controllerAs: "vm",
                    resolve: {
                        assetClassificationsSvc: "assetClassificationsSvc",
                        assetClassifications: function (assetClassificationsSvc) {
                            return assetClassificationsSvc.query().$promise;
                        }
                    }
                })


                 // Position-Transactions
                .state("position_transactions_edit", {
                    url: "/Transactions",
                    templateUrl: "../Position-Transactions/transactionsModalView.html",
                    controller: "transactionsModalCtrl",
                    controllerAs: "vm",
                    params: {
                        positionIdParam: "",
                        accountParam: "",
                        mktPriceParam: 0
                    }
                })


            ; // termination for $stateProvider

        }]);
       

}());