const express = require('express')
const router = express.Router()
const db = require('../model/db')

const categories = ['자유', '만화', '공부'];

router.get("/", function(req, res){
    const user = req.session.user;
    res.render('index', {user, title:"빡공팟 수료 기원 1주차", categories: categories});
})


module.exports = router
