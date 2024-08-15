import mongoose from "mongoose";

const postSchema = new mongoose.Schema(
    {
    userId:{
        type:String,
        required:true,
    },
    content:{
        type:String,
        required:true,
    },
    title: {
        type: String,
        required: true,
        unique: true,
    },
    image: {
        type:String,
        default: 'https://cdn.websites.hibu.com/97df2096307b4f18a0f85bf1ed3dceb8/dms3rep/multi/blog-c341ba1a.png',
    },
    category: {
        type: String,
        default: 'uncategorized',
    },
    slug: {
        type: String,
        required: true,
        unique: true,
    },
},{ timestamps: true }
);

const  Post = mongoose.model('Post', postSchema);

export default Post;