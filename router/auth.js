const express = require('express');
const router = express.Router();
const db = require('../model/db')
const bcrypt = require('bcrypt');

const saltRounds = 10;

const nodemailer = require('nodemailer');

let transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'codehacker0207@gmail.com',
    pass: 'tqbvncmcrjxhwjwz'
  }
});


router.get('/signup', (req, res) => {
    res.render('auth/signup');
});

router.post('/signup', async (req, res) => {
    try {
        const { username, email, password } = req.body;

        const digit = /\d/;
        if(password.length<8 || !digit.test(password)){
            return res.status(400).json({ message: '비밀번호 조건을 만족시켜 주세요'});
        }

        const hashedPassword = await bcrypt.hash(password, saltRounds);
        
        const user = await db.users.findOne({ where: { email } });
        if(user)
        {
            return res.redirect('/auth/failed');
        }

        await db.users.create({
            username,
            email,
            password: hashedPassword,
        });
        res.redirect('/');
        
    } catch (error) {
        res.status(500).json({ message: '회원가입 중 오류 발생', error: error.message });
    }
});

router.get('/failed', (req, res) => {
    res.render('auth/failed');
});

router.get('/login', (req, res) => {
    res.render('auth/login');
});

router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await db.users.findOne({ where: { username } });

        if (!user) {
            return res.status(400).json({ message: '유저를 찾을 수 없습니다.' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        
        if (!isMatch) {
            return res.status(400).json({ message: '비밀번호가 일치하지 않습니다.' });
        }

        req.session.user = {
            id: user.id,
            username: user.username,
            email: user.email
        };

        res.redirect('/');

    } catch (error) {
        res.status(500).json({ message: '로그인 실패', error: error.message });
    }
});

router.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/');
});


router.post('/verify', async (req, res) => {
    try {
        const {email, code} = req.body;

        const latest = await db.verificationCodes.findOne({
            where: { email: email },
            order: [ ['expiresAt', 'DESC'] ]
        });
        
        if (!latest) {
            return res.status(400).send('User not found.');
        }

        if (new Date() > latest.expiresAt) {
            return res.status(400).send('Verification code has expired.');
        }
        

        if (latest.verificationCode == code) {
            return res.json({success: true});
        } else {
            return res.status(400).send('Incorrect verification code.');
        }
    } catch (error) {
        return res.status(500).send('Server error.');
    }
});

router.post('/sendcode', async (req, res) => {
    const verificationCode = Math.floor(Math.random() * 1000000);
    const {email} = req.body;
    let mailOptions = {
        from: 'codehakcer0207@gmail.com',
        to: email,
        subject: 'Please verify your email address',
        text: `Your verification code is: ${verificationCode}`
        };
    
    await transporter.sendMail(mailOptions);
    await db.verificationCodes.create({
        email: email,
        verificationCode: verificationCode,
        expiresAt: new Date(Date.now() + 3 * 60 * 1000)
    });

    res.json({
        success: true,
        message: 'Verification code sent successfully.'
    });

});

router.get('/findid', (req, res) => {
    res.render('auth/findid');
});

router.post('/findid', async (req, res) => {
    try {
      const { email } = req.body;
      const user = await db.users.findOne({ where: { email } });
  
      if (!user) {
        return res.status(400);
      }
  
      const mailOptions = {
        from: 'codehacker0207@gmail.com',
        to: email,
        subject: '아이디 찾기',
        text: `귀하의 아이디는 ${user.username} 입니다.`
      };
  
      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          return res.status(500);
        }
        res.json({ success: true, message: '아이디가 이메일로 발송되었습니다.' });
      });
    } catch (error) {
      res.status(500).json({ message: '아이디 찾기 실패', error: error.message });
    }
});

module.exports = router;