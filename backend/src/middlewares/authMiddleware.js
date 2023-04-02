const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const { query } = require('../config/sql/sqlQuery');
const { checkPermission } = require('../utilities/checkUserPermission')
const { getUserForAuthMiddleware } = require('../config/redis/redisQuery')



// protect middleware for user validation
// all the routes passing this middleware will have access to user info (variable = req.user) from which additional privilege validatoin can be performed
const protect = asyncHandler(async (req, res, next) => {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            // get token from the header
        token = req.headers.authorization.split(' ')[1]
            // verify the token
            const decoded = jwt.verify(token, process.env.JWT_SECRET)

        // verify user from Redis if exists in redis;
        req.user_id = decoded.id
        getUserForAuthMiddleware(req, res, next);

        // if user not found in Redis try in db;
        try {
            const userQuery = `
                    SELECT u.id AS user_id, u.*, p.project_name AS project_name, p.project_code AS project_code, p.is_active AS project_is_active,
                    r.id AS role_id, r.name AS role_name, STRING_AGG(rp.permission_id::text, ',') AS permission_ids
                    FROM "user" u
                    LEFT JOIN project p ON u.project_id = p.id
                    LEFT JOIN roles r ON u.role_id = r.id
                    LEFT JOIN role_permissions rp ON r.id = rp.role_id
                    WHERE u.id = $1
                    GROUP BY u.id, p.project_name, p.project_code, p.is_active, r.id, r.name; `

            const user = await query(userQuery, [decoded.id]);

            delete user[0].password;
            req.user = user[0];
            if (!checkPermission(req.user.permission_ids, req.route.path, req.route.stack[0].method)) {
                res.status(403)
                throw new Error('Not authorized to perform the requested action or does not have privilege to get the requested data.');
            }
            next()
        } catch (error) {
            console.log(error)
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