'use strict';

module.exports = (sequelize, DataTypes) => {
  const Questionnaire = sequelize.define('Questionnaire', {
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
    personalInfo: {
      type: DataTypes.JSON,
      allowNull: false
    },
    contactInfo: {
      type: DataTypes.JSON,
      allowNull: false
    },
    workExperience: {
      type: DataTypes.JSON,
      allowNull: false
    },
    references: {
      type: DataTypes.JSON,
      allowNull: false
    },
    additionalInfo: {
      type: DataTypes.JSON
    },
    consents: {
      type: DataTypes.JSON,
      allowNull: false
    },
    completed: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    submittedAt: {
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
  Questionnaire.associate = function (models) {
    Questionnaire.belongsTo(models.User, {
      foreignKey: 'userId',
      as: 'user',
      onDelete: 'CASCADE'
    });
  };

  return Questionnaire;
};
