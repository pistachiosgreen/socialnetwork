var Sequelize = require('sequelize');
/*var sequelize = new Sequelize('postgres://sid:check12@localhost:5432/snetwork', {
    dialect: 'postgres',
    dialectOptions: {
        ssl: {
            require: true
        }
    }
});
*/
var sequelize = new Sequelize('postgres://sid:check12@localhost:5432/snetwork',{
	dialect: 'postgres',
	protocol: 'postgres'
});

module.exports = sequelize;
