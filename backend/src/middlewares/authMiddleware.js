const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const { query } = require('../config/sql/sqlQuery');


// protect middleware for user validation
// all the routes passing this middleware will have access to user info (variable = req.user) from which additional privilege validatoin can be performed
const protect = asyncHandler(async (req, res, next) => {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith ('Bearer')){
        try {
            // get token from the header
            token = req.headers.authorization.split(' ')[1]

            // verify the token
            const decoded = jwt.verify(token, process.env.JWT_SECRET)
            
            // get the user from the token
            const result = await query(`
                SELECT
                    id, first_name, last_name, full_name, email, "role"
                FROM
                    "public"."user" 
                WHERE id = $1
                    `, [decoded.id]);

            req.user = result[0];
            
            next()
        } catch (error) {
            res.status(401)
            throw new Error ('Not autherized, no token');
        }
    }
    if (!token) {
        res.status(401)
        throw new Error ('Not autherized')
    }
})


module.exports = {protect};