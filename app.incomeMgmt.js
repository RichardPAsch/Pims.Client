(function() {
    "use strict";

    /* 
        PARENT module definition for the application.
        Aggregator for all app functionality via module declarations.
        Note: Dependencies are defined at specific functional levels vs defining module
              dependencies explicitly for each module in each module. This is easier to
              maintain, track, and extend.
    */

    angular.module("incomeMgmt", [

        // Module(s) - Application-wide access, reuseable SHARED functionality
        // used throughout the application, defined here.
        'incomeMgmt.core',



        // Module(s) - feature/functional areas, as Properties/behaviors
        // characteristic of the application as a whole.
        'incomeMgmt.registration',
        'incomeMgmt.login',
        'incomeMgmt.activitySummary',
        'incomeMgmt.assetCreate',
        'incomeMgmt.assetCreateTicker',
        'incomeMgmt.assetCreateProfile',
        'incomeMgmt.assetCreatePosition',
        'incomeMgmt.assetCreateIncome',
        'incomeMgmt.pimsGrid',
        'incomeMgmt.profileRetreive',
        'incomeMgmt.incomeCreate',
        'incomeMgmt.incomeEditDelete',
        'incomeMgmt.positionEditDelete',
        'incomeMgmt.assetClass',
        'incomeMgmt.positionTransactions'


    ]);


}());