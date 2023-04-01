const jwt = require ('jsonwebtoken');
const bcrypt = require('bcryptjs');
const asyncHandler = require('express-async-handler');
const { query } = require('../config/sql/sqlQuery');
// input validations
const { validateSuperAdminRegisterInput } = require('../utilities/validations') 
const { sendOTP } = require('../utilities/emailingFunctionalities')




// @Register a super_admin
// @Route POST api/users/registerSuperAdmin
// @access Public
const registerSuperAdmin = asyncHandler(async (req, res) => {
    const userInput = req.body;
    const validateInput = validateSuperAdminRegisterInput(userInput);

    if (!validateInput.success) {
        res.status(400);
        throw new Error(validateInput.message);
    };

// check if email is already registered
    const isUserExists = await query(` SELECT EXISTS ( SELECT 1 FROM "user" WHERE email = '${req.body.email}' UNION SELECT 1 FROM temp_user WHERE email = '${req.body.email}' ) as user_exists`);
    if (isUserExists[0].user_exists) {
        res.status(400)
        throw new Error(`Email ${req.body.email} already registered.`);
    }

    const { firstName, lastName, email, phone, password, organisation, team, designation, projectName } = userInput;
    const otp = Math.floor(Math.random() * 90000) + 10000;
    const role = 1;
    const is_verified = false;

    // send OTP to user email
    const sendOTPEmail = await sendOTP(email, otp);
    if(sendOTPEmail.status !== 'success'){
        res.status(400);
        throw new Error(`An error occured while sending email, please contact admin if email is valid.`);
    }

    // save user credentials to db
    const sqlQuery = `INSERT INTO temp_user (first_name, last_name, email, phone, "password", "role", organisation, team, designation, otp, is_verified, project_name)
                            VALUES('${firstName}', '${lastName}', '${email}', '${phone}', '${password}', ${role}, '${organisation}', '${team}', '${designation}', '${otp}', ${is_verified}, '${projectName}')
                            RETURNING first_name, last_name, email, phone, role, organisation, team, designation, otp, is_verified, project_name`;

    try {
        // execute the sql query using your database library and return the inserted user object
        const result = await query(sqlQuery);
        res.status(201).json({ success: true, data: result[0] });
    } catch (error) {
        res.status(500)
        throw new Error(`An error occured while saving to database.`);
    }
});


// @Verify Super admin OTP and convert as permenent user
// @Route POST api/users/registerSuperAdmin
// @access Public
const verifySuperAdminOTP = asyncHandler(async (req, res) => {
    const { email, otp } = req.body;

    // Check if any user with the email and otp combination exists in the db
    const tempUser = await query(`SELECT * FROM temp_user WHERE email = '${email}' AND otp = '${otp}'`);
    if (tempUser.length == 0) {
        res.status(404)
        throw new Error('Could not find user with the email and OTP provided');
    }

    try {
        // move user to permenent user table
        const registeredUser = await query(`INSERT INTO "user" (first_name, last_name, email, phone, "password", organisation, team, designation, is_verified, is_active, role_id)
                                            VALUES('${tempUser[0].first_name}', '${tempUser[0].last_name}', '${tempUser[0].email}', '${tempUser[0].phone}', '${tempUser[0].password}', '${tempUser[0].organisation}', '${tempUser[0].team}', '${tempUser[0].designation}', true, true, 1)
                                            RETURNING *`);

        if (registeredUser[0]) {
            // delete user from temporary user table
            const deleteTempUser = await query(`DELETE FROM "temp_user" WHERE email = '${registeredUser[0].email}' RETURNING true;`);
        };

        res.status(201).json({ success: true, data: registeredUser[0] });
    } catch (error) {
        res.status(400).send(error)
    }
})















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











// const testFunction = async () => {

//     try {
//         const result = await query(`
//           INSERT INTO "users" (first_name, last_name, email, phone, "password", organisation, team, designation, is_verified, is_active, role_id)
//           VALUES('Jennita', 'Manuel', 'james007123566@gmail.com', '4158002317', 'test&356hd', 'AIMA', 'cREDEBN', 'MANAGER', true, true, 1)
//           RETURNING *;
//         `);

//         const resultKeys = Object.keys(result);
//         console.log(result.code)
//         console.log(resultKeys)
        
//         // console.log('From try block', resultKeys);
//       } catch (error) {
//         console.log('ERROR:', error);
        

//       }
      


// }

// testFunction();









module.exports = {
    registerSuperAdmin,
    verifySuperAdminOTP,
    loginUser,
    getMyInfo
}