'use strict';

module.exports = {
	up: async (queryInterface, Sequelize) => {
		// Check if the 'custId' column already exists in the 'Addresses' table
		const columns = await queryInterface.describeTable('Addresses');
		if ('custId' in columns) {
			console.log('Column "custId" already exists in the table "Addresses". Skipping migration.');
			return Promise.resolve();
		}

		// If the 'custId' column doesn't exist, add it to the 'Addresses' table
		return queryInterface.addColumn('Addresses', 'custId', {
			type: Sequelize.INTEGER
		});
	},

	down: async (queryInterface, Sequelize) => {
		// Remove the 'custId' column from the 'Addresses' table
		return queryInterface.removeColumn('Addresses', 'custId');
	}
};
