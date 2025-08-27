import express from 'express';
import multer from 'multer';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { protect } from '../middleware/authMiddleware.js';
import { parseReceiptText } from '../helpers/receiptParser.js'; // <-- Import the parser

const router = express.Router();

// Configure multer for file storage in memory
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Initialize the Google Generative AI client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Helper function to convert buffer to base64
function bufferToBase64(buffer) {
  return buffer.toString('base64');
}

// @desc    Upload a receipt and extract text using Gemini
// @route   POST /api/receipts/scan
// @access  Private
router.post('/scan', protect, upload.single('receipt'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No receipt image uploaded.' });
  }
  if (!process.env.GEMINI_API_KEY) {
    console.error('Gemini API key is missing.');
    return res.status(500).json({ message: 'Server configuration error: Missing API Key.' });
  }

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro-vision' });
    const prompt = "Extract all text from this receipt, focusing on item names, prices, and the total amount. Present the information clearly, line by line.";

    const imagePart = {
      inlineData: {
        data: bufferToBase64(req.file.buffer),
        mimeType: req.file.mimetype,
      },
    };

    const result = await model.generateContent([prompt, imagePart]);
    const response = await result.response;
    const text = response.text();

    // Use the parser to get structured data
    const items = parseReceiptText(text);

    res.status(200).json({
      message: 'Receipt scanned successfully!',
      extractedText: text, // We still send the raw text for debugging
      items: items, // Send the parsed items
    });

  } catch (error) {
    console.error('Error with Gemini API:', error);
    res.status(500).json({ message: 'Failed to process receipt with AI service.' });
  }
});

export default router;
