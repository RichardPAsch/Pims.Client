/// <reference path="../Asset/assetCreateTickerView.html" />

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
                .state("home", {                // defined home state - state referenced via html 'sref=' (state reference)
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

                .state("asset_income_ActivitySummary", {
                    url: "/ActivitySummary",
                    templateUrl: "../ActivitySummary/activitySummaryView.html",  // phys addr: /Pims.Client/App/ActivitySummary/activitySummaryView
                    controller: "activitySummaryCtrl as vm"
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
                    controller: "assetCreateCtrl as vm"  // added 1.4.16
                })

                .state("asset_create.ticker", { // first of 4 nested views, noted via dot notation
                    url: "/Ticker",
                    templateUrl: "../Asset/Create/Ticker/assetCreateTickerView.html",
                    controller: "assetCreateTickerCtrl", // required 
                    controllerAs: "vm",
                    // have assetClassifications data asynchronously fetched/resolved & available before the controller is instantiated.
                    // Resolve = another property of state config object; provides custom data to defined ctrl; dependencies (listed as keys)
                    // can be injected into the ctrl, & can be a promise--for which data is first fetched, as noted. Values (of key/value pairs)
                    // can be a string (service) or a fx (a promise).
                    resolve: {
                        assetClassificationsSvc: "assetClassificationsSvc",
                        assetClassifications: function (assetClassificationsSvc) {
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
                        assetProfile: function (assetProfileSvc, $stateParams) {
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
                        assetProfile: function () {
                            return null;
                        }
                    }
                })

                .state("asset_create.position", {
                    url: "/Position",
                    templateUrl: "../Asset/Create/Position/assetCreatePositionView.html",
                    controller: "assetCreatePositionCtrl", // required 
                    controllerAs: "vm",
                    resolve: {
                        accountTypesSvc: "accountTypesSvc",
                        accountTypes: function (accountTypesSvc) {
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


                // Income
                .state("income_create", {
                    url: "/Income",
                    templateUrl: "../Income/Create/incomeCreateView.html",
                    controller: "createIncomeCtrl",
                    controllerAs: "vm"
                })

                .state("income_queries", {
                    url: "/Queries",
                    templateUrl: "../Income/Queries/incomeQueryMenuView.html",
                    controllerAs: "vm"
                })

                // template grid
                .state("generic_grid", {
                    url: "/grid",
                    templateUrl: "../Common.Templates/pimsGrid.html",
                    controller: "pimsGridCtrl",
                    controllerAs: "vm"
                })



            ; // termination for $stateProvider

        }]);
       

}());