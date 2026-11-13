import express from "express";
import ViteExpress from "vite-express";
import passport from "passport";
import api from "./api.js";

const app = express();
app.use(passport.initialize());
app.use(express.json());
app.use('/api', api);

app.get("/hello", (req, res) => {
  res.send("Hello Vite + React!");
});

ViteExpress.listen(app, 3000, () =>
  console.log("Server is listening on port 3000..."),
);
