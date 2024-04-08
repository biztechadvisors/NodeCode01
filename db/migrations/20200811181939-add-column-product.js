'use strict';

module.exports = {
	up: async (queryInterface, Sequelize) => {
		// Check if the 'slug' column already exists in the 'products' table
		const columns = await queryInterface.describeTable('products');
		if ('slug' in columns) {
			console.log('Column "slug" already exists in the table "products". Skipping migration.');
			return Promise.resolve();
		}

		// If the 'slug' column doesn't exist, add it to the 'products' table
		return queryInterface.addColumn('products', 'slug', {
			type: Sequelize.STRING
		});
	},

	down: async (queryInterface, Sequelize) => {
		// Remove the 'slug' column from the 'products' table
		return queryInterface.removeColumn('products', 'slug');
	}
};
