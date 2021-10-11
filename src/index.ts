import { dir, DirectoryResult } from "tmp-promise";
import bodyParser from "body-parser";
import express from "express";
import https from "https";
import fileUpload from "express-fileupload";
import i18next from "i18next";
import i18nextFsBackend from "i18next-fs-backend";
import i18nextHttpMiddleware from "i18next-http-middleware";
import path from "path";
import cors from "cors";
import jwt from "express-jwt";
import jwks from "jwks-rsa";
import axios from "axios";
import fs from "fs";

import restExpressRoutes from "./routes";
import User from "./User";
import { displayIps, clearTempFiles } from "./utils";

let tmpDir: DirectoryResult;

var jwtCheck = jwt({
  secret: jwks.expressJwtSecret({
    cache: true,
    rateLimit: true,
    jwksRequestsPerMinute: 5,
    jwksUri: "https://dev-chaday.us.auth0.com/.well-known/jwks.json",
  }),
  audience: "UFREMjIzSSAoU2ltYmlvc3lzIEwpMB4XDTIxMTAxMTE4MTYxNVoXDTI0MDExMTE5",
  issuer: "https://dev-chaday.us.auth0.com/",
  algorithms: ["RS256"],
});

const start = async (): Promise<void> => {
  const useTempUploads = process.env.TEMP_UPLOADS === "true";
  const key = fs.readFileSync(
    "C:\\wamp64\\www\\PROYECTS\\auth0-express\\localhostkey.pem"
  );
  const cert = fs.readFileSync(
    "C:\\wamp64\\www\\PROYECTS\\auth0-express\\localhost.pem"
  );

  if (useTempUploads) {
    tmpDir = await dir({ keep: false, unsafeCleanup: true });
  }
  const options: cors.CorsOptions = {
    allowedHeaders: [
      "Origin",
      "X-Requested-With",
      "Content-Type",
      "Accept",
      "X-Access-Token",
      "authorization",
    ],
    credentials: true,
    methods: "GET,HEAD,OPTIONS,PUT,PATCH,POST,DELETE",
    origin: "*",
    preflightContinue: false,
  };

  const server = express();
  server.use(cors(options));
  const serverE = https.createServer({ key: key, cert: cert }, server);

  server.use(bodyParser.json({ limit: "500mb" }));
  server.use(
    bodyParser.urlencoded({
      extended: true,
    })
  );

  server.use((req, res, next) => {
    //  req = new User();
    next();
  });
  server.use(jwtCheck);
  server.use("/api", restExpressRoutes());
  const port = process.env.PORT || "8000";

  // For developer convenience we display a list of IPs, the server is running
  // on. You can then simply click on it in the terminal.
  displayIps(port);

  serverE.listen(port);
};

// We can't use await outside a an async function, so we use the start()
// function as a workaround.

start();
