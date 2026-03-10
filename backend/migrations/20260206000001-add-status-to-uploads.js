'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Uploads', 'status', {
      type: Sequelize.ENUM('pending', 'approved', 'rejected'),
      defaultValue: 'pending'
    });
    await queryInterface.addColumn('Uploads', 'reviewedAt', {
      type: Sequelize.DATE,
      allowNull: true
    });
    await queryInterface.addColumn('Uploads', 'reviewedBy', {
      type: Sequelize.STRING,
      allowNull: true
    });
    await queryInterface.addColumn('Uploads', 'rejectionReason', {
      type: Sequelize.TEXT,
      allowNull: true
    });
  },

  down: async (queryInterface) => {
    await queryInterface.removeColumn('Uploads', 'status');
    await queryInterface.removeColumn('Uploads', 'reviewedAt');
    await queryInterface.removeColumn('Uploads', 'reviewedBy');
    await queryInterface.removeColumn('Uploads', 'rejectionReason');
  }
};

