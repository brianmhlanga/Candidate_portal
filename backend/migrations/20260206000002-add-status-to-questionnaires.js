'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Questionnaires', 'status', {
      type: Sequelize.ENUM('pending', 'approved', 'rejected'),
      defaultValue: 'pending'
    });
    await queryInterface.addColumn('Questionnaires', 'reviewedAt', {
      type: Sequelize.DATE,
      allowNull: true
    });
    await queryInterface.addColumn('Questionnaires', 'reviewedBy', {
      type: Sequelize.STRING,
      allowNull: true
    });
    await queryInterface.addColumn('Questionnaires', 'rejectionReason', {
      type: Sequelize.TEXT,
      allowNull: true
    });
  },

  down: async (queryInterface) => {
    await queryInterface.removeColumn('Questionnaires', 'status');
    await queryInterface.removeColumn('Questionnaires', 'reviewedAt');
    await queryInterface.removeColumn('Questionnaires', 'reviewedBy');
    await queryInterface.removeColumn('Questionnaires', 'rejectionReason');
  }
};

