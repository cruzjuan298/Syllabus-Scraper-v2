import express from "express"
import logger from "./logger.js"

const app = express();

const port = 3000

app.get('/', (req, res) => {
    res.send("Testing");
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`)
});