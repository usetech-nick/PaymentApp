const express = require("express");
const cors = require("cors");
const app = express();
const rootRouter = require("./routes/index");

app.use(express.json());
app.use(cors());
app.use("/api/v1", rootRouter);

app.listen(3000, () => {
  console.log("Sever running at port 3000");
});
