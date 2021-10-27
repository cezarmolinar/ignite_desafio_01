const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  const user = users.find(
    (user) => user.username === username
  );

  if (!user) {
    return response.status(404).json({ error: "User not found!" });
  }

  request.user = user;

  return next();
}

function checksExistsTodo(request, response, next) {
  const { id } = request.params;

  const { user } = request;

  const todo = user.todos.find(
    (todo) => todo.id === id
  );

  if (!todo) {
    return response.status(404).json({ error: "TODO not found!" });
  }

  request.todo = todo;

  return next();
}

app.post('/users', (request, response) => {
  const { name, username } = request.body;

  const userAlreadyExists = users.some(
    (user) => user.username === username
  );

  if (userAlreadyExists) {
    return response.status(400).json({ error: "User already exists!" });
  }

  users.push({
    id: uuidv4(),
    name,
    username,
    todos: []
  });

  return response.status(201).json(users[users.length - 1]);
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request;

  return response.status(200).json(user.todos);
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request;

  const { title, deadline } = request.body;

  user.todos.push({
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date()
  });

  return response.status(201).json(user.todos[user.todos.length - 1]);
});

app.put('/todos/:id', checksExistsUserAccount, checksExistsTodo, (request, response) => {
  const { todo } = request;

  const { title, deadline } = request.body;

  todo.title = title;

  todo.deadline = new Date(deadline);

  return response.status(201).json(todo);
});

app.patch('/todos/:id/done', checksExistsUserAccount, checksExistsTodo, (request, response) => {
  const { todo } = request;

  todo.done = true;

  return response.status(201).json(todo);
});

app.delete('/todos/:id', checksExistsUserAccount, checksExistsTodo, (request, response) => {
  const { user } = request;
  /*  const { todo } = request;
    const user_todo = user.todos;
    user_todo.splice(todo, 1);*/
  const { id } = request.params;

  const todoIndex = user.todos.findIndex((todo) => todo.id === id);

  if (todoIndex === -1) {
    return response.status(404).json({ erro: 'TODO not found' });
  }

  user.todos.splice(todoIndex, 1);

  return response.status(204).send();

});

module.exports = app;