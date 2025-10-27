import express from "express";
import multer from "multer";
import { nanoid } from "nanoid";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { PutCommand, GetCommand, DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

const app = express();
app.use(express.json());
const upload = multer();

const {
    AWS_REGION = "ap-northeast-2",
    TABLE_NAME = "notes",
    BUCKET_NAME = "myapp-uploads"
} = process.env;

const ddb = DynamoDBDocumentClient.from(new DynamoDBClient({ region: AWS_REGION }));
const s3 = new S3Client({ region: AWS_REGION });

app.get("/healthz", (_, res) => res.status(200).send("ok"));

app.post("/note", async (req, res) => {
    try {
        const id = nanoid(8);
        const item = { id, text: req.body.text ?? "", createdAt: Date.now() };
        await ddb.send(new PutCommand({ TableName: TABLE_NAME, Item: item }));
        res.json({ id, ok: true });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

app.get("/note/:id", async (req, res) => {
    try {
        const r = await ddb.send(new GetCommand({ TableName: TABLE_NAME, Key: { id: req.params.id } }));
        if (!r.Item) return res.status(404).json({ error: "not found" });
        res.json(r.Item);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

app.post("/upload", upload.single("file"), async (req, res) => {
    try {
        const key = `uploads/${nanoid(6)}-${req.file.originalname}`;
        await s3.send(new PutObjectCommand({
            Bucket: BUCKET_NAME,
            Key: key,
            Body: req.file.buffer,
            ContentType: req.file.mimetype
        }));
        res.json({ key, ok: true });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`listening on ${port}`));
