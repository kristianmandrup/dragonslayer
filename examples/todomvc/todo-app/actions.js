module.exports = {
  setTodoField: setTodoField,
  add: add,
  clearCompleted: clearCompleted,
  toggleAll: toggleAll,
  destroy: destroy
};

function setTodoField(state, data) {
  state.field.text.set(data.newTodo);
}

function add(state, data) {
  if (data.newTodo.trim() === '') {
    return;
  }

  var todo = TodoItem({
    title: data.newTodo.trim()
  });
  state.todos.put(todo.id(), todo);
  state.field.text.set('');
}

function clearCompleted(state) {
  Object.keys(state.todos).forEach(function clear(key) {
    if (state.todos[key].completed()) {
      destroy(state, state.todos[key]());
    }
  });
}

function toggleAll(state, value) {
  Object.keys(state.todos).forEach(function toggle(key) {
    state.todos[key].completed.set(value.toggle);
  });
}

function destroy(state, opts) {
  state.todos.delete(opts.id);
}