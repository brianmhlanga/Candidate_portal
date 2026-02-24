'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Users', 'role', {
      type: Sequelize.ENUM('user', 'admin'),
      defaultValue: 'user'
    });
    await queryInterface.addColumn('Users', 'approvalStatus', {
      type: Sequelize.ENUM('pending', 'approved', 'rejected'),
      defaultValue: 'pending'
    });
    await queryInterface.addColumn('Users', 'approvedAt', {
      type: Sequelize.DATE,
      allowNull: true
    });
    await queryInterface.addColumn('Users', 'approvedBy', {
      type: Sequelize.STRING,
      allowNull: true
    });
    await queryInterface.addColumn('Users', 'rejectionReason', {
      type: Sequelize.TEXT,
      allowNull: true
    });
  },

  down: async (queryInterface) => {
    await queryInterface.removeColumn('Users', 'role');
    await queryInterface.removeColumn('Users', 'approvalStatus');
    await queryInterface.removeColumn('Users', 'approvedAt');
    await queryInterface.removeColumn('Users', 'approvedBy');
    await queryInterface.removeColumn('Users', 'rejectionReason');
  }
};
