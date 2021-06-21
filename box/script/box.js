//Control general del juego
class Game {
    constructor() {
        this.maxLevel = 0;
        this.score = 0;
        this.scoreLevel = 0;
        this.level = 1;
        this.playerPosition = {};
        this.playerDir = "";
        this.result = "";

        //w:wall, e:empty, p:player, b:box, o:objective, po:playeroverobjective, bo:boxoverobjective
        this.boardMatrix = [];

        this.changeText("restart", "Reiniciar Juego");
        this.toggleButton("instruc1", "hide");
        this.toggleButton("instruc2", "hide");
        this.toggleButton("results", "show");
        this.toggleButton("restartLevel", "show");
        this.reset();
    }

    //Evita errores de consistencia entre la matriz y el jugador
    getFirstPosition(matrix = this.boardMatrix) {
        let i, j;
        for (i = 0; i < matrix.length; i++) {
            for (j = 0; j < matrix[0].length; j++) {
                if (matrix[i][j] === "p") {
                    this.playerPosition = {
                        "i": i,
                        "j": j
                    }
                    break;
                }
            }
        }
    }

    //Avanza de nivel
    nextLevel() {

        if (this.level === this.maxLevel) {
            this.result = "Felicidades, pasaste el ultimo nivel!";
            return true;
        }
        this.scoreLevel = 0;
        this.level += 1;
        this.reset();
    }

    //Reinicia la interfaz
    reset() {

        if (this.scoreLevel !== 0) {
            this.score = this.score - this.scoreLevel;
        }
        this.scoreLevel = 0;
        this.eraseTable();
        this.playerDir = "playerDown";
        this.result = "";
        this.boardMatrix = this.matrixLevels(this.level);
        this.toggleButton("gameControls", "show");
        this.toggleButton("nextLevel", "hide");
        this.getFirstPosition();
        this.paintBoard();
        this.update("attention");
    }

    //Verifica ganador
    check(matrix = this.boardMatrix) {
        let i, j;
        let countBoxes = 0;
        let countPlacedBoxes = 0;
        for (i = 0; i < matrix.length; i++) {
            for (j = 0; j < matrix[0].length; j++) {
                if (matrix[i][j] === "b") {
                    countBoxes += 1;
                } else if (matrix[i][j] === "bo") {
                    countBoxes += 1;
                    countPlacedBoxes += 1;
                }
            }
        }
        if (countBoxes === countPlacedBoxes) {
            this.result = "Ganaste!";
            this.scoreLevel = countPlacedBoxes;
            this.score += this.scoreLevel;
            this.toggleButton("gameControls", "hide");

            //Si llega al final de los niveles
            if(this.maxLevel === this.level){
                this.update("final");
                this.toggleButton("nextLevel", "hide");
            } else{
                this.update("win");
                this.toggleButton("nextLevel", "show");
            }
            
            console.log("gano");
        }
    }

    //Pinta todos los elementos del juego
    paintBoard(matrix = this.boardMatrix) {
        let i, j, tr, td;
        let tbody = document.getElementById("gameBody");
        let cell = "cell ";
        for (i = 0; i < matrix.length; i++) {
            tr = document.createElement("tr");
            for (j = 0; j < matrix[0].length; j++) {
                td = this.paintPosition(i, j, true);
                td.setAttribute("id", "".concat("cell", "-", i, "-", j));
                tr.appendChild(td);
            }
            tbody.appendChild(tr);
        }
    }

    //Pinta elementos de juego segun la boardMatrix
    paintPosition(actualI, actualJ, create = false) {
        let td;
        //Crea u obtiene la columna / celda
        if (create) {
            td = document.createElement("td");
        } else {
            td = document.getElementById("".concat("cell", "-", actualI, "-", actualJ));
        }

        let actualMatrix = this.boardMatrix[actualI][actualJ];
        let cell = "cell ";
        if (actualMatrix === "w") {
            td.setAttribute("class", "".concat(cell, "gameWall"));
        } else if (actualMatrix === "o") {
            td.setAttribute("class", "".concat(cell, "gamePlaceBox"));
        } else if (actualMatrix === "p") {
            td.setAttribute("class", "".concat(cell, this.playerDir));
        } else if (actualMatrix === "b") {
            td.setAttribute("class", "".concat(cell, "gameBox"));
        } else if (actualMatrix === "po") {
            td.setAttribute("class", "".concat(cell, "gamePlaceBox ", this.playerDir));
        } else if (actualMatrix === "bo") {
            td.setAttribute("class", "".concat(cell, "gamePlaceBox ", "gameBox"));
        } else {
            td.setAttribute("class", "".concat(cell));
        }
        return td;
    }

