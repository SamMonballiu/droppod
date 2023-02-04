import express, { Request, Response } from "express";

const app = express();
app.use(express.static(__dirname + "/public"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.post("/upload_files", (req: Request, res: Response) => {
    console.log(req.body);
});

app.listen(4004, () => {
    console.log("Server started...");
});