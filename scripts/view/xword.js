define(function (require) {
    var kinetic = require("../kinetic");
    var stage;
    var gridLayer;
    var crosswordLayer;
    var ctrlr;
    var mousedown;
    var squaresHoveredOver = [];
    var enterTextMode = false;
    var enterTextLine;
    var viewProperties;
    var textEntrySquare;


    function drawLine(line, viewProperties, shouldEnterTextMode) {
        console.log(line);
        for (var i = 0; i < line.squares.length; i++) {
            var square = line.squares[i];
            if (!square.textView) {

                var sq = new kinetic.Rect({
                    x: square.offsetX,
                    y: square.offsetY,
                    width: viewProperties.SQUARE_SIZE,
                    height: viewProperties.SQUARE_SIZE,
                    stroke: viewProperties.SELECTED_COLOUR,
                    strokeWidth: viewProperties.LINE_WIDTH_HOVER,
                    fill: i == 0 && shouldEnterTextMode ? viewProperties.TEXT_ENTRY_FILL : viewProperties.FILL_COLOUR_HOVER,
                    //shadowBlur: i == 0 && shouldEnterTextMode ? 2 : 0,
                    //shadowColor: viewProperties.TEXT_ENTRY_FILL, //this isnt working
                    //shadowOpacity: 0.5
                });
                var simpleText = new kinetic.Text({
                    x: square.offsetX,
                    y: square.offsetY,
                    fontSize: 30,
                    fill: viewProperties.SELECTED_COLOUR,
                    fontFamily: 'Bree Serif',
                    width: sq.getWidth(),
                    align: 'center',
                    sq: sq,
                    square: square,
                    line: line,
                    Text: square.letter? square.letter:""
                });
                if (!shouldEnterTextMode) {
                    //attach event to fill in clue
                    if (true) {
                        simpleText.on("mousedown", function (e) {
                            if (enterTextLine) {
                                unfocus(enterTextLine);
                            }
                            this.getAttr("sq").fill(viewProperties.TEXT_ENTRY_FILL);
                            crosswordLayer.draw();
                            enterTextLine = this.getAttr("line");
                            enterTextMode = true;
                            textEntrySquare = this.getAttr("square");
                        });
                        simpleText.on("unfocus", function (e) {
                            this.getAttr("sq").fill("white");
                            crosswordLayer.draw();
                        });
                    }
                }


                square.crosswordLevelDrawing = sq;
                square.textView = simpleText;

                crosswordLayer.add(sq);
                crosswordLayer.add(simpleText);
                crosswordLayer.draw();
                enterTextMode = shouldEnterTextMode;
                enterTextLine = line;
            }

        }
    }

    function unfocus(line) {
        for (var i = 0; i < line.squares.length; i++) {
            line.squares[i].crosswordLevelDrawing.fill("White");
        }
    }

    function getSquaresFromCoordinates(coord1, coord2) {
        if (coord1.coordX === coord2.coordX) {
            return grid.squares[coord1.coordX].slice(coord1.coordY, coord2.coordY - coord1.coordY);
        } else if (coord1.coordY === coord2.coordY) {
            var squares = [];
            for (var i = coord1.coordX; i < coord2.coordX; i++) {
                squares[i - coord1.coordX] = grid.squares[i][coord1.coordY];
            }
            return squares;
        }
    }

    function clearAllSquares(grid, viewProperties) {
        for (var i = 0; i < grid.squares.length; i++) {
            for (var j = 0; j < grid.squares[i].length; j++) {
                clear(grid.squares[i][j], viewProperties);
            }
        }
    }

    function clear(square, viewProperties) {
        square.drawing.stroke(viewProperties.LINE_COLOUR);
        square.drawing.strokeWidth(viewProperties.LINE_WIDTH);
        square.drawing.fill(viewProperties.FILL_COLOUR);
    }

    function drawSquare(square, viewProperties, grid) {
        var sq = new kinetic.Rect({
            x: square.offsetX,
            y: square.offsetY,
            width: viewProperties.SQUARE_SIZE,
            height: viewProperties.SQUARE_SIZE,
            stroke: viewProperties.LINE_COLOUR,
            strokeWidth: viewProperties.LINE_WIDTH,
            fill: viewProperties.FILL_COLOUR
        });

        square.drawing = sq;

        sq.on('mouseover', function () {
            if (enterTextMode) return;
            if (mousedown) {
                clearAllSquares(grid, viewProperties);
                if (square.coordX == mousedownSquare.coordX) {
                    if (square.coordY >= mousedownSquare.coordY)

                        for (var i = mousedownSquare.coordY; i <= square.coordY; i++) {
                        grid.squares[square.coordX][i].drawing.stroke(viewProperties.LINE_COLOUR_HOVER);
                        grid.squares[square.coordX][i].drawing.strokeWidth(viewProperties.LINE_WIDTH_HOVER);
                        grid.squares[square.coordX][i].drawing.fill(viewProperties.FILL_COLOUR_HOVER);
                        squaresHoveredOver.push(grid.squares[square.coordX][i]);
                    }

                } else if (square.coordY == mousedownSquare.coordY) {
                    if (square.coordX >= mousedownSquare.coordX)

                        for (var i = mousedownSquare.coordX; i <= square.coordX; i++) {
                        grid.squares[i][square.coordY].drawing.stroke(viewProperties.LINE_COLOUR_HOVER);
                        grid.squares[i][square.coordY].drawing.strokeWidth(viewProperties.LINE_WIDTH_HOVER);
                        grid.squares[i][square.coordY].drawing.fill(viewProperties.FILL_COLOUR_HOVER);
                        squaresHoveredOver.push(grid.squares[i][square.coordY]);
                    }

                }

            }
            this.stroke(viewProperties.LINE_COLOUR_HOVER);
            this.strokeWidth(viewProperties.LINE_WIDTH_HOVER);
            this.fill(viewProperties.FILL_COLOUR_HOVER);
            gridLayer.draw();
        });
        sq.on('mouseout', function () {
            if (enterTextMode) return;
            this.stroke(viewProperties.LINE_COLOUR);
            this.strokeWidth(viewProperties.LINE_WIDTH);
            this.fill(viewProperties.FILL_COLOUR);
            gridLayer.draw();
        });

        sq.on('mousedown', function () {
            if (enterTextMode) return;
            mousedown = true;
            mousedownSquare = square;
            this.stroke(viewProperties.LINE_COLOUR_HOVER);
            this.strokeWidth(viewProperties.LINE_WIDTH_HOVER);
            this.fill(viewProperties.FILL_COLOUR_HOVER);
            gridLayer.draw();
        });

        sq.on('mouseup', function () {
            if (enterTextMode) return;
            mousedown = false;
            mouseupsquare = square;

            if (mousedownSquare !== mouseupsquare) {
                controller.addLine(mousedownSquare, mouseupsquare);
            }
        });


        gridLayer.add(sq);
    };

    function getFirstSquareWithoutText(line) {
        for (var i = 0; i < line.squares.length; i++) {
            if (!line.squares[i].textView.getText()) {
                return line.squares[i];
            }
        }

    }


    window.addEventListener('keypress', function (e) {
        if (enterTextMode) {
            var square = textEntrySquare || getFirstSquareWithoutText(enterTextLine);
            e = e || window.event;
            var charCode = (typeof e.which == "number") ? e.which : e.keyCode;
            if (charCode) {
                square.textView.text(String.fromCharCode((charCode)));
                square.letter =  String.fromCharCode((charCode));
                square.crosswordLevelDrawing.fill("white");
                if (!textEntrySquare) {
                    square = getFirstSquareWithoutText(enterTextLine);
                } else {
                    square = enterTextLine.squares[enterTextLine.squares.indexOf(square) + 1];
                    textEntrySquare = square;
                }

                if (square) {
                    square.crosswordLevelDrawing.fill(viewProperties.TEXT_ENTRY_FILL);
                    crosswordLayer.draw();
                } else {
                    crosswordLayer.draw();
                    enterTextMode = false;
                }

            }
        }
        
    });

    function makeBigBlackSquare(opacity) {
        return new kinetic.Rect({
            x: 0,
            y: 0,
            width: stage.getWidth(),
            height: stage.getHeight(),
            fill: 'black',
            opacity: opacity
        });
    };

    function addNumbers(grid) {
        for (var i = 0; i < grid.lines.length; i++) {
            if (grid.lines[i].num) {
                var number = new kinetic.Text({
                    Text: grid.lines[i].num,
                    x: grid.lines[i].squares[0].offsetX + 1,
                    y: grid.lines[i].squares[0].offsetY + 1,
                    fontSize: 15,
                    fill: grid.viewProperties.LINE_COLOUR_HOVER,
                    fontFamily: 'Arial',
                    align: 'left'
                });
                console.log(number);
                crosswordLayer.add(number);
                crosswordLayer.draw();

            }
        }
    }
    
    function getClues(lines) {
        for (var i = 0; i < lines.length; i++) {
            var text = "";
            for (var j = 0; j < lines[i].squares.length; j++) {
                text += lines[i].squares[j].textView.text();
            }
            
            document.getElementById(lines[i].horizontal?"clue-entry-across":"clue-entry-down").innerHTML +=
                ("<div>" + lines[i].num + ". " + text + " <input  id='clue-entry-" + lines[i].num + (lines[i].horizontal?"h":"d") + "' type='text' placeholder='enter clue here'></input></div>");
            
            
        }
        document.getElementById("clue-entry").classList.add("modal");

    }

    function addClues(lines) {
        var acrossClueCount = 0;
        var downClueCount = 0;

        
        for (var i = 0; i < lines.length; i++) {
            if (lines[i].horizontal && lines[i].num) {
                document.getElementById("across-clues-beneath").getElementsByTagName("ol")[0].innerHTML += ("<li>" + lines[i].num + ". " + lines[i].clue + " ("+ lines[i].squares.length +")" + "</li>");
            } else if (lines[i].num) {
                document.getElementById("down-clues").getElementsByTagName("ol")[0].innerHTML += ("<li>" + lines[i].num + ". " + lines[i].clue + " ("+ lines[i].squares.length +")" + "</li>");
            }
        }
        document.getElementById("across-clues-beneath").classList.remove("clue");
        document.getElementById("down-clues").classList.remove("clue");
    }
    
    function hideCluesGetter() {
        document.getElementById("clue-entry").classList.remove("modal");
    }


    return {

        makeStage: function (vwProperties) {

            viewProperties = vwProperties;
            stage = new kinetic.Stage({
                container: viewProperties.CONTAINER,
                width: viewProperties.WIDTH,
                height: viewProperties.HEIGHT
            });
        },


        setController: function (ctrlr) {
            controller = ctrlr;
        },
        draw: function (grid) {


            gridLayer = new kinetic.Layer();
            crosswordLayer = new kinetic.Layer();

            for (var i = 0; i < grid.squares.length; i++) {
                for (var j = 0; j < grid.squares[i].length; j++) {
                    drawSquare(grid.squares[i][j], grid.viewProperties, grid);
                }
            }

            stage.add(gridLayer);
            stage.add(crosswordLayer);



        },
        drawCrossword: function (grid) {
            for (var i = 0; i < grid.lines.length; i++) {
                drawLine(grid.lines[i], grid.viewProperties, true);
            }
        },
        drawEmptyCrossword: function (grid) {
            if (!crosswordLayer) crosswordLayer = new kinetic.Layer();
            stage.add(crosswordLayer);
            crosswordLayer.add(makeBigBlackSquare(1));
            for (var i = 0; i < grid.lines.length; i++) {
                drawLine(grid.lines[i], grid.viewProperties, false);
            }
            addNumbers(grid);
            addClues(grid.lines);
            crosswordLayer.draw();

        },
        getRidOfGrid: function () {
            var rect = makeBigBlackSquare(0);

            gridLayer.add(rect);

            var fade = new Kinetic.Tween({
                node: rect,
                duration: 1,
                opacity: 1
            });
            fade.play();

            gridLayer.draw();
        },
        addNumbers: function (grid) {
            addNumbers(grid);
        },
        addClues: function (lines) {
            addClues(lines);
        },
        getClues: function (lines) {
            getClues(lines);
        },
        showUrl: function (url) {
            document.getElementById("url").innerHTML = '<a href="' + url + '">link to this cross word</a>';
            document.getElementById("url-text").value = url;
            
        document.getElementById("url-text").style.display = "block";
        },
        hideCluesGetter: function() {
            hideCluesGetter();
        }
    }
})