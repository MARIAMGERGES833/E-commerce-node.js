
import SubCategory from "../../../DB/Models/sub-category.model.js"
import Category from '../../../DB/Models/category.model.js'
import Brand from '../../../DB/Models/brand.model.js'

import generateUniqueString from "../../utils/generate-Unique-String.js"
import cloudinaryConnection from "../../utils/cloudinary.js"
import slugify from "slugify"
import  { APIFeatures } from "../../utils/api-features.js"




//============================== add SubCategory ==============================//
export const addSubCategory = async (req, res, next) => {
    // 1- destructuring the request body
    const { name } = req.body
    const { categoryId } = req.params
    const { _id } = req.authUser

    // 2- check if the subcategory name is already exist
    const isNameDuplicated = await SubCategory.findOne({ name })
    if (isNameDuplicated) {
        return next({ cause: 409, message: 'SubCategory name is already exist' })
        // return next( new Error('Category name is already exist' , {cause:409}) )
    }

    // 3- check if the category is exist by using categoryId
    const category = await Category.findById(categoryId)
    if (!category) return next({ cause: 404, message: 'Category not found' })

    // 4- generate the slug
    const slug = slugify(name, '-')

    // 5- upload image to cloudinary
    if (!req.file) return next({ cause: 400, message: 'Image is required' })

    const folderId = generateUniqueString(4)
    const { secure_url, public_id } = await cloudinaryConnection().uploader.upload(req.file.path, {
        folder: `${process.env.MAIN_FOLDER}/Categories/${category.folderId}/SubCategories/${folderId}`
    })


    // 6- generate the subCategory object
    const subCategory = {
        name,
        slug,
        Image: { secure_url, public_id },
        folderId,
        addedBy: _id,
        categoryId
    }
    // 7- create the subCategory
    const subCategoryCreated = await SubCategory.create(subCategory)
    res.status(201).json({ success: true, message: 'subCategory created successfully', data: subCategoryCreated })
}








//============================== update SubCategory ==============================//
export const updateSubCategory = async (req, res, next) => {
    const { categoryId } = req.params
    const { _id } = req.query     //=========id subcategory
    let { name,  oldPublicId ,  addedBy } = req.body

  // check if the category is exist by using categoryId
  const SubCategory = await SubCategory.findById(_id)
  if (!SubCategory) return next({ cause: 404, message: 'Category not found' })

  // 3- check if the category is exist by using categoryId
  const category = await Category.findById(categoryId)
  if (!category) return next({ cause: 404, message: 'Category not found' })

    let finalUserData = {}

    // 2- check if the subcategory name is already exist
    const isNameDuplicated = await SubCategory.findOne({ name })
    if (isNameDuplicated) {
        return next({ cause: 409, message: 'SubCategory name is already exist' })
    }

    if(name)finalUserData.name = name
    const slug = slugify(name, '-')
    if(slug)finalUserData.slug = slug
    if(addedBy)finalUserData.addedBy = addedBy

//=================replace image and check if the user want to update the image
    if (oldPublicId) {
        if (!req.file) return next({ cause: 400, message: 'Image is required' })

        const newPulicId = oldPublicId.split(`${folderId}/`)[1]

        const { secure_url } = await cloudinaryConnection().uploader.upload(req.file.path, {
            folder: `${process.env.MAIN_FOLDER}/Categories/${category.folderId}/SubCategories/${folderId}`,
            public_id: newPulicId
        })

        finalUserData.Image.secure_url = secure_url
    }

    finalUserData.updatedBy = _id

  const subCategoryUpdated = await SubCategory.findOneAndUpdate({_id:_id},finalUserData ,{new:true})
  res.status(201).json({ success: true, message: 'subCategory updated successfully', data: subCategoryUpdated })


}



//====================== delete SubCategory ======================//
export const deleteSubCategory = async (req, res, next) => {
    const { subCategoryId } = req.params
   

    // 1- delete category
    const SubCategory = await SubCategory.findByIdAndDelete(subCategoryId)
    if (!SubCategory) return next({ cause: 404, message: 'SubCategory not found' })

    // 2-delete the related subcategories
    const subCategories = await SubCategory.deleteMany({ subCategoryId })
    if (subCategories.deletedCount <= 0) {
        console.log(subCategories.deletedCount);
        console.log('There is no related subcategories');
    }

    //3- delete the related brands
    const brands = await Brand.deleteMany({ subCategoryId })
    if (brands.deletedCount <= 0) {
        console.log(brands.deletedCount);
        console.log('There is no related brands');
    }


    // 4- delete the SubCategory folder from cloudinary
    await cloudinaryConnection().api.delete_resources_by_prefix(`${process.env.MAIN_FOLDER}/Categories/${category.folderId}/SubCategories/${folderId}`)
    await cloudinaryConnection().api.delete_folder(`${process.env.MAIN_FOLDER}/Categories/${category.folderId}/SubCategories/${folderId}`)

    res.status(200).json({ success: true, message: 'SubCategory deleted successfully' })
}




//============================== get all SubCategory ==============================//
export const getAllSubcategoriesByBrands = async (req, res, next) => {
   
    const SubCategory = await SubCategory.find().populate(
        [
            {
                path: 'Brands'
            }
        ]
    )
   
    res.status(200).json({ success: true, message: 'SubCategory fetched successfully', data: SubCategory })
}


export const getAllSubcategories = async (req, res, next) => {
    const { page, size, sort, ...search } = req.query
    const features = new APIFeatures(req.query, SubCategory.find())
        // .sort(sort)
        .pagination({ page, size }).populate(
            [
                {
                    path: 'Brands'
                }
            ]
        )
        // .search(search)
        // .filters(search)

    // console.log(features.mongooseQuery);
    const SubCategory = await features.mongooseQuery
    res.status(200).json({ success: true, data: SubCategory })
}




//===================================== search Subcategories API ===================================//
export const searchAllSubcategories = async (req, res, next) => {
    const { page, size, sort, ...search } = req.query
    const features = new APIFeatures(req.query, SubCategory.find())
        // .sort(sort)
        // .pagination({ page, size })
        .search(search)
        // .filters(search)

    // console.log(features.mongooseQuery);
    const SubCategory = await features.mongooseQuery
    res.status(200).json({ success: true, data: SubCategory })
}

//===================================== sort Subcategories API ===================================//
export const sortAllSubcategories = async (req, res, next) => {
    const { page, size, sort, ...search } = req.query
    const features = new APIFeatures(req.query, SubCategory.find())
        .sort(sort)
        // .pagination({ page, size })
        // .search(search)
        // .filters(search)

    // console.log(features.mongooseQuery);
    const SubCategory = await features.mongooseQuery
    res.status(200).json({ success: true, data: SubCategory })
}

//===================================== filter Subcategories API ===================================//
export const filterAllSubcategories = async (req, res, next) => {
    const { page, size, sort, ...search } = req.query
    const features = new APIFeatures(req.query, SubCategory.find())
        // .sort(sort)
        // .pagination({ page, size })
        // .search(search)
        .filters(search)

    // console.log(features.mongooseQuery);
    const SubCategory = await features.mongooseQuery
    res.status(200).json({ success: true, data: SubCategory })
}




export const getSubCategoryById = async (req, res) => {
    try {
        const { subCategoryId } = req.query
  
        const SubCategory = await SubCategory.findOne({ subCategoryId });
  
        if (SubCategory) {
            res.json({ SubCategory });
        } else {
            res.status(404).json({ message: 'SubCategory not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message, data: null });
    }
  };

