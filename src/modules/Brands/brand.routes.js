import { Router } from 'express'
import expressAsyncHandler from 'express-async-handler'

import * as brandController from './brand.controller.js'
import { multerMiddleHost } from '../../middlewares/multer.js'
import { allowedExtensions } from '../../utils/allowed-extensions.js'
import { endPointsRoles } from './brand.endpoints.js'
import { auth } from '../../middlewares/auth.middleware.js'
const router = Router()





router.post('/',
    auth(endPointsRoles.ADD_BRAND),
    multerMiddleHost({
        extensions: allowedExtensions.image
    }).single('image'),
    expressAsyncHandler(brandController.addBrand))



    router.put('/update',
    auth(endPointsRoles.ADD_BRAND),
    multerMiddleHost({
        extensions: allowedExtensions.image
    }).single('image'),
    expressAsyncHandler(brandController.updateBrand))


    router.delete('/delete',
    auth(endPointsRoles.ADD_BRAND),
    expressAsyncHandler(brandController.deleteBrand))


    router.get('/',
    auth(endPointsRoles.ADD_BRAND),
    expressAsyncHandler(brandController.getAllbrands))




export default router
