const express = require('express');
const app = express();
const morgan = require('morgan'); //Morgan helps to log request details in the terminal
const bodyParser = require('body-parser');
const cors = require('cors');

const userRoutes = require('./api/routes/user');
const adminRoutes = require('./api/routes/admin');
const eventRoutes = require('./api/routes/event');

app.use(morgan('dev'));
app.use('/uploads', express.static('uploads'))
const connectDb = require('./database/db');
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.use(cors());
// app.use((req, res, next)=>{
//     res.header('Access-Control-Allow-Origin','*');
//     res.header('Access-Control-Allow-Headers', '*');
//     if(req.method === 'OPTIONS'){
//         res.header('Access-Control-Allow-Methods','PUT, POST, PATCH, DELETE, GET')
//         return res.status(200).json({});
//     }
// next();
// })

//Routes 
app.use('/users', userRoutes);
app.use('/admin', adminRoutes);
app.use('/events', eventRoutes);

connectDb();

// Middleware for non-existing routes 
app.use((req,res,next)=>{
    const error = new Error('Not Found');
    error.status = 404;
    next(error);
});

//Middleware for handling all kinds of errors in the application.
app.use((error, req, res, next)=>{
    res.status(error.status || 500);
    res.json({error:{message:error.message}});
});

module.exports = app;