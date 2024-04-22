import slugify from 'slugify'

import Category from '../../../DB/Models/category.model.js'
import subCategory from '../../../DB/Models/sub-category.model.js'
import Brand from '../../../DB/Models/brand.model.js'
import cloudinaryConnection from '../../utils/cloudinary.js'
import generateUniqueString from '../../utils/generate-Unique-String.js'
import  { APIFeatures } from "../../utils/api-features.js"

// import mongoose from 'mongoose'

// const Brand = mongoose.models.Brand
//============================== add category ==============================//
export const addCategory = async (req, res, next) => {
    // 1- destructuring the request body
    const { name } = req.body
    const { _id } = req.authUser

    // 2- check if the category name is already exist
    const isNameDuplicated = await Category.findOne({ name })
    if (isNameDuplicated) {
        return next({ cause: 409, message: 'Category name is already exist' })
        // return next( new Error('Category name is already exist' , {cause:409}) )
    }

    // 3- generate the slug
    const slug = slugify(name, '-')

    // 4- upload image to cloudinary
    if (!req.file) return next({ cause: 400, message: 'Image is required' })

    const folderId = generateUniqueString(4)
    const { secure_url, public_id } = await cloudinaryConnection().uploader.upload(req.file.path, {
        folder: `${process.env.MAIN_FOLDER}/Categories/${folderId}`
    })
    // console.log(`category folder id:`, `${process.env.MAIN_FOLDER}/Categories/${folderId}`);
    req.folder = `${process.env.MAIN_FOLDER}/Categories/${folderId}`

    // 5- generate the categroy object
    const category = {
        name,
        slug,
        Image: { secure_url, public_id },
        folderId,
        addedBy: _id
    }
    // 6- create the category
    const categoryCreated = await Category.create(category)
    req.savedDocuments = { model: Category, _id: categoryCreated._id }


    // const x = 8
    // x = 7

    res.status(201).json({ success: true, message: 'Category created successfully', data: categoryCreated })
}


//================================ upadte category ================================//
export const updateCategory = async (req, res, next) => {
    // 1- destructuring the request body
    const { name, oldPublicId } = req.body
    // 2- destructuring the request params 
    const { categoryId } = req.params
    // 3- destructuring _id from the request authUser
    const { _id } = req.authUser

    // 4- check if the category is exist bu using categoryId
    const category = await Category.findById(categoryId)
    if (!category) return next({ cause: 404, message: 'Category not found' })

    // 5- check if the use want to update the name field
    if (name) {
        // 5.1 check if the new category name different from the old name
        if (name == category.name) {
            return next({ cause: 400, message: 'Please enter different category name from the existing one.' })
        }

        // 5.2 check if the new category name is already exist
        const isNameDuplicated = await Category.findOne({ name })
        if (isNameDuplicated) {
            return next({ cause: 409, message: 'Category name is already exist' })
        }

        // 5.3 update the category name and the category slug
        category.name = name
        category.slug = slugify(name, '-')
    }


    // 6- check if the user want to update the image
    if (oldPublicId) {
        if (!req.file) return next({ cause: 400, message: 'Image is required' })

        const newPulicId = oldPublicId.split(`${category.folderId}/`)[1]

        const { secure_url } = await cloudinaryConnection().uploader.upload(req.file.path, {
            folder: `${process.env.MAIN_FOLDER}/Categories/${category.folderId}`,
            public_id: newPulicId
        })

        category.Image.secure_url = secure_url
    }


    // 7- set value for the updatedBy field
    category.updatedBy = _id

    await category.save()
    res.status(200).json({ success: true, message: 'Category updated successfully', data: category })
}


//============================== get all categories ==============================//
export const getAllCategoriesWithBrand = async (req, res, next) => {
    // nested populate
    const categories = await Category.find().populate(
        [
            {
                path: 'subcategories',
                populate: [{
                    path: 'Brands'
                }]
            }
        ]
    )
    // console.log(categories);
    res.status(200).json({ success: true, message: 'Categories fetched successfully', data: categories })
}


