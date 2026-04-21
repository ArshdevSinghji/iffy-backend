const express = require("express");
const cors = require("cors");
const qs = require("qs");
const { handleError } = require("./middleware/handle-error");
require("dotenv").config();

const PORT = process.env.PORT;
const app = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
  })
);

app.use(express.json());
app.set("query parser", (str) => qs.parse(str));

app.use("/api", require("./routes"));
app.use(handleError);


app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
