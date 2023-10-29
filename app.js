const express = require('express')
const app = express()
const helmet = require("helmet")
app.use(helmet())
app.use(express.json())
app.use(express.urlencoded())
app.use(express.urlencoded({ extended: true }));

app.set('view engine', 'ejs')
app.set('views', './views')
app.use('/public', express.static(__dirname+'/public'))

const session = require('express-session');

app.use(session({
  secret: 'your-secret-key',
  resave: false,
  saveUninitialized: false
}));

const mainRouter = require('./router/controller')
const boardRouter = require('./router/board');
const authRouter = require('./router/auth');
app.use('/', mainRouter)
app.use('/board', boardRouter);
app.use('/auth', authRouter);

app.listen(3000, function(req, res){
    console.log("서버")
})