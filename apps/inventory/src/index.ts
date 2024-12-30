import express from "express";

const app = express();
const port = process.env.PORT || 4000;

app.get("/", (req, res) => {
  res.send("Inventory Microservice is running!");
});

app.listen(port, () => {
  console.log(`Inventory service listening on port ${port}`);
});
