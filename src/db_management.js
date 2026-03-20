export const createTodoEntry = (db, data) => {
  const query = `INSERT INTO todos(title, id, user_id) VALUES(?, ?, ?);`;
  db.prepare(query).run(data.title, data.id, data.userId);
  return getData(db, "todos", data);
};

export const createTaskEntry = (db, data) => {
  const query = "INSERT INTO tasks(title, id, todo_id) VALUES(?, ?, ?);";
  db.prepare(query).run(data.title, data.id, data.todoId);
  return getData(db, "tasks", data);
};

export const updateStatus = (db, { id, todoId }) => {
  const query = `UPDATE tasks SET status=NOT status WHERE id=? and todo_id=?;`;
  db.prepare(query).run(id, todoId);
};

export const createId = (db, type, title) => {
  if (!title) return;

  let randomId = getRandomId(`yxy`);
  if (type === "todo") {
    randomId = getRandomId("xyx");
  }

  const mergedId = `${title}-${randomId}`;

  if (isInDB(db, mergedId, "todos")) return mergedId;

  return createId(db, "todo", title);
};

export const getRandomId = (template = `xyxy`) =>
  template
    .split("")
    .map((ch) => (ch === "x" ? randomBtw(0, 5) : randomBtw(5, 9)))
    .join("");

export const randomBtw = (min, max) =>
  Math.round(Math.random() * (max - min)) + min;

export const isInDB = (db, id, tableName) => {
  const query = `SELECT * FROM ${tableName} WHERE id=?;`;
  const data = db.prepare(query).all(id);

  return data.length === 0;
};

export const getData = (db, tableName, { id }) =>
  db.prepare(`SELECT * FROM ${tableName} WHERE id=?;`).get(id);

export const initialize = (db) => {
  db.exec(`
    CREATE TABLE IF NOT EXISTS todos(
    user_id text,
    id text,
    title text
    );

    CREATE TABLE IF NOT EXISTS tasks(
    id text,
    todo_id text,
    title text,
    status DEFAULT 0 CHECK (status in (0,1))
    );
    `);
};
