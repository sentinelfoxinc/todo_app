//const newrelic = require('newrelic')
const express = require('express');
const bodyParser = require('body-parser');
var knex = require('./db/connection');
var cors = require('cors');
require('dotenv').config();

const app = express();
const api = express();

api.use(bodyParser.urlencoded({extended: true}));
api.use(bodyParser.json());
api.use(cors({origin: true}));
app.set('view engine', 'ejs');
app.use(express.static('views'));

app.get('/', async (req, res) => {
	res.render('index', {url: `http://localhost:${API_PORT}`});
});

api.get('/api/list', async (req, res) => {
	try {
		let _tasks = [];
		_tasks =
			req.query.done === undefined
				? await knex.select().table('tasks').orderBy('id', 'desc')
				: await knex
						.select()
						.where('is_completed', req.query.done === 'true' ? 1 : 0)
						.orderBy('id', 'desc')
						.table('tasks');
		_tasks = await Promise.all(
			_tasks.map(async (t) => {
				t.users =
					(await knex('assignees').where('task_id', t.id).join('users', 'users.id', '=', 'assignees.user_id')) || [];
				return t;
			}),
		);
		res.json({
			status: 'OK',
			data: _tasks ? _tasks : [],
		});
	} catch (error) {
		res.json({
			status: 'ERROR',
			message: `unable to execute query. ${error}`,
		});
	}
});

api.post('/api/add', async (req, res) => {
	try {
		let data = await knex('tasks').insert({...req.body, is_completed: false});
		res.json({
			status: 'OK',
			message: 'Created Successfully!',
			id: data[0],
		});
	} catch (error) {
		res.json({
			status: 'ERROR',
			message: `unable to execute query. ${error}`,
		});
	}
});

api.post('/api/done', async (req, res) => {
	try {
		await knex('tasks')
			.where('id', req.query.id)
			.update({is_completed: req.query.done === 'true' ? true : false});
		res.json({
			status: 'OK',
			message: 'Updated Successfully!',
		});
	} catch (error) {
		res.json({
			status: 'ERROR',
			message: `unable to execute query. ${error}`,
		});
	}
});

api.delete('/api/clear-all', async (req, res) => {
	await knex('assignees').truncate();
	await knex('tasks').truncate();
	try {
		res.json({
			status: 'OK',
			message: 'Deleted Successfully!',
		});
	} catch (error) {
		res.json({
			status: 'ERROR',
			message: `unable to execute query. ${error}`,
		});
	}
});

api.delete('/api/delete', async (req, res) => {
	try {
		await knex('assignees').where('task_id', req.query.id).del();
		await knex('tasks').where('id', req.query.id).del();
		res.json({
			status: 'OK',
			message: 'Deleted Successfully!',
		});
	} catch (error) {
		res.json({
			status: 'ERROR',
			message: `unable to execute query. ${error}`,
		});
	}
});

api.post('/api/users/add', async (req, res) => {
	try {
		await knex('users').insert({...req.body});
		res.json({
			status: 'OK',
			message: 'Created Successfully!',
		});
	} catch (error) {
		res.json({
			status: 'ERROR',
			message: `unable to execute query. ${error}`,
		});
	}
});

api.get('/api/users/list', async (req, res) => {
	try {
		let _users = await knex.select().table('users');
		res.json({
			status: 'OK',
			data: _users ? _users : [],
		});
	} catch (error) {
		res.json({
			status: 'ERROR',
			message: `unable to execute query. ${error}`,
		});
	}
});

api.delete('/api/users/delete', async (req, res) => {
	try {
		await knex('assignees').where('user_id', req.query.id).del();
		await knex('users').where('id', req.query.id).del();
		res.json({
			status: 'OK',
			message: 'Deleted Successfully!',
		});
	} catch (error) {
		res.json({
			status: 'ERROR',
			message: `unable to execute query. ${error}`,
		});
	}
});

api.post('/api/assign-to', async (req, res) => {
	try {
		await knex('assignees').insert({user_id: req.query.user, task_id: req.query.task});
		res.json({
			status: 'OK',
			message: 'Added Successfully!',
			id,
		});
	} catch (error) {
		res.json({
			status: 'ERROR',
			message: `unable to execute query. ${error}`,
		});
	}
});

api.post('/api/remove-assign', async (req, res) => {
	try {
		await knex('assignees').where('user_id', req.query.user).where('task_id', req.query.task).del();
		res.json({
			status: 'OK',
			message: 'Deleted Successfully!',
		});
	} catch (error) {
		res.json({
			status: 'ERROR',
			message: `unable to execute query. ${error}`,
		});
	}
});

const PORT = process.env.PORT || 3031;
app.listen(PORT, () => console.log(`App Server running at http://localhost:${PORT}`));

const API_PORT = process.env.API_PORT || 4040;
api.listen(API_PORT, () => console.log(`API Server running at http://localhost:${API_PORT}`));
