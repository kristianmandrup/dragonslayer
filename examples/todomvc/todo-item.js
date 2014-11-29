'use strict';

var hg = require('../../index.js');
var h = require('../../index.js').h;
var cuid = require('cuid');
var WeakmapEvent = require('../lib/weakmap-event.js');

var FocusHook = require('../lib/focus-hook.js');

var DestroyEvent = WeakmapEvent();
var ESCAPE = 27;

TodoItem.onDestroy = DestroyEvent.listen;

var actions = require('./todo-item').actions;

module.exports = TodoItem;

function TodoItem(item) {
    item = item || {};

    return hg.state({
        id: hg.value(item.id || cuid()),
        title: hg.value(item.title || ''),
        editing: hg.value(item.editing || false),
        completed: hg.value(item.completed || false),
        handles: {
            toggle: toggle,
            startEdit: startEdit,
            cancelEdit: cancelEdit,
            finishEdit: finishEdit
        }
    });
}

var sneakyGlobal = {};

TodoItem.render = function render(todo, parentHandles) {
    var className = (todo.completed ? 'completed ' : '') +
        (todo.editing ? 'editing' : '');

    sneakyGlobal[todo.id] = todo;

    return h('li', { className: className, key: todo.id }, [
        h('.view', [
            h('input.toggle', {
                type: 'checkbox',
                checked: todo.completed,
                'ev-change': hg.event(todo.handles.toggle, {
                    completed: !todo.completed
                })
            }),
            h('label', {
                'ev-dblclick': hg.event(todo.handles.startEdit)
            }, todo.title),
            h('button.destroy', {
                'ev-click': hg.event(parentHandles.destroy, {
                    id: todo.id
                })
            })
        ]),
        h('input.edit', {
            value: todo.title,
            name: 'title',
            // when we need an RPC invocation we add a
            // custom mutable operation into the tree to be
            // invoked at patch time
            'ev-focus': todo.editing ? FocusHook() : null,
            'ev-keydown': hg.keyEvent(
                todo.handles.cancelEdit, ESCAPE),
            'ev-event': hg.submitEvent(todo.handles.finishEdit),
            'ev-blur': hg.valueEvent(todo.handles.finishEdit)
        })
    ]);

};
