import mongoose from "mongoose";
const connectDB = async () => {
    try {
        mongoose.connection.on("connected",()=>{console.log("MongoDB connected")})

        let mongodbURI = process.env.MONGODB_URI;
        const projectName='resume-builder';
        if(!mongodbURI) {
            throw new Error(`MongoDB URI is not defined in the environment variables. Please set MONGODB_URI in your .env file.`)
        }


        if(mongodbURI.endsWith("/")) {
            mongodbURI = mongodbURI.slice(0, -1)
        }

await mongoose.connect(mongodbURI, {
  dbName: "resume-builder",
});
    }catch (error) {
        console.error("Error connecting to MongoDB:", error)
    }
}

export default connectDB