(function () {

    "use strict";

    angular
        .module("incomeMgmt.assetCreatePosition")
        .controller("assetCreatePositionCtrl", assetCreatePositionCtrl);

    // $promise returned, via 'routing.js' state;  key reference injected for initializing dropdown.
    assetCreatePositionCtrl.$inject = ['createAssetWizardSvc', 'accountTypes', '$state', '$filter', 'currentInvestorSvc', 'appSettings','$interval'];


    function assetCreatePositionCtrl(createAssetWizardSvc, accountTypes, $state, $filter, currentInvestorSvc, appSettings, $interval) {

        var vm = this;
        var positionCount = 0;

        vm.accountTypesCollection = accountTypes;
        vm.accountTypeSelected = "";
        vm.isOneOfManyPositions = false;
        // Fetch investors' entire Profile in case other properties are needed in the future.
        vm.currentInvestorProfile = currentInvestorSvc.profile;
        vm.currentAsset = createAssetWizardSvc.processAsset();
        vm.showAAssetAcctTypeValidationMsg = false;
        vm.showQtyValidationMsg = false;
        vm.QuantityRegEx = "^[0-9.]+$";
        vm.inRevisitMode = false;
  

        if (vm.currentAsset.PositionsCreated != undefined) {
            // Always the most recently added Position will be available for REVISIT viewing.
            positionCount = vm.currentAsset.PositionsCreated.length - 1;
            vm.positionQty = vm.currentAsset.PositionsCreated[positionCount].Qty;
            vm.costBasis = vm.currentAsset.PositionsCreated[positionCount].CostBasis;
            vm.assetPurchaseDate = vm.currentAsset.PositionsCreated[positionCount].DateOfPurchase;
            vm.positionLastUpdate = vm.currentAsset.PositionsCreated[positionCount].LastUpdate;
            var idx = createAssetWizardSvc.getAccountTypeIndex(vm.currentAsset.PositionsCreated[positionCount].PostEditPositionAccount, accountTypes);
            vm.accountTypeSelected = vm.accountTypesCollection[idx];
            vm.assetTickerSymbol = vm.currentAsset.AssetTicker.toUpperCase();
            vm.positionUnitPrice = vm.currentAsset.ProfileToCreate.Price;
            vm.inRevisitMode = true;
        } else {
            vm.assetTickerSymbol = vm.currentAsset.AssetTicker;
            vm.assetPurchaseDate = "";
            vm.positionQty = 0;
            vm.positionUnitPrice = vm.currentAsset.ProfileToCreate == undefined ? 0 : vm.currentAsset.ProfileToCreate.Price;
            vm.costBasis = 0;
            vm.positionLastUpdate = getLastUpdate();
            vm.referencedAcctType = createAssetWizardSvc.getBaseReferencingAccount();
            vm.accountTypeSelected = vm.accountTypesCollection[5]; // "Select..."
        } 


        vm.isMinimumPositionData = function () {
            if (vm.inRevisitMode)
                return false;
           
            if (vm.accountTypeSelected.accountTypeDesc != "Select..." && vm.assetPurchaseDate != "" && vm.positionQty > 0) {
                return true;
            } else {
                return false;
            }
        }
        

        vm.calculateCostBasis = function () {
            vm.costBasis = $filter('currency')(vm.positionUnitPrice * vm.positionQty);
        }


        vm.isValidAccountType = function () {
            return vm.accountTypeSelected.accountTypeDesc == "Select..." ? false : true;
        }

       
        vm.isValidQuantity = function () {
            return vm.positionQty == undefined || vm.positionQty.match(vm.QuantityRegEx) == null
                                               || vm.positionQty.length > 6
                                               || vm.positionQty == ""
                ? false
                : true;
        }


        function getLastUpdate() {
            var date = new Date();
            return  date.getMonth() + 1 + "/" + date.getDate() + "/" + date.getFullYear();
        }
                

        vm.saveAssetPosition = function () {

            if (!vm.isValidAccountType()) {
                vm.showAAssetAcctTypeValidationMsg = true;
                $interval(function () {
                    vm.showAAssetAcctTypeValidationMsg = false;
                }, 5000);
                return null;
            }

            // Not needed; field is now readonly!
            //if (!vm.isValidPurchaseDate()) {
            //    vm.showPurchaseDateValidationMsg = true;
            //    $interval(function () {
            //        vm.showPurchaseDateValidationMsg = false;
            //    }, 5000);
            //    return null;
            //}

            if (!vm.isValidQuantity()) {
                vm.showQtyValidationMsg = true;
                $interval(function () {
                    vm.showQtyValidationMsg = false;
                }, 5000);
                return null;
            }

            // One or more Positions may be associated with an Asset.
            if (vm.currentAsset.PositionsCreated != undefined){
                positionCount = vm.currentAsset.PositionsCreated.length;
            } else {
                vm.currentAsset.PositionsCreated = [];
            }


            if (positionCount > 0 && createAssetWizardSvc.checkAccountTypeDuplicate(vm.accountTypeSelected.accountTypeDesc, vm.currentAsset.PositionsCreated)) {
                alert("Unable to save; duplicate Position found for : " + vm.accountTypeSelected.accountTypeDesc.toUpperCase());
                return null;
            }
                

            // Initialize with Position; object graph includes 'ReferencedAccount'
            var positionBuild = createAssetWizardSvc.getBasePosition(); // fetch new instance to avoid duplicates.

            positionBuild.PreEditPositionAccount = vm.accountTypeSelected.accountTypeDesc;
            positionBuild.PostEditPositionAccount = vm.accountTypeSelected.accountTypeDesc;
            positionBuild.Qty = Number(vm.positionQty);
            positionBuild.CostBasis = createAssetWizardSvc.formatCurrency(vm.costBasis, 2);
            positionBuild.DateOfPurchase = $filter('date')(vm.assetPurchaseDate, 'M/dd/yyyy');
            positionBuild.LastUpdate = $filter('date')(vm.positionLastUpdate, 'M/dd/yyyy');
            positionBuild.Url = appSettings.serverPath + "/Pims.Web.Api/api/Asset/"
                                                       + vm.currentAsset.AssetTicker.toUpperCase().trim()
                                                       + "/Position/"
                                                       + vm.accountTypeSelected.accountTypeDesc;

            positionBuild.LoggedInInvestor = vm.currentInvestorProfile.investorName.trim();

            // Intialize child AccountType object.
            positionBuild.ReferencedAccount.AccountTypeDesc = vm.accountTypeSelected.accountTypeDesc;
            positionBuild.ReferencedAccount.Url = appSettings.serverPath + "/Pims.Web.Api/api/Asset/"
                                                                         + vm.currentAsset.AssetTicker.toUpperCase().trim()
                                                                         + "/Position/Account/"
                                                                         + vm.accountTypeSelected.accountTypeDesc; // use Guid instead ?
            
            vm.currentAsset.PositionsCreated.push(positionBuild);
  
            // Update service with new Position(s).
            createAssetWizardSvc.processAsset(vm.currentAsset);

            if (vm.isOneOfManyPositions) {
                vm.clearPosition();
            } else {
                $state.go("asset_create.income");
                createAssetWizardSvc.showActiveTab('steps clearfix', 'income');
            }
            return null;
        }


        vm.reInitialize = function() {
            // If user forgets to uncheck 'Mark as one of many...' upon last entry/Save, then allow them to continue to 'Income' page;
            // the most recent entry may be viewed via page/tab revisit.
            if (!vm.isOneOfManyPositions && vm.currentAsset.PositionsCreated.length > 0) {
                if (!vm.inRevisitMode)
                    vm.inRevisitMode = true;

                $state.go("asset_create.income");
                createAssetWizardSvc.showActiveTab('steps clearfix', 'income');
            }
        }


        vm.clearPosition = function () {
            vm.accountTypeSelected = vm.accountTypesCollection[5]; 
            vm.assetPurchaseDate = "";
            vm.positionQty = 0;
            vm.costBasis = 0;
            vm.positionLastUpdate = getLastUpdate();
            vm.referencedAcctType = createAssetWizardSvc.getBaseReferencingAccount();
        }


        vm.calendarOpen = function ($event) {
            $event.preventDefault(); // prevent any default action triggered
            $event.stopPropagation();

            vm.opened = !vm.opened;
        }

        


    }

}());