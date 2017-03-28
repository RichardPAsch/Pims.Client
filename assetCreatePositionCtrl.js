(function () {

    "use strict";

    angular
        .module("incomeMgmt.assetCreatePosition")
        .controller("assetCreatePositionCtrl", assetCreatePositionCtrl);

    // $promise returned, via 'routing.js' state;  key reference injected for initializing dropdown.
    assetCreatePositionCtrl.$inject = ['createAssetWizardSvc', 'accountTypes', '$state', '$filter', 'currentInvestorSvc', 'appSettings','$interval', 'incomeMgmtSvc'];


    function assetCreatePositionCtrl(createAssetWizardSvc, accountTypes, $state, $filter, currentInvestorSvc, appSettings, $interval, incomeMgmtSvc) {

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
        vm.assetFees = 0.00;
        var today = new Date();
  

        if (vm.currentAsset.PositionsCreated != undefined) {
            // Always the most recently added Position will be available for REVISIT viewing.
            positionCount = vm.currentAsset.PositionsCreated.length - 1;
            vm.positionQty = vm.currentAsset.PositionsCreated[positionCount].Qty;
            vm.unitCosts = vm.currentAsset.PositionsCreated[positionCount].UnitCosts;
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
            vm.unitCosts = 0;
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
            var unFormattedCostBasis = 0.0;
            
            if (vm.assetFees != "") {
                if (incomeMgmtSvc.isValidCurrencyFormat(vm.assetFees)) {
                    unFormattedCostBasis = parseFloat(((vm.positionUnitPrice * vm.positionQty) + parseFloat(vm.assetFees)));
                } else {
                    alert("Invalid fees entry.");
                }
            } else {
                    unFormattedCostBasis = parseFloat(((vm.positionUnitPrice * vm.positionQty)));
            }

            vm.costBasis = createAssetWizardSvc.formatCurrency(unFormattedCostBasis.toString(), 2);
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
                

            // Initialize with Position view model; object graph includes 'ReferencedAccount'
            // Fetch new instance to avoid duplicates.
            var positionBuild = createAssetWizardSvc.getBasePositionVm();

            positionBuild.PreEditPositionAccount = vm.accountTypeSelected.accountTypeDesc;
            positionBuild.PostEditPositionAccount = vm.accountTypeSelected.accountTypeDesc;
            positionBuild.Qty = Number(vm.positionQty);
            positionBuild.ReferencedTickerSymbol = vm.currentAsset.AssetTicker.toUpperCase().trim();
            positionBuild.CostBasis = createAssetWizardSvc.formatCurrency(vm.costBasis.toString(), 2);

            positionBuild.UnitCost = incomeMgmtSvc.isValidCurrencyFormat(vm.positionUnitPrice.toString()) ? vm.positionUnitPrice : 0.0;
            
            //positionBuild.UnitCost = createAssetWizardSvc.formatCurrency(vm.positionUnitPrice, 2);
            positionBuild.DateOfPurchase = $filter('date')(vm.assetPurchaseDate, 'M/dd/yyyy');
            positionBuild.LastUpdate = $filter('date')(vm.positionLastUpdate, 'M/dd/yyyy');
            positionBuild.DatePositionAdded = $filter('date')(today, 'M/dd/yyyy');
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


        vm.clearPosition = function () {
            vm.accountTypeSelected = vm.accountTypesCollection[5]; 
            vm.assetPurchaseDate = "";
            vm.positionQty = 0;
            vm.costBasis = 0;
            vm.positionLastUpdate = getLastUpdate();
            vm.referencedAcctType = createAssetWizardSvc.getBaseReferencingAccount();
            vm.isOneOfManyPositions = false;
            vm.assetFees = 0;

        }


        vm.calendarOpen = function ($event) {
            $event.preventDefault(); // prevent any default action triggered
            $event.stopPropagation();

            vm.opened = !vm.opened;
        }

        


    }

}());