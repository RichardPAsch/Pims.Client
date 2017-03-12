(function () {

    // TODO: re-evaluate need for this, not used anywhere ? 9.23.16

    /* Reusable data access component for all /Asset-related CRUD operations,
       $resource object offers the following default methods for back-end communication:
         1)query, 
         2)get,
         3)save,
         4)remove
         added via customization
         5) update
    */

    "use strict";

    angular
        .module("incomeMgmt.core")
        .factory("assetResource", assetResource);

    assetResource.$inject = ["$resource", "appSettings"];
    

    function assetResource($resource, appSettings) {

        // Returns $resource class object; sets up communication with the server as a wrapper for $http service.
        return $resource(appSettings.serverPath + "/Pims.Web.Api/api/Asset/:id",
                         null, // NO default parameter values necessary
                         {
                             'update' : {method: 'PUT'}
                         });
    };



}());