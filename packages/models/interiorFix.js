module.exports = (sequelize, DataTypes) => {
  const InteriorFix = sequelize.define('InteriorFix', {
    ownerId: {
      type: DataTypes.INTEGER,
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
    kilitdurumu: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    anahtarId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    interiorType: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    rentStatus: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    saleStatus: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    salePrice: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    rentPrice: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
  }, {});
  
  return InteriorFix;
};