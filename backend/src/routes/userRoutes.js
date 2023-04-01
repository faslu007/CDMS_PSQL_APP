const express = require ('express');
const path = require('path')
const router = express.Router();
const {protect} = require('../middlewares/authMiddleware')
const { loginUser, registerSuperAdmin, verifySuperAdminOTP, getMyInfo } = require('../controller/userController') 

const multer  = require('multer');
const upload = multer()

//API: /api/users
router.post('/login', upload.none(), loginUser);
router.get('/getMyInfo', protect, getMyInfo);
router.post('/registerSuperAdmin', upload.none(), registerSuperAdmin);
router.post('/verifySuperAdminOTP', upload.none(), verifySuperAdminOTP);

// router.post('/verifyOPT', upload.none(), verifyOTP),
// router.post('/registerUser', upload.none(), protect, registerUser);

// router.get('/getAllUsers', protect, getAllUsers);
// router.post('/resetpassword', upload.none(), resetPassword);
// router.patch('/updateUser/:id', upload.none(), protect, updateUser)
module.exports = router;