'use strict';
const bcrypt = require('bcrypt');

module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      // IMPORTANT: Unique constraint is handled via migrations, not through Sequelize
      // This avoids the "too many keys" error (max 64 keys allowed)
      validate: {
        isEmail: true
      }
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false
    },
    firstName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    lastName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    phone: {
      type: DataTypes.STRING
    },
    onboardingStep: {
      type: DataTypes.ENUM('welcome', 'photo-upload', 'audio-recording', 'video-recording', 'questionnaire', 'completion'),
      defaultValue: 'welcome'
    },
    role: {
      type: DataTypes.ENUM('user', 'admin'),
      defaultValue: 'user'
    },
    onboardingCompleted: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    onboardingCompletedAt: {
      type: DataTypes.DATE
    },
    professionalSummary: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    aiGeneratedQuestions: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'JSON array of questions generated based on professional summary'
    },
    approvalStatus: {
      type: DataTypes.ENUM('pending', 'approved', 'rejected'),
      defaultValue: 'pending'
    },
    approvedAt: {
      type: DataTypes.DATE
    },
    approvedBy: {
      type: DataTypes.STRING
    },
    rejectionReason: {
      type: DataTypes.TEXT
    }
  }, {
    hooks: {
      beforeCreate: async (user) => {
        if (user.password) {
          const salt = await bcrypt.genSalt(10);
          user.password = await bcrypt.hash(user.password, salt);
        }
      },
      beforeUpdate: async (user) => {
        if (user.changed('password')) {
          const salt = await bcrypt.genSalt(10);
          user.password = await bcrypt.hash(user.password, salt);
        }
      }
    }
  });

  // Instance method to compare password
  User.prototype.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
  };

  // Associations
  User.associate = function (models) {
    User.hasMany(models.Upload, {
      foreignKey: 'userId',
      as: 'uploads'
    });
    User.hasOne(models.Questionnaire, {
      foreignKey: 'userId',
      as: 'questionnaire'
    });
  };

  return User;
};
