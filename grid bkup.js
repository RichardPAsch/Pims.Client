// original

// Header text is highlighted upon text entry into filter area.
vm.highlightFilteredHeader = function (row, rowRenderIndex, col, colRenderIndex) {
    if (col.filters[0].term) {
        return 'header-filtered';
    } else {
        return '';
    }
};

vm.gridOptions = {
    enableFiltering: false,
    showGridFooter: true,
    showColumnFooter: false,
    data: [
            {
                "fname": "Richard",
                "lname": "Asch",
                "gender": "male"
            },
            {
                "fname": "Patricia",
                "lname": "Motheral",
                "gender": "female"
            }
    ],
    onRegisterApi: function (gridApi) { //TODO: what is this? affects filtering
        vm.gridApi = gridApi;
    },
    columnDefs: [
        { field: 'fname', headerCellClass: vm.highlightFilteredHeader },
        { field: 'lname', headerCellClass: vm.highlightFilteredHeader },
        { field: 'gender', headerCellClass: vm.highlightFilteredHeader }
    ]

};


vm.toggleFiltering = function () {
    vm.gridOptions.enableFiltering = !vm.gridOptions.enableFiltering;
    vm.gridApi.core.notifyDataChange(uiGridConstants.dataChange.COLUMN);
};



//vm.testData = [
//    {
//        "fname": "Richard",
//        "lname": "Asch",
//        "gender": "male"
//    },
//    {
//        "fname": "Patricia",
//        "lname": "Motheral",
//        "gender": "female"
//    }
//];
