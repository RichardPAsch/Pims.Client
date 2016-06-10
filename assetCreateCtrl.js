(function () {

    "use strict";

    angular
        .module("incomeMgmt.assetCreate")
        .controller("assetCreateCtrl", assetCreateCtrl);

    assetCreateCtrl.$inject = ['$state', 'createAssetWizardSvc'];


    function assetCreateCtrl($state, createAssetWizardSvc) {
        var vm = this;
        vm.baseDomNode = 'steps clearfix';

        vm.displayActiveTab = function(tabToActivate) {
            createAssetWizardSvc.showActiveTab(vm.baseDomNode, tabToActivate);
        }
       

        // Handle browser refreshes, setting default state & active tab.
        createAssetWizardSvc.showActiveTab(vm.baseDomNode, 'ticker');
        $state.go("asset_create.ticker");



        //TODO: deferred - use of directive to implement 'Next/Previous' nav functionality?
        //function navigateTo(baseElement, direction) {
        //vm.showActiveTab('steps clearfix', 'profile');

            //$state.go('asset_create.profile');

            //var ulListing = document.getElementsByClassName(baseElement);
            //var count = ulListing[0].children[0].children.length;

            //for (var i = 0; i < count; i++) {
            //    if (ulListing[0].children[0].children[i].className.trim() == 'current') {
            //        var textId1 = ulListing[0].children[0].children[i].id;
            //        var textId2 = textId1.substr(0, textId1.indexOf('T'));
            //        if (direction.trim() == 'next') {
            //            ulListing[0].children[0].children[i+1].className = 'current';
            //            //vm.showActiveTab('steps clearfix', 'profile');// TODO: get name of tab to display
            //            break;
            //        }

            //    }


            //}
        //}



    }
    
    //angular
        //    .module("incomeMgmt.assetCreate")
        //    .directive('assetCreateView', function () {
        //        return {
        //            restrict: 'E',
        //            templateUrl: "assetCreateView.html",
        //            //scope: {},
        //            //transclude: true,
        //            controller: function (vm) {
        //                    vm.showActiveTab = function (parentElementClass, clickedTab) {
        //                    var ulListing = document.getElementsByClassName(parentElementClass);
        //                    var count = ulListing[0].children[0].children.length;

        //                    for (var i = 0; i < count; i++) {
        //                        var elementText = ulListing[0].children[0].children[i].id;
        //                        if (elementText.indexOf(clickedTab.trim()) >= 0) {
        //                            ulListing[0].children[0].children[i].className = 'current';
        //                        } else {
        //                            ulListing[0].children[0].children[i].className = 'done';
        //                        }
        //                    }

        //                }
        //            }
        //        };
        //    }
        //);



}());