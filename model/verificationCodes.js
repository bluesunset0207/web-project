module.exports = function(sequelize, DataTypes) { 
    return sequelize.define('verificationCodes', {
      idx: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
      },
      email: {
        type: DataTypes.STRING(255),
        allowNull: false
      },
      verificationCode: {
        type: DataTypes.STRING(6),
        allowNull: true
      },
      expiresAt: {
        type: DataTypes.DATE,
        allowNull: true
      }
    });
}
