import express from "express";
// routes import
const app = express();
app.get('/', (req, res) => {
    res.send("Hello World");
});
app.listen(4000, () => {
    console.log("Server is running on port 4000");
});
