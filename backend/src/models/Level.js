import mongoose from "mongoose";

const levelsSchema = new mongoose.Schema({
    _id: { 
        type: String, 
        required: true,
        unique: true
    },
    name: {
        type: String,
        required: true
    },
    monthlyQuota: { 
        type: Number, 
        required: true 
    }, 
});

const Levels = mongoose.model("Levels", levelsSchema);
export default Levels;
