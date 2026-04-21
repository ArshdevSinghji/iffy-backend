const connectDB = require("./config/db");
const express = require("express");
const qs = require("qs");
const cors = require("cors");
const { handleError } = require("./middleware/handle-error");
require("dotenv").config();

const PORT = process.env.PORT;

const app = express();
app.set("query parser", (str) => qs.parse(str));

app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
  }),
);

app.use(express.json());

app.use("/", require("./routes"));
app.use(handleError);

const startServer = async () => {
  await connectDB();

  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
};

startServer();
