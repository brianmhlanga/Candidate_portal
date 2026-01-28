'use strict';

module.exports = (sequelize, DataTypes) => {
  const Upload = sequelize.define('Upload', {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id'
      }
    },
    type: {
      type: DataTypes.ENUM('photo', 'audio', 'video'),
      allowNull: false
    },
    url: {
      type: DataTypes.STRING,
      allowNull: false
    },
    attempts: {
      type: DataTypes.INTEGER,
      defaultValue: 1
    },
    duration: {
      type: DataTypes.INTEGER,
      comment: 'Duration in seconds for audio/video files'
    },
    completed: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    uploadedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    status: {
      type: DataTypes.ENUM('pending', 'approved', 'rejected'),
      defaultValue: 'pending'
    },
    reviewedAt: {
      type: DataTypes.DATE
    },
    reviewedBy: {
      type: DataTypes.STRING
    },
    rejectionReason: {
      type: DataTypes.TEXT
    }
  });

  // Associations
  Upload.associate = function (models) {
    Upload.belongsTo(models.User, {
      foreignKey: 'userId',
      as: 'user',
      onDelete: 'CASCADE'
    });
  };

  return Upload;
};
