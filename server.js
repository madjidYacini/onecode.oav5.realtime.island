import express from "express";
import socketIo from "socket.io";
import path from "path";
import randomWords from "random-words";
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
        magicNumber.emit("magicNumberMessage", "Waiting for another player");
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

      socket.on("beginGame", number => {
        socket.round = socket.round || 0;
        let answer = Math.floor(Math.random() * 1338);
        console.log(answer);
        magicNumber.answer = magicNumber.answer || answer;
        if (number > magicNumber.answer) {
          console.log("plus petit");
          socket.emit("magicNumberMessage", "smaller");
        } else if (number < magicNumber.answer) {
          console.log("plus grand");

          socket.emit("magicNumberMessage", "greater");
        } else if (number == magicNumber.answer) {
          socket.round++;
          magicNumber.answer = Math.floor(Math.random() * 1338);
          console.log(magicNumber.answer);

          console.log("le round est gagné");
          console.log(socket.round);

          let winner;
          let loser;
          if (socket.round == 3) {
            winner = "The Game is over : You win.";
            loser =  "The Game is over : You lose.";
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

    let fastkey = io.of("/fastkey");
    fastkey.on("connection", function(socket) {
      fastkey.emit("welcome", "Welcome in the fastKey game");

      socket.on("join", nickname => {
        socket.nickname = nickname;
        mlog(`${nickname} has joined the fast Game`, "cyan");
      });

      fastkey.on("disconnect", nickname => {
        fastkey.nbPlayers = fastkey.nbPlayers - 1;
        fastkey.nbPlayers = fastkey.nbPlayers == 0 ? null : fastkey.nbPlayers;
        fastkey.emit("fastKeyMessage", null);
      });

      socket.on("start", () => {
        fastkey.nbPlayers = fastkey.nbPlayers || 0;
        fastkey.nbPlayers++;

        if (fastkey.started) {
          socket.emit(
            "fastKeyMessage",
            "The game is already started wait the end"
          );
        } else if (fastkey.nbPlayers == 2) {
          fastkey.started = true;
          socket.emit("start", true);
          socket.broadcast.emit("start", true);
          fastkey.answer = randomWords();
          console.log("ZERTYUI");
          console.log(fastkey.answer);
          socket.emit(
            "fastKeyMessage",
            `The game is to type the word ${fastkey.answer} quickly`
          );
          socket.broadcast.emit(
            "fastKeyMessage",
            `The game is to type the word ${fastkey.answer} quickly`
          );
          console.log("all players are connected");
        } else {
          socket.emit("fastKeyMessage", "waiting other player");
        }
        console.log(fastkey.nbPlayers);
        console.log(`${socket.nickname} is ready`);
      });

      socket.on("beginGame", word => {
        socket.round = socket.round || 0;
        console.log(fastkey.answer);
        console.log(word);

        if (word.localeCompare(fastkey.answer) !== 0) {
          socket.emit(
            "fastKeyMessage",
            "you've miss typed the word, try again"
          );
          console.log("wrong");
        } else if (word.localeCompare(fastkey.answer) === 0) {
          socket.round++;
          console.log(socket.round);
          fastkey.answer = randomWords();
          let winner;
          let loser;
          if (socket.round == 2) {
            winner = "You win";
            loser = "You lose";
            console.log("you winn bitch");
          } else {
            winner = `You win this round, ${7 -
              socket.round} more rounds to win the game. Here the new word: ${
              fastkey.answer
            }`;
            loser = `You lose this round  Here the new word : ${
              fastkey.answer
            }`;
            console.log(loser);
            console.log(winner);
          }

          socket.emit("fastKeyMessage", winner);
          socket.broadcast.emit("fastKeyMessage", loser);
        }
      });
    });

    // QuicKey
    // wait TWO or more players for start the game
    let players = []
    let pointForHim = []
    let nbPLayer = 0
    let quicKey = io.of("/QuicKey");
    quicKey.on("connection", function(socket){


  socket.on("ok", (nickname) => {
    // console.log(nickname);
    quicKey.nickname = nickname
    quicKey.countKey =  0
    // for (const client of Object.values(quicKey.clients())) {
    //   console.log(client);
    // }

    nbPLayer = nbPLayer + 1
    if (nbPLayer>= 2) {
      socket.emit("start", ("k"))
      setTimeout(() =>{ socket.emit("endChrono"), countPoint() }, 3000)
    }
    else {
      console.log(`${quicKey.nickname} wait a other player`);
    }
  });

  // add counter when Keypress
  socket.on("addKey", (key) => {
    quicKey.countKey++
  });

  // function to add point to Most playerCounter
   function countPoint(){
     for (const client of Object.values(io.sockets.clients().connected)) {
       console.log(client.nickname);
       let user = {}
       user.name = client.nickname
       user.countKey = client.countKey || 0
       user.point = client.point || 0
       players.push(user)
     }
     let valueMax  = Math.max(...players.map(o => o.countKey), 0)
     let indexOfArray = players.findIndex(i => i.countKey === valueMax)
     players[indexOfArray].point ++
     console.log(`winnerStep is : ${players[indexOfArray].name}`);
     socket.emit("winnerStep", players[indexOfArray] )
  }
})

        // FINQuicKey

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
