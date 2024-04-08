module.exports = {
  up: async (queryInterface, Sequelize) => {
    try {
      // Check if the column 'DiscountPer' already exists in the 'ch_brand_details' table
      const columns = await queryInterface.describeTable('ch_brand_details');
      if ('DiscountPer' in columns) {
        console.log('Column "DiscountPer" already exists in the table "ch_brand_details".');
      } else {
        // If 'DiscountPer' does not exist, add it
        await queryInterface.addColumn('ch_brand_details', 'DiscountPer', {
          type: Sequelize.INTEGER,
          after: "status",
        });
      }

      return Promise.resolve();
    } catch (e) {
      return Promise.reject(e);
    }
  },

  down: async (queryInterface, Sequelize) => {
    try {
      // Remove the 'DiscountPer' column from the 'ch_brand_details' table
      await queryInterface.removeColumn('ch_brand_details', 'DiscountPer');
      return Promise.resolve();
    } catch (e) {
      return Promise.reject(e);
    }
  }
};
