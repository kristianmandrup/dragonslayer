module.exports = function mainSection(todos, route, handles) {
  var todosList = objectToArray(todos);

  var allCompleted = todosList.every(function isComplete(todo) {
    return todo.completed;
  });
  var visibleTodos = todosList.filter(function isVisible(todo) {
    return route === COMPLETED_URI && todo.completed ||
      route === ACTIVE_URI && !todo.completed ||
      route === ROOT_URI;
  });

  return h('section#main.main', { hidden: !todosList.length }, [
    h('input#toggle-all.toggle-all', {
      type: 'checkbox',
      name: 'toggle',
      checked: allCompleted,
      'ev-change': hg.valueEvent(handles.toggleAll)
    }),
    h('label', { htmlFor: 'toggle-all' }, 'Mark all as complete'),
    h('ul#todo-list.todolist', visibleTodos
      .map(function renderItem(todo) {
        return TodoItem.render(todo, handles);
      }))
  ]);
}