    //Borra todo el tablero
    eraseTable() {
        const myNode = document.getElementById("gameBody");
        while (myNode.firstChild) {
            myNode.removeChild(myNode.lastChild);
        }

    }

    //Oculta o muestra partes de la interfaz
    toggleButton(id = "nextLevel", op = "hide") {
        let button = document.getElementById(id);
        if (op === "hide") {
            button.setAttribute("hidden", "");
        } else {
            button.removeAttribute("hidden");
        }


    }

    changeText(id = "restart", text = "") {
        document.getElementById(id).innerText = text;
    }

    //Movimiento del jugador 
    press(dir = 'up') {
        if (this.result !== "Ganaste!") {
            if (dir === 'up') {
                console.log("arriba");
                this.playerDir = "playerUp";
                this.movePlayer(this.playerPosition["i"] - 1, this.playerPosition["j"]);
            } else if (dir === 'down') {
                console.log("abajo");
                this.playerDir = "playerDown";
                this.movePlayer(this.playerPosition["i"] + 1, this.playerPosition["j"]);
            } else if (dir === 'left') {
                console.log("izquierda");
                this.playerDir = "playerLeft";
                this.movePlayer(this.playerPosition["i"], this.playerPosition["j"] - 1);
            } else if (dir === 'right') {
                console.log("derecha");
                this.playerDir = "playerRight";
                this.movePlayer(this.playerPosition["i"], this.playerPosition["j"] + 1);
            }
        }
    }

    movePlayer(nextI, nextJ) {
        let actualI = this.playerPosition["i"];
        let actualJ = this.playerPosition["j"];
        let actualMatrix = this.boardMatrix[actualI][actualJ];
        let moved = false;

        //Pinta la direccion del jugador por si no se mueve
        this.paintPosition(actualI, actualJ);

        //Si no sale del tablero
        if (!(nextI < 0) && !(nextJ < 0) && !(nextI >= this.boardMatrix.length) && !(nextJ >= this.boardMatrix[0].length)) {
            let nextCellMatrix = this.boardMatrix[nextI][nextJ];
            //Si la siguiente posicion es vacia
            if (nextCellMatrix === "e") {
                this.playerPosition["i"] = nextI;
                this.playerPosition["j"] = nextJ;
                this.boardMatrix[nextI][nextJ] = "p";
                moved = true;
            }
            //Si la siguiente pos es objetivo
            else if (nextCellMatrix === "o") {
                this.playerPosition["i"] = nextI;
                this.playerPosition["j"] = nextJ;
                this.boardMatrix[nextI][nextJ] = "po";
                moved = true;
            }
            // Si la siguiente pos es caja 
            else if (nextCellMatrix === "b" || nextCellMatrix === "bo") {
                let boxMoved = this.moveBoxes(nextI, nextJ);
                if (boxMoved) {
                    nextCellMatrix = this.boardMatrix[nextI][nextJ];
                    //Si la siguiente posicion es vacia
                    if (nextCellMatrix === "e") {
                        this.playerPosition["i"] = nextI;
                        this.playerPosition["j"] = nextJ;
                        this.boardMatrix[nextI][nextJ] = "p";
                        moved = true;
                    }
                    //Si la siguiente pos es objetivo
                    else if (nextCellMatrix === "o") {
                        this.playerPosition["i"] = nextI;
                        this.playerPosition["j"] = nextJ;
                        this.boardMatrix[nextI][nextJ] = "po";
                        moved = true;
                    }
                    this.check();
                }
            }

            //Si se movio
            if (moved) {
                // Pinta la celda actual por si era objetivo

                if (this.boardMatrix[actualI][actualJ] === "po") {
                    this.boardMatrix[actualI][actualJ] = "o";
                } else if (this.boardMatrix[actualI][actualJ] === "p") {
                    this.boardMatrix[actualI][actualJ] = "e";
                }
                this.paintPosition(actualI, actualJ);
                this.paintPosition(nextI, nextJ);
            }
        }

    }

