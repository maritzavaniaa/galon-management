import mongoose from "mongoose";

const levelSchema = new mongoose.Schema({
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

const Level = mongoose.model("Level", levelSchema);
export default Level;
