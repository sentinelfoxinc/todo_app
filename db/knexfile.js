const path = require('path');
const _ = require('lodash');

require('dotenv').config({
	path: path.resolve(__dirname, '../.env'),
});

module.exports = {
	client: 'mysql2',
	connection: {
		host: process.env.MYSQL_HOST || 'todo.mysql.database.azure.com',
		port: process.env.MYSQL_PORT || 3306,
		user: process.env.MYSQL_USER || 'todo',
		password: process.env.MYSQL_PASSWORD || 'xxxxxxxxx',
		database: process.env.MYSQL_DATABASE || 'todo',
		ssl: { rejectUnauthorized: false }
	},
	useNullAsDefault: true,
	migrations: {
		tableName: 'migrations',
		directory: path.join(__dirname, 'migrations'),
	},
	wrapIdentifier: (value, origImpl) => origImpl(_.snakeCase(value)),
};
