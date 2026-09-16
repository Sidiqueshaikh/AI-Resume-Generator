import imageKit from "../configs/imageKit.js";
import resume from "../models/resume.js"
import fs from "fs"

const normalizeProjects = (projects = []) => projects.map((project) => ({
    ...project,
    name: project.name ?? project.project_name ?? "",
}))


//contoller for creating a new resume
//POST: /api/resumes/create

export const createResume = async (req, res) => {
    try{
        const userId = req.userId;
        const title = req.body.title?.trim();

        if (!title) {
            return res.status(400).json({ message: 'Resume title is required' });
        }

        //create new resume
        const newResume = await resume.create({userId,title})
        //return success message
        return res.status(201).json({message:'Resume created successfully',resume:newResume})

    }catch (error) {
        return res.status(400).json({ message: error.message });
    }
}

//controller for deleting a resume
//DELETE: /api/resumes/delete
export const deleteResume = async (req, res) => {
    try{
        const userId = req.userId;
        const {resumeId} = req.params;

        await resume.findByIdAndDelete({userId,_id:resumeId})

        //return success message
        return res.status(200).json({message:'Resume deleted successfully'})
    }catch (error) {
        return res.status(400).json({ message: error.message });
    }
}

//get user resume by id
//GET:/api/resumes/get
export const getResumeById = async (req, res) => {
    try{
        const userId = req.userId;
        const {resumeId} = req.params;
        const resumeRecord = await resume.findOne({userId,_id:resumeId}).lean()

        if(!resumeRecord){
            return res.status(404).json({message:'Resume not found'})
        }

        delete resumeRecord.__v;
        delete resumeRecord.createdAt;
        delete resumeRecord.updatedAt;
        // Older records used `projects`; the frontend uses `project`.
        resumeRecord.project = normalizeProjects(resumeRecord.project ?? resumeRecord.projects);
        // Older records may contain the misspelled schema field.
        resumeRecord.accent_color ??= resumeRecord.assest_color;
        return res.status(200).json({resume: resumeRecord})
    }catch (error) {
        return res.status(400).json({ message: error.message });
    }
}


//get resume by user id public
//GET: /api/resumes/public

export const getPublicResumeById = async (req, res) => {
    try{
        const {resumeId} = req.params;
        const resumeRecord = await resume.findOne({public:true,_id:resumeId}).lean()

        if(!resumeRecord){
            return res.status(404).json({message:'Resume not found'})
        }

        resumeRecord.project = normalizeProjects(resumeRecord.project ?? resumeRecord.projects);
        resumeRecord.accent_color ??= resumeRecord.assest_color;
        return res.status(200).json({resume: resumeRecord})
    }catch (error) {
        return res.status(400).json({ message: error.message });
    }
}

//controller for updating a resume
//PUT: /api/resumes/update
export const updateResume = async (req, res) => {
    try{
        const userId = req.userId;
        const {resumeId,resumeData,removeBackground} = req.body;
        const image =req.file

        let resumeDataCopy;
        if(typeof resumeData === 'string'){

            resumeDataCopy = await JSON.parse(resumeData)
        }
        else{
            resumeDataCopy = structuredClone(resumeData)
        }
        if(image){

            const imageBufferData = fs.createReadStream(image.path);
            let response;
            try {
                response = await imageKit.files.upload({
                        file: imageBufferData,
                        fileName: `${userId}-${Date.now()}.jpg`,
                        folder: 'user-resumes',
                        useUniqueFileName: true,
                        transformation:{
                            pre:'w-300,h-300,fo-face,z-0.75' + (removeBackground ? ',e-bgremove' : '')
                        }
                    });
            } finally {
                await fs.promises.unlink(image.path).catch(() => undefined);
            }

            if (!response?.url) {
                return res.status(502).json({message:'Image upload did not return a usable URL'});
            }
            resumeDataCopy.personal_info ??= {};
            resumeDataCopy.personal_info.image = response.url;
        }

        if (resumeDataCopy.title !== undefined) {
            resumeDataCopy.title = String(resumeDataCopy.title).trim();
            if (!resumeDataCopy.title) {
                return res.status(400).json({ message: 'Resume title is required' });
            }
        }

        if (resumeDataCopy.project && !resumeDataCopy.projects) {
            resumeDataCopy.projects = resumeDataCopy.project;
        }
        if (resumeDataCopy.accent_color && !resumeDataCopy.assest_color) {
            resumeDataCopy.assest_color = resumeDataCopy.accent_color;
        }

const updatedResume = await resume.findOneAndUpdate(
    { userId, _id: resumeId },
    resumeDataCopy,
    {
        returnDocument: "after",
        runValidators: true
    }
)

        if (!updatedResume) {
            return res.status(404).json({message:'Resume not found'})
        }

        return res.status(200).json({message:'Saved Successfully',resume: updatedResume})
    }catch (error) {
        return res.status(400).json({ message: error.message });
    }
}
