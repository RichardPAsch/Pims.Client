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



         



            // Angular add-on 3rd-party modules.
            'ui.bootstrap',
            'ui.router',
            'ui.grid',
            'ui.grid.edit',
            'ui.grid.cellNav',
            'ui.grid.resizeColumns',
            'ui.grid.moveColumns',
            'ui.grid.selection',
            'ui.grid.exporter',
            'ui.grid.selection',
            'ui.grid.autoResize',
            'ui.grid.rowEdit'


        ]);


}());