import express from "express"
import logger from "./logger.js"
import multer from "multer"
import cors from "cors"
import * as pdfjsLib from "pdfjs-dist"
import { GoogleGenerativeAI } from "@google/generative-ai"
import dotenv from "dotenv"

const mock = true;
const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

const upload = multer({ storage: multer.memoryStorage() });

dotenv.config();

const apiKey = process.env.API_KEY;

const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
let prompt;
let result;

app.post("/process-text", async (req, res) => {
    const { text } = req.body;

    prompt = `You are an expert large language model that can detect important dates for exams, quizes, deadlines or anything else that may be of relevance of being due at a certain date. You will output data in this format: Date - Activity. For example, an exam on october 12 should be: October 12 - Exam. From this text, what are important deadlines or dates?: ${text}`;

    if (mock) {
        result = {
            response : {
                text : () => Promise.reolve("October 13: Exam"),
            },
        };
    } else result = await model.generateContent(prompt);

    let scrapedData;

    if (result &&  result.response) {
        scrapedData = await result.response.text();
    } else scrapedData = "Error retrieving data";

    console.log("Recieved text:", text);
    res.json({ success: true, message: "Text processed succesfully", scrapedText: scrapedData});
})

app.post("/process-pdf", upload.single("pdf"), async (req, res) => {
    const pdfFile = req.file;

    if (!pdfFile) {
        return res.status(400).json({ error: "No PDF file uploaded"});
    }

    console.log("Recieved PDF file:", pdfFile.originalname);

    try {
        const uint8Array = new Uint8Array(pdfFile.buffer);
        const pdfDocument = await pdfjsLib.getDocument({ data: uint8Array}).promise;

        let extractedText = "";

        const numPages = pdfDocument.numPages;

        for (let i = 0; i < numPages; i++){
            try {
                const page = await pdfDocument.getPage(i + 1);
                const textContent = await page.getTextContent();

                textContent.items.forEach(item => {
                    extractedText += item.str + " ";
                });
            } catch (pageError) {
                logger.error(`Error processing page ${i + 1}`, pageError);
            }
        }

        console.log("Extracted Text from PDF", extractedText);

        const prompt = `You are an expert large language model that can detect important dates for exams, quizzes, deadlines, or anything else of relevance being due at a certain date. You will output data in this format: Date - Activity. For example, an exam on October 12 should be: October 12 - Exam. From this text, what are important deadlines or dates?: ${extractedText}`;

        if (mock) {
            result = {
                response: {
                    text: () => Promise.resolve("October 22nd: Exam"),
                },
            };
        } else result = await model.generateContent(prompt);

        let scrapedData;

        if (result && result.response) {
             scrapedData = await result.response.text();
        } else scrapedData = "Error scraping data";

        res.json({
            success: true,
            message: "PDF processed successfully",
            extractedText: extractedText,
            analyzedData: scrapedData,
        });
    } catch (error) {
        logger.error("Error parsing PDF: ", error);
        res.status(500).json({ error: "Failed to process PDF", details: error.message});
    }
});



app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`)
});