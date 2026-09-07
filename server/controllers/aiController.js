import { generateWithDeepSeek } from "../services/ai/huggingfaceService.js";

export const generateAIResponse = async (req, res) => {
    try {
    const { prompt } = req.body;

    if (!prompt) {
        return res.status(400).json({
        success: false,
        message: "Prompt is required",
        });
    }

    const response = await generateWithDeepSeek(prompt);

    res.status(200).json({
        success: true,
        response,
    });

    } catch (error) {

    console.error(error);

    res.status(500).json({
        success: false,
        message: error.message,
    });

    }
};