const express = require("express");
const app = express();

app.get("/", (req, res) => res.send("Hello Lets Go Colombo Tours by J!"));
app.listen(3000, "127.0.0.1", () => console.log("Test server running at http://localhost:3000"));