import { Router } from 'express'
import expressAsyncHandler from 'express-async-handler'
import User from "../../../DB/Models/user.model.js"



import * as userController from './user.controller.js'
import { auth } from '../../middlewares/auth.middleware.js'
import { multerMiddleHost } from '../../middlewares/multer.js'
import { allowedExtensions } from '../../utils/allowed-extensions.js'
import { endPointsRoles } from './user.endpoints.js'
import { systemRoles } from '../../utils/system-roles.js'

const router = Router()



router.get('/',
    auth(systemRoles.USER),
    expressAsyncHandler(userController.getUserData)
)

router.delete('/',
    auth(endPointsRoles.USER),
    expressAsyncHandler(userController.deleteUserData)
)
router.put('/update',
    auth(endPointsRoles.USER),
    expressAsyncHandler(userController.updateUserData)
)



router.get('/allusers', userController.getAllUser)


router.get('/sort', userController.sortedUsers)


router.get('/user/:id', userController.getUserById)


router.post('/forgetpass', userController.forgetPassword)


router.post('/verifyCode', userController.verifyCode)


router.post('/resetPassword', userController.resetPassword)

//delete using params
router.delete("/user/:id", userController.deleteUser)


// Endpoint to get user profile
// router.get('/user/profile', userController.verification ,userController.getProfile );


router.get("/user/profile", async (req, res) => {
    try {
      const { _id } = req.body; // Assuming you have the user ID available in the request body
      const user = await User.findById(_id);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user profile:", error);
      res.status(500).json({ message: "Failed to fetch user profile" });
    }
  });

export default router