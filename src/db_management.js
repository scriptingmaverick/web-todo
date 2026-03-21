export const createTodoEntry = (db, data) => {
  const query = `INSERT INTO todos(title, id, username) VALUES(?, ?, ?);`;

  db.prepare(query).run(data.title, data.id, data.username);
  return getData(db, "todos", data);
};

export const removeEntry = (db, { id }, tableName) => {
  const query = `DELETE FROM ${tableName} WHERE id=?;`;
  db.prepare(query).run(id);
};

export const updateTitle = (db, { id, newTitle }, tableName) => {
  const query = `UPDATE ${tableName} SET title=? WHERE id=?;`;
  db.prepare(query).run(newTitle, id);
};

export const createTaskEntry = (db, data) => {
  const query = "INSERT INTO tasks(title, id, todo_id) VALUES(?, ?, ?);";
  db.prepare(query).run(data.title, data.id, data.todoId);
  return getData(db, "tasks", data);
};

export const updateStatus = (db, { id, todoId }) => {
  const query = `UPDATE tasks SET status=NOT status WHERE id=? AND todo_id=?;`;
  db.prepare(query).run(id, todoId);
};

export const getTodos = (db, { username }) => {
  const query = "SELECT * FROM todos WHERE username=?;";
  return db.prepare(query).all(username);
};

export const getTasks = (db, { todoId }) => {
  const query = "SELECT * FROM tasks WHERE todo_id=?;";
  return db.prepare(query).all(todoId);
};

// User DB Management

export const saveSession = (db, { sessionId, username }) => {
  const query = "INSERT INTO sessions(id, username) VALUES(?, ?);";
  db.prepare(query).run(sessionId, username);
};

export const saveUser = (db, { id, username }) => {
  const query = "INSERT INTO users(id, username) VALUES(?, ?);";
  db.prepare(query).run(id, username);
};

export const isUserExists = (db, { username }) => {
  const query = "SELECT * FROM users WHERE username=?;";
  return db.prepare(query).get(username);
};

export const removeSession = (db, { sessionId }) => {
  const query = "UPDATE sessions SET is_active=NOT is_active WHERE id=?;";
  db.prepare(query).run(sessionId);
};

export const isSessionActive = (db, sessionId) => {
  const query = "SELECT is_active FROM sessions WHERE id=?;";
  const { is_active } = db.prepare(query).get(sessionId);
  return is_active;
};

export const createId = (db, type, title) => {
  if (!title) return;

  let randomId = getRandomId(`yxy`);
  if (type === "todo") {
    randomId = getRandomId("xyx");
  }

  const mergedId = `${title}-${randomId}`;

  if (isNotInDB(db, mergedId, `${type}s`)) return mergedId;

  return createId(db, type, title);
};

export const getRandomId = (template = `xyxy`) =>
  template
    .split("")
    .map((ch) => (ch === "x" ? randomBtw(0, 5) : randomBtw(5, 9)))
    .join("");

export const randomBtw = (min, max) =>
  Math.round(Math.random() * (max - min)) + min;

export const isNotInDB = (db, id, tableName) => {
  const query = `SELECT * FROM ${tableName} WHERE id=?;`;
  const data = db.prepare(query).all(id);

  return data.length === 0;
};

export const getData = (db, tableName, { id }) =>
  db.prepare(`SELECT * FROM ${tableName} WHERE id=?;`).get(id);

export const initialize = (db) => {
  db.exec(`
    CREATE TABLE IF NOT EXISTS todos(
    username text,
    id text,
    title text
    );

    CREATE TABLE IF NOT EXISTS tasks(
    id text,
    todo_id text,
    title text,
    status INTEGER DEFAULT 0 CHECK (status in (0,1))
    );

    CREATE TABLE IF NOT EXISTS users(
    id text,
    username text
    );

    CREATE TABLE IF NOT EXISTS sessions(
    id text,
    is_active INTEGER DEFAULT 1 CHECK (is_active in (0,1)),
    username text
    );
    `);
};
