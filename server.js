import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const app = express();
const server = createServer(app);
const io = new Server(server);
const allusers = {};

// /your/system/path
const __dirname = dirname(fileURLToPath(import.meta.url));

// exposing public directory to outside world
app.use(express.static("public"));

// handle incoming http request
app.get("/", (req, res) => {
  console.log("GET Request /");
  res.sendFile(join(__dirname + "/app/index.html"));
});

// handle socket connections
io.on("connection", (socket) => {
  socket.emit("connected", socket.id);

  socket.on("join-user", ({ roomNumber, username }) => {
    const rooomSize = io.sockets.adapter.rooms.get(roomNumber);
    if (rooomSize?.size >= 2) {
      socket.emit("room-full", roomNumber);
      return;
    }
    socket.broadcast.emit("joined", { roomNumber, username });
    socket.join(roomNumber);
    socket.room = roomNumber;
    allusers[username] = { username, id: socket.id, roomNumber: roomNumber };
    if (rooomSize?.size === 2) {
      for (const user in allusers) {
        if (allusers[user].roomNumber === roomNumber) {
          io.in(roomNumber).emit("allUsers", allusers[user]);
        }
      }
    }
  });

  socket.on("translatedSpeech", (audioData) => {
    socket.to(socket.room).emit("audioData", audioData);
  });

  //PEER RTC CONNECTION EXCHANGE;

  socket.on("offer", ({ from, to, offer }) => {
    // console.log({from , to, offer });
    io.to(allusers[to].id).emit("offer", { from, to, offer });
  });

  socket.on("answer", ({ from, to, answer }) => {
    io.to(allusers[from].id).emit("answer", { from, to, answer });
  });

  socket.on("icecandidate", (candidate) => {
    // console.log({ candidate });
    socket.broadcast.emit("icecandidate", candidate);
  });
});

server.listen(9000, () => {
  console.log(`Server listening on port 9000`);
});
