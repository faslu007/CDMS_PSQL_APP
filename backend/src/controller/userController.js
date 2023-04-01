const jwt = require ('jsonwebtoken');
const bcrypt = require('bcryptjs');
const asyncHandler = require('express-async-handler');
const { query } = require('../config/sql/sqlQuery');




// @Login User
// @Route POST api/users/login
// @access Public
const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    // get user data
    const result = await query(`
        SELECT
            id, first_name, last_name, full_name, email, "password", "role", is_verified, is_active
        FROM
            "public"."user" 
        WHERE email = $1
            `, [email]);
    const user = result[0];
    // verify is user active
    if (!user.is_active){
        res.status(400)
        throw new Error('Your account is inactive, please contact admin to regain access!')
    }
    // verify password
    if(user && (await bcrypt.compare(password, user.password))) {
        res.status(200).json(
            {   id: user.id,
                fullName: user.full_name,
                email: user.email,
                token: generateToken(user.id) }
        );
    } else {
        res.status(400)
        throw new Error('Invalid credentials')
    }
  });

// @Get Logged in User Data
// @Route Get api/users/getMyInfo
// @access Private
const getMyInfo = asyncHandler ( async (req, res) => {
        res.status(200).json(req.user);
});





// generate JWT Token on success login & register with expiry 5 days
const generateToken = (id) =>{
    return jwt.sign({id}, process.env.JWT_SECRET, {
        expiresIn: '50d',
    })
}

module.exports = {
    loginUser,
    getMyInfo
}