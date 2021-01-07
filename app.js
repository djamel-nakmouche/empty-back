const express = require('express');
const mongoose = require('mongoose');
// const logger = require('morgan');
const cors =require("cors");
const expressJwt = require("express-jwt")
var compression = require('compression');
var helmet = require('helmet');
const multer = require('multer')

const dotenv = require('dotenv') //package pour gerer les constantes à cacher
dotenv.config();

// const createError = require('http-errors');

const app = express();



// let port;
// if(process.env.PORT){port = process.env.PORT}else{port = 80}
const port = process.env.PORT || 8080;
console.log("port", port)

let DB_CONNECT
if (!process.env.NODE_ENV || process.env.NODE_ENV === 'development') {
  DB_CONNECT=process.env.DB_CONNECT_MAIN
} else {
  DB_CONNECT=process.env.DB_CONNECT_PROD
}
console.log("DB_CONNECT", DB_CONNECT)
console.log("ENV", process.env.NODE_ENV)

// connect to DB
// mongoose.connect(process.env.DB_CONNECT, { useUnifiedTopology: true, useNewUrlParser: true },
//     () => console.log('connected to DB')
// );
mongoose.connect(DB_CONNECT, { useUnifiedTopology: true, useNewUrlParser: true },
  () => console.log('connected to DB')
);

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));


// //Routers
// // PERSON PROFILE 
const AuthRouter = require('./routes/authRoutes')
const AdminRouter = require('./routes/adminRoutes')
const PublicRouter = require('./routes/publicRoutes')
const MembersRouter = require('./routes/membersRoutes')
const ReviewerRouter = require('./routes/reviewerRoutes')
const AccountRouter = require('./routes/accountRoutes')
const ActivityRouter = require('./routes/activityRoutes')


//Middlewares
app.use(compression())
app.use(helmet());
app.use(cors());
// app.use(logger('dev')); //logs
app.use(express.json()); // in order to understand the post requests. includes the "body parser"
app.use(express.urlencoded({ extended: false })); // Why ?

const TOKEN_SECRET = process.env.TOKEN_SECRET

app.use(expressJwt({secret : TOKEN_SECRET}).unless({path: [/^\/public\/.*/, /^\/auth\/.*/, /^\/activity\/.*/, ]}))

app.use(function(err, req, res, next) {
    console.log("header authorization", req.headers.authorization)
    if(err.name === 'UnauthorizedError') {
        console.log("err", err)
      res.status(err.status).send(err.message);
    //   logger.error(err);
      return;
    }
 next();
});

// app.use(express.static(__dirname + '/media'));

// Routes middlewares
// Chkoune Flane
app.use('/auth', AuthRouter);
app.use('/admin', AdminRouter);
app.use('/public', PublicRouter);
app.use('/members', MembersRouter);
app.use('/reviewer', ReviewerRouter);
app.use('/account', AccountRouter);
app.use('/activity', ActivityRouter);




app.get('*', function(req, res){
    res.send('Error 404', 404);
  });

 

app.listen(port, () => {
    console.log(`listening on port ${port}`)
});