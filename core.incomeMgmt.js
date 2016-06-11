(function() {

    "use strict";

    angular
        .module("incomeMgmt.core", [
            /* 
                All dependencies will be resolved here.
            */

            // AngularJS modules.
            'ngAnimate',
            'ngResource',
            'ng',
            'ngAria',


            // Shareable modules available within application.
            'investorRegisterLogin',
            'currentInvestor',
            'appendToken',
            'redirectToLogin',
            'appLocalStorage',



         



            // 3rd-party modules.
            'ui.bootstrap',
            'ui.router',
            'ui.grid',
            'ui.grid.resizeColumns',
            'ui.grid.moveColumns',
            'ui.grid.selection',
            'ui.grid.exporter'


        ]);


}());