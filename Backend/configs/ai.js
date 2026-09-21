import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;

const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

export default ai;

// import OpenAI from "openai";

// //const ai=new OpenAI({
// //apiKey:process.env.GEMINI_API_KEY,
// //baseURL: process.env.OPENAI_BASE_URL
// //})
// const apiKey = process.env.GEMINI_API_KEY || process.env.OPENAI_API_KEY;
// const isGemini = Boolean(process.env.GEMINI_API_KEY);
// const geminiBaseURL = 'https://generativelanguage.googleapis.com/v1beta/openai/';

// const resolveBaseURL = () => {
//     const configuredBaseURL = process.env.OPENAI_BASEURL?.trim();
//     if (!isGemini) return configuredBaseURL || undefined;
//     if (!configuredBaseURL) return geminiBaseURL;

//     try {
//         const url = new URL(configuredBaseURL);
//         if (url.hostname === 'generativelanguage.googleapis.com') {
//             return geminiBaseURL;
//         }
//     } catch {
//         return geminiBaseURL;
//     }

//     return configuredBaseURL;
// }

// const ai = apiKey ? new OpenAI({
//     apiKey,
//     baseURL: resolveBaseURL(),
// }) : null;

// export default ai;
