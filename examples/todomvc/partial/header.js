module.exports = function header(field, handles) {
  return h('header#header.header', {
    'ev-event': [
      hg.changeEvent(handles.setTodoField),
      hg.submitEvent(handles.add)
    ]
  }, [
    h('h1', 'Todos'),
    h('input#new-todo.new-todo', {
      placeholder: 'What needs to be done?',
      autofocus: true,
      value: field.text,
      name: 'newTodo'
    })
  ]);
}