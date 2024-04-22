
import Review from '../../../DB/Models/review.model'
import { Router } from 'express'
import expressAsyncHandler from 'express-async-handler'
import * as reviewController from './review.controller'



const router = Router()





// @desc    Get list of reviews
// @route   GET /api/v1/reviews
// @access  Public
router.get('/getReviews',  expressAsyncHandler(reviewController.getAll))
// @desc    Get specific review by id
// @route   GET /api/v1/reviews/:id
// @access  Public
router.get('/getReview',expressAsyncHandler(reviewController.getOne))



// @desc    Create review
// @route   POST  /api/v1/reviews
// @access  Private/Protect/User
router.post('/createReview',expressAsyncHandler(reviewController.createOne))


// @desc    Update specific review
// @route   PUT /api/v1/reviews/:id
// @access  Private/Protect/User
router.put('/update', expressAsyncHandler(reviewController.updateOne))
// @desc    Delete specific review
// @route   DELETE /api/v1/reviews/:id
// @access  Private/Protect/User-Admin-Manager
router.delete('/deleteReview', expressAsyncHandler(reviewController.deleteOne))





export default router