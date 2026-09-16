import OpenAI from "openai";

const apiKey = process.env.GEMINI_API_KEY || process.env.OPENAI_API_KEY;
const isGemini = Boolean(process.env.GEMINI_API_KEY);
const geminiBaseURL = 'https://generativelanguage.googleapis.com/v1beta/openai/';

const resolveBaseURL = () => {
    const configuredBaseURL = process.env.OPENAI_BASEURL?.trim();
    if (!isGemini) return configuredBaseURL || undefined;
    if (!configuredBaseURL) return geminiBaseURL;

    try {
        const url = new URL(configuredBaseURL);
        if (url.hostname === 'generativelanguage.googleapis.com') {
            return geminiBaseURL;
        }
    } catch {
        return geminiBaseURL;
    }

    return configuredBaseURL;
}

const ai = apiKey ? new OpenAI({
    apiKey,
    baseURL: resolveBaseURL(),
}) : null;

export default ai;
