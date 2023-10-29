module.exports = (sequelize, DataTypes) => {
    return sequelize.define('recommend', {
      username: {
        type: DataTypes.STRING,
        allowNull: false
      },
      postId: {
        type: DataTypes.INTEGER,
        allowNull: false
      }
    });
  };
  