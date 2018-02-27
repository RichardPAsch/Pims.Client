(function() {

    "use strict";

    angular
        .module("incomeMgmt.core")
        .factory("profileCreateSvc", profileCreateSvc);

    profileCreateSvc.$inject = ['incomeMgmtSvc','$filter','appSettings', '$resource'];


    function profileCreateSvc(incomeMgmtSvc, $filter, appSettings, $resource) {

        var vm = this;
        var tickerRegEx = "^[a-zA-Z0-9-/_% ]+$"; // letters,numbers,hyphens,spaces, or underscores allowed for both symbol and desc.
        var validationExceptions = "";



        function validateProfileVm(profileToValidate) {
            // TODO: Some duplication with assetCreateTickerCtrl.js.
            validationExceptions = "";

            if (profileToValidate.TickerSymbol == undefined ||
                profileToValidate.TickerSymbol.match(tickerRegEx) == null ||
                profileToValidate.TickerSymbol.length > 8 ||
                profileToValidate.TickerSymbol === "")
                buildExceptionString("ticker symbol");


            if (profileToValidate.TickerDescription == undefined ||
                profileToValidate.TickerDescription.match(tickerRegEx) == null ||
                profileToValidate.TickerDescription.length > 50 ||
                profileToValidate.TickerDescription === "")
                buildExceptionString("ticker description");
            
            if(!incomeMgmtSvc.isValidDistributionFrequency(profileToValidate.DividendFreq) || profileToValidate.DividendFreq === "")
                buildExceptionString("div freq");

            if(isNaN(profileToValidate.Price) || profileToValidate.Price === "" || profileToValidate.Price === 0) 
                buildExceptionString("price");

            if(isNaN(profileToValidate.DividendRate) || profileToValidate.DividendRate === "" || profileToValidate.DividendRate === 0) 
                buildExceptionString("div rate");

            if(isNaN(profileToValidate.DividendYield) || profileToValidate.DividendYield === "") 
                buildExceptionString("div yield");
            
            if(isNaN(profileToValidate.PE_Ratio) || profileToValidate.PE_Ratio === "") 
                buildExceptionString("P/E");

            if(isNaN(profileToValidate.EarningsPerShare) || profileToValidate.EarningsPerShare === "") 
                buildExceptionString("EPS");

            profileToValidate.ExDividendDate = incomeMgmtSvc.validateDate(profileToValidate.ExDividendDate)
                ? profileToValidate.ExDividendDate
                :  buildExceptionString("exDiv Date");

            profileToValidate.DividendPayDate = incomeMgmtSvc.validateDate(profileToValidate.DividendPayDate)
                ? profileToValidate.DividendPayDate
                : buildExceptionString("div PayDate");

            profileToValidate.LastUpdate = $filter("date")(new Date(), "M/d/yyyy hh:mm a");


            return validationExceptions;
        }
        

        function buildExceptionString(exceptionAttr) {
            if (validationExceptions.length > 0)
                validationExceptions += " - " + "[" + exceptionAttr + "]";
            else
                validationExceptions += "[" + exceptionAttr + "]";
        }
            
        
        function saveProfile(profileToSave, ctrl) {

            // http://localhost/Pims.Web.Api/api/Profile
            var profileUrl = appSettings.serverPath + "/Pims.Web.Api/api/Profile";

            $resource(profileUrl).save(profileToSave).$promise.then(function () {
                ctrl.postAsyncSave(true);
            }, function () {
                ctrl.postAsyncSave(false);
            });
        }



        // API
        return {
            validateProfileVm: validateProfileVm,
            saveProfile: saveProfile

        }


    }


}());