(function () {
    "use strict";

    /*
        Provides both login & registration services for accessing appropriate API endpoints, as well
        as formatting user credentials for HTTP requests.
        http://localhost/Pims.Web.Api/api/Account            - REST registration endpoint
        http://localhost/Pims.Web.Api/api/Account/LoginAsync - REST login; uses auth server "/token" endpoint.
    */
    
    angular
        .module("investorRegisterLogin")
        .factory("investorRegisterloginSvc", registerLogin);  // a shareable module; register new factory service with core module
        

    registerLogin.$inject = ["$resource", "appSettings"];


    //TODO: temp fix for direct auth server call.
    // Custom $resource method used.
    function registerLogin($resource, appSettings) {

        return {
            registration: $resource(appSettings.serverPath + "/Pims.Web.Api/api/Account", null, {
                                        "registerInvestor": { "method": "POST" }
                                    }),
            login: $resource(appSettings.serverPath + "/Pims.Web.Api/api/Account/LoginAsync", null, {
                                        "loginInvestor": {
                                                            "method" : "POST",
                                                            // Designate non-Json format for registration body.
                                                            "headers" : {"content-type" : "application/x-www-form-urlencoded"},
                                                            // Override default $resource Json formatting via transforming to urlencoding.
                                                            // Ex: userName=rpasch%40rpclassics.net&password...
                                                            "transformRequest" : function(data, headersGetter) {
                                                                var requestBodyStr = [];
                                                                for (var propSegment in data)
                                                                    requestBodyStr.push(encodeURIComponent(propSegment) + "=" + encodeURIComponent(data[propSegment]));
  
                                                                return requestBodyStr.join("&");
                                                            }
                                                         }
                                                    })
               } 
    }



}());