    //Movimiento de las cajas
    moveBoxes(actualI, actualJ, dir = this.playerDir) {

        //Obtiene la posible siguiente posicion de la caja de acuerdo hacia donde empuja el jugador
        let nextI, nextJ;
        if (dir === "playerUp") {
            nextI = actualI - 1;
            nextJ = actualJ;
        } else if (dir === "playerDown") {
            nextI = actualI + 1;
            nextJ = actualJ;
        } else if (dir === "playerLeft") {
            nextI = actualI;
            nextJ = actualJ - 1;
        } else if (dir === "playerRight") {
            nextI = actualI;
            nextJ = actualJ + 1;
        }
        let actualCellMatrix = this.boardMatrix[actualI][actualJ];
        let nextCellMatrix = this.boardMatrix[nextI][nextJ];
        let moved = false;
        //Si no sale del tablero
        if (!(nextI < 0) && !(nextJ < 0) && !(nextI >= this.boardMatrix.length) && !(nextJ >= this.boardMatrix[0].length)) {

            //Si la siguiente posicion es vacia
            if (nextCellMatrix === "e") {
                this.boardMatrix[nextI][nextJ] = "b";
                moved = true;
            }
            //Si la siguiente posicion es objetivo
            else if (nextCellMatrix === "o") {
                this.boardMatrix[nextI][nextJ] = "bo";
                moved = true;
            }

            //Si se movio
            if (moved) {
                //Pinta la celda actual de acuerdo a si es objetivo o vacia
                if (actualCellMatrix === "b") {
                    this.boardMatrix[actualI][actualJ] = "e";
                } else if (actualCellMatrix === "bo") {
                    this.boardMatrix[actualI][actualJ] = "o";
                }
                this.paintPosition(actualI, actualJ);
                this.paintPosition(nextI, nextJ);

            }


        }
        return moved;

    }

    

    //Muestra mensajes generales al jugador
    update(momento = "score") {
        let level = document.getElementById("actualLevel");
        let scorePlayer = document.getElementById("scorePlayer");
        let result = document.getElementById("result");

        if (momento === "attention") {
            result.innerHTML = "Empuja las cajas hacia los indicadores rojos";
        } else if (momento === "final") {
            result.innerHTML = "¡Felicidades, completaste el Juego!";
        } else if (momento === "win") {
            result.innerHTML = "Ganaste! Resultados:";
        } 
        level.innerHTML = "Nivel: " + this.level;
        scorePlayer.innerHTML = "Puntuación Total: " + this.score;
    }

    //Guarda todos los niveles del juego
    matrixLevels(level = 1) {
        let matrixes = {
            1: [
                ["w", "w", "w", "w", "w", "w"],
                ["w", "e", "e", "e", "e", "w"],
                ["w", "e", "o", "p", "b", "w"],
                ["w", "e", "b", "e", "o", "w"],
                ["w", "e", "e", "e", "e", "w"],
                ["w", "w", "w", "w", "w", "w"]
            ],
            2: [
                ["w", "w", "w", "w", "w", "w"],
                ["w", "o", "e", "e", "e", "w"],
                ["w", "e", "e", "p", "b", "w"],
                ["w", "e", "b", "e", "o", "w"],
                ["w", "e", "e", "e", "e", "w"],
                ["w", "w", "w", "w", "w", "w"]
            ],
            3: [
                ["w", "w", "w", "w", "w", "w", "w", "w"],
                ["w", "w", "w", "e", "e", "e", "w", "w"],
                ["w", "o", "p", "b", "e", "e", "w", "w"],
                ["w", "w", "w", "e", "b", "o", "w", "w"],
                ["w", "o", "w", "w", "b", "e", "w", "w"],
                ["w", "e", "w", "e", "o", "e", "w", "w"],
                ["w", "b", "e", "bo", "b", "b", "o", "w"],
                ["w", "e", "e", "e", "o", "e", "e", "w"],
                ["w", "w", "w", "w", "w", "w", "w", "w"],
            ]

        }
        const size = Object.keys(matrixes).length;
        this.maxLevel = size; 
        return matrixes[level].slice();
    }

}
var gameActual;
function restart() {
    gameActual = new Game();
}


