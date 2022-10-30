const express = require("express");
const fs = require("fs");
const fileUpload = require("express-fileupload");
const cors = require("cors");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");

const app = express();

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

app.use(
  fileUpload({
    createParentPath: true,
  })
);

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));

app
  .get("/ping", async (req, res, next) => {
    return res.status(200).json({
      status: "200",
      message: "Pong!",
    });
  })
  .post("/", limiter, async (req, res) => {
    try {
      if (req.files && req.files.files) {
        [req.files.files].flat().map((file) => {
          file.mv("./uploads/" + file.name);
        });
      }

      fs.appendFile("./uploads/data.json", `${JSON.stringify(req.body)} \n`, "utf8", () => {
        res.send({
          status: true,
          message: "Data is uploaded",
        });
      });
    } catch (e) {
      res.status(500).send(e.message);
    }
  });

  const port = process.env.PORT || 9001;

app.listen(port, () => console.log(`Server is running on port ${port}`));
