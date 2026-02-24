import Post from "../models/post.model.js";
import User from "../models/user.model.js";
import { errorHandler } from "../utils/error.js";
import { notifySearchEngines } from "../utils/searchEngine.js";

export const create = async (req, res, next) => {
  // All authenticated users can create posts
  if (!req.body.title || !req.body.content) {
    return next(errorHandler(400, "Please provide all required fields"));
  }
  const slug = req.body.title
    .split( ' ' )
    .join( '-' )
    .toLowerCase()
    .replace(/[^a-zA-Z0-9-]/g, '');
  const newPost = new Post({
    ...req.body,
    slug,
    userId: req.user.id,
  });
  try {
    const savedPost = await newPost.save();

    // Notify search engines about the new post
    const siteUrl = process.env.SITE_URL || 'https://dailybloggs.com';
    notifySearchEngines(siteUrl).catch(err =>
      console.error('Failed to notify search engines:', err)
    );

    res.status(201).json(savedPost);
  } catch (error) {
    next(error);
  }
};

export const getposts = async (req,res,next) => {
  try {
    const startIndex = parseInt(req.query.startIndex) || 0;
    const limit = parseInt(req.query.limit) || 9;
    const sortDirection = req.query.order === 'asc' ? 1:-1;
    const posts = await Post.find({
      ...(req.query.userId && {userId: req.query.userId}),
      ...(req.query.category && {category: req.query.category}),
      ...(req.query.slug && {slug: req.query.slug}),
      ...(req.query.postId && {_id: req.query.postId}),
      ...(req.query.searchTerm && {
        $or: [
          {title: { $regex: req.query.searchTerm, $options: 'i' } },
          {content: { $regex: req.query.searchTerm, $options: 'i' } },
        ]
      }),
  }).sort({updatedAt: sortDirection}).skip(startIndex).limit(limit);

  // Fetch author info for each post
  const postsWithAuthor = await Promise.all(
    posts.map(async (post) => {
      const author = await User.findById(post.userId).select('username profilePicture');
      return {
        ...post._doc,
        author: author ? {
          username: author.username,
          profilePicture: author.profilePicture,
        } : null,
      };
    })
  );

  const totalPosts = await Post.countDocuments();
  const now = new Date();
  const oneMonthAgo = new Date(
    now.getFullYear(),
    now.getMonth() - 1,
    now.getDate()
  );
  const lastMonthPosts = await Post.countDocuments({
    createdAt: { $gte: oneMonthAgo},
  });

  res.status(200).json({
    posts: postsWithAuthor,
    totalPosts,
    lastMonthPosts,
  });

  } catch (error) {
    next(error);
  }
};

export const deletepost = async (req,res,next) =>{
   // Super admin can delete any post, regular users can only delete their own posts
   if(!req.user.isAdmin && req.user.id !== req.params.userId){
    return next(errorHandler(403, 'You can only delete your own posts'));
   }
   try {
    await Post.findByIdAndDelete(req.params.postId);
    res.status(200).json({message: 'Post deleted successfully'});
   } catch (error) {
     next(error);
   }
};

export const updatepost = async (req, res, next) =>{
  // Super admin can update any post, regular users can only update their own posts
  if(!req.user.isAdmin && req.user.id !== req.params.userId){
    return next(errorHandler(403, 'You can only update your own posts'));
    }
    try {
      const updatedPost =  await Post.findByIdAndUpdate(
        req.params.postId,
        { $set: {
           title:req.body.title,
           content: req.body.content,
           category: req.body.category,
           image:req.body.image,
         }},{new:true}
      )

      // Notify search engines about the updated post
      const siteUrl = process.env.SITE_URL || 'https://dailybloggs.com';
      notifySearchEngines(siteUrl).catch(err =>
        console.error('Failed to notify search engines:', err)
      );

      res.status(200).json({message: 'Post updated successfully', updatedPost});
    } catch (error) {
      next(error);
    }
}

export const likePost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.postId);
    if (!post) {
      return next(errorHandler(404, 'Post not found'));
    }
    const userIndex = post.likes.indexOf(req.user.id);
    if (userIndex === -1) {
      post.numberOfLikes += 1;
      post.likes.push(req.user.id);
    } else {
      post.numberOfLikes -= 1;
      post.likes.splice(userIndex, 1);
    }
    await post.save();
    res.status(200).json(post);
  } catch (error) {
    next(error);
  }
};
