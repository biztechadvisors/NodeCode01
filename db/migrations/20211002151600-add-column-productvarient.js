module.exports = {
  up: async (queryInterface, Sequelize) => {
    try {
      // Check if the column 'slug' already exists in the 'ProductVariants' table
      const columns = await queryInterface.describeTable('ProductVariants');
      if ('slug' in columns) {
        console.log('Column "slug" already exists in the table "ProductVariants".');
      } else {
        // If 'slug' does not exist, add it
        await queryInterface.addColumn('ProductVariants', 'slug', {
          type: Sequelize.STRING,
          after: "productName",
        });
      }

      return Promise.resolve();
    } catch (e) {
      return Promise.reject(e);
    }
  },

  down: async (queryInterface, Sequelize) => {
    try {
      // Remove the 'slug' column from the 'ProductVariants' table
      await queryInterface.removeColumn('ProductVariants', 'slug');
      return Promise.resolve();
    } catch (e) {
      return Promise.reject(e);
    }
  }
};
