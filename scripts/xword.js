define(function (require) {


    var gridcontroller = require("controller/gridcontroller");


    return {
        start: function () {
            gridcontroller.start();
        }
    }
});