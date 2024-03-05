/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

const {onRequest} = require("firebase-functions/v2/https");
const logger = require("firebase-functions/logger");

const admin = require("firebase-admin");
const serviceAccount = require("./permissions.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const express = require("express");
const app = express();
const db = admin.firestore();

const cors = require("cors");
app.use(cors({origin: true}));

// Routes

app.get("/update-volunteer-attendance-info", (req, res) => {
  logger.log(`volunteerId is: ${req.query.id}`);

  let totalPresent = 0;
  let totolMeet = 0;

  (async () => {
    try {
      const document = db
          .collection(`volunteers`)
          .doc(`${req.query.id}`)
          .collection(`attendance`)
          .where("is_present", "==", true);

      const response = await document.count().get();
      // let response = commitee.data();

      logger.log(response);
      totalPresent = response.data().count;
      return res.status(200).send(response.data());
    } catch (error) {
      console.log(error);
      return res.status(500).send(error);
    }
  })();

  (async () => {
    try {
      const document = db
          .collection(`volunteers`)
          .doc(`${req.query.id}`)
          .collection(`attendance`);

      const response = await document.count().get();

      logger.log(response.data());
      totolMeet = res.data().count;
      return res.status(200).send(response.data());
    } catch (error) {
      logger.log(error);
      return res.status(500).send(error);
    }
  })();

  (async () => {
    const fieldN = new Date()
        .toLocaleString("default", {month: "long"})
        .slice(0, 3)
        .toLowerCase();
    logger.log(fieldN);
    try {
      db
          .collection(`volunteers`)
          .doc(`${req.query.id}`)
          .collection(`attendance_info`)
          .doc(`${new Date().getFullYear()}`)
          .create({
            fieldN: [totalPresent, totolMeet],
          });

      return res.status(200).send("doc created sucessfully");
    } catch (error) {
      logger.log(error);
      return res.status(500).send(error);
    }
  })();
});

exports.app = onRequest(app);
