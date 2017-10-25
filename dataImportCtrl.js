(function () {

    "use strict";

    angular
        .module("incomeMgmt.dataImport")
        .controller("dataImportCtrl", dataImportCtrl);

    dataImportCtrl.$inject = ["dataImportSvc"];

    function dataImportCtrl(dataImportSvc) {

        var vm = this;
        var filePathRegExpr = "^(([a-zA-Z]\\:)|(\\\\))(\\\\{1}|((\\\\{1})[^\\\\]([^/:*?<>\"|]*))+)$";
        vm.importFilePath = ""; // test file: C:\Downloads\FidelityXLS\2017SEPT_RevenueTemplate.csv

        
        
        vm.processImportFile = function () {
            
            // Validate path.
            if (vm.importFilePath.match(filePathRegExpr))
                {
                    alert("file path is: " + vm.importFilePath + " \nand is valid.");

                    var result = dataImportSvc.parseImportFile(vm.importFilePath);
                }

        }
        

        vm.cancelImport = function () {
        }


       
        /* Async WebApi service calls */
        vm.postCheckRevenueDuplicate = function (duplicateFound) {

            //if (duplicateFound) {
            //    vm.isDuplicateIncome = duplicateFound;
            //    alert("Unable to save revenue; duplicate entry found for Asset: \n" +
            //           vm.selectedTicker.trim().toUpperCase() +
            //           "\n using account: " + vm.selectedAccountType +
            //          "\n on: " + $filter('date')(vm.incomeDateReceived, 'M/dd/yyyy'));
            //    return null;
            //}


            //// TODO: Fx name above should reflect save. Duplicate code - move to service.
            //var incomeBuild = createAssetWizardSvc.getBaseRevenue(); // fetch new instance to avoid duplicates.
            //var today = new Date();
            
            //incomeBuild.AcctType = vm.selectedAccountType;
            //incomeBuild.AmountRecvd = createAssetWizardSvc.formatCurrency(vm.incomeAmtReceived, 2);
            //incomeBuild.DateReceived = $filter('date')(vm.incomeDateReceived, 'M/dd/yyyy');
            //incomeBuild.AssetId = positionCreateSvc.getAssetId(positionData, vm.selectedTicker);
            //incomeBuild.AmountProjected = 0;
            //incomeBuild.DateUpdated = incomeMgmtSvc.formatDate(today);
            //incomeBuild.Url = createAssetWizardSvc.getBasePath
            //                                        + "Asset/"
            //                                        + vm.selectedTicker.trim().toUpperCase()
            //                                        + "/Income/"
            //                                        + incomeBuild.AcctType.toUpperCase();

            //// Extended properties needed for validation checking in saveRevenue().
            //incomeBuild.TickerSymbol = vm.selectedTicker.trim().toUpperCase();
            
            //var datePositionAdded = positionCreateSvc.getPositionAddDate(positionData, incomeBuild.TickerSymbol, incomeBuild.AcctType);
            //var formattedPosDate = new Date(datePositionAdded.toString());

            //incomeBuild.PositionAddDate = incomeMgmtSvc.formatDate(formattedPosDate);

            //incomeCreateSvc.saveRevenue(incomeBuild, vm);
            //return null;
        }


        //vm.postAsyncSave = function (isSaved) {
        //    if (!vm.isDuplicateIncome) {
        //        if (isSaved) {
        //            vm.incomeIsSaved = isSaved;
        //            alert("Successfully saved  $" + vm.incomeAmtReceived + "\nfor " + vm.selectedTicker + "\n on account " + vm.selectedAccountType);
        //        } else {
        //            if (!vm.incomeIsSaved)
        //                alert("Error saving income.");
        //        }
        //    }
        //}


    }


}());