import axios from "axios";
import express from "express";

import User from "./User";

/**
 */
export default function (): express.Router {
  const router = express.Router();
  router.get("/", (req, res) => {
    res.send("this is an secure server");
  });

  router.get(`/userinfo`, async (req, res) => {
    try {
      const accessToken = req.headers.authorization.split(" ")[1];
      const userInfo = axios
        .get("https://dev-chaday.us.auth0.com/userInfo", {
          headers: {
            authorization: `Bearer ${accessToken}`,
          },
        })
        .then((response) => {
          res.send(response.data);
          res.status(200).end();
        })
        .catch((error) => {
          res.status(500).end(error.message);
        });
    } catch (error) {
      res.status(500).end(error.message);
    }
  });
  router.get("/data", function (req, res) {
    try {
      res.send("content");
      res.status(200).end();
    } catch (error) {
      res.status(500).end(error.message);
    }
  });

  return router;
}
