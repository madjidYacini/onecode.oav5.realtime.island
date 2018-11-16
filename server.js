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

    io.on("connection", socket => {
      mlog("client connected", "yellow");

      socket.on("disconnect", () => {
        mlog("client disconnected", "yellow");
      });

      socket.on("join", nickname => {
        console.log(`${nickname} has joined the channel`);
        socket.nickname = nickname;

        socket.emit("hello", "Welcome to the jungle!");
      });
    });
  } catch (err) {
    mlog(err, "red");
    process.exit(42);
  }
};

// Let's Rock!
start();
