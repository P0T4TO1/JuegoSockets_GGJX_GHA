const http = require('http');
const fs = require('fs');
const url = require("url");


const server = http.createServer((req, res) => {
    // Path request
    const pathname = url.parse(req.url).pathname;

    console.log("Request for " + pathname + " received.");

    if (pathname === "/") {
        res.writeHead(200, {"Content-Type": "text/html"});
        html = fs.readFileSync("index.html", "utf8");
        res.write(html);
    } else if (pathname === "/index.js") {
        res.writeHead(200, {"Content-Type": "text/javascript"});
        script = fs.readFileSync("index.js", "utf8");
        res.write(script);
    } else if (pathname === "./convert/domToJson.js") {
        res.writeHead(200, {"Content-Type": "text/javascript"});
        script = fs.readFileSync("domToJson.js", "utf8");
        res.write(script);
    } else if (pathname === "./public/assets/style.css") {
        res.writeHead(200, {"Content-Type": "text/css"});
        style = fs.readFileSync("style.css", "utf8");
        res.write(style);
    }
    res.end();
});

// Cargando socket.io
let io = require("socket.io")(server);

// Número del juagdor
let numberPlayer = 0;

// Conexion de un jugador
io.sockets.on('connection', (socket) => {
    console.log('Jugador conectado!');
    numberPlayer++;

    if(numberPlayer === 2){
        io.emit("startGame");
    }

    // Transmision de mensaje //

    socket.on("sendGrid", (grid) => {
        socket.broadcast.emit("gridPlayer2", grid);
    });

    socket.on("sendScore", (score) => {
        socket.broadcast.emit("scorePlayer2", score);
    });

    socket.on("sendMiniGrid", (minigrid) => {
        socket.broadcast.emit("miniGridPlayer2", minigrid);
    });

    // Jugador desconectado
    socket.on('disconnect', () => {
        console.log("Un jugador se ha desconectado!");
        numberPlayer--;
    });
});

server.listen(8000, () => {
    console.log("Servidor abierto en el puerto 8000")
});