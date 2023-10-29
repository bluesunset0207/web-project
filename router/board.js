const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const db = require('../model/db');
const comments = require('../model/comments');
const categories = ['자유', '만화', '공부'];
const Sequelize = require('sequelize');
const seq = Sequelize.Op;

const path = require('path');
const multer = require('multer');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
      cb(null, file.originalname);
    }
});

const upload = multer({ storage: storage });

router.get('/files/:filename', (req, res) => {
    const filename = req.params.filename;
    const filePath = path.join(__dirname, '../', 'uploads', filename);
    res.download(filePath);
});


router.get('/search', async (req, res) => {
    const { query, category, type } = req.query;
    
    const whereClause = {
        [type]: {
            [seq.like]: '%' + query + '%'
        }
    };

    if(category !== "all"){
        whereClause.category = category;
    }

    const post = await db.posts.findAll({ where: whereClause });
    res.render('board/search', { post });
});


router.get('/main/:category',async (req, res) => {
    const category = req.params.category;
    const posts = await db.posts.findAll({ where: { category } });
    if (!categories.includes(category)) {
        return res.redirect('/');
      }
    res.render('board/main',{posts: posts, category: category, categories: categories});
});

router.get('/write', (req, res) => {
    if(!req.session.user){
        res.redirect('/auth/login');
    }
    res.render('board/write',{categories: categories});
});


router.post('/write', upload.single('file'), async(req, res) => {
    const { category, title, content, secret, password } = req.body;

    if(!req.session.user){
        res.redirect('/auth/login');
    }

    let filePath = null;
    let fileName = null;

    if (req.file) {
      filePath = req.file.path;
      fileName = req.file.originalname;
    }

    const hashedPassword = secret && password ? await bcrypt.hash(password, 10) : null;

    db.posts.create({
        title: title,
        content: content,
        writer: req.session.user.username,
        secret: secret === 'on',
        password: hashedPassword,
        category: category,
        filePath: filePath,
        fileName: fileName
    }).then(function(result){
        res.redirect('/board/main/'+category);
    })
});


router.get('/read/:id', async(req, res) => {
    if(!req.session.user){
        return res.redirect('/auth/login');
    }
    const postId = req.params.id;
    const post = await db.posts.findByPk(postId)
    const iswriter = req.session.user && req.session.user.username === post.writer;
    const isadmin = req.session.user && req.session.user.email === "codehacker0207@gmail.com";

    const comments = await db.comments.findAll({
        where: {postId: postId},
        order: [['createdAt', 'DESC']]
    })

    const recommendnum = await db.recommend.count({
        where: { postId: postId }
    });

    const isrecommend = await db.recommend.findOne({
        where: { username: req.session.user.username, postId: postId }
    }) !== null;


    if (post.secret && (!req.session.user || req.session.user.username !== post.writer || 1 === 1)) {
        return res.render('board/secret', { postId: post.idx });
    }

    res.render('board/read', { post: post, 
        iswriter: iswriter, 
        comments: comments, 
        user: req.session.user, 
        recommendnum: recommendnum,
        isrecommend: isrecommend,
        isadmin: isadmin
    });
});

router.post('/read/:id/secret', async (req, res) => {
    const postId = req.params.id;
    const { password } = req.body;
    const post = await db.posts.findByPk(postId);

    const comments = await db.comments.findAll({
        where: {postId: postId},
        order: [['createAt', 'DESC']]
    })

    if (!post) {
        return res.status(404).send('게시글을 찾을 수 없습니다.');
    }

    if (await bcrypt.compare(password, post.password)) {
        const iswriter = req.session.user && req.session.user.username === post.writer;
        return res.render('board/read', { post: post, iswriter: iswriter, comments: comments, user: req.session.user});
    } else {
        return res.render('board/secret', { postId: post.id, error: '비밀번호가 틀렸습니다.' });
    }
});


router.post('/delete/:id', (req, res) => {
    const postId = req.params.id;
    db.posts.destroy({
        where:{idx:postId}
    }).then(function(result){
        res.redirect('/');
    })
})
  

router.get('/edit/:id', async (req, res) => {
    const postId = req.params.id;
    const post = await db.posts.findByPk(postId);
    res.render('board/edit', { post });
});

router.post('/update/:id', async (req, res) => {
    const postId = req.params.id;
    const { title, content} = req.body;
    const result = await db.posts.update({ title, content }, { where: { idx: postId } });
    res.redirect('/');
});

router.post('/comment/:id', async (req, res) => {

    const postId = req.params.id;
    const { content } = req.body;
    await db.comments.create({ 
    postId: postId, 
    writer: req.session.user.username, 
    content: content });
    res.redirect('/board/read/'+postId);
});
  
router.post('/comment/:id/delete', async (req, res) => {

    const commentId = req.params.id;
    db.comments.destroy({
        where:{idx:commentId}
    }).then(function(result){
        res.redirect('/');
    })
});

router.get('/comment/:id/edit', async (req, res) => {
    const commentId = req.params.id;
    const comment = await db.comments.findByPk(commentId);
    res.render('board/editcomment', { comment });

});

router.post('/comment/:id/update', async (req, res) => {
    const commentId = req.params.id;
    const { content } = req.body;
    const result = await db.comments.update({ content }, { where: { idx: commentId } });
    res.redirect('/');
});

router.post('/recommend/:postId', async (req, res) => {
    if(!req.session.user){
        return res.redirect('/auth/login');
    }

    const postId = req.params.postId;
    const username = req.session.user.username;

    const [recommend, created] = await db.recommend.findOrCreate({
        where: { username: username, postId: postId },
        defaults: { username: username, postId: postId }
        
    });

    return res.redirect('/board/read/'+postId)

});
  

module.exports = router;