module.exports = {
  up: async (queryInterface, Sequelize) => {
    try {
      // Check if the column 'Sequence' already exists in the 'Ch_Super_Categories' table
      const columns = await queryInterface.describeTable('Ch_Super_Categories');
      if ('Sequence' in columns) {
        console.log('Column "Sequence" already exists in the table "Ch_Super_Categories".');
      } else {
        // If 'Sequence' does not exist, add it
        await queryInterface.addColumn('Ch_Super_Categories', 'Sequence', {
          type: Sequelize.INTEGER,
          after: "Slug",
        });
      }

      return Promise.resolve();
    } catch (e) {
      return Promise.reject(e);
    }
  },

  down: async (queryInterface, Sequelize) => {
    try {
      // Remove the 'Sequence' column from the 'Ch_Super_Categories' table
      await queryInterface.removeColumn('Ch_Super_Categories', 'Sequence');
      return Promise.resolve();
    } catch (e) {
      return Promise.reject(e);
    }
  }
};
