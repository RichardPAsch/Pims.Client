(function(module) {

    /*
        Provides Income Received portion of 'Activity Summary' page..
        Example WebApi json results for : http://localhost/Pims.Web.Api/api/Income/Averages
        [
            {"monthRecvd":1,"amountRecvd":37.17,"ytdAverage":37.17,"rolling3MonthAverage":0.0},
            {"monthRecvd":3,"amountRecvd":33.19,"ytdAverage":35.18,"rolling3MonthAverage":0.0},
            {"monthRecvd":4,"amountRecvd":131.22,"ytdAverage":67.19,"rolling3MonthAverage":67.19},
            {"monthRecvd":5,"amountRecvd":389.21,"ytdAverage":147.70,"rolling3MonthAverage":184.54},
            {"monthRecvd":6,"amountRecvd":42.98,"ytdAverage":126.75,"rolling3MonthAverage":187.80}
        ]
    */

    "use strict";

    angular
        .module("incomeMgmt.core")
        .factory("activitySummarySvc", incomeActivity);

    incomeActivity.$inject = ["$resource", "appSettings"]; 


    function incomeActivity($resource, appSettings) {
        return $resource(appSettings.serverPath + "/Pims.Web.Api/api/Income/Averages");
    };

   

}());