(function () {
	"use strict";

	/* 
		Configuration setting(s) for all client-Web API communications, e.g., data access I/O.
		Module is not a 'feature area', but part of available 'core' functionality.
	*/

	angular
		.module("incomeMgmt.core") 
		.constant("appSettings", {
			serverPath: "http://localhost"  //TODO: Replace with production server path.
		});

}());