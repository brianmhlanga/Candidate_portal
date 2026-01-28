'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Questionnaires', {
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
      personalInfo: {
        type: Sequelize.JSON,
        allowNull: false
      },
      contactInfo: {
        type: Sequelize.JSON,
        allowNull: false
      },
      workExperience: {
        type: Sequelize.JSON,
        allowNull: false
      },
      references: {
        type: Sequelize.JSON,
        allowNull: false
      },
      additionalInfo: {
        type: Sequelize.JSON
      },
      consents: {
        type: Sequelize.JSON,
        allowNull: false
      },
      completed: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },
      submittedAt: {
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
    await queryInterface.dropTable('Questionnaires');
  }
};
