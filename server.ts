import express, { Request, Response } from "express";
import multer from "multer";

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, __dirname + "/public/uploads");
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});

const upload = multer({ storage });

const app = express();
app.use(express.static(__dirname + "/public"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.post(
  "/upload_files",
  upload.array("files"),
  (_: Request, res: Response) => {
    res.status(200).send("ok");
  }
);

app.listen(4004, () => {
  console.log("Server started...");
});
