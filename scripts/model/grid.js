define(function (require) {

    require("../lz-string");
    var viewProperties = {
        WIDTH: 1000,
        HEIGHT: 1000,
        SQUARE_SIZE: 30,
        BUMPER_SIZE: 1,
        FILL_COLOUR: '#DDDDDD',
        LINE_COLOUR: '#999999',
        LINE_COLOUR_HOVER: '#000000',
        FILL_COLOUR_HOVER: '#FFFFFF',
        SELECTED_COLOUR: '#000000',
        LINE_WIDTH: 1,
        LINE_WIDTH_HOVER: 2,
        CONTAINER: 'xword2',
        TEXT_ENTRY_FILL: '#B2E0FF'
    };

    var grid;

    function getViewProperties() {
        return viewProperties;
    };

    function getSquares() {
        var row = [];

        var numOfColumns = viewProperties.WIDTH / (viewProperties.SQUARE_SIZE + viewProperties.BUMPER_SIZE * 2);
        var numOfRows = viewProperties.HEIGHT / (viewProperties.SQUARE_SIZE + viewProperties.BUMPER_SIZE * 2);
        var sidebumper = viewProperties.WIDTH - ((numOfColumns - (numOfColumns % 1)) * (viewProperties.SQUARE_SIZE + viewProperties.BUMPER_SIZE * 2));
        var topBottomBumper = viewProperties.HEIGHT - ((numOfRows - (numOfRows % 1)) * (viewProperties.SQUARE_SIZE + viewProperties.BUMPER_SIZE * 2));
        for (var i = 0; i < numOfColumns; i++) {
            row[i] = [];
            for (var j = 0; j < numOfRows; j++) {
                row[i][j] = {
                    offsetX: sidebumper / 2 + (viewProperties.SQUARE_SIZE + viewProperties.BUMPER_SIZE) * i + viewProperties.BUMPER_SIZE,
                    offsetY: topBottomBumper / 2 + (viewProperties.SQUARE_SIZE + viewProperties.BUMPER_SIZE) * j + viewProperties.BUMPER_SIZE,
                    coordX: i,
                    coordY: j
                };
            }
        }

        return row;

    };

    function getSquaresFromCoordinates(coord1, coord2) {
        if (coord1.coordX === coord2.coordX) {
            return grid.squares[coord1.coordX].slice(coord1.coordY, coord2.coordY + 1);
        } else if (coord1.coordY === coord2.coordY) {
            var squares = [];
            for (var i = coord1.coordX; i <= coord2.coordX; i++) {
                squares[i - coord1.coordX] = grid.squares[i][coord1.coordY];
            }
            return squares;
        }
    }


    function addLine(startSquare, endSquare, clue) {
        if (typeof (grid.lines) == 'undefined') {
            grid.lines = [];
        }
        var squares = getSquaresFromCoordinates(startSquare, endSquare);
        if (typeof (squares) == "undefined") {
            return null;
        }

        for (var i = 0; i < squares.length; i++) {
            squares[i].addedToCrossword = true;
        }

        grid.lines[grid.lines.length] = {
            squares: squares,
            clue: clue,
            horizontal: startSquare.coordX === endSquare.coordX
        }
    }

    function amend(lines) {
        for (var i = 0; i < lines.length; i++) {
            var line = lines[i];
            //are lines horizontal or vertical?
            line.horizontal = (line.squares[0].coordY === line.squares[1].coordY);
            //firstly lets make sure the lines are correct. i.e. they may include a square before or after which is part of another line
            var finished = false;
            var previousSquare = grid.squares[line.horizontal ? line.squares[0].coordX - 1 : line.squares[0].coordX][line.horizontal ? line.squares[0].coordY : line.squares[0].coordY - 1];
            while (!finished) {
                if (previousSquare && previousSquare.addedToCrossword) {
                    line.squares.unshift(previousSquare);
                } else {
                    break;
                }
                previousSquare = grid.squares[line.horizontal ? line.squares[0].coordX - 1 : line.squares[0].coordX][line.horizontal ? line.squares[0].coordY : line.squares[0].coordY - 1];
            }
            finished = false;
            var nextSquare = grid.squares[line.horizontal ? line.squares[0].coordX + 1 : line.squares[0].coordX][line.horizontal ? line.squares[0].coordY : line.squares[0].coordY + 1];
            while (!finished) {
                if (previousSquare && previousSquare.addedToCrossword) {
                    line.squares.push(nextSquare);
                } else {
                    break;
                }
                nextSquare = grid.squares[line.horizontal ? line.squares[0].coordX + 1 : line.squares[0].coordX][line.horizontal ? line.squares[0].coordY : line.squares[0].coordY + 1];
            }
        }



        checkForExtraLines();

    }

    function lineSorter(line1, line2) {
        if (line1.squares[0].coordY < line2.squares[0].coordY) {
            return -1;
        }
        if (line1.squares[0].coordY > line2.squares[0].coordY) {
            return 1;
        }
        if (line1.squares[0].coordX < line2.squares[0].coordX) {
            return -1;
        }
        if (line1.squares[0].coordX > line2.squares[0].coordX) {
            return 1;
        }
    }

    function checkLineAddedToCrosswordAndAdd(square1, square2) {
        for (var i = 0; i < grid.lines.length; i++) {
            if ((grid.lines[i].squares[0] === square1) && (grid.lines[i].squares[1] === square2)) {
                return
            }
        }
        var squares = [];
        var square = square1;
        var horizontal = (square1.coordX === square2.coordX);
        while (grid.squares[horizontal ? square.coordX + 1 : square.coordX][horizontal ? square.coordY : square.coordY + 1].addedToCrossword) {
            square = grid.squares[horizontal ? square.coordX + 1 : square.coordX][horizontal ? square.coordY : square.coordY + 1];
        }
        addLine(square1, square, "a");
        return false;
    }

    function checkForExtraLines() {
        var leftMostSquare = getLeftmostSquare();
        var rightMostSquare = getRightmostSquare();
        var topMostSquare = getTopmostSquare();
        var bottomMostSquare = getBottomostSquare();
        for (var i = leftMostSquare.coordX; i <= rightMostSquare.coordX; i++) {
            for (var j = topMostSquare.coordY; j <= bottomMostSquare.coordY; j++) {
                if (grid.squares[i][j].addedToCrossword) {
                    if ((!grid.squares[i - 1][j] || !grid.squares[i - 1][j].addedToCrossword) && grid.squares[i + 1][j].addedToCrossword) {
                        checkLineAddedToCrosswordAndAdd(grid.squares[i][j], grid.squares[i + 1][j]);
                    }
                    if ((!grid.squares[i][j - 1] ||!grid.squares[i][j - 1].addedToCrossword) && grid.squares[i][j + 1].addedToCrossword) {
                        checkLineAddedToCrosswordAndAdd(grid.squares[i][j], grid.squares[i][j + 1])
                    }
                }
            }
        }
    }


    function addNumbersToSquares() {
        amend(grid.lines);
        grid.lines.sort(lineSorter);
        var clueCounter = 1;
        for (var i = 0; i < grid.lines.length; i++) {
            if (!grid.lines[i].squares[0].num) {
                grid.lines[i].num = clueCounter;
                grid.lines[i].squares[0].num = clueCounter;
                clueCounter++;
            } else {
                grid.lines[i].num = grid.lines[i].squares[0].num;
            }
        }


    }

    function copyLineAndAdjust(line, leftmostSquare, topmostSquare, withLetters) {
        var newline = {
            clue: line.clue,
            horizontal: line.horizontal,
            num: line.num,
            squares: []
        };

        for (var i = 0; i < line.squares.length; i++) {
            newline.squares[i] = {
                offsetX: line.squares[i].offsetX - leftmostSquare.offsetX,
                offsetY: line.squares[i].offsetY - topmostSquare.offsetY,
                coordX: line.squares[i].coordX - leftmostSquare.coordX,
                coordY: line.squares[i].coordY - topmostSquare.coordY,
                num: line.squares[i].num,
                letter: withLetters? line.squares[i].letter:""
            }
        }


        return newline;
    }

    function getLeftmostSquare() {
        var squareForComparison = grid.lines[0].squares[0];
        for (var i = 1; i < grid.lines.length; i++) {
            if (grid.lines[i].squares[0].coordX < squareForComparison.coordX) {
                squareForComparison = grid.lines[i].squares[0];
            }
        }
        return squareForComparison;
    }

    function getRightmostSquare() {
        var squareForComparison = grid.lines[0].squares[grid.lines[0].squares.length - 1];
        for (var i = 1; i < grid.lines.length; i++) {
            if (grid.lines[i].squares[grid.lines[i].squares.length - 1].coordX > squareForComparison.coordX) {
                squareForComparison = grid.lines[i].squares[grid.lines[i].squares.length - 1];
            }
        }
        return squareForComparison;
    }


    function getTopmostSquare() {
        var squareForComparison = grid.lines[0].squares[0];
        for (var i = 1; i < grid.lines.length; i++) {
            if (grid.lines[i].squares[0].coordY < squareForComparison.coordY) {
                squareForComparison = grid.lines[i].squares[0];
            }
        }
        return squareForComparison;
    }

    function getBottomostSquare() {
        var squareForComparison = grid.lines[0].squares[grid.lines[0].squares.length - 1];
        for (var i = 1; i < grid.lines.length; i++) {
            if (grid.lines[i].squares[grid.lines[i].squares.length - 1].coordY > squareForComparison.coordY) {
                squareForComparison = grid.lines[i].squares[grid.lines[i].squares.length - 1];
            }
        }
        return squareForComparison;
    }

    function correctCrossoverPoints(obj) {
        var tempGrid = [];
        for (var i = 0; i < obj.lines.length; i++) {
            for (var j = 0; j < obj.lines[i].squares.length; j++) {
                var square = obj.lines[i].squares[j];
                if (tempGrid[square.coordX] && tempGrid[square.coordX][square.coordY]) {
                    obj.lines[i].squares[j] = tempGrid[square.coordX][square.coordY];
                } else if (tempGrid[square.coordX]) {
                    tempGrid[square.coordX][square.coordY] = obj.lines[i].squares[j];
                } else {
                    tempGrid[square.coordX] = [];
                    tempGrid[square.coordX][square.coordY] = obj.lines[i].squares[j];
                }
            }
        }

    }

    function saveClues() {
        for (var i = 0; i < grid.lines.length; i++) {
            grid.lines[i].clue = document.getElementById("clue-entry-" + grid.lines[i].num + (grid.lines[i].horizontal ? "h" : "d")).value;
        }
    }

    return {
        getViewProperties: function () {
            return viewProperties;
        },
        get: function () {
            grid = {
                squares: getSquares(),
                viewProperties: getViewProperties(),
                addLine: addLine,
                addNumbersToSquares: addNumbersToSquares
            };
            return grid;
        },
        generateUrl: function (withLetters) {
            var newJsonObject = {};
            newJsonObject.lines = [];
            var leftMostSquare = getLeftmostSquare();
            var rightMostSquare = getRightmostSquare();
            var TopMostSquare = getTopmostSquare();
            var BottomostMostSquare = getBottomostSquare();


            for (var i = 0; i < grid.lines.length; i++) {
                newJsonObject.lines[i] = copyLineAndAdjust(grid.lines[i], leftMostSquare, TopMostSquare, withLetters);
            }
            newJsonObject.stageWidth = rightMostSquare.offsetX + viewProperties.BUMPER_SIZE + viewProperties.SQUARE_SIZE - leftMostSquare.offsetX;
            newJsonObject.stageHeight = BottomostMostSquare.offsetY + viewProperties.BUMPER_SIZE + viewProperties.SQUARE_SIZE - TopMostSquare.offsetY;
            var compresseduri = LZString.compressToBase64(JSON.stringify(newJsonObject))

            return document.URL.split('?xword=')[0] + '?xword=' + encodeURIComponent(compresseduri);


        },
        getObjectFromUrl: function () {
            
            var object = JSON.parse(LZString.decompressFromBase64(decodeURIComponent(document.URL.split("?xword=")[1])));
            correctCrossoverPoints(object);
            grid = object;
            return object;

        },
        saveClues: function () {
            saveClues();
        }
    }
})