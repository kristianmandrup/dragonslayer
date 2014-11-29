module.exports = function statsSection(todos, route, handles) {
  var todosList = objectToArray(todos);
  var todosLeft = todosList.filter(function notComplete(todo) {
    return !todo.completed;
  }).length;
  var todosCompleted = todosList.length - todosLeft;

  return h('footer#footer.footer', {
    hidden: !todosList.length
  }, [
    h('span#todo-count.todo-count', [
      h('strong', String(todosLeft)),
      todosLeft === 1 ? ' item' : ' items',
      ' left'
    ]),
    h('ul#filters.filters', [
      link(ROOT_URI, 'All', route === ROOT_URI),
      link(ACTIVE_URI, 'Active', route === ACTIVE_URI),
      link(COMPLETED_URI, 'Completed',
        route === COMPLETED_URI)
    ]),
    h('button.clear-completed#clear-completed', {
      hidden: todosCompleted === 0,
      'ev-click': hg.event(handles.clearCompleted)
    }, 'Clear completed (' + String(todosCompleted) + ')')
  ]);
}