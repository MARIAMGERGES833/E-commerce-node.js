
import mongoose, { Schema, model } from "mongoose";
import { systemRoles } from "../../src/utils/system-roles.js";
import pkg from 'bcrypt'

const userSchema = new Schema({
    username: {
        type: String,
        required: true,
        minlength: 3,
        maxlength: 20,
        tirm: true,
        lowercase: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        tirm: true,
        lowercase: true
    },
    password: {
        type: String,
        required: true,
        minlength: 8,
    },
    phoneNumbers: [{
        type: String,
        required: true,
    }],
    addresses: [{
        type: String,
        required: true
    }],
    role: {
        type: String,
        enum: [systemRoles.USER, systemRoles.ADMIN, systemRoles.SUPER_ADMIN],
        default: systemRoles.USER
    },
    isEmailVerified: {
        type: Boolean,
        default: false
    },
    age: {
        type: Number,
        min: 18,
        max: 100
    },
    isLoggedIn: {
        type: Boolean,
        default: false
    }
}, { timestamps: true })




// userSchema.pre('save' , function(next , hash){
// this.password = pkg.hashSync(this.password , +process.env.SALT_ROUNDS)
// next()
// })

export default mongoose.models.User || model('User', userSchema)