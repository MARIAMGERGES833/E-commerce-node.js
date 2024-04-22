
import { Router } from "express";
const router = Router();
import * as subCategoryController from './subCategory.controller.js'
import expressAsyncHandler from "express-async-handler";
import { multerMiddleHost } from "../../middlewares/multer.js";
import { endPointsRoles } from "../Category/category.endpoints.js";
import { auth } from "../../middlewares/auth.middleware.js";
import { allowedExtensions } from "../../utils/allowed-extensions.js";


router.post('/:categoryId',
    auth(endPointsRoles.ADD_CATEGORY),
    multerMiddleHost({
        extensions: allowedExtensions.image
    }).single('image'),
    expressAsyncHandler(subCategoryController.addSubCategory))


    router.put('/:categoryId',
    auth(endPointsRoles.ADD_CATEGORY),
    multerMiddleHost({
        extensions: allowedExtensions.image
    }).single('image'),
    expressAsyncHandler(subCategoryController.updateSubCategory))


    router.delete('/',
    auth(endPointsRoles.ADD_CATEGORY),
    multerMiddleHost({
        extensions: allowedExtensions.image
    }).single('image'),
    expressAsyncHandler(subCategoryController.updateSubCategory))


    router.get('/',
    auth(endPointsRoles.ADD_BRAND),
    expressAsyncHandler(subCategoryController.getAllSubcategories))


    
    router.get('/sort',
    auth(endPointsRoles.ADD_BRAND),
    expressAsyncHandler(subCategoryController.sortAllSubcategories))



    
    router.get('/filter',
    auth(endPointsRoles.ADD_BRAND),
    expressAsyncHandler(subCategoryController.filterAllSubcategories))



    
    router.get('/search',
    auth(endPointsRoles.ADD_BRAND),
    expressAsyncHandler(subCategoryController.searchAllSubcategories))




    router.get('/allByBrands',
    auth(endPointsRoles.ADD_BRAND),
    expressAsyncHandler(subCategoryController.getAllSubcategoriesByBrands))


    router.get('/',
    auth(endPointsRoles.ADD_BRAND),
    expressAsyncHandler(subCategoryController.getSubCategoryById))


    


export default router;