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
        var today = new Date();

        vm.accountTypesCollection = accountTypes;
        vm.accountTypeSelected = "";
        vm.isOneOfManyPositions = false;
        // Fetch investors' entire Profile in case other properties are needed in the future.
        vm.currentInvestorProfile = currentInvestorSvc.profile;
        // Fetch currently saved Asset Profile.
        vm.currentAsset = createAssetWizardSvc.processAsset();
        vm.showAAssetAcctTypeValidationMsg = false;
        vm.showQtyValidationMsg = false;
        vm.QuantityRegEx = "^[0-9.]+$";
        vm.inRevisitMode = false;
        vm.transactionFees = 0.00;
        vm.currentUnitMktPrice = this.currentAsset.ProfileToCreate.Price;

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
            vm.costBasis = vm.currentAsset.ProfileToCreate.Price;
            vm.inRevisitMode = true;
        } else {
            vm.assetTickerSymbol = vm.currentAsset.AssetTicker;
            vm.assetPurchaseDate = "";
            vm.positionQty = 0;
            vm.costBasis = 0.00; 
            vm.unitCosts = 0.00; 
            vm.positionLastUpdate = getLastUpdate();
            vm.referencedAcctType = createAssetWizardSvc.getBaseReferencingAccount();
            vm.accountTypeSelected = vm.accountTypesCollection[5]; // "Select..."
        } 


        function getLastUpdate() {
            var date = new Date();
            return date.getMonth() + 1 + "/" + date.getDate() + "/" + date.getFullYear();
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
            
            if (vm.transactionFees > 0.00) {
                if (incomeMgmtSvc.isValidCurrencyFormat(vm.transactionFees)) {
                    unFormattedCostBasis = parseFloat(((vm.currentUnitMktPrice * vm.positionQty) + parseFloat(vm.transactionFees)));
                } else {
                    alert("Invalid fees entry.");
                }
            } else {
                unFormattedCostBasis = parseFloat(((vm.currentUnitMktPrice * vm.positionQty)));
            }

            return unFormattedCostBasis.toFixed(2);
        }


        vm.calculateUnitCosts = function() {
            return (vm.costBasis / vm.positionQty).toFixed(3);
        }


        vm.initializeCostBasisAndUnitCost = function() {
            
            if (vm.currentUnitMktPrice > 0.00 & vm.positionQty > 0) {
                vm.costBasis = this.calculateCostBasis();
                vm.unitCosts = this.calculateUnitCosts();
            } else {
                return 0.00;
            }
                
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
        

        vm.saveAssetPosition = function () {

           
            if (!vm.isValidAccountType()) {
                vm.showAAssetAcctTypeValidationMsg = true;
                $interval(function () {
                    vm.showAAssetAcctTypeValidationMsg = false;
                }, 5000);
                return null;
            }

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
            positionBuild.CostBasis = vm.costBasis;
            positionBuild.UnitCost = vm.unitCosts;
            positionBuild.TransactionFees = vm.transactionFees;
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


            // Initialize child Transaction object.
            positionBuild.ReferencedTransaction.TransactionId = incomeMgmtSvc.createGuid();
            positionBuild.ReferencedTransaction.PositionId = incomeMgmtSvc.createGuid();
            positionBuild.ReferencedTransaction.TransactionEvent = "B";
            positionBuild.ReferencedTransaction.Units = vm.positionQty;
            positionBuild.ReferencedTransaction.MktPrice = vm.currentUnitMktPrice;
            positionBuild.ReferencedTransaction.Fees = vm.transactionFees;
            positionBuild.ReferencedTransaction.UnitCost = vm.unitCosts;
            positionBuild.ReferencedTransaction.CostBasis = vm.costBasis;
            positionBuild.ReferencedTransaction.Valuation = (vm.positionQty * vm.currentUnitMktPrice);
            positionBuild.ReferencedTransaction.DateCreated = $filter('date')(today, 'M/dd/yyyy hh:mm');

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
            vm.transactionFees = 0;

        }


        vm.calendarOpen = function ($event) {
            $event.preventDefault(); // prevent any default action triggered
            $event.stopPropagation();

            vm.opened = !vm.opened;
        }

        


    }

}());