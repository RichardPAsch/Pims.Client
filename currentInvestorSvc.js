(function(module) {

    "use strict";

    /*
        Provides state info (e.g., access_token, loggedIn, etc.), from localStorage if applicable, 
        for current Investor - particularly for screen refreshes.
        All services are stored as singletons, and thus single instances are accessible anywhere
        within the application.
    */
    
    var currentInvestorProfile = function(appLocalStorageSvc, $location) {

        // ReSharper disable once InconsistentNaming
        var INVESTORKEY = "PimsKey";


        var setProfile = function(investorName, token, issueDate, minToExpire) {
            profile.investorName = investorName;
            profile.token = token;
            profile.localStorageKey = INVESTORKEY;
            profile.tokenIssuedOn = issueDate;
            profile.tokenValidFor = minToExpire;

            // Add localStorage key for to-be-serialized profile.
            appLocalStorageSvc.addItem(INVESTORKEY, profile);
        }


        // Called during browser refresh.
        function initializeInvestor() {

            var investor = {
                investorName: "",
                token: "",
                localStorageKey : "",
                get IsLoggedIn() {
                    return this.token !== "";
                }
            };


            // Check profile data if investor already exists in localstorage.
            var localUser = appLocalStorageSvc.getItem(INVESTORKEY);
            if (localUser) {
                if(tokenHasExpired(localUser)) {
                    $location.path("/Login");
                }

                investor.investorName = localUser.investorName;
                investor.token = localUser.token;
                investor.localStorageKey = INVESTORKEY;
            }

            return investor;
        }


        function tokenHasExpired(investorProfileInfo) {
            var tokenDate = new Date(investorProfileInfo.tokenIssuedOn);
            var currentDateTime = new Date();

            // Appending configured StartUp.Auth.AccessTokenExpireTimeSpan value.
            var tokenToExpireAt = tokenDate.setMinutes(tokenDate.getMinutes() + investorProfileInfo.tokenValidFor);
            // Obtained ms value converted to date.
            return new Date(tokenToExpireAt) < currentDateTime;
        }


        // If investor was in localstorage, it will now be part of the profile.
        var profile = initializeInvestor();
        

        // API for callers.
        return {
            profile: profile,
            setProfile : setProfile
        };

    };

    // Register this service with 'incomeMgmt' factory method.
    // arg1: name of service; arg2: dependencies and fx pointer. 
    module.factory("currentInvestorSvc", ['appLocalStorageSvc', '$location', currentInvestorProfile]);

    


    // Obtain reference to module.
}(angular.module('currentInvestor')));