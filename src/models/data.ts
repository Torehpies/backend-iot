import { Schema, model } from 'mongoose';

const dataSchema = new Schema({
    mq135: {
        type: String, // Keep as string type
        required: true
    },
    airQuality: {
        type: String,
        required: true
    },
    humidity: {
        type: String, // Keep as string type
        required: false
    },
    temperature: {
        type: String, // Keep as string type
        required: true
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
});

export default model('Data', dataSchema);