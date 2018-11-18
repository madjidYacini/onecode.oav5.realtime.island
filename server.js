import express from "express";
import socketIo from "socket.io";
import path from "path";
import { createServer } from "http";
import { argv, mlog } from "./libs/utils";

// Instantiate express application
const app = express();
const port = parseInt(argv[0], 10) || process.env.PORT;

// Entry point function
const start = async () => {
  try {
    // app is a request handler function that we must pass to http server instance
    const server = createServer(app);
    // socket.io take a server and not an express application
    const io = socketIo(server);
    let magicNumber = io.of("/magic");
    magicNumber.on("connection", socket => {
      magicNumber.emit("welcome", "Welcome in the MagicNumber Game");

      socket.on("disconnect", nickname => {
        if (magicNumber.nbPlayers) {
          magicNumber.nbPlayers--;
        }
        magicNumber.emit("messageMagic", "Waiting for another player");
        if (magicNumber.nbPlayers != 2) {
          magicNumber.started = false;
        }
        mlog(`${socket.nickname} has leave the  Room`, "red");
      });

      socket.on("join", nickname => {
        socket.nickname = nickname;
        mlog(`${nickname} has joined the MagicNumber Game`, "cyan");
      });

      socket.on("start", () => {
        magicNumber.nbPlayers = magicNumber.nbPlayers || 0;
        magicNumber.nbPlayers++;
        console.log(magicNumber.nbPlayers);
        if (magicNumber.started) {
          console.log("jeu a commencé veulliez attendre");
          socket.emit(
            "magicNumberMessage",
            "The game is already started wait the end"
          );
        } else if (magicNumber.nbPlayers == 2) {
          magicNumber.started = true;
          console.log("il y a deux joueur le jeu commence");
          socket.emit("start", true);
          socket.emit(
            "magicNumberMessage",
            "The game is started, guess a number between 0 and 1337"
          );
        } else {
          console.log("attente d'autre joueur");
          socket.emit("magicNumberMessage", "waiting other player");
        }
        mlog(`${socket.nickname} is ready`, "yellow");
      });

      socket.on("number", nb => {
        socket.round = socket.round || 0;
        let answer = Math.floor(Math.random() * 1338);
        magicNumber.answer = magicNumber.answer || answer;
        if (nb > magicNumber.answer) {
          console.log("plus petit");
          socket.emit("magicNumberMessage", "smaller");
        } else if (nb < magicNumber.answer) {
          console.log("plus grand");

          socket.emit("magicNumberMessage", "greater");
        } else if (nb == magicNumber.answer) {
          socket.round++;
          magicNumber.answer = Math.floor(Math.random() * 1338);
          console.log();

          console.log("le round est gagné");
          console.log(socket.round);

          let winner;
          let loser;
          if (socket.round == 3) {
            winner = "You win";
            loser = "You lose";
            console.log("la partie est terminé");
          } else {
            winner = `You win this round, ${3 -
              socket.round}more round to win the game :D`;
            console.log(winner);
            loser = "You lose";
            console.log(loser);
          }
          socket.emit("magicNumberMessage", winner);
          socket.broadcast.emit("magicNumberMessage", loser);
          magicNumber.answer = null;
        }
      });
    });

    // ... and finally server listening not the app
    server.listen(port, err => {
      if (err) throw err;

      mlog(`Server is running on port ${port}`);
    });
  } catch (err) {
    mlog(err, "red");
    process.exit(42);
  }
};

// Let's Rock!
start();
