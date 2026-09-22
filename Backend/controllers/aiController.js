import resume from "../models/resume.js"
import ai from "../configs/ai.js"


const aiModel = process.env.GEMINI_MODEL || "gemini-3.5-flash";

const requireAI = (res) => {
    if (!ai) {
        res.status(503).json({message:'AI service is not configured. Set GEMINI_API_KEY on the backend.'});
        return false;
    }
    return true;
}

// The native SDK returns plain text on response.text, not response.choices[0].message.content
const getAIContent = (response) => response?.text?.trim();

const parseGeminiErrorMessage = (message) => {
    if (!message) return null;
    try {
        // Gemini SDK sometimes puts the raw JSON error blob into error.message
        const jsonStart = message.indexOf('{');
        if (jsonStart === -1) return null;
        const parsed = JSON.parse(message.slice(jsonStart));
        return parsed?.error?.message || null;
    } catch {
        return null;
    }
}

const aiErrorMessage = (error) => {
    const status = error?.status || error?.response?.status;
    const rawMessage = error?.message || '';
    const innerMessage = parseGeminiErrorMessage(rawMessage) || rawMessage;

    if (status === 401 || status === 403 || /API key not valid|UNAUTHENTICATED/i.test(innerMessage)) {
        return 'AI authentication failed. Check that GEMINI_API_KEY is a valid, current Gemini API key.';
    }
    if (status === 404 || /not found/i.test(innerMessage)) {
        return 'The configured AI model was not found. Check GEMINI_MODEL is a currently supported model.';
    }
    if (status === 503 || /UNAVAILABLE|overloaded|high demand/i.test(innerMessage)) {
        return 'The AI service is temporarily busy due to high demand. Please try again in a moment.';
    }
    return innerMessage || 'The AI service request failed';
}

const parseAIJson = (content) => {
    const normalized = content.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();
    return JSON.parse(normalized);
}

//contoller for enhancing resume using AI
//POST: /api/ai/enhance-pro-sum

export const enhanceProfessionalSummary = async (req, res) => {
    try{
        const {userContent} =req.body

        if(!userContent){
            return res.status(400).json({message:'missing required fields'})
        }
        if (!requireAI(res)) return;

        const response = await ai.models.generateContent({
            model: aiModel,
            contents: userContent,
            config: {
                systemInstruction: "You are an expert in resume writing.Your task is to enhance the professional summary of a resume. The summary should be 1-2 sentences also highlighting key skills,experience, and career objectives. Make it compelling and ATS-friendly. and only return text no options or anything else."
            }
        })

        const enhancedContent = getAIContent(response)
        if (!enhancedContent) {
            return res.status(502).json({message:'AI returned an empty response'})
        }
        return res.status(200).json({enhancedContent})
    }catch(error){
        return res.status(502).json({message:aiErrorMessage(error)})
    }
}

//controller for enhancing a resume's job description
//POST: /api/ai/enhance-job-desc

export const enhanceJobDescription = async (req, res) => {
    try{
        const {userContent} =req.body

        if(!userContent){
            return res.status(400).json({message:'missing required fields'})
        }
        if (!requireAI(res)) return;

        const response = await ai.models.generateContent({
            model: aiModel,
            contents: userContent,
            config: {
                systemInstruction: "You are an expert in resume writing.Your task is to enhance the job description of a resume. The job description should be only in 1-2 sentence also highlighting key responsibilities and achievements. Use action verbs and quantifiable results where possible. Make it ATS-friendly. and only return text no options or anything else."
            }
        })

        const enhancedContent = getAIContent(response)
        if (!enhancedContent) {
            return res.status(502).json({message:'AI returned an empty response'})
        }
        return res.status(200).json({enhancedContent})
    }catch(error){
        return res.status(502).json({message:aiErrorMessage(error)})
    }
}


