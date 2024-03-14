import mongoose from "mongoose";
const Schema = mongoose.Schema;

const UserSchema = new Schema({
    id: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    fullname: {
        type: String,
        required: true,
    },
    image: String,
    bio: String,
    posts: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Post'
        }
    ],
    onboarded: {
        type: Boolean,
        default: false
    },
    communities: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Community'
        }
    ],
}, { timestamps: true })

const User = mongoose.models.User || mongoose.model('User', UserSchema);
export default User;