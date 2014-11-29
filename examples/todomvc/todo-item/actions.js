module.exports = {
  toggle: toggle,
  startEdit: startEdit,
  finishEdit: finishEdit,
  cancelEdit: cancelEdit
};

function toggle(state, data) {
  state.completed.set(data.completed);
}

function startEdit(state) {
  state.editing.set(true);
}

function finishEdit(state, data) {
  if (state.editing() === false) {
    return;
  }

  state.editing.set(false);
  state.title.set(data.title);

  if (data.title.trim() === '') {
    DestroyEvent.broadcast(state, {
      id: state.id()
    });
  }
}

function cancelEdit(state) {
  state.editing.set(false);
}