//contoller  for uploading a resume to the database
//POST: //api//ai//upload-resume
export const uploadResume = async (req, res) => {
    try{

        const {resumeText,title: rawTitle} =  req.body;
        const userId = req.userId
        const title = rawTitle?.trim();

        if(!resumeText || !title){
            return res.status(400).json({message:'Resume title and resume content are required'})
        }
        if (!requireAI(res)) return;
            
        const systemPrompt = "You are an expert AI agent to extract data from resume."

        const userPrompt = `extract data from this resume: ${resumeText} 
        
        Provide data in the following JSON format with no additional text before or after:

        {
        professional_summary:{type:String,default:""},
        skills:[{type:String}],
        personal_info:{
            image:{type:String,default:""},
            full_name:{type:String,default:""},
            profession:{type:String,default:""},
            email:{type:String,default:""},
            phone:{type:String,default:""},
            location:{type:String,default:""},
            linkedin:{type:String,default:""},
            website:{type:String,default:""},
        },
        experience:[
            {
                company:{type:String},
                position:{type:String},
                start_date:{type:String},
                end_date:{type:String},
                description:{type:String},
                is_current:{type:Boolean,default:false}
            }
        ],
        projects:[{
            project_name:{type:String},
            type:{type:String},
            description:{type:String},
        }],
        education:[{
            institution:{type:String},
            degree:{type:String},
            field_of_study:{type:String},
            graduation_date:{type:String},
            gpa:{type:String},
        }],
        }
        `;

        const response = await ai.models.generateContent({
            model: aiModel,
            contents: userPrompt,
            config: {
                systemInstruction: systemPrompt,
                responseMimeType: 'application/json'
            }
        })

        const extractedData = getAIContent(response)
        if (!extractedData) {
            return res.status(502).json({message:'AI returned no resume data'})
        }
        const parsedData = parseAIJson(extractedData)
        if (!parsedData.project && parsedData.projects) {
            parsedData.project = parsedData.projects.map((project) => ({
                ...project,
                name: project.name ?? project.project_name ?? "",
            }));
        }
        const newResume = await resume.create({userId, title, ...parsedData})
        
        res.json({resumeId: newResume._id})
    }catch(error){
        return res.status(502).json({message:aiErrorMessage(error)})
    }
}



// import resume from "../models/resume.js"
// import ai from "../configs/ai.js"

// const aiModel = process.env.OPENAI_MODEL || process.env.GEMINI_MODEL || "gemini-3.5-flash";

// const requireAI = (res) => { 
//     if (!ai) {
//         res.status(503).json({message:'AI service is not configured. Set GEMINI_API_KEY or OPENAI_API_KEY on the backend.'});
//         return false;
//     }
//     return true;
// }

// const getAIContent = (response) => response?.choices?.[0]?.message?.content?.trim();

// const aiErrorMessage = (error) => {
//     const status = error?.status || error?.response?.status;
//     if (status === 401 || error?.code === 'invalid_api_key') {
//         return 'AI authentication failed. Check GEMINI_API_KEY and OPENAI_BASEURL. Gemini must use https://generativelanguage.googleapis.com/v1beta/openai/.';
//     }
//     if (status === 404) {
//         return 'The configured AI model or endpoint was not found. Check OPENAI_MODEL and OPENAI_BASEURL.';
//     }
//     return error?.message || 'The AI service request failed';
// }

// const parseAIJson = (content) => {
//     const normalized = content.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();
//     return JSON.parse(normalized);
// }

// //contoller for enhancing resume using AI
// //POST: /api/ai/enhance-pro-sum



// export const enhanceProfessionalSummary = async (req, res) => {
//     try{
//         const {userContent} =req.body

//         if(!userContent){
//             return res.status(400).json({message:'missing required fields'})
//         }
//         if (!requireAI(res)) return;

//         const response = await ai.chat.completions.create({
//             model: aiModel,
//             messages: [
//                 {   role: "system",
//                     content:  "You are an expert in resume writing.Your task is to enhance the professional summary of a resume. The summary should be 1-2 sentences also highlighting key skills,experience, and career objectives. Make it compelling and ATS-friendly. and only return text no options or anything else."
//                 },
//                 {
//                     role: "user",
//                     content: userContent,
//                 },
//             ],
//         })

