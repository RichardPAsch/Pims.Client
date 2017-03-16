(function () {

    "use strict";

    angular
        .module("incomeMgmt.assetClass")
        .controller("assetClassCtrl", assetClassCtrl);


    assetClassCtrl.$inject = ['assetClassifications'];
    

    function assetClassCtrl(assetClassifications) {

        var vm = this;

        // TODO: re-eval injection via routing, as opposed to svc call, as page does NOT appear until route resolve/promise is fulfilled.
        // Initialized via injected data, as a result of routing resolve/promise.
        vm.assetClasses = assetClassifications;
        if (vm.assetClasses.length == 0) {
            alert("Error retreiving available asset classes.");
            return;
        }
        initializeAssetClassListing();

  
      
        vm.reload = function () {
            location.reload(true);
        }


        function initializeAssetClassListing() {
            var listingElement = document.getElementById("assetClassListing");

            for (var ac = 0; ac < vm.assetClasses.length; ac++) {
                if (ac == 1) {
                    listingElement.value = vm.assetClasses[ac].description;
                } else if(ac > 1) {
                    listingElement.value += "\r" + vm.assetClasses[ac].description;
                }
            }
        }



    }



}());