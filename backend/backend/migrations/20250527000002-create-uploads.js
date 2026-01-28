'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Uploads', {
      id: {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.UUIDV4
      },
      userId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      type: {
        type: Sequelize.ENUM('photo', 'audio', 'video'),
        allowNull: false
      },
      url: {
        type: Sequelize.STRING,
        allowNull: false
      },
      attempts: {
        type: Sequelize.INTEGER,
        defaultValue: 1
      },
      duration: {
        type: Sequelize.INTEGER,
        comment: 'Duration in seconds for audio/video files'
      },
      completed: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },
      uploadedAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false
      }
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('Uploads');
  }
};
