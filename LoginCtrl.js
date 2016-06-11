(function () {

    "use strict";
    
    angular
        .module("incomeMgmt.login")
        .controller("LoginCtrl", loginCtrl);

    loginCtrl.$inject = ['investorRegisterloginSvc', 'currentInvestorSvc', 'redirectToLoginSvc'];
    
    function loginCtrl(investorRegisterloginSvc, currentInvestorSvc, redirectToLoginSvc) {
        var vm = this;

        vm.token = "";
        vm.isLoggedIn = false;
        vm.message = "";
        vm.loginData = {
            grant_type: "",
            userName: "",
            password: ""
        };
       

        // Called by 'Sign in' button.
        vm.loginInvestor = function () {
            vm.grant_type = "password";
            vm.userName = vm.loginData.userName;

            // Use custom service for processing login & acquiring an access token.
            investorRegisterloginSvc.login.loginInvestor(vm.loginData,
                // Success callback.  
                function(responseData) {
                   vm.isLoggedIn = true;
                   vm.message = "";  // clear any old messages 
                   vm.password = ""; // not needed in this context
                   vm.token = responseData.access_token;
                   responseData.issuedOn = new Date().toUTCString();
                   responseData.minutesToExpiration = Math.ceil(responseData.expires_in / 60);
                   
                   // Hand off received token to service for general application availability.
                   currentInvestorSvc.setProfile(responseData.userName, responseData.access_token, responseData.issuedOn, responseData.minutesToExpiration);
                   // on successful login, we'll redirect to attempted URL, if applicable.
                   if (!currentInvestorSvc.profile.IsLoggedIn) {
                       vm.message = "Unable to verify login.";
                       redirectToLoginSvc.redirectPostLogin();
                       return;
                   } else {
                       redirectToLoginSvc.redirectPostLogin();
                   }
                },
                // Error callback - no access token granted.
                function(response) {
                    vm.password = "";
                    vm.isLoggedIn = false;
                    vm.message = response.statusText + "\r\n";
                    if (response.data.exceptionMessage)
                        vm.message += response.data.exceptionMessage;

                    if (response.data.error)
                        vm.message += response.data.error;
                }
            );



        }


    }


}());