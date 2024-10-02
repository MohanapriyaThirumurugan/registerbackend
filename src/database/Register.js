import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    phone: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    resetToken: {   // New field for the reset token
        type: String,
        default: null // Default value can be null
    },
    resetTokenExpiry: { // New field for the reset token expiration time
        type: Date,
        default: null // Default value can be null
    }
});

// Create a model from the schema
const userdetails = mongoose.model('userdetails', userSchema);
export default userdetails;
