'use strict';
const bcrypt = require('bcrypt');

module.exports = {
  async up (queryInterface, Sequelize) {
    const hashedPassword = await bcrypt.hash('123456', 10);
    await queryInterface.bulkInsert('users', [
      {
        nombre: 'Matias Franco',
        correo: 'm@gmail.com',
        token: null,
        password: hashedPassword,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        nombre: 'Luis David',
        correo: 'l@gmail.com',
        token: null,
        password: hashedPassword,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ], {});
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('users', null, {});
  }
};
