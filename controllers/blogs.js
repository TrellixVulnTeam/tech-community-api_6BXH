const {validationResult, Result} = require('express-validator');
const blogMedel = require('../models/blog');
// const mongodb = require('mongodb');
// const mongoose = require('mongoose');
// const { ObjectID } = require('bson');
// const ObjectId = require('mongodb').ObjectID;

exports.createBlog= async (req,res,next)=>{
const title = req.body.title;
const description = req.body.description;
const imageUrl = req.body.image

const validationError =   validationResult(req)
if(!validationError.isEmpty()){
res.status(402).json({message:'validationError',
validationMessage:validationError})
return next()
}

//here we check if there is a blog with the same title 
//you provided and if we find one immediatlly we block the process
//beacause two blogs can't have similar title
try {
    const findBlog = await blogMedel.find({title:title})
    if(findBlog.length > 0){
        res.status(402).json({message:'A blog with this title already exist please pick another title'});
        return next()
    }
} catch (error) {
    res.status(502).json({message:'something went went with our sever please come back later',error:error});
}


const newModel = new blogMedel({
title:title,
description:description,
BlogImage:imageUrl
})

try {
const save = await newModel.save()
res.status(202).json({message:'postCreated',data:save}); 
} catch (error) {
    console.log(error);
   res.status(502).json({message:'faild to save the blog please come back later'})
   return next();
}
}


//get blogs with pagination 
exports.getBlogs = async (req,res,next)=>{ 
const page = req.query;
const elementParPage = 10


try {
    const documentNumber = await blogMedel.find().countDocuments();
    const fetchDocument =await blogMedel.find().skip((page.page - 1)* elementParPage).limit(elementParPage)
    res.status(200)
    .json({message:'data fetched successfully',
     data:fetchDocument,
     totalDocument:documentNumber,
     totalPage:Math.ceil(documentNumber / elementParPage ),
     ElementLenght:fetchDocument.length
    })
} catch (error) {
    console.log(error)
    res.status({message:'something went wrong please come back later !'})
}
}

//load a single post
exports.getSingleBlog =async (req,res,next)=>{
const blogId = req.params.id;

try {
    const blog = await  blogMedel.findById(blogId);
    console.log(blog);
    res.status(200).json({message:blog ? 'blogFecthed' : 'the folllowing data is not avalaible it may be deleted ' ,data:blog})
} catch (error) {
    console.log(error)
    res.status(404).json({message:"the following blog can't be loaded please try again "})
}
}


/*This controoller load the blog what the user choose to 
update , the following data can be used on the update page 
to prevew the blog that the user want to update .
/in order to load the blog you should provide the blog id in the url as a parameter , this is how the url should like
https://localhost:8080/blog/getUpdate/62911e62230727164d1f99c7 
the last part of the url is the blog id , and you may see local host but 
in production the local host will will not bet there and the port may be different.
Reading the docuemntation of more details 
*/
exports.getupdate = async (req,res,next)=>{

  const id = req.params.id;

  try {
    const blog = await blogMedel.findById(id)
    res.status(200).json({message:'post loaded',data:blog})
  } catch (error) {
    console.log(error)
    res.status(404).json({message:'impossible to load this blog make sure that you have the right access'})
  }
}




//the following controller consist of
//updating the targeted blog .
//the person who try to update should be the person who
//created the blog .

exports.postEditBlog = async (req,res,next)=>{
const blogId = req.body.id;
const title = req.body.title;
const descriptions = req.body.description;
const imageUrl = req.body.imageUrl;
console.log(imageUrl);
let image;

try {
    const blog = await blogMedel.findById(blogId)
    if(!imageUrl){
     image = blog.BlogImage;
    }else
    {
      image = imageUrl;

    }
    
    blog.title = title;
    blog.description =  descriptions;
    blog.imageUrl = image;
    console.log(blog);

    const save = await blog.save()
    res.json({message:'bog updated',data:save})

} catch (error) {
    console.log(error)
    res.status(404).json({message:'something went wrong ! Make sure that you provided the right id or you are the owner of this blogs',error:error})
}
}


