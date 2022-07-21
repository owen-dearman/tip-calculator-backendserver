import { Client } from "pg";
import { config } from "dotenv";
import express from "express";
import cors from "cors";
import filePath from "./filePath";

config(); //Read .env file lines as though they were env vars.

//Call this script with the environment variable LOCAL set if you want to connect to a local db (i.e. without SSL)
//Do not set the environment variable LOCAL if you want to connect to a heroku DB.

//For the ssl property of the DB connection config, use a value of...
// false - when connecting to a local DB
// { rejectUnauthorized: false } - when connecting to a heroku DB
const herokuSSLSetting = { rejectUnauthorized: false }
const sslSetting = process.env.LOCAL ? false : herokuSSLSetting
const dbConfig = {
  connectionString: process.env.DATABASE_URL,
  ssl: sslSetting,
};

const app = express();

app.use(express.json()); //add body parser to each following route handler
app.use(cors()) //add CORS support to each following route handler

const client = new Client(dbConfig);
client.connect();

app.get("/", (req, res) => {
  const pathToFile = filePath("../public/index.html");
  res.sendFile(pathToFile);
});

app.get("/settings", async (req, res) => {
  try {
    const response = await client.query("select * from saved_settings");
    res.status(200).json(response.rows);
  } catch (error) {
    res.status(400).send({ error });
  }
});
type TipDiscountOptions = "percentage" | "setAmount";
interface PostedSettings {
  name: string;
  currency: string;
  numPayee: number;
  discountType: TipDiscountOptions;
  tipType: TipDiscountOptions;
  discount: number;
  tip: number;
  misc: number;
  roundUp: boolean;
}

app.post<{}, {}, PostedSettings>("/settings", async (req, res) => {
  try {
    const {
      name,
      currency,
      numPayee,
      discountType,
      discount,
      tipType,
      tip,
      misc,
      roundUp,
    } = req.body;
    const response = await client.query(
      "insert into saved_settings (name, currency, numpayee, discounttype, tiptype, discount, tip, misc, roundup) values ($1,$2,$3,$4,$5,$6,$7,$8,$9);",
      [
        name,
        currency,
        numPayee,
        discountType,
        tipType,
        discount,
        tip,
        misc,
        roundUp,
      ]
    );
    res.status(200).json(response.rows);
  } catch (error) {
    res.status(500).send({ error });
  }
});

app.delete<{ id: string }, {}, {}>("/settings/:id", async (req, res) => {
  try {
    const id = req.params.id;
    await client.query("DELETE FROM saved_settings WHERE id = $1", [id]);
    const getResponse = await client.query("select * from saved_settings");
    res.status(200).json(getResponse.rows);
  } catch (error) {
    res.status(400).send({ error });
  }
});

//Start the server on the given port
const port = process.env.PORT;
if (!port) {
  throw 'Missing PORT environment variable.  Set it in .env file.';
}
app.listen(port, () => {
  console.log(`Server is up and running on port ${port}`);
});
