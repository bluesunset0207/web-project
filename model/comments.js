module.exports = function(sequelize, DataTypes){ 
    return sequelize.define('comments', {
      idx: {
        type : DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
      },
      content: {
        type: DataTypes.TEXT,
        allowNull: false
      },
      writer: {
        type: DataTypes.STRING(255),
        allowNull: false
      },
      postId: {
        type: DataTypes.INTEGER,
        allowNull: false
      }
    });
}
  
