const express = require('express');
const port = process.env.PORT || 5000;
const bodyParser = require('body-parser');
const dotenv = require('dotenv').config();
const cors = require('cors');
const compression = require('compression') // compress req & res data transfer
const path = require("path");
const { errorHandler } = require('./middlewares/errorMiddleware')
const app = express();
const { exportUsersToRedis } = require('./config/redis/redisQuery')



// for parsing application/json
app.use(bodyParser.json());
app.use(express.json());

// for parsing application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }));

app.use(express.static('public'));

// cors - cross origin sharing - (http-request)
app.use(cors());

// export users to redis from db
exportUsersToRedis();

// all routes
app.use('/api/users', require('./routes/userRoutes'));
// app.use('/api/accounts', require('./routes/accountsRoutes'));
// app.use('/api/inNetwork', require('./routes/inNetworkRoutes'));
// app.use('/api/openIssues', require('./routes/openIssuesRoutes'));
// app.use('/api/portalLogins', require('./routes/portalLoginsRoutes'));
// app.use('/api/pif', require('./routes/pifRoutes'));



// compress the res data transfer
const compressionOptions = {
    level: 6, // Set the compression level (0-9)
    threshold: '512', // Set the minimum response size to compress (in bytes or a string like '1kb')
    filter: (req, res) => {
        // Add a filter function to determine whether to compress the response
        if (res.getHeader('Content-Type') === 'text/event-stream') {
            // Don't compress EventSource (SSE) responses
            return false;
        }
        return compression.filter(req, res);
    },
};
app.use(compression(compressionOptions));


// error handler middleware - return structured error message - this should be always placed beneath the routes to work
app.use(errorHandler);

app.listen(port, () => console.log(`Server started on ${port}`));