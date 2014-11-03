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
            clue: clue
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
                if (previousSquare.addedToCrossword) {
                    line.squares.unshift(previousSquare);
                } else {
                    break;
                }
                previousSquare = grid.squares[line.horizontal ? line.squares[0].coordX - 1 : line.squares[0].coordX][line.horizontal ? line.squares[0].coordY : line.squares[0].coordY - 1];
            }
            finished = false;
            var nextSquare = grid.squares[line.horizontal ? line.squares[0].coordX + 1 : line.squares[0].coordX][line.horizontal ? line.squares[0].coordY : line.squares[0].coordY + 1];
            while (!finished) {
                if (previousSquare.addedToCrossword) {
                    line.squares.push(nextSquare);
                } else {
                    break;
                }
                nextSquare = grid.squares[line.horizontal ? line.squares[0].coordX + 1 : line.squares[0].coordX][line.horizontal ? line.squares[0].coordY : line.squares[0].coordY + 1];
            }
        }


        console.log(grid);

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


    function copyLine(line) {
        var newline = {
            clue: line.clue,
            horizontal: line.horizontal,
            num: line.num,
            squares: []
        };

        for (var i = 0; i < line.squares.length; i++) {
            newline.squares[i] = {
                offsetX: line.squares[i].offsetX,
                offsetY: line.squares[i].offsetY,
                coordX: line.squares[i].coordX,
                coordY: line.squares[i].coordY,
                num: line.squares[i].num
            }
        }


        return newline;
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
        generateUrl: function () {
            var newJsonObject = {};
            newJsonObject.lines = [];

            for (var i = 0; i < grid.lines.length; i++) {
                newJsonObject.lines[i] = copyLine(grid.lines[i]);
            }
            var compresseduri = LZString.compressToBase64(JSON.stringify(newJsonObject))

            return document.URL + '?xword=' + encodeURIComponent(compresseduri);


        },
        getObjectFromUrl: function () {
            return JSON.parse(LZString.decompressFromBase64(decodeURIComponent(document.URL.split("?xword=")[1])));

        }
    }
})