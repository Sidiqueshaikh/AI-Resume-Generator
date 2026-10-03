import resume from "../models/resume.js"
import ai from "../configs/ai.js"
import { aiModel, requireAI, getAIContent, aiErrorMessage, parseAIJson } from "./aiController.js"

const MAX_TEXT = 20000


const resumeToText = (r) => {
    const p = r.personal_info || {}
    const projects = r.project?.length ? r.project : (r.projects || [])
    const lines = []

    lines.push(`Name: ${p.full_name || ""}`)
    lines.push(`Profession: ${p.profession || ""}`)
    lines.push(`Email: ${p.email || ""}`)
    lines.push(`Phone: ${p.phone || ""}`)
    lines.push(`Location: ${p.location || ""}`)
    lines.push(`LinkedIn: ${p.linkedin || ""}`)
    lines.push(`Website: ${p.website || ""}`)

    lines.push(`\nPROFESSIONAL SUMMARY\n${r.professional_summary || ""}`)

    lines.push(`\nEXPERIENCE`)
    ;(r.experience || []).forEach((e) => {
        lines.push(`${e.position || ""} at ${e.company || ""} (${e.start_date || ""} - ${e.is_current ? "Present" : e.end_date || ""})`)
        lines.push(e.description || "")
    })

    lines.push(`\nPROJECTS`)
    projects.forEach((pr) => {
        lines.push(`${pr.name || pr.project_name || ""} (${pr.type || ""})`)
        lines.push(pr.description || "")
    })

    lines.push(`\nEDUCATION`)
    ;(r.education || []).forEach((ed) => {
        lines.push(`${ed.degree || ""} ${ed.field || ed.field_of_study || ""}, ${ed.institution || ""} (${ed.graduation_date || ""}) ${ed.gpa ? "GPA " + ed.gpa : ""}`)
    })

    lines.push(`\nSKILLS\n${(r.skills || []).join(", ")}`)
    return lines.join("\n")
}

const clamp = (n) => Math.max(0, Math.min(100, Math.round(Number(n) || 0)))
const strArr = (a) => (Array.isArray(a) ? a.filter((x) => typeof x === "string" && x.trim()).slice(0, 10) : [])

const normalizeResult = (raw) => {
    const cs = raw.category_scores || {}
    const level = ["Low", "Moderate", "High", "Excellent"].includes(raw.industry_compatibility?.level)
        ? raw.industry_compatibility.level
        : "Moderate"

    return {
        score: clamp(raw.score),
        detected_role: String(raw.detected_role || ""),
        industry_compatibility: {
            level,
            summary: String(raw.industry_compatibility?.summary || ""),
        },
        category_scores: {
            keywords: clamp(cs.keywords),
            content_quality: clamp(cs.content_quality),
            structure: clamp(cs.structure),
            formatting: clamp(cs.formatting),
            completeness: clamp(cs.completeness),
        },
        strengths: strArr(raw.strengths),
        weaknesses: strArr(raw.weaknesses),
        missing_keywords: strArr(raw.missing_keywords),
        focus_areas: (Array.isArray(raw.focus_areas) ? raw.focus_areas : []).slice(0, 8).map((f) => ({
            priority: ["High", "Medium", "Low"].includes(f?.priority) ? f.priority : "Medium",
            title: String(f?.title || ""),
            action: String(f?.action || ""),
        })),
    }
}

const analyze = async (text, { targetRole, jobDescription }) => {
    const systemInstruction = `You are a strict, realistic ATS (Applicant Tracking System) analyst and senior recruiter.
Score resumes honestly; do NOT inflate scores. An average resume should land between 55 and 70.
Scoring rubric (weights): keywords & role relevance 30%, content quality & measurable impact 25%, structure & standard sections 20%, formatting/parsability 15%, completeness of contact details 10%.
Return ONLY valid JSON, no markdown.`

    const context = [
        targetRole ? `Target role: ${targetRole}` : "Target role: not provided. Infer the most likely role from the resume and evaluate against industry standards for it.",
        jobDescription ? `Job description to match against:\n${jobDescription}` : "",
    ].filter(Boolean).join("\n")

    const prompt = `${context}

Analyze this resume:
"""
${text}
"""

Return JSON in exactly this shape:
{
  "score": 0-100 (overall ATS score, integer),
  "detected_role": "role you evaluated against",
  "industry_compatibility": {
    "level": "Low" | "Moderate" | "High" | "Excellent",
    "summary": "2-3 sentences on how well this resume fits current industry expectations for this role"
  },
  "category_scores": {
    "keywords": 0-100,
    "content_quality": 0-100,
    "structure": 0-100,
    "formatting": 0-100,
    "completeness": 0-100
  },
  "strengths": ["up to 5 short points"],
  "weaknesses": ["up to 5 short points"],
  "missing_keywords": ["up to 10 important keywords/skills missing for the role"],
  "focus_areas": [
    { "priority": "High" | "Medium" | "Low", "title": "short title", "action": "specific, actionable fix" }
  ]
}
Provide 4-6 focus_areas ordered by priority.`

    const response = await ai.models.generateContent({
        model: aiModel,
        contents: prompt,
        config: {
            systemInstruction,
            responseMimeType: "application/json",
            temperature: 0.2,
        },
    })

    const content = getAIContent(response)
    if (!content) throw Object.assign(new Error("AI returned an empty response"), { status: 502 })
    return normalizeResult(parseAIJson(content))
}

const handleError = (res, error) => {
    if (error?.name === "CastError") return res.status(400).json({ message: "Invalid resume id" })
    if (error instanceof SyntaxError) return res.status(502).json({ message: "AI returned an unreadable response. Please try again." })
    return res.status(502).json({ message: aiErrorMessage(error) })
}

// POST /api/ats/check-saved/:resumeId   body: { targetRole?, jobDescription? }
export const checkSavedResume = async (req, res) => {
    try {
        const userId = req.userId
        const { resumeId } = req.params
        const { targetRole = "", jobDescription = "" } = req.body || {}
        if (!requireAI(res)) return

        const record = await resume.findOne({ userId, _id: resumeId }).lean()
        if (!record) return res.status(404).json({ message: "Resume not found" })

        const text = resumeToText(record).slice(0, MAX_TEXT)
        if (text.replace(/\s/g, "").length < 80) {
            return res.status(400).json({ message: "This resume has too little content to analyze. Fill in more sections first." })
        }

        const result = await analyze(text, {
            targetRole: targetRole.trim().slice(0, 100),
            jobDescription: jobDescription.trim().slice(0, 5000),
        })
        return res.status(200).json({ result })
    } catch (error) {
        return handleError(res, error)
    }
}

// POST /api/ats/check-text   body: { resumeText, targetRole?, jobDescription? }
export const checkResumeText = async (req, res) => {
    try {
        const { resumeText, targetRole = "", jobDescription = "" } = req.body || {}
        if (!resumeText?.trim()) {
            return res.status(400).json({ message: "Resume text is required" })
        }
        if (!requireAI(res)) return

        const result = await analyze(resumeText.trim().slice(0, MAX_TEXT), {
            targetRole: targetRole.trim().slice(0, 100),
            jobDescription: jobDescription.trim().slice(0, 5000),
        })
        return res.status(200).json({ result })
    } catch (error) {
        return handleError(res, error)
    }
}