//===================================== get all products API ===================================//
export const getAllCategories = async (req, res, next) => {
    const { page, size, sort, ...search } = req.query
    const features = new APIFeatures(req.query, Category.find())
        // .sort(sort)
        .pagination({ page, size }).populate(
            [
                {
                    path: 'subcategories',
                    populate: [{
                        path: 'Brands'
                    }]
                }
            ]
        )
        // .search(search)
        // .filters(search)

    // console.log(features.mongooseQuery);
    const categories = await features.mongooseQuery
    res.status(200).json({ success: true, data: categories })
}








//===================================== search Categories API ===================================//
export const searchAllCategories = async (req, res, next) => {
    const { page, size, sort, ...search } = req.query
    const features = new APIFeatures(req.query, Category.find())
        // .sort(sort)
        // .pagination({ page, size })
        .search(search)
        // .filters(search)

    // console.log(features.mongooseQuery);
    const categories = await features.mongooseQuery
    res.status(200).json({ success: true, data: categories })
}

//===================================== sort Categories API ===================================//
export const sortAllCategories = async (req, res, next) => {
    const { page, size, sort, ...search } = req.query
    const features = new APIFeatures(req.query, Category.find())
        .sort(sort)
        // .pagination({ page, size })
        // .search(search)
        // .filters(search)

    // console.log(features.mongooseQuery);
    const categories = await features.mongooseQuery
    res.status(200).json({ success: true, data: categories })
}

//===================================== filter Categories API ===================================//
export const filterAllCategories = async (req, res, next) => {
    const { page, size, sort, ...search } = req.query
    const features = new APIFeatures(req.query, Category.find())
        // .sort(sort)
        // .pagination({ page, size })
        // .search(search)
        .filters(search)

    // console.log(features.mongooseQuery);
    const categories = await features.mongooseQuery
    res.status(200).json({ success: true, data: categories })
}








export const getCategoryById = async (req, res) => {
    try {
        const { categoryId } = req.query
  
        const category = await Category.findOne({ categoryId });
  
        if (category) {
            res.json({ category });
        } else {
            res.status(404).json({ message: 'Category not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message, data: null });
    }
  };







  

export const allcategoriesCreatedByUser = async (req, res) => {
    try {
        const allcateg = await Category.find({createdBy: req.params.id}).populate("createdBy");
        res.json({message:"ok Done", allcateg})
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}


export const getCategoryByName = async (req, res) => {
  try {
      const categoryName = req.body.categoryName;

      const category = await Category.findOne({ categoryName });

      if (category) {
          res.json({ category });
      } else {
          res.status(404).json({ message: 'Category not found' });
      }
  } catch (error) {
      res.status(500).json({ message: error.message, data: null });
  }
};




//====================== delete category ======================//
export const deleteCategory = async (req, res, next) => {
    const { categoryId } = req.params

    // 1- delete category
    const catgory = await Category.findByIdAndDelete(categoryId)
    if (!catgory) return next({ cause: 404, message: 'Category not found' })

    // 2-delete the related subcategories
    const subCategories = await subCategory.deleteMany({ categoryId })
    if (subCategories.deletedCount <= 0) {
        console.log(subCategories.deletedCount);
        console.log('There is no related subcategories');
    }

    //3- delete the related brands
    const brands = await Brand.deleteMany({ categoryId })
    if (brands.deletedCount <= 0) {
        console.log(brands.deletedCount);
        console.log('There is no related brands');
    }


    // 4- delete the category folder from cloudinary
    await cloudinaryConnection().api.delete_resources_by_prefix(`${process.env.MAIN_FOLDER}/Categories/${catgory.folderId}`)
    await cloudinaryConnection().api.delete_folder(`${process.env.MAIN_FOLDER}/Categories/${catgory.folderId}`)

    res.status(200).json({ success: true, message: 'Category deleted successfully' })
}