//         const enhancedContent = getAIContent(response)
//         if (!enhancedContent) {
//             return res.status(502).json({message:'AI returned an empty response'})
//         }
//         return res.status(200).json({enhancedContent})
//     }catch(error){
//         return res.status(502).json({message:aiErrorMessage(error)})
//     }
// }

// //controller for enhancing a resume's job description
// //POST: /api/ai/enhance-job-desc

// export const enhanceJobDescription = async (req, res) => {
//     try{
//         const {userContent} =req.body

//         if(!userContent){
//             return res.status(400).json({message:'missing required fields'})
//         }
//         if (!requireAI(res)) return;

//         const response = await ai.chat.completions.create({
//             model: aiModel,
//             messages: [
//                 {   role: "system",
//                     content:  "You are an expert in resume writing.Your task is to enhance the job description of a resume. The job description should be only in 1-2 sentence also highlighting key responsibilities and achievements. Use action verbs and quantifiable results where possible. Make it ATS-friendly. and only return text no options or anything else."
//                 },
//                 {
//                     role: "user",
//                     content: userContent,
//                 },
//             ],
//         })

//         const enhancedContent = getAIContent(response)
//         if (!enhancedContent) {
//             return res.status(502).json({message:'AI returned an empty response'})
//         }
//         return res.status(200).json({enhancedContent})
//     }catch(error){
//         return res.status(502).json({message:aiErrorMessage(error)})
//     }
// }


// //contoller  for uploading a resume to the database
// //POST: //api//ai//upload-resume
// export const uploadResume = async (req, res) => {
//     try{

//         const {resumeText,title: rawTitle} =  req.body;
//         const userId = req.userId
//         const title = rawTitle?.trim();

//         if(!resumeText || !title){
//             return res.status(400).json({message:'Resume title and resume content are required'})
//         }
//         if (!requireAI(res)) return;
            
//         const systemPrompt = "You are an expert AI agent to extract data from resume."

//         const userPrompt = `extract data from this resume: ${resumeText} 
        
//         Provide data in the following JSON format with no additional text before or after:

//         {
//         professional_summary:{type:String,default:""},
//         skills:[{type:String}],
//         personal_info:{
//             image:{type:String,default:""},
//             full_name:{type:String,default:""},
//             profession:{type:String,default:""},
//             email:{type:String,default:""},
//             phone:{type:String,default:""},
//             location:{type:String,default:""},
//             linkedin:{type:String,default:""},
//             website:{type:String,default:""},
//         },
//         experience:[
//             {
//                 company:{type:String},
//                 position:{type:String},
//                 start_date:{type:String},
//                 end_date:{type:String},
//                 description:{type:String},
//                 is_current:{type:Boolean,default:false}
//             }
//         ],
//         projects:[{
//             project_name:{type:String},
//             type:{type:String},
//             description:{type:String},
//         }],
//         education:[{
//             institution:{type:String},
//             degree:{type:String},
//             field_of_study:{type:String},
//             graduation_date:{type:String},
//             gpa:{type:String},
//         }],
//         }
//         `;
//         const response = await ai.chat.completions.create({
//             model: aiModel,
//             messages: [
//                 {   role: "system",
//                     content:  systemPrompt
//                 },
//                 {
//                     role: "user",
//                     content: userPrompt,
//                 },
//             ],
//             response_format: {type:'json_object'}
//         })

//         const extractedData = getAIContent(response)
//         if (!extractedData) {
//             return res.status(502).json({message:'AI returned no resume data'})
//         }
//         const parsedData = parseAIJson(extractedData)
//         if (!parsedData.project && parsedData.projects) {
//             parsedData.project = parsedData.projects.map((project) => ({
//                 ...project,
//                 name: project.name ?? project.project_name ?? "",
//             }));
//         }
//         const newResume = await resume.create({userId, title, ...parsedData})
        
//         res.json({resumeId: newResume._id})
//     }catch(error){
//         return res.status(502).json({message:aiErrorMessage(error)})
//     }
// }
