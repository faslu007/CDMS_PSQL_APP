const redisClient = require('./redisConn');
const bcrypt = require('bcryptjs');
const { query } = require('../sql/sqlQuery');
const { generateJWT } = require('../../utilities/commonsFunctions')
const asyncHandler = require('express-async-handler');
const { checkPermission } = require('../../utilities/checkUserPermission')


// function to load all users to redis from db on server start
// this is called from the server.js 
async function exportUsersToRedis() {
    try {
        await redisClient.connect();
        const allUserQuery = `
                SELECT u.id AS user_id, u.*, p.project_name AS project_name, p.project_code AS project_code, p.is_active AS project_is_active,
                r.id AS role_id, r.name AS role_name, STRING_AGG(rp.permission_id::text, ',') AS permission_ids
                FROM "user" u
                LEFT JOIN project p ON u.project_id = p.id
                LEFT JOIN roles r ON u.role_id = r.id
                LEFT JOIN role_permissions rp ON r.id = rp.role_id
                GROUP BY u.id, p.project_name, p.project_code, p.is_active, r.id, r.name;`;
        const allUsers = await query(allUserQuery);

        for (const user of allUsers) {
            const userIdKey = `user:${user.user_id}`;
            const emailKey = `user:${user.email}`;
            const redisUser = {
                first_name: user.first_name,
                last_name: user.last_name,
                full_name: user.full_name,
                email: user.email,
                phone: user.phone,
                password: user.password,
                organisation: user.organisation,
                team: user.team,
                designation: user.designation,
                is_verified: user.is_verified,
                is_active: user.is_active,
                role_id: user.role_id,
                project_id: user.project_id,
                project_name: user.project_name,
                project_code: user.project_code,
                project_is_active: user.project_is_active,
                role_name: user.role_name,
                permission_ids: user.permission_ids,
            };

            const userIdSet = await redisClient.set(userIdKey, JSON.stringify(redisUser), 'NX');
            const emailSet = await redisClient.set(emailKey, user.user_id, 'NX');
        }
    } catch (e) {
        console.error(e);
    } finally {
        await redisClient.quitAsync();
    }
};

// const protect = asyncHandler(async (req, res, next) => {
// middleware function to get user from redis if exists in redis cache for logging in
const checkInRedisCache = asyncHandler(async (req, res, next) => {
    const { email, password } = req.body;
    try {
        await redisClient.connect();

        const findIdByEmail = await redisClient.get(`user:${email}`);
        // if redis has no key value for the email provided then return to login function from there it can check in db
        if (!findIdByEmail) {
            return next();
        }
        // if id is found then get user data by using id and authenticate the user
        const cachedUser = await redisClient.get(`user:${findIdByEmail}`);
        if (cachedUser) {
            const user = JSON.parse(cachedUser);
            if (user.password && (await bcrypt.compare(password, user.password))) {
                delete user.password;
                user.token = generateJWT(user.user_id, user.permission_ids, user.project_id);
                res.status(200).json(user);
            }
        } else {
            return next();
        }
    } catch (error) {
        next();
    } finally {
        await redisClient.quitAsync();
    }
});

// middleware to retrieve user from redis and set req.user object and then call next middleware
const getUserForAuthMiddleware = asyncHandler(async (req, res, next) => {
    try {
        await redisClient.connect();

        const cachedUser = await redisClient.get(`user:${req.user_id}`);
        if (cachedUser) {
            req.user = JSON.parse(cachedUser);
            // validate user privileges
            if (!checkPermission(req.user.permission_ids, req.route.path, req.route.stack[0].method)) {
                res.status(403)
                throw new Error('Not authorized to perform the requested action or does not have privilege to get the requested data.');
            }
            next();
        } else {
            return null;
        }
    } catch (error) {
        console.log(error)
        return null;
    } finally {
        await redisClient.quitAsync();
    }
})


// save a new user to redis
async function addNewUserToRedis(user) {
    try {
        await redisClient.connect();
        user.user_id = user.id;
        // set email as key and id as value - this required for login
        const setEmailAndId = await redisClient.set(`user:${user.email}`, user.user_id);
        // set id as key and user object as value
        const setUserObjectWithId = await redisClient.set(`user:${user.user_id}`, JSON.stringify(user));
    } catch (error) {
        console.log(error)
    } finally {
        await redisClient.quitAsync();
    }
}


module.exports = {
    exportUsersToRedis,
    checkInRedisCache,
    getUserForAuthMiddleware,
    addNewUserToRedis
}
