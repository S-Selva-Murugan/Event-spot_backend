const { validationResult } = require("express-validator")
const CategoryModel = require("../models/category-model")
const _ = require("lodash")

const categoryCltr = {}

categoryCltr.create = async(req,res)=>{
    const errors = validationResult(req)
    if(!errors.isEmpty()){
        return res.status(400).json({error:errors.array()})
    }else{
        const body = _.pick(req.body,["name"])
        try{
            const cat = new CategoryModel(body)
            await cat.save()
            res.status(201).json(cat)
        }catch(err){
            console.log(err)
            res.status(500).json(err)

        }
    }
}

categoryCltr.getAll = async(req,res)=>{
    try{
        const cat =await CategoryModel.find()
        res.status(200).json(cat)
    }catch(err){
        res.status(500).json(err)

    }
}

categoryCltr.getOne = async(req,res)=>{
    const categoryId = req.params.categoryId
    try{
        const cat =await CategoryModel.findById(categoryId)
        res.status(200).json(cat)
    }catch(err){
        res.status(500).json(err)

    }
}


categoryCltr.update = async(req,res)=>{
    const categoryId = req.params.categoryId
    const errors = validationResult(req)
    if(!errors.isEmpty()){
        res.status(400).json({error:errors.array()})

    }else{
        const body = _.pick(req.body,["name"])
        try{
            const cat = await CategoryModel.findByIdAndUpdate({_id:categoryId},body,{new:true})
            res.status(201).json(cat)

        }catch(err){
            console.log(err)
            res.status(500).json(err)
        }

    }
}


categoryCltr.delete=async(req,res)=>{
    const categoryId = req.params.categoryId
    // console.log(categoryId)

    try{
        const cat  = await  CategoryModel.findByIdAndDelete({_id:categoryId})
        //check findByIDAndUpdate or One
        res.status(200).json(cat)

    }catch(err){
        console.log(err)
        res.status(500).json(err)

    }
}

module.exports = categoryCltr
