(function() {

    "use strict";

    angular
        .module("incomeMgmt.registration")
        .controller("RegisterCtrl", registerCtrl);  

    registerCtrl.$inject = ['investorRegisterloginSvc', '$timeout', '$state'];

    function registerCtrl(investorRegisterloginSvc, $timeout, $state) {
        var vm = this;

        vm.isRegistered = false;
        vm.message = "";
        vm.registrationData = { // data to submit to WebApi
            UserName: "",       
            Password: "",
            ConfirmPassword : ""
        };

      
        // Called by 'Sign up' button.
        vm.registerInvestor = function () {
            
            if (!angular.equals(vm.registrationData.ConfirmPassword.trim(), vm.registrationData.Password.trim()))
                return "Invalid password confirmation";

            vm.registrationData.ConfirmPassword = vm.registrationData.Password.trim();

           
            // NO automatic login; require investor to login-- if desired.
            // Use customized service.
            //investorRegisterloginSvc.registerInvestor(vm.registrationData,
            investorRegisterloginSvc.registration.registerInvestor(vm.registrationData,
                // Success callback.
                function (responseData) {
                    vm.message = "Registration successful...";
                    $timeout(function() {
                        $state.go("signIn");
                    }, 4000);
                    //vm.message = "Registration successful...";
                    vm.isRegistered = true;
                },
                // Error callback.
                function(response){
                    vm.isRegistered = false;
                    vm.message = response.statusText + "\r\n";
                    if (response.data.exceptionMessage)
                        vm.message += "Exception error - " + response.data.exceptionMessage;

                    if(response.data.modelState)
                        vm.message += "Invalid model state - " +  response.data.modelState[key] + "\r\n";
                }
            );
            return vm.message;
        }


    }


}());