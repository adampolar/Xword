define(function (require) {
    var gridModel = require("../model/grid");
    var view = require("../view/xword");
    var grid;

    //RegisterForPageEvents
    document.getElementById("generate").addEventListener("click", function (e) {
        generateCrossword();
    });


    function generateCrossword() {
        view.getRidOfGrid();
        grid.addNumbersToSquares();
        view.addNumbers(grid);
        view.addClues(grid.lines);
        view.showUrl(gridModel.generateUrl());
    }

    return {
        addLine: function (startCoord, endCoord, clue, text) {
            grid.addLine(startCoord, endCoord, clue);
            view.drawCrossword(grid);
        },

        start: function () {

            view.makeStage(gridModel.getViewProperties());

            if (document.URL.split("?xword=")[1]) {
                var xword = gridModel.getObjectFromUrl(Document.URL);
                xword.viewProperties = gridModel.getViewProperties();
                view.drawEmptyCrossword(xword);
                return;
            }




            grid = gridModel.get();
            view.setController(this);
            view.draw(grid);
        }
    }
})