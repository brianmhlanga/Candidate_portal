'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        // 1. Add candidateNumber column
        await queryInterface.addColumn('Users', 'candidateNumber', {
            type: Sequelize.STRING,
            allowNull: true,
            comment: 'Unique candidate identifier (e.g. CAN-1)'
        });

        // 2. Backfill existing users
        // We can't use the model here directly because it might not be loaded or synced
        // So we use raw queries for safety and speed
        const [users] = await queryInterface.sequelize.query(
            `SELECT id FROM Users WHERE role = 'user' ORDER BY createdAt ASC`
        );

        if (users && users.length > 0) {
            console.log(`Backfilling candidate numbers for ${users.length} users...`);

            for (let i = 0; i < users.length; i++) {
                const user = users[i];
                const candidateNumber = `CAN-${i + 1}`;

                await queryInterface.sequelize.query(
                    `UPDATE Users SET candidateNumber = '${candidateNumber}' WHERE id = '${user.id}'`
                );
            }

            console.log('Backfill complete.');
        }
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.removeColumn('Users', 'candidateNumber');
    }
};
