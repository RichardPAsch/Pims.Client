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

            $resource(vm.importFileControllerUrl).save(importFileDataModel).$promise.then(
                function (responseMsg) {
                    var respObj = responseMsg;
                    ctrl.postAsyncProcessImportFile(responseMsg);
                },
                function (err) {
                    alert("Unable to process XLSX import file for ticker symbol(s) :\n" + err.data.message + "\nValidate that : \n1) submitted file type is correct, and/or \n2) there are no duplicate or missing POSITION-ACCOUNT(S).");
                }
             );
        }

       


        // API
        return {
            processImportFileModel: processImportFileModel
        }

    }



}());