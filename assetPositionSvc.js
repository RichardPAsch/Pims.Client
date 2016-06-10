(function () {

    "use strict";

    angular
        .module("incomeMgmt.core")
        .factory("assetPositionSvc", assetPositionSvc);

    assetPositionSvc.$inject = [];

    // Position-specifc functionality offerred.
    //TODO: Check this object (mapping) against new Position to be saved/added as part of a new Asset creation.
    //TODO: This needs refinement & completion, ex. create an API for use?

    function assetPositionSvc() {

        function createPosition() {
            return {
                "preEditPositionAccount": "",
                "postEditPositionAccount": null,
                "qty": 0,
                "costBasis": 0,
                "dateOfPurchase": "",
                "lastUpdate": "",
                "url": null,
                "loggedInInvestor": "",  // ex: "dc20c248-d731-4540-92e8-a48100bcc6d9",
                "referencedAccount": null,
                "createdPositionId": "00000000-0000-0000-0000-000000000000",
                "referencedAssetId": "00000000-0000-0000-0000-000000000000",
                "referencedTickerSymbol": null
            }
        }

    };



}());