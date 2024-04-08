module.exports = {
  up: async (queryInterface, Sequelize) => {
    try {
      // Check if the column 'role' already exists in the 'customers' table
      const columns = await queryInterface.describeTable('customers');
      if ('role' in columns) {
        console.log('Column "role" already exists in the table "customers".');
      } else {
        // If 'role' does not exist, add it
        await queryInterface.addColumn("customers", "role", {
          type: Sequelize.ENUM,
          values: ["0", "1"],
          comment: "0 (ecomm), 1 (salon)",
          defaultValue: "0",
          after: "email",
        });
      }

      return Promise.resolve();
    } catch (e) {
      return Promise.reject(e);
    }
  },

  down: async (queryInterface, Sequelize) => {
    try {
      // Remove the 'role' column from the 'customers' table
      await queryInterface.removeColumn("customers", "role");
      return Promise.resolve();
    } catch (e) {
      return Promise.reject(e);
    }
  },
};
