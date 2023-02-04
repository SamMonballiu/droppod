import express, { Request, Response } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { FileInfo } from "./models/fileinfo";

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

app.get("/files", (_, res: Response) => {
  const folder = __dirname + "/public/uploads/";
  const files = fs.readdirSync(folder);
  
  const result = files.reduce((acc, file) => {
    return acc.concat({
      filename: file,
      extension: path.extname(folder + file),
      size: fs.statSync(folder + file).size
    })
  }, [] as FileInfo[]);

  res.status(200).send(result);
});

app.listen(4004, () => {
  console.log("Server started...");
});
