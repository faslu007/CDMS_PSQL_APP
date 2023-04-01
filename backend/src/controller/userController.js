const jwt = require ('jsonwebtoken');
const bcrypt = require('bcryptjs');
const asyncHandler = require('express-async-handler');
const { query } = require('../config/sql/sqlQuery');
// input validations
const { validateSuperAdminRegisterInput } = require('../utilities/validations')
const { sendOTP } = require('../utilities/emailingFunctionalities')
const { generateProjectCode, generateJWT } = require('../utilities/commonsFunctions')




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

    // check if project with requested name already exists in db
    const isProjectExists = await query(` SELECT EXISTS ( SELECT 1 FROM "project" WHERE project_name = '${req.body.projectName}') as project_exists`);
    if (isProjectExists[0].project_exists) {
        res.status(400)
        throw new Error(`Project ${req.body.projectName} already registered.`);
    }

    const { firstName, lastName, email, phone, password, organisation, team, designation, projectName } = userInput;
    const otp = Math.floor(Math.random() * 90000) + 10000;
    const role = 1;
    const is_verified = false;

    // hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // send OTP to user email
    const sendOTPEmail = await sendOTP(email, otp);
    if(sendOTPEmail.status !== 'success'){
        res.status(400);
        throw new Error(`An error occurred while sending email, please contact admin if email is valid.`);
    }

    // save user credentials to db
    const queryToSaveUser = `INSERT INTO temp_user (first_name, last_name, email, phone, "password", "role", organisation, team, designation, otp, is_verified, project_name)
                            VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
                            RETURNING first_name, last_name, email, phone, role, organisation, team, designation, otp, is_verified, project_name`;

    const queryValues = [firstName, lastName, email, phone, hashedPassword, role, organisation, team, designation, otp, is_verified, projectName];

    try {
        const result = await query(queryToSaveUser, queryValues);
        const { otp, ...data } = result[0];
        res.status(201).json({ success: true, data: data });
    } catch (error) {
        res.status(500)
        throw new Error(`An error occurred while saving to database.`);
    }
});





// @Verify Super admin OTP and convert as permenent user
// @Route POST api/users/registerSuperAdmin
// @access Public
const verifySuperAdminOTP = asyncHandler(async (req, res) => {
    const { email, otp } = req.body;

    // Check if any user with the email and otp combination exists in the db
    const tempUser = await query('SELECT * FROM temp_user WHERE email = $1 AND otp = $2', [email, otp]);
    if (tempUser.length == 0) {
        res.status(404)
        throw new Error('Could not find user with the email and OTP provided');
    }

    try {
        // Move user to permanent user table
        const registeredUser = await query(`INSERT INTO "user" (first_name, last_name, email, phone, "password", organisation, team, designation, is_verified, is_active, role_id)
                                            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, true, true, 1)
                                            RETURNING *
                                        `, [
            tempUser[0].first_name,
            tempUser[0].last_name,
            tempUser[0].email,
            tempUser[0].phone,
            tempUser[0].password,
            tempUser[0].organisation,
            tempUser[0].team,
            tempUser[0].designation,
        ]);

        // create the project
        const projectCode = generateProjectCode(tempUser[0].project_name);
        const createProject = await query(`INSERT INTO "project" (project_name, project_code, created_by, is_active)
                                            VALUES ($1, $2, $3, true)
                                            RETURNING *
                                        `, [
            tempUser[0].project_name,
            projectCode,
            registeredUser[0].id,
        ]);

        // Add project id to user table
        const addProjectToUser = await query(`UPDATE "user" SET project_id = $1 WHERE id = $2`, [
            createProject[0].id,
            registeredUser[0].id,
        ]);

        if (registeredUser[0]) {
            // delete user from temporary user table
            const deleteTempUser = await query(`DELETE FROM "temp_user" WHERE email = '${registeredUser[0].email}' RETURNING true;`);
        };
        // return user object
        res.status(201).json({ success: true, data: { id: registeredUser[0].id, email: registeredUser[0].email } });

    } catch (error) {
        throw new Error('An error occurred while saving into database');
    }
})





// @Login User
// @Route POST api/users/login
// @access Public
const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    // Get user from db
    const userQuery = `
        SELECT u.id AS user_id, u.*, p.project_name AS project_name, p.project_code AS project_code, p.is_active AS project_is_active,
        r.id AS role_id, r.name AS role_name, STRING_AGG(rp.permission_id::text, ',') AS permission_ids
        FROM "user" u
        LEFT JOIN project p ON u.project_id = p.id
        LEFT JOIN roles r ON u.role_id = r.id
        LEFT JOIN role_permissions rp ON r.id = rp.role_id
        WHERE u.email = $1
        GROUP BY u.id, p.project_name, p.project_code, p.is_active, r.id, r.name; `
    const user = await query(userQuery, [email]);
    const { id, ...userData } = user[0];

    // if user does not exist throw error
    if (user?.length === 0) {
        res.status(401);
        throw new Error('User not found with the provided email');
    }

    // validate password and send response;
    if (user[0] && (await bcrypt.compare(password, userData.password))) {
        delete userData.password;
        userData.token = generateJWT(userData.user_id, userData.permission_ids, userData.project_id);
        res.status(200).json(userData)
    } else {
        res.status(400)
        throw new Error('Invalid credentials')
    }
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