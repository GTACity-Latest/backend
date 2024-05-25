module.exports = (sequelize, DataTypes) => {
  const Interior = sequelize.define('Interior', {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    x: {
      type: DataTypes.DOUBLE,
      allowNull: false,
    },
    y: {
      type: DataTypes.DOUBLE,
      allowNull: false,
    },
    z: {
      type: DataTypes.DOUBLE,
      allowNull: false,
    },
    dimension: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  }, {});
  return Interior;
};
