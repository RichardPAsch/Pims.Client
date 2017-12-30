(function () {

   
    "use strict";

    angular
        .module("incomeMgmt.core")
        .factory("dataImportSvc", dataImportSvc);

    dataImportSvc.$inject = ["$resource", 'appSettings'];


    function dataImportSvc($resource, appSettings) {

        var vm = this;
        vm.importFileControllerUrl = appSettings.serverPath + "/Pims.Web.Api/api/ImportFile";

        
        function processImportFileModel(importFileDataModel, ctrl) {
            var test = 2;
            // TODO: ok to this point. Double quotes on file path ok? 12.29.17
            // TODO: sample file used: C:/Downloads/FidelityXLS/Portfolio_RevenueTEST_1_Fidelity.xlsx


            $resource(vm.importFileControllerUrl).save(importFileDataModel.ImportFilePath.trim()).$promise.then(function () {
                    ctrl.postAsyncProcessImportFile("ok");
                },
                    function() {
                        // to be implmented
                    });


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
            processImportFileModel: processImportFileModel
           
        }

    }



}());