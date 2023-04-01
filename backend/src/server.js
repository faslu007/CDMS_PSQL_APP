const express = require('express');
const port = process.env.PORT || 5000;
const bodyParser = require('body-parser');
const dotenv = require('dotenv').config();
const cors = require('cors');
const compression = require('compression') // compress req & res data transfer
const path = require("path");
const {errorHandler} = require('./middlewares/errorMiddleware')
const app = express();
const { query } = require('./config/sql/sqlQuery');


// for parsing application/json
app.use(bodyParser.json());
app.use(express.json());

// for parsing application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true })); 

// app.use(upload.array());

app.use(express.static('public'));

// compress the res data transfer
app.use(compression())

// cors - cross origin sharing - (http-request)
app.use(cors());

// all routes
app.use('/api/users', require('./routes/userRoutes'));
// app.use('/api/accounts', require('./routes/accountsRoutes'));
// app.use('/api/inNetwork', require('./routes/inNetworkRoutes'));
// app.use('/api/openIssues', require('./routes/openIssuesRoutes'));
// app.use('/api/portalLogins', require('./routes/portalLoginsRoutes'));
// app.use('/api/pif', require('./routes/pifRoutes'));


const testFunction = async () => {

    try {
        const result = await query(`
          INSERT INTO "users" (first_name, last_name, email, phone, "password", organisation, team, designation, is_verified, is_active, role_id)
          VALUES('Jennita', 'Manuel', 'james007123566@gmail.com', '4158002317', 'test&356hd', 'AIMA', 'cREDEBN', 'MANAGER', true, true, 1)
          RETURNING *;
        `);

        const resultKeys = Object.keys(result);
        console.log(result.code)
        console.log(resultKeys)
        
        // console.log('From try block', resultKeys);
      } catch (error) {
        console.log('ERROR:', error);
        

      }
      


}

testFunction();






// error handler middleware - return structured error message - this should be always placed beneath the routes to work
app.use(errorHandler);

app.listen(port, ()=> console.log(`Server started on ${port}`));