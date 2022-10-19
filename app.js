import { toDOM, toJSON } from "./domToJson.js";
// Conexion al server via socket
const socket = io.connect('http://localhost:8080/');

document.addEventListener('DOMContentLoaded', () => {
  const grid = document.querySelector('.grid')
  const gridP2 = document.querySelector('.grid2')
  const miniGrid = document.querySelector('.mini-grid')
  const miniGridP2 = document.querySelector('.mini-grid2')
  let squares = Array.from(document.querySelectorAll('.grid div'))
  const scoreDisplay = document.querySelector('#score')
  const scoreDisplayP2 = document.querySelector('#scoreP2')
  const width = 10
  let nextRandom = 0
  let timerId
  let score = 0
  const colors = [
    'orange',
    'red',
    'purple',
    'green',
    'blue'
  ]

  // Formas
  const lTetromino = [
    [1, width+1, width*2+1, 2],
    [width, width+1, width+2, width*2+2],
    [1, width+1, width*2+1, width*2],
    [width, width*2, width*2+1, width*2+2]
  ]

  const zTetromino = [
    [0,width,width+1,width*2+1],
    [width+1, width+2,width*2,width*2+1],
    [0,width,width+1,width*2+1],
    [width+1, width+2,width*2,width*2+1]
  ]

  const tTetromino = [
    [1,width,width+1,width+2],
    [1,width+1,width+2,width*2+1],
    [width,width+1,width+2,width*2+1],
    [1,width,width+1,width*2+1]
  ]

  const oTetromino = [
    [0,1,width,width+1],
    [0,1,width,width+1],
    [0,1,width,width+1],
    [0,1,width,width+1]
  ]

  const iTetromino = [
    [1,width+1,width*2+1,width*3+1],
    [width,width+1,width+2,width+3],
    [1,width+1,width*2+1,width*3+1],
    [width,width+1,width+2,width+3]
  ]

  const theTetrominoes = [lTetromino, zTetromino, tTetromino, oTetromino, iTetromino]

  let currentPosition = 4
  let currentRotation = 0

  console.log(theTetrominoes[0][0])

  // Rotacion random que aparece la figura
  let random = Math.floor(Math.random()*theTetrominoes.length)
  let current = theTetrominoes[random][currentRotation]

  // Dibujar figura
  function draw() {
    current.forEach(index => {
      squares[currentPosition + index].classList.add('tetromino')
      squares[currentPosition + index].style.backgroundColor = colors[random]
      squares[currentPosition + index].style.borderColor = colors[random]
    })
  }

  // Borrar figura
  function undraw() {
    current.forEach(index => {
      squares[currentPosition + index].classList.remove('tetromino')
      squares[currentPosition + index].style.backgroundColor = ''
    })
  }

  // Funcion de control de las figuras con el teclado
  function control(e) {
    if(e.keyCode === 37) {
      moveLeft()
    } else if (e.keyCode === 38) {
      rotate()
    } else if (e.keyCode === 39) {
      moveRight()
    } else if (e.keyCode === 40) {
      moveDown()
    }
  }
  document.addEventListener('keyup', control)

  // Aceleracion de bajada de las figuras
  function moveDown() {
    undraw()
    currentPosition += width
    draw()
    freeze()
    console.log(scoreDisplay.innerHTML.toString());
    socket.emit("sendGrid", toJSON(grid));
    socket.emit("sendScore", scoreDisplay.innerHTML);
  }

  // Congelar figuras
  function freeze() {
    if(current.some(index => squares[currentPosition + index + width].classList.contains('taken'))) {
      current.forEach(index => squares[currentPosition + index].classList.add('taken'))

      random = nextRandom
      nextRandom = Math.floor(Math.random() * theTetrominoes.length)
      current = theTetrominoes[random][currentRotation]
      currentPosition = 4
      draw()
      displayShape()
      addScore()
      gameOver()
    }
  }

  // Mover figura a la izquierda si es posible
  function moveLeft() {
    undraw()
    const isAtLeftEdge = current.some(index => (currentPosition + index) % width === 0)
    if(!isAtLeftEdge) currentPosition -=1
    if(current.some(index => squares[currentPosition + index].classList.contains('taken'))) {
      currentPosition +=1
    }
    draw()
    socket.emit("sendGrid", toJSON(grid));
    socket.emit("sendScore", scoreDisplay.innerHTML);
  }

  // Mover figura a la derecha si es posible
  function moveRight() {
    undraw()
    const isAtRightEdge = current.some(index => (currentPosition + index) % width === width -1)
    if(!isAtRightEdge) currentPosition +=1
    if(current.some(index => squares[currentPosition + index].classList.contains('taken'))) {
      currentPosition -=1
    }
    draw()
    socket.emit("sendGrid", toJSON(grid));
    socket.emit("sendScore", scoreDisplay.innerHTML);
  }

  function isAtRight() {
    return current.some(index=> (currentPosition + index + 1) % width === 0)
  }

  function isAtLeft() {
    return current.some(index=> (currentPosition + index) % width === 0)
  }

  function checkRotatedPosition(P){
    P = P || currentPosition
    if ((P+1) % width < 4) {
      if (isAtRight()){
        currentPosition += 1
        checkRotatedPosition(P)
        }
    }
    else if (P % width > 5) {
      if (isAtLeft()){
        currentPosition -= 1
      checkRotatedPosition(P)
      }
    }
  }

  // Rotar figura si es posible
  function rotate() {
    undraw()
    currentRotation ++
    if(currentRotation === current.length) {
      currentRotation = 0
    }
    current = theTetrominoes[random][currentRotation]
    checkRotatedPosition()
    draw()
    console.log(grid);
    socket.emit("sendGrid", toJSON(grid));
    socket.emit("sendScore", scoreDisplay.innerHTML);
  }

  const displaySquares = document.querySelectorAll('.mini-grid div')
  const displayWidth = 4
  const displayIndex = 0

  // Figuras basicas
  const upNextTetrominoes = [
    [1, displayWidth+1, displayWidth*2+1, 2], //lTetromino
    [0, displayWidth, displayWidth+1, displayWidth*2+1], //zTetromino
    [1, displayWidth, displayWidth+1, displayWidth+2], //tTetromino
    [0, 1, displayWidth, displayWidth+1], //oTetromino
    [1, displayWidth+1, displayWidth*2+1, displayWidth*3+1] //iTetromino
  ]

  // Para las figuras que vienen
  function displayShape() {
    displaySquares.forEach(square => {
      square.classList.remove('tetromino')
      square.style.backgroundColor = ''
    })
    upNextTetrominoes[nextRandom].forEach( index => {
      displaySquares[displayIndex + index].classList.add('tetromino')
      displaySquares[displayIndex + index].style.backgroundColor = colors[nextRandom]
      displaySquares[displayIndex + index].style.borderColor = colors[nextRandom]
    })
    socket.emit("sendMiniGrid", toJSON(miniGrid));
  }

  // Reconocer mensjae startGame para empezar el juego
  socket.on("startGame", function(){
    if (timerId) {
      clearInterval(timerId)
      timerId = null
    } else {
      draw()
      timerId = setInterval(moveDown, 1000)
      nextRandom = Math.floor(Math.random()*theTetrominoes.length)
      displayShape()
    }
  })

  // Actualizar puntaje
  function addScore() {
    for (let i = 0; i < 199; i += width) {
      const row = [i, i+1, i+2, i+3, i+4, i+5, i+6, i+7, i+8, i+9];

      if(row.every(index => squares[index].classList.contains('taken'))) {
        score += 10;
        scoreDisplay.innerHTML = score;
        row.forEach(index => {
          squares[index].classList.remove('taken');
          squares[index].classList.remove('tetromino');
          squares[index].style.backgroundColor = '';
        })
        const squaresRemoved = squares.splice(i, width);
        squares = squaresRemoved.concat(squares);
        squares.forEach(cell => grid.appendChild(cell));
      }
    }
  }

  // Game Over
  function gameOver() {
    if(current.some(index => squares[currentPosition + index].classList.contains('taken'))) {
      scoreDisplay.innerHTML = 'Game Over'
      clearInterval(timerId)
    }
  }
  
  socket.on("gridPlayer2", (newGrid) => {
    newGrid = toDOM(newGrid)
    newGrid.className = "grid2"
    gridP2.innerHTML = newGrid.innerHTML
  });

  
  socket.on("scorePlayer2", (newScore) => {
    scoreDisplayP2.innerHTML = newScore;
  });

  
  socket.on("miniGridPlayer2", (newMiniGrid) => {
    newMiniGrid = toDOM(newMiniGrid)
    newMiniGrid.className = "mini-grid2"
    miniGridP2.innerHTML = newMiniGrid.innerHTML
  });

})
