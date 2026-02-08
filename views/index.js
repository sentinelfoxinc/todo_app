const ToDo = ({task, onDelete, onComplete, isCompleted, viewUsers, users, removerUser}) => {
	return (
		<li class="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
			<div>
				<input
					type="checkbox"
					class="mr-2"
					onClick={(e) => onComplete(e.target.checked)}
					checked={isCompleted === true || isCompleted === 1}
				/>
				<span className={`${isCompleted === true || isCompleted === 1 ? 'line-through' : ''}`}>{task}</span>
			</div>
			<div className="flex items-center space-x-2">
				<ul className="flex items-center space-x-1">
					{users.map((u) => (
						<li className="px-1 bg-gray-300 rounded inline-flex items-center">
							{u.name}
							<span className="cursor-pointer" onClick={() => removerUser(u)}>
								<svg
									xmlns="http://www.w3.org/2000/svg"
									fill="none"
									viewBox="0 0 24 24"
									stroke-width="1.5"
									stroke="currentColor"
									class="ml-1.5 w-4 h-4"
								>
									<path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
								</svg>
							</span>
						</li>
					))}
				</ul>
				<button class="text-gray-400 hover:text-green-700" onClick={viewUsers}>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						fill="none"
						viewBox="0 0 24 24"
						stroke-width="1.5"
						stroke="currentColor"
						class="w-5 h-5"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							d="M19 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM4 19.235v-.11a6.375 6.375 0 0112.75 0v.109A12.318 12.318 0 0110.374 21c-2.331 0-4.512-.645-6.374-1.766z"
						/>
					</svg>
				</button>
				<button class="text-gray-400 hover:text-green-700" onClick={onDelete}>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						fill="none"
						viewBox="0 0 24 24"
						stroke-width="1.5"
						stroke="currentColor"
						class="w-5 h-5"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
						/>
					</svg>
				</button>
			</div>
		</li>
	);
};

class Users extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			new_user: '',
			users: [],
		};
	}

	componentDidMount() {
		api.get('/users/list').then((l) => {
			if (l.data.status === 'OK') {
				this.setState({users: l.data.data || []});
			}
		});
	}

	addUser(e) {
		e.preventDefault();
		if (this.state.new_user !== '') {
			api
				.post('/users/add', {
					name: this.state.new_user,
				})
				.then((l) => {
					this.setState({
						users: [...this.state.users, {id: l.data.id, name: this.state.new_user}],
						new_user: '',
					});
				});
		}
	}

	onDelete(id) {
		api.delete('/users/delete?id=' + id).then((l) => {
			this.setState({users: this.state.users.filter((u) => u.id !== id)});
			this.props.onDeleteUser();
		});
	}

	render() {
		let {view, close, onUserSelect} = this.props;
		return view ? (
			<div className="absolute top-0 left-0 h-screen min-h-[900px] w-full z-40 bg-black/30 flex items-center justify-center">
				<div className="flex flex-col space-y-2 w-[350px] h-[450px] bg-white shadow-xl rounded p-2 z-50">
					<div className="flex items-center justify-between pb-2 ">
						<span className="text-lg px-1 font-bold">Users</span>
						<span onClick={close} className="cursor-pointer hover:underline text-gray-400">
							close
						</span>
					</div>
					<form className="flex items-center space-x-2" onSubmit={this.addUser.bind(this)}>
						<input
							type="text"
							onChange={(e) => this.setState({new_user: e.target.value})}
							value={this.state.new_user}
							placeholder="Add User"
							className="border broder-gray-600 focus:ring-[2px] focus:ring-green-700 px-3 py-1.5 rounded shadow w-full outline-none focus:outline-none"
						/>
						<button
							type="submit"
							className="bg-green-700 hover:bg-green-600 text-white px-6 py-1.5 rounded shadow h-full"
						>
							Add
						</button>
					</form>
					<ul class="relative w-full h-full border border-gray-300 overflow-none overflow-y-auto rounded">
						{this.state.users.map((u) => (
							<li className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
								<span className="hover:underline cursor-pointer" onClick={() => onUserSelect(u)}>
									{u.name}
								</span>
								<button class="text-gray-400 hover:text-green-700" onClick={this.onDelete.bind(this, u.id)}>
									<svg
										xmlns="http://www.w3.org/2000/svg"
										fill="none"
										viewBox="0 0 24 24"
										stroke-width="1.5"
										stroke="currentColor"
										class="w-5 h-5"
									>
										<path
											stroke-linecap="round"
											stroke-linejoin="round"
											d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
										/>
									</svg>
								</button>
							</li>
						))}
					</ul>
				</div>
			</div>
		) : (
			''
		);
	}
}

