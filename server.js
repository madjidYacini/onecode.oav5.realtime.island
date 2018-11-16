import express from "express";
import socketIo from "socket.io";
import path from "path";

import { createServer } from "http";

import { argv, mlog } from "./libs/utils";

// Instantiate express application
const app = express();

// Setting the application port depending to environment
const port = parseInt(argv[0], 10) || process.env.PORT;

// Entry point function
const start = async () => {
  try {
    // app is a request handler function that we must pass to http server instance
    const server = createServer(app);

    // socket.io take a server and not an express application
    const io = socketIo(server);

    // ... and finally server listening not the app
    server.listen(port, err => {
      if (err) throw err;

      mlog(`Server is running on port ${port}`);
    });

    let users = []

    io.on("connection", socket => {
      mlog("client connected", "yellow");

      socket.on("disconnect", () => {
        mlog("client disconnected", "yellow");
        nbPlay = nbPlay -1
      });

      socket.on("newUser", nickname => {
        users.push(nickname)
        socket.nickname = nickname;
        console.log(users);
        console.log(`${nickname} has joined the channel`);
      });

      // magicUser
        let nbPlay  = 0
        let randomNumber = 0
        let score = []
        let nbRound = 0
      socket.on("joint", () => {
        console.log("le joueur ",socket.nickname,"");
        nbPlay = nbPlay+1
        // que tu peux pas tajouter deux fois au jeu
        if (nbPlay == 2) {
             randomNumber =  Math.floor((Math.random() * 1338) )
             console.log(randomNumber);

             socket.emit("start", "you can start the game")

        }
        else {
          console.log("il y a : ",nbPlay);
        }
        // socket.emit("hello", "Welcome to the jungle!");
      });

      socket.on("try", number => {
        console.log("randomNumber est : ", randomNumber);
        console.log(" ton number est : ", number);
      if (number == randomNumber  ) {
        console.log(`The player : ${socket.nickname} wins the manche`);
        io.emit("addPoint", `The player : ${socket.nickname} wins the manche`)
        nbRound = nbRound+1
        console.log(socket.nickname);
        score.push(socket.nickname)
      }
      else if (number < randomNumber) {
        console.log(socket.nickname);
        console.log("your number is to lower");
        socket.emit("tryAgain", "your number is to lower")

      }
      else if (number > randomNumber) {
        console.log("your number is to bigger");
        socket.emit("tryAgain", "your number is to bigger")

      }
      });


      //finMagicUser

    });
  } catch (err) {
    mlog(err, "red");
    process.exit(42);
  }
};

// Let's Rock!
start();
