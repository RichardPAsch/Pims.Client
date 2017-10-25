(function () {

   
    "use strict";

    angular
        .module("incomeMgmt.core")
        .factory("dataImportSvc", dataImportSvc);

    dataImportSvc.$inject = [];


    function dataImportSvc() {

        var vm = this;
       


        
        function parseImportFile(importFile) {

            console.log("Received file: " + importFile);
            //var incomeUrl = appSettings.serverPath + "/Pims.Web.Api/api/Asset/" + incomeToSave.TickerSymbol + "/Income";

            //if (!incomeMgmtSvc.isValidIncomeDateVsPositionAndTodayDate(incomeToSave.DateReceived, incomeToSave.PositionAddDate)) {
            //    alert("Invalid entry; income date may not precede date 'Position' was created, \nnor exceed todays' date.");
            //    return;
            //}

            //// Properties now unnecessary.
            //delete incomeToSave.TickerSymbol;
            //delete incomeToSave.PositionAddDate;


            //$resource(incomeUrl).save(incomeToSave).$promise.then(function () {
            //    ctrl.postAsyncSave(true);
            //}, function () {
            //    ctrl.postAsyncSave(false);
            //});
            return "ok";
        }

       


        

        // API
        return {
            parseImportFile: parseImportFile
           
        }

    }



}());