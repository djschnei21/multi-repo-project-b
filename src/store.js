export function createStore(seed = []) {
  const todos = new Map();
  let nextId = 1;

  function add({ title, tags = [] }) {
    const todo = {
      id: nextId++,
      title,
      done: false,
      tags,
      createdAt: new Date().toISOString(),
    };
    todos.set(todo.id, todo);
    return todo;
  }

  for (const item of seed) add(item);

  return {
    list: () => [...todos.values()],
    get: (id) => todos.get(id),
    add,
    update(id, changes) {
      const todo = todos.get(id);
      if (!todo) return undefined;
      Object.assign(todo, changes);
      return todo;
    },
    remove: (id) => todos.delete(id),
  };
}
