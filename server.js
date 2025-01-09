import express from "express"
import logger from "./logger.js"
import multer from "multer"
import * as pdfjsLib from "pdfjs-dist";

const app = express();
const port = 3000;

app.use(express.json());

const upload = multer({ storage: multer.memoryStorage() });

app.post("/process-text", (req, res) => {
    const { text } = req.body;

    console.log("Recieved text:", text);
    res.json({ success: true, message: "Text processed succesfully"})
})

app.post("/process-pdf", upload.single("pdf"), async (req, res) => {
    const pdfFile = req.file;

    if (!pdfFile) {
        return res.status(400).json({ error: "No PDF file uploaded"});
    }

    console.log("Recieved PDF file:", pdfFile.originalname);

    try {
        const pdfDocument = await pdfjsLib.getDocument({ data: pdfFile.buffer}).promise;

        let extractedText = "";

        for(let i = 0; i < pdfDocument.numPages; i++) {
            const page = await pdfDocument.getPage(i);
            const textContent = await page.getTextContent();

            textContent.items.forEach(item => {
                extractedText  += item.str + " ";
            });
        }

        console.log("Extracted Text from PDF", extractedText);

        res.json({
            success: true,
            message: "PDF processed successfully",
            extractedText: extractedText,
        });
    } catch (error) {
        logger.error("Error parsing PDF: ", error);
        res.status(500).json({ error: "Failed to process PDF"});
    }
});



app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`)
});