class App extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			menu: 'all',
			new_todo: '',
			todo: [],
			view_users: false,
			select_user: false,
			error: false,
		};

		this.onComplete.bind(this);
		this.onDelete.bind(this);
		this.changeMenu.bind(this);
	}

	componentDidMount() {
		api.get('/list').then((l) => {
			if (l.data.status === 'OK') {
				this.setState({todo: l.data.data || []});
			} else {
				this.setState({error: true});
			}
		});
	}

	addTodo(e) {
		e.preventDefault();
		if (this.state.new_todo !== '') {
			api
				.post('/add', {
					task: this.state.new_todo,
				})
				.then((l) => {
					console.log(l.data);
					this.setState({
						todo: [{id: l.data.id, task: this.state.new_todo, is_completed: false, users: []}, ...this.state.todo],
						new_todo: '',
					});
				});
		}
	}

	onComplete(t, checked) {
		api.post('/done/?id=' + t.id + '&done=' + checked).then(() => {
			this.setState({
				todo: this.state.todo.map((td) => {
					if (td.id === t.id) {
						td.is_completed = checked;
					}
					return td;
				}),
			});
		});
	}

	onDelete(t) {
		api.delete('/delete?id=' + t.id).then((l) => {
			this.setState({todo: this.state.todo.filter((td) => td.id !== t.id)});
		});
	}

	clearAll() {
		api.delete('/clear-all').then((l) => {
			this.setState({todo: []});
		});
	}

	changeMenu(menu) {
		this.setState({menu});
		api.get(menu === 'all' ? '/list' : `/list?done=${menu === 'done' ? true : false}`).then((l) => {
			this.setState({todo: l.data.data || []});
		});
	}

	onUserSelect(user) {
		if (
			this.state.select_user !== false &&
			this.state.todo.find((t) => t.id === this.state.select_user).users.find((u) => u.id === user.id) === undefined
		) {
			api.post('/assign-to/?task=' + this.state.select_user + '&user=' + user.id).then((l) => {
				this.setState({
					todo: this.state.todo.map((t) => {
						if (t.id === this.state.select_user) {
							t.users = [...t.users, user];
						}
						return t;
					}),
					view_users: false,
					select_user: false,
				});
			});
		} else {
			this.setState({
				view_users: false,
				select_user: false,
			});
		}
	}

	removerUser(id, user) {
		api.post('/remove-assign/?task=' + id + '&user=' + user.user_id).then(() => {
			this.setState({
				todo: this.state.todo.map((t) => {
					if (t.id === id) {
						t.users = t.users.filter((u) => u.user_id !== user.user_id);
					}
					return t;
				}),
			});
		});
	}

	render() {
		return (
			<div className="py-32 flex flex-col items-center justify-between h-full w-full">
				<Users
					view={this.state.view_users}
					close={() => this.setState({view_users: false, select_user: false})}
					onUserSelect={this.onUserSelect.bind(this)}
					onDeleteUser={() => this.changeMenu(this.state.menu)}
				/>
				<div className="flex flex-col w-[550px] h-full bg-white shadow-lg shadow-green-900 rounded mx-auto p-2 space-y-4">
					{this.state.error ? (
						<div className="w-full h-full inline-flex items-center justify-center">Waiting for Database...</div>
					) : (
						<>
							<form className="flex items-center space-x-2" onSubmit={this.addTodo.bind(this)}>
								<input
									type="text"
									onChange={(e) => this.setState({new_todo: e.target.value})}
									value={this.state.new_todo}
									placeholder="Add to ToDo"
									className="border broder-gray-600 focus:ring-[2px] focus:ring-green-700 px-3 py-1.5 rounded shadow w-full outline-none focus:outline-none"
								/>
								<button
									type="submit"
									className="bg-green-700 hover:bg-green-600 text-white px-6 py-1.5 rounded shadow h-full"
								>
									Add
								</button>
							</form>
							<div class="flex items-center justify-between pb-4 border-b border-gray-200">
								<ul class="flex items-center space-x-6">
									<li
										class={`px-2 py-1 cursor-pointer border-b-2 ${
											this.state.menu === 'all' ? 'border-green-700' : 'border-white'
										} text-gray-600`}
										onClick={() => this.changeMenu('all')}
									>
										All
									</li>
									<li
										class={`px-2 py-1 cursor-pointer border-b-2 ${
											this.state.menu === 'todo' ? 'border-green-700' : 'border-white'
										} text-gray-600`}
										onClick={() => this.changeMenu('todo')}
									>
										ToDo
									</li>
									<li
										class={`px-2 py-1 cursor-pointer border-b-2 ${
											this.state.menu === 'done' ? 'border-green-700' : 'border-white'
										} text-gray-600`}
										onClick={() => this.changeMenu('done')}
									>
										Completed
									</li>
								</ul>
								<div className="flex items-center space-x-2">
									<button onClick={this.clearAll.bind(this)} class="text-green-700 mx-4 text-sm hover:underline">
										Clear All
									</button>
									<button
										onClick={() => this.setState({view_users: true})}
										class="bg-green-700 hover:bg-green-600 text-white px-6 py-1.5 rounded shadow h-full shrink-0"
									>
										Users
									</button>
								</div>
							</div>
							<ul class="w-full h-full border border-gray-300 overflow-none overflow-y-auto rounded">
								{this.state.todo.map((t) => (
									<ToDo
										task={t.task}
										isCompleted={t.is_completed}
										viewUsers={() => this.setState({view_users: true, select_user: t.id})}
										users={t.users}
										removerUser={this.removerUser.bind(this, t.id)}
										onDelete={() => this.onDelete(t)}
										onComplete={(checked) => this.onComplete(t, checked)}
									/>
								))}
							</ul>
						</>
					)}
				</div>
			</div>
		);
	}
}

ReactDOM.render(<App />, document.getElementById('root'));
