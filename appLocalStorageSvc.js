(function() {

    "use strict";
    /*
        Service handles HTML5 localStorage and is a wrapper around
        it and the browser, avoiding loss of state (tokens, location.path, etc.) 
        when necessary, and upon browser refreshes. API allows for simple CRUD-like operations.
        Note: localStorage is stored separately for EACH browser user profile,
        such that each user accessing this site will have their OWN localstorage space.
    */

    angular
        .module("appLocalStorage")
        .factory("appLocalStorageSvc", handleToken);

    handleToken.$inject = ['$window'];

    function handleToken($window) {

        // Access via windows service.
        var store = $window.localStorage;

        function addItem(key, value) {
            value = angular.toJson(value);
            store.setItem(key, value);
        }

        function getItem(key) {
            var value = store.getItem(key);
            if (value)
                value = angular.fromJson(value);

            return value;
        }

        function deleteItem(key) {
            store.removeItem(key);
        }



        return {
            addItem : addItem,
            getItem : getItem,
            deleteItem : deleteItem
        }

    };


}());