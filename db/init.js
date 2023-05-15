const initKnex = require('knex');

const knexfile = require('./knexfile');

const knex = initKnex(knexfile);

(async () => {
	try {
		await knex.migrate.latest();
	} catch (error) {
		process.exitCode = 1;

		throw error;
	} finally {
		knex.destroy();
	}
})();
