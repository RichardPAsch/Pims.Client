(function () {

    /* Sharable component */

    "use strict";

    angular
        .module("incomeMgmt.core")
        .factory("createAssetWizardSvc", createAssetWizardSvc);

    createAssetWizardSvc.$inject = ["$resource", "appSettings", "currentInvestorSvc", "incomeMgmtSvc"];



    function createAssetWizardSvc($resource, appSettings, currentInvestorSvc, incomeMgmtSvc) {

        var initializedAsset = {};

        // Walk the DOM, containing inserted 'assetCreateXXXView' view, to show active selected tab.
        // TODO: figure out how using an Angular directive could work instead, with nested views.
        function showActiveTab(parentElementClass, clickedTab) {
            var ulListing = document.getElementsByClassName(parentElementClass);
            var count = ulListing[0].children[0].children.length;

            for (var i = 0; i < count; i++) {
                var elementText = ulListing[0].children[0].children[i].id;
                if (elementText.indexOf(clickedTab.trim()) >= 0) {
                    ulListing[0].children[0].children[i].className = 'current';
                } else {
                    ulListing[0].children[0].children[i].className = 'done';
                }
            }
        }


        function processAsset(val) {

            if (val == null) {
                return initializedAsset;
            } else {
                initializedAsset = val;
            }
            return null;
        }


        function getAsset() {

            return initializedAsset;
        }


        function getBaseAsset() {

            // Model for use during wizard intialization steps.
            return {
                "AssetTicker": "",
                "AssetDescription": "",
                "AssetClassification": "", // ex: CS (common stock)
                "ProfileToCreate": {
                    "TickerSymbol": "",
                    "TickerDescription": "",
                    "DividendFreq": "",
                    "Price": 0.0,
                    "DividendRate": 0.0,
                    "DividendYield": 0.0,
                    "PE_Ratio": 0.0,
                    "EarningsPerShare": 0,
                    "ExDividendDate": "1/1/1900",
                    "DividendPayDate": "1/1/1900",
                    "LastUpdate": "1/1/1900",
                    "Url": ""
                },
                "PositionsCreated": [
                  {
                      "PreEditPositionAccount": "",   // ex: IRA
                      "PostEditPositionAccount": "",  // ex: Roth-IRA
                      "Qty": 0,
                      "UnitCosts": 0.0,
                      "DateOfPurchase": "1/1/1900",
                      "LastUpdate": "1/1/1900",
                      "Url": "",
                      "LoggedInInvestor": "", // maryblow@yahoo.com
                      "ReferencedAccount": {
                          "AccountTypeDesc": "", // ex: IRA
                          "Url": ""
                      },
                      "ReferencedTransaction": {
                          "PositionId": "",
                          "TransactionId": "",
                          "TransactionEvent": "",
                          "Units": 0,
                          "MktPrice": 0,
                          "Fees": 0,
                          "UnitCost": 0,
                          "CostBasis": 0,
                          "Valuation": 0,
                          "DateCreated": ""
                      }
                  }
                ],
                "RevenueCreated": [
                  {
                      "AcctType": "", // ex: IRA
                      "AmountRecvd": 0.0,
                      "DateReceived": "1/1/1900",
                      "AmountProjected": 0,
                      "DateUpdated": "1/1/1900",
                      "Url": ""
                  }
                ]
            }

        }


        function getBaseProfile() {
            
            return {
                "ProfileId": "",
                "TickerSymbol": "",
                "CreatedBy": "",
                "TickerDescription": "",
                "DividendFreq": "",
                "Price": 0.0,
                "DividendRate": 0.0,
                "DividendYield": 0.0,
                "PE_Ratio": 0.0,
                "EarningsPerShare": 0,
                "ExDividendDate": "1/1/1900",
                "DividendPayDate": "1/1/1900",
                "LastUpdate": "1/1/1900",
                "Url": ""
            }

        }


        function getBasePositionVm() {
            // Satisfy WebApi.PositionController.CreateNewPosition() expected model state.
            return {
                        "PreEditPositionAccount": "",        // ex: IRA
                        "PostEditPositionAccount": "",       // ex: Roth-IRA
                        "Qty": 0,
                        "UnitCost": 0.0,
                        "CostBasis": 0.0,
                        "DateOfPurchase": "1/1/1900",
                        "LastUpdate": "1/1/1900",
                        "Url": "",
                        "LoggedInInvestor": "",              // ex: rpasch@rpclassics.net
                        "ReferencedAccount": {
                            "AccountTypeDesc": "",           // ex: IRA
                            "Url": ""
                        },
                        "ReferencedTransaction": {           // 1:1 - Position:Transaction during Asset creation.
                            "PositionId": "",
                            "TransactionId": "",
                            "TransactionEvent": "",
                            "Units": 0,
                            "MktPrice": 0,
                            "Fees": 0,
                            "UnitCost": 0,
                            "CostBasis": 0,
                            "Valuation": 0,
                            "DateCreated": ""
                        }, 
                        "ReferencedTickerSymbol": "",
                        "DatePositionAdded": "",
                        "Status": "A",                        // (A)ctive 
                        "TransactionFees": 0
                   }
        }


        function getBaseRevenue() {
            return {
                "AcctType": "", // ex: IRA
                "AmountRecvd": 0, 
                "AmountProjected": 0,
                "DateReceived": "1/1/1900",
                "DateUpdated": "1/1/1900",
                "Url": ""
            }
        }


        function getBaseReferencingAccount() {
            return {
                "AccountTypeDesc": "",
                "Url": ""
            }
        }


        function getCreatedPositionsAccountTypes() {
            // New asset WIP Position(s) : account type(s).
            var assetWip = this.getAsset();
            return assetWip.PositionsCreated == undefined ? null : assetWip.PositionsCreated;
        }

        
        function checkAssetDuplicate(assetToAdd, controller) {

            var investorProfile = currentInvestorSvc.profile;
            var assetByInvestorAndTickerUrl = appSettings.serverPath + "/Pims.Web.Api/api/Asset/" + assetToAdd.AssetTicker;
            var resourceObj = $resource(assetByInvestorAndTickerUrl);

            resourceObj.query().$promise.then(function(response) {
                // Success in this instance indicates a record was found, with duplicate check pending.
                var asset = response;
                if (investorProfile.investorName == asset[0].currentInvestor) {
                    controller.saveAssetBaseAttrPostDupCheck(false);
                } else {
                    controller.saveAssetBaseAttrPostDupCheck(true);
                }

            }, function () {
                // Error in this instance indicates NO record was found & is Ok to proceed; invalid ticker
                // symbols will be handled via the Profile controller.
                controller.saveAssetBaseAttrPostDupCheck(true);
            });
        }


        function checkNewRevenueDuplicate(newEntries) {

            // Perform duplicate checking on newly added revenue, in context of asset creation process.
            // Duplicate checking against persisted (Db) revenue is handled via 'incomeMgmtSvc'.

            var isDuplicate = false;
            for (var i = 0; i < newEntries.length; i++) {
                var currIdx = i;
                var currDate = newEntries[i].DateReceived;
                var currAmt = newEntries[i].AmountRecvd;
                var currAcct = newEntries[i].AcctType;

                for (var y = 0; y < newEntries.length; y++) {
                    if (y != currIdx) {
                        if (newEntries[y].DateReceived == currDate && newEntries[y].AmountRecvd == currAmt && newEntries[y].AcctType == currAcct) {
                            isDuplicate = true;
                            break;
                        }
                    }
                }
            }

            return isDuplicate;
        }


        function checkAccountTypeDuplicate(acctTypeToCheck, existingPositions) {
            // No new Position may be added where an associated account type already exist. Guid values used.
            var found = false;
            if (acctTypeToCheck != undefined && existingPositions != undefined) {
                for (var i = 0; i < existingPositions.length; i++) {
                    if (existingPositions[i].PostEditPositionAccount === acctTypeToCheck) {
                        found = true;
                        break;
                    }
                }
            }
            
            return found;
        }


        function checkIncomeDateVsPurchaseDate(dateReceived, associatedAcctType) {

            // Since Position 'date of purchase' is in context here, we'll encapsulate 
            // the majority of date logic here.
            var isOkDate = false;
            var newAsset = this.getAsset();

            // Iterate Positions affiliated with new asset being added.
            angular.forEach(newAsset.PositionsCreated, function (value) {
                // Leverage application-wide incomeMgmtSvc dates processing.
                if (value.ReferencedAccount.AccountTypeDesc == associatedAcctType.ReferencedAccount.AccountTypeDesc) {
                    isOkDate = incomeMgmtSvc.isValidIncomeDateVsPositionAndTodayDate(dateReceived, value.DateOfPurchase); 
                }
            });
            return isOkDate;
        }


        function isValidDividendFrequency(freqToCheck) {
            if (freqToCheck === null)
                return false;

            var acceptableFrequencies = ["A", "S", "Q", "M"];
            for (var idx = 0; idx < acceptableFrequencies.length; idx++) {
                if (freqToCheck.trim() === acceptableFrequencies[idx]) 
                    return true;
            }
            return false;
        }


        function getAccountTypeIndex(keyLookUp, searchCollection) {
            var foundIndex = 0;
            for (var i = 0; i < searchCollection.length; i++) {
                if (searchCollection[i].accountTypeDesc === keyLookUp) {
                    foundIndex = i;
                    break;
                }
            }
            return foundIndex;
        }


        function saveNewAsset(newAsset, ctrl) {

            // The $resource 'class' object method immediately returns an empty reference (object or array). Once the data 
            // is returned from the server, the existing reference is populated with the actual data.
            // TODO: 5.30.18 - debug WebApi ctrl
            var assetUrl = appSettings.serverPath + "/Pims.Web.Api/api/Asset";
            $resource(assetUrl).save(newAsset, function () {
                ctrl.postAsyncSaveAsset(true);  // success
            }, function (err) {
                var debugData = err;
                ctrl.postAsyncSaveAsset(false, debugData.statusText);  // error
            }); 

        }


        function formatCurrency(sourceString, precision) {

            // TODO: 5.23.16 - Obsolete; functionality now replaced via incomeMgmtSvc.isValidCurrencyFormat() . Keep for possible future use and/or refactoring.
            // Handle special currency characters.
            if (sourceString.indexOf('$') == 0 || sourceString.indexOf(',') >= 1) {
                var idx1 = sourceString.indexOf('$');
                var idx2 = sourceString.indexOf(',');
                var newFormat = "";

                if (idx1 == 0) {
                    newFormat = sourceString.replace('$', '');
                }

                if (idx2 >= 1) {
                    newFormat = newFormat.replace(',', '');
                }

                sourceString = newFormat;
            }

            var v1 = Number(sourceString);
            var v2 = v1.toFixed(precision);
            return Number(v2);
        }

        // TODO: still needed, now that we have 'readonly' attr set on date pickers?
        function formatDate(sourceDate) {
            var d = new Date(sourceDate);
            return d.getMonth() + 1 + "/" + d.getDate() + "/" + d.getFullYear();
        }


        
       

        // API.
        return {
            getBaseAsset: getBaseAsset,
            getAsset: getAsset,
            showActiveTab: showActiveTab,
            getBasePositionVm: getBasePositionVm,
            getBaseReferencingAccount: getBaseReferencingAccount,
            checkAccountTypeDuplicate: checkAccountTypeDuplicate,
            getBaseRevenue: getBaseRevenue,
            saveNewAsset: saveNewAsset,
            getBasePath: appSettings.serverPath + "/Pims.Web.Api/api/",   // "http://localhost/Pims.Web.Api/api/", modified 5.20.16
            getBaseProfile: getBaseProfile,
            processAsset: processAsset,
            formatCurrency: formatCurrency,
            formatDate: formatDate,
            isValidDividendFrequency: isValidDividendFrequency,
            getAccountTypeIndex: getAccountTypeIndex,
            checkAssetDuplicate: checkAssetDuplicate,
            getCreatedPositionsAccountTypes: getCreatedPositionsAccountTypes,
            checkIncomeDateVsPurchaseDate: checkIncomeDateVsPurchaseDate,
            checkNewRevenueDuplicate: checkNewRevenueDuplicate
           
        }


    };


   
}());