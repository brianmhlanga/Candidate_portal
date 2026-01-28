'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Drop the IQResults table as part of removing the IQ assessment feature
    await queryInterface.dropTable('IQResults');
  },

  down: async (queryInterface, Sequelize) => {
    // Recreate the IQResults table if needed to revert this migration
    // This is the reverse of the original create-iq-results migration
    await queryInterface.createTable('IQResults', {
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
      score: {
        type: Sequelize.FLOAT,
        allowNull: false
      },
      correctAnswers: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      totalQuestions: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      completionTime: {
        type: Sequelize.INTEGER,
        allowNull: false,
        comment: 'Completion time in seconds'
      },
      completed: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },
      completedAt: {
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
  }
};
