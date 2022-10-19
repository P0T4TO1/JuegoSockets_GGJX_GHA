const http = require('http');
const fs = require('fs');
const url = require("url");

const server = http.createServer((req, res) => {
    // Rutas
    const pathname = url.parse(req.url).pathname;

    if(pathname === "/") {
        res.writeHead(200, {"Content-Type": "text/html"});
        html = fs.readFileSync("./index.html", "utf8");
        res.write(html);

    } else if (pathname === "/app.js") {
        res.writeHead(200, {"Content-Type": "text/javascript"});
        script = fs.readFileSync("app.js", "utf8");
        res.write(script);

    } else if (pathname === "/domToJson.js") {
        res.writeHead(200, {"Content-Type": "text/javascript"});
        script = fs.readFileSync("domToJson.js", "utf8");
        res.write(script);

    } else if (pathname === "/style.css"){
        res.writeHead(200, {"Content-Type": "text/css"});
        style = fs.readFileSync("style.css", "utf8");
        res.write(style);

    } else if (pathname === "/assets/bootstrap/css/bootstrap.min.css"){
        res.writeHead(200, {"Content-Type": "text/css"});
        style = fs.readFileSync("assets/bootstrap/css/bootstrap.min.css", "utf8");
        res.write(style);

    } else if (pathname === "/assets/fonts/font-awesome.min.css"){
        res.writeHead(200, {"Content-Type": "text/css"});
        style = fs.readFileSync("assets/fonts/font-awesome.min.css", "utf8");
        res.write(style);

    } else if (pathname === "/assets/bootstrap/js/bootstrap.min.js"){
        res.writeHead(200, {"Content-Type": "text/javascript"});
        script = fs.readFileSync("assets/bootstrap/js/bootstrap.min.js", "utf8");
        res.write(script);
    }

    res.end();
});

// Cargar socket
const io = require('socket.io').listen(server);

// Numero de jugadores
let numberPlayer = 0;

// Conexion del jugador
io.sockets.on('connection', (socket) => {
    console.log('Un jugador se ha conectado!');
    numberPlayer++;

    if(numberPlayer === 2){
        // Enviar enpezar juego
        io.emit("startGame");
    }

    socket.on("sendGrid", (grid) => {
        socket.broadcast.emit("gridPlayer2", grid);
    });

    socket.on("sendScore", (score) => {
        socket.broadcast.emit("scorePlayer2", score);
    });

    socket.on("sendMiniGrid", (minigrid) => {
        socket.broadcast.emit("miniGridPlayer2", minigrid);
    });


    socket.on('disconnect', () => {
        console.log("Un jugador se ha desconectado!");
        numberPlayer--;
    });
});

server.listen(8080);
