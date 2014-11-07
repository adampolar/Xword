define(function (require) {
    var gridModel = require("../model/grid");
    var view = require("../view/xword");
    var grid;

    document.getElementById("finish").addEventListener("click", function() {
        view.getRidOfGrid();
        grid.addNumbersToSquares();
        view.addNumbers(grid);
        view.getClues(grid.lines);
        document.getElementById("finish").style.display = "none";
    })
    
    //RegisterForPageEvents
    document.getElementById("generate").addEventListener("click", function (e) {
        view.hideCluesGetter();
        gridModel.saveClues();
        generateCrossword();
    });
    
    document.getElementById("save-for-later").addEventListener("click", function(e) {
        document.location.href = "mailto:?body="+ gridModel.generateUrl(true) +"&subject= My saved crossword";
    });


    function generateCrossword() {
        view.addClues(grid.lines);
        view.showUrl(gridModel.generateUrl());
    }

    return {
        addLine: function (startCoord, endCoord, clue, text) {
            grid.addLine(startCoord, endCoord, clue);
            view.drawCrossword(grid);
        },

        start: function () {


            if (document.URL.split("?xword=")[1]) {
                var xword = gridModel.getObjectFromUrl(Document.URL);
                xword.viewProperties = gridModel.getViewProperties();
                xword.viewProperties.HEIGHT = xword.stageHeight;
                xword.viewProperties.WIDTH = xword.stageWidth;
                view.makeStage(gridModel.getViewProperties());
                grid= xword;
                document.getElementById("save-for-later").style.display = "block";
                view.drawEmptyCrossword(xword);
                return;
            }


            document.getElementById("finish").style.display = "block";
            view.makeStage(gridModel.getViewProperties());


            grid = gridModel.get();
            view.setController(this);
            view.draw(grid);
        }
    }
})