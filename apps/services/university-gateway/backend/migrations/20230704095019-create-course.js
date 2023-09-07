'use strict'

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
        queryInterface.createTable(
          'course',
          {
            id: {
              type: Sequelize.UUID,
              primaryKey: true,
              allowNull: false,
              defaultValue: Sequelize.UUIDV4,
            },
            external_id: {
              type: Sequelize.STRING,
              allowNull: false,
            },
            name_is: {
              type: Sequelize.STRING,
              allowNull: false,
            },
            name_en: {
              type: Sequelize.STRING,
              allowNull: false,
            },
            university_id: {
              type: Sequelize.UUID,
              references: {
                model: 'university',
                key: 'id',
              },
              allowNull: false,
            },
            credits: {
              type: Sequelize.INTEGER,
              allowNull: false,
            },
            semester_year: {
              type: Sequelize.INTEGER,
              allowNull: true,
            },
            semester_season: {
              type: Sequelize.ENUM('FALL', 'SPRING', 'SUMMER'),
              allowNull: false,
            },
            description_is: {
              type: Sequelize.STRING(1000),
              allowNull: true,
            },
            description_en: {
              type: Sequelize.STRING(1000),
              allowNull: true,
            },
            external_url_is: {
              type: Sequelize.STRING,
              allowNull: true,
            },
            external_url_en: {
              type: Sequelize.STRING,
              allowNull: true,
            },
            created: {
              type: Sequelize.DATE,
              allowNull: false,
            },
            modified: {
              type: Sequelize.DATE,
              allowNull: false,
            },
          },
          { transaction: t },
        ),
      ])
    })
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
        queryInterface.dropTable('course', { transaction: t }),
      ])
    })
  },
}
