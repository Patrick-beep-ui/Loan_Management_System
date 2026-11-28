import express from "express";
import ViteExpress from "vite-express";
import passport from "passport";
import cors from "cors";
import helmet from "helmet";
import api from "./api.js";
import { corsOptions, helmetOptions } from "./config/security.js";
import { errorHandler } from "./middlewares/errorHandler.js";

const app = express();
app.use(helmet(helmetOptions));
app.use(cors(corsOptions));
app.use(passport.initialize());
app.use(express.json());
app.use('/api', api);

app.get("/hello", (req, res) => {
  res.send("Hello Vite + React!");
});

app.use(errorHandler);

ViteExpress.listen(app, 3000, () =>
  console.log("Server is listening on port 3000..."),
);
