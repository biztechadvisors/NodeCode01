module.exports = {
  up: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      const columnsBannerDetails = await queryInterface.describeTable('BannerDetails');
      if (!columnsBannerDetails['heading']) {
        await queryInterface.addColumn('BannerDetails', 'heading', {
          type: Sequelize.STRING,
          allowNull: false,
        }, { transaction });
      }
      if (!columnsBannerDetails['content']) {
        await queryInterface.addColumn('BannerDetails', 'content', {
          type: Sequelize.STRING,
          allowNull: false,
        }, { transaction });
      }
      await transaction.commit();
      return Promise.resolve();
    } catch (e) {
      await transaction.rollback();
      return Promise.reject(e);
    }
  },

  down: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      const columnsBannerDetails = await queryInterface.describeTable('BannerDetails');
      if (columnsBannerDetails['heading']) {
        await queryInterface.removeColumn('BannerDetails', 'heading', { transaction });
      }
      if (columnsBannerDetails['content']) {
        await queryInterface.removeColumn('BannerDetails', 'content', { transaction });
      }
      await transaction.commit();
      return Promise.resolve();
    } catch (e) {
      await transaction.rollback();
      return Promise.reject(e);
    }
  },
};
