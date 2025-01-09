import express from "express"
import logger from "./logger.js"

const app = express();

const port = 3000

app.post("/process-text", (req, res) => {
    const { text } = req.body;

    console.log("Recieved text:", text);
    res.json({ success: true, message: "Text processed succesfully"})
})

/*app.post("/process-pdf", (req, res) => {

})
*/


app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`)
});