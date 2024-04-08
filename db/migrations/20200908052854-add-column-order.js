'use strict';

module.exports = {
	up: async (queryInterface, Sequelize) => {
		// Check if the 'deliverydate' column already exists in the 'Orders' table
		const columns = await queryInterface.describeTable('Orders');
		if ('deliverydate' in columns) {
			console.log('Column "deliverydate" already exists in the table "Orders". Skipping migration.');
			return Promise.resolve();
		}

		// If the 'deliverydate' column doesn't exist, add it to the 'Orders' table
		return queryInterface.addColumn('Orders', 'deliverydate', {
			type: Sequelize.DATE
		});
	},

	down: async (queryInterface, Sequelize) => {
		// Remove the 'deliverydate' column from the 'Orders' table
		return queryInterface.removeColumn('Orders', 'deliverydate');
	}
};
