import { Schema, model } from 'mongoose'

const UserSchema = new Schema({
    name: {
        type: String,
        required: [true, "enter name"]
    },
    email: {
        type: String,
        required: [true, "emailrequired"],
        trim: true,
        lowercase: true,
        unique: [true, "email already exist"]
    },
    password: {
        type: String,
        required: [true, "password required"]
    },
    isVerified: {
        type: Boolean,
        default: false,
    },
    verificationCode: {
        type: String,
    },
    verificationCodeExpires: {
        type: Date,
    },
})
export const UserModel = model("UserModel", UserSchema);
