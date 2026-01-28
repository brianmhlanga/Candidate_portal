'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Add professional summary and AI-generated questions columns
    return queryInterface.sequelize.transaction(async (t) => {
      // Check if columns already exist
      const tableInfo = await queryInterface.describeTable('Users', { transaction: t });

      const columnsToAdd = [];
      
      if (!tableInfo.professionalSummary) {
        columnsToAdd.push(
          queryInterface.addColumn('Users', 'professionalSummary', {
            type: Sequelize.TEXT,
            allowNull: true
          }, { transaction: t })
        );
      }
      
      if (!tableInfo.aiGeneratedQuestions) {
        columnsToAdd.push(
          queryInterface.addColumn('Users', 'aiGeneratedQuestions', {
            type: Sequelize.TEXT,
            allowNull: true,
            comment: 'JSON array of questions generated based on professional summary'
          }, { transaction: t })
        );
      }

      return Promise.all(columnsToAdd);
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Remove the added columns
    return queryInterface.sequelize.transaction(async (t) => {
      return Promise.all([
        queryInterface.removeColumn('Users', 'professionalSummary', { transaction: t }),
        queryInterface.removeColumn('Users', 'aiGeneratedQuestions', { transaction: t })
      ]);
    });
  }
};
