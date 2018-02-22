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
                    alert("Unable to process XLS import file; please check: \n1) submitted file type, and/or \n2) duplicate data,e.g, position-account.");
                }
             );
        }

       


        // API
        return {
            processImportFileModel: processImportFileModel
        }

    }



}());