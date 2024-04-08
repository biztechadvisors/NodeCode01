module.exports = {
  up: async (queryInterface, Sequelize) => {
    try {
      // Check if the column 'networkType' already exists in the 'ProductVariant' table
      const columns = await queryInterface.describeTable('ProductVariant');
      if ('networkType' in columns) {
        console.log('Column "networkType" already exists in the table "ProductVariant".');
      } else {
        // If 'networkType' does not exist, add it
        await queryInterface.addColumn("ProductVariant", "networkType", {
          type: Sequelize.STRING, // Adjust the data type as needed
          allowNull: true, // Modify options as required
          after: "status", // Specify the column after which 'networkType' should be added
        });
      }

      return Promise.resolve();
    } catch (e) {
      return Promise.reject(e);
    }
  },

  down: async (queryInterface, Sequelize) => {
    try {
      // Remove the 'networkType' column from the 'ProductVariant' table
      await queryInterface.removeColumn("ProductVariant", "networkType");
      return Promise.resolve();
    } catch (e) {
      return Promise.reject(e);
    }
  },
};
