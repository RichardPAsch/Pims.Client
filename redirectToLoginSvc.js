(function() {
    /* 
        Service utiliizes Angulars' http messaging pipeline processing, via use 
        of interceptors, and wil listen in on EACH incoming request, where we'll 
        catch all response errors, particularly trapping for a 401 (unauthorized) response, 
        in which case, we'll simply redirect the user accordingly.
    */

    "use strict";

    angular
        .module("redirectToLogin")
        .factory("redirectToLoginSvc", loginRedirect)
        .config(function ($httpProvider) {
           $httpProvider.interceptors.push(loginRedirect);   
       });


    
    loginRedirect().$inject = ['$q', '$location', 'appLocalStorageSvc'];
    

    // Injection of this service, e.g., via assetCreateCtrl, forces execution here first.
    function loginRedirect($q, $location, appLocalStorageSvc) {

        var lastUrlAttempted = "/";
       
        var responseError = function (response)
        {
            // Handle specific response error from unauthorized access to API. We'll track
            // the attempted access for later post-login redirect.
            if (response.status == 401) {
                lastUrlAttempted = $location.path();
                appLocalStorageSvc.addItem("urlAttempt", lastUrlAttempted); 
                $location.path("/Login");
            }

            // For all response errors, we will create a $q promise that will be rejected, and
            // deliver this response to anyone that is listening for this rejection.
            return $q.reject(response);
        };


        function redirectPostLogin() {

            // Verify investor didn't first try to attempt accessing functionality before logging in.
            var preLoginAttempt = appLocalStorageSvc.getItem("urlAttempt");
            if (preLoginAttempt != null && preLoginAttempt != "/" && preLoginAttempt != "/Login") {
                lastUrlAttempted = preLoginAttempt;
                appLocalStorageSvc.deleteItem("urlAttempt");
            } else {
                // Always the default page after a first time access--via login.
                lastUrlAttempted = "/ActivitySummary";
            }
                
            $location.path(lastUrlAttempted);
        }


       
        return {
            responseError: responseError,
            redirectPostLogin: redirectPostLogin
        };

    };







})();