(function() {
    /* 
        Service utiliizes Angulars' http messaging pipeline processing, via use 
        of interceptors, and wil append EACH outgoing request with a header
        holding the current logged in users' access_token, for authorization purposes.
    */

    "use strict";

    angular
       .module("appendToken")
       .factory("appendTokenSvc", addRequestToken)
       // Register interceptor(s), adding string value of 'appendToken' to data structure.
       // $httpProvider allows for registering more than 1 interceptor.
       .config(function ($httpProvider) {
           $httpProvider.interceptors.push(addRequestToken);   // string value of addRequestToken needed here?
           //alert($httpProvider.interceptors[0].toString());
       });

    addRequestToken.$inject = ['currentInvestorSvc', '$q'];



    function addRequestToken(currentInvestorSvc, $q) {
        // 'config' object is associated with all http requests, and contains header, url, data, etc.
        var request = function (config) {
            if (currentInvestorSvc.profile.IsLoggedIn) {
                // Create auth header for every request once login is verified.
                config.headers.Authorization = "Bearer " + currentInvestorSvc.profile.token;
            }

            // Interceptor returns the passed in 'config' object via a 'promise' ($q service) that
            // resolves with that value of config.
            return $q.when(config);
        }

        // For now, a single method will to be called for EVERY outgoing http request. 
        // We will handle incoming response later if needed.
        return {
            request: request
        }


    };




}());