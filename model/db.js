const sequelize = require("sequelize");
var Seq = require("sequelize")
var seq;

seq = new Seq.Sequelize("study", "root", "vkfksshdmf0207",{
    host:"localhost",
    port:3306,
    dialect:"mysql",
    timezone:"+09:00",
    define: {
        charset:"utf8",
        collate:"utf8_general_ci",
        timestamps:true,
        freezeTableName:true
    }
})

var db = {};
db.users = seq.import(__dirname+"/users.js");
db.posts = seq.import(__dirname+"/posts.js");
db.verificationCodes = seq.import(__dirname+"/verificationCodes.js");
db.comments = seq.import(__dirname+"/comments.js");
db.recommend = seq.import(__dirname+"/recommend.js");

db.seq = seq;
db.Seq = Seq;

db.users.hasMany(db.recommend);
db.recommend.belongsTo(db.users);

db.posts.hasMany(db.recommend);
db.recommend.belongsTo(db.posts);

module.exports = db;

seq.sync()
