import slugify from "slugify"

import Brand from "../../../DB/Models/brand.model.js"
import User from "../../../DB/Models/user.model.js"
import Product from "../../../DB/Models/product.model.js"
import { systemRoles } from "../../utils/system-roles.js"
import cloudinaryConnection from "../../utils/cloudinary.js"
import generateUniqueString from "../../utils/generate-Unique-String.js"
import randomstring from "randomstring";
import { DateTime } from "luxon";

//==============================get user data==========================
export const getUserData = async (req, res, next) => {
    const { _id } = req.authUser

    const user = await User.findById(_id)
    if (!user) {
        return next(new Error('user not founded', { cause: 404 }))
    }
    res.status(200).json({ success: true, message: 'search successfully', data: user })

}



//=========================delete user=========================

export const deleteUserData = async (req, res, next) => {
    const { _id } = req.authUser

const userDel = await User.findByIdAndDelete(_id)
if (!userDel) return next({ cause: 404, message: 'user not found' })


res.status(200).json({ success: true, message: 'deleted successfully'})
}



//======================================update user data
export const updateUserData = async (req, res, next) => {
    const { _id } = req.authUser
    const { username , email ,password , phoneNumbers , addresses , age } = req.body

    const userCheck = await User.findById(_id)
    if (!userCheck) {
        return next(new Error('user not founded', { cause: 404 }))
    }

		let finalUserData = {}
		if(username){
			finalUserData.username = username
		}
		if(email){
			const isEmailExists = await User.findOne({ email })
			if (isEmailExists) return next(new Error('Email is already exists', { cause: 409 }))
			if (!isEmailExists)finalUserData.email = email
		}
		if(addresses)finalUserData.addresses = addresses
		if(age)finalUserData.age = age
		if(phoneNumbers){
			const isphoneNumbersExists = await User.findOne({ phoneNumbers })
			if (isphoneNumbersExists) return next(new Error('phoneNumbers is already exists', { cause: 409 }))
			if (!isphoneNumbersExists)finalUserData.phoneNumbers = phoneNumbers
		}
        const hashedPassword = bcrypt.hashSync(password, +process.env.SALT_ROUNDS)
        if(password)finalUserData.password = hashedPassword
		
		// console.log(finalUserData)
		const user = await User.findOneAndUpdate({_id:_id},finalUserData ,{new:true})
		return res.status(200).json({message:"done!"} ,user)
	}






	export const getAllUser = async (req, res) => {
		try {
		  const users = await User.find();
		  res.json({ message: "ok Done", users });
		} catch (error) {
		  console.error(error);
		  res.status(500).json({ error: "Internal Server Error" });
		}
	  };






	  

export const sortedUsers = async (req, res) => {
	let foundeduser = await User.find().sort({ userName: 1 });
  
	if (foundeduser) {
	  res.json({ message: "User Sorted", foundeduser });
	} else {
	  res.json({ message: "user not found" });
	}
  };



  
  export const getUserById = async (req, res) => {
	try {
		const userId = req.params.id;
  
		const user = await User.findById(userId);
  
		if (user) {
			res.json({ user });
		} else {
			res.json({ message: 'user not found' });
		}
	} catch (error) {
		res.json({ message: error.message, data: null });
	}
  };
  

  export const securePassword = async (password) => {
	const saltRounds = process.env.SALT_ROUNDS;
  
	try {
	  const hashedPassword = await bcrypt.hash(password, saltRounds);
	  return hashedPassword;
	} catch (error) {
	  throw new Error(`Error hashing password: ${error.message}`);
	}
  };
  
  
  export const forgetPassword = async (req, res) => {
	try {
	  const { email } = req.body;
	  const foundUser = await User.findOne({ email });
  
	  if (foundUser) {
		const randomCode = randomstring.generate();
		const expirationTime = new Date();
		expirationTime.setMinutes(expirationTime.getMinutes() + 15);
  
		const updatedDate = await User.updateOne(
		  { email },
		  { $set: { resetCode: randomCode, resetCodeExpiration: expirationTime } }
		);
  
		// Send the random code to the user via email
		sendResetPasswordMail(foundUser.username, foundUser.email, randomCode);
  
		return res
		  .status(200)
		  .json({ message: "Please check your email for the verification code" });
	  } else {
		return res.status(404).json({ message: { message: "User not found" } });
	  }
	} catch (error) {
	  res.status(500).json({ message: error.message, data: null });
	}
  };



  
  export const verifyCode = async (req, res) => {
	try {
	  const { email, resetCode } = req.body;
  
	  const foundUser = await User.findOne({ email, resetCode });
  
	  if (foundUser) {
		return res.status(200).json({ message: "Code verification successful" });
	  } else {
		return res.status(404).json({ message: "Invalid code or email" });
	  }
	} catch (error) {
	  res.status(500).json({ message: error.message, data: null });
	}
  };



  
  export const resetPassword = async (req, res) => {
	try {
	  const password = req.body.password;
	  const user_email = req.body.email;
  
	  if (!user_email) {
		return res.status(400).json({
		  status: "error",
		  message: "User email is missing",
		  data: null,
		});
	  }
  
	  const secure_password = await securePassword(password);
	  const updatedData = await User.findOneAndUpdate(
		{ email: user_email },
		{ $set: { password: secure_password, token: "" } }
	  );
  
	  if (!updatedData) {
		return res
		  .status(404)
		  .json({ status: "error", message: "User not found", data: null });
	  }
  
	  // res.json("reset success");
	  res.json({message: "reset success"});
  
	} catch (error) {
	  res
		.status(500)
		.json({ status: "fail", message: error.message, data: null });
	}
  };
  

  export const verification = async (req, res) => {
	let { token } = req.params;
	jwt.verify(token, "Newuser", async (err, decoded) => {
	  let foundeduser = await User.findById(decoded.id);
	  if (!foundeduser) return res.json({ message: "invalid user" });
	  let updateduser = await User.findByIdAndUpdate(
		decoded.id,
		{ isverified: true },
		{ new: true }
	  );
	  res.json({ message: "verification Done", updateduser });
	});
  };

  export const getProfile =  async (req, res) => {
    try {
      // Get user ID from decoded token
      const userId = req.userId;
  
      // Fetch user profile data from the database
      const user = await User.findById(userId);
  
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
  
      // Send user profile data in response
      res.status(200).json({
        username: user.username,
        email: user.email,
        age: user.age,
        addresses: user.addresses
        // You can include other fields as needed
      });
    } catch (error) {
      console.error("Error fetching user profile:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }



  export const deleteUser = async (req, res) => {
	let foundeduser = await User.findByIdAndDelete(req.params.id);
	if (foundeduser) {
	  res.json({ message: "User Deleted", foundeduser });
	} else {
	  res.json({ message: "user not found" });
	}
  };



//   export const deactivateUser = async (req, res) => {
// 	try {
// 	  const { email } = req.body;
// 	  const deactivatedUser = await User.findOneAndUpdate(
// 		{ email },
// 		{ $set: { isActive: false } },
// 		{ new: true }
// 	  );
// 	  if (deactivatedUser) {
// 		return res.status(200).json({ message: "User deactivated successfully" });
// 	  } else {
// 		return res.status(404).json({ message: "User not found" });
// 	  }
   
// 	} catch (error) {
// 	  res.status(500).json({ message: error.message, data: null });
// 	}
//   };
  
  
  