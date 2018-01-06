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
                function () {
                    // error to be implemented.
                }
             );
        }

       


        // API
        return {
            processImportFileModel: processImportFileModel
        }

    }



}());