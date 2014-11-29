'use strict';

var hg          = require('mercury');
var h           = hg.h;
var ds          = require('../../index');
var Router      = ds.lib.util.router;
var document    = require('global/document');

var TodoItem    = require('./todo-item.js');

var actions     = require('./todo-app/actions');
var partials    = require('./partial');
var section     = require('./section');

var ROOT_URI = String(document.location.pathname);
var COMPLETED_URI = ROOT_URI + '/completed';
var ACTIVE_URI = ROOT_URI + '/active';

module.exports = TodoApp;

function TodoApp(opts) {
    opts = opts || {};

    var state = hg.state({
        todos: hg.varhash(opts.todos || {}, TodoItem),
        route: Router(),
        field: hg.struct({
            text: hg.value(opts.field && opts.field.text || '')
        }),
        handles: {
            setTodoField: actions.setTodoField,
            add: actions.add,
            clearCompleted: actions.clearCompleted,
            toggleAll: actions.toggleAll,
            destroy: actions.destroy
        }
    });

    TodoItem.onDestroy.asHash(state.todos, function onDestroy(ev) {
        actions.destroy(state, ev);
    });

    return state;
}

TodoApp.render = function render(state) {
    return h('.todomvc-wrapper', {
        style: { visibility: 'hidden' }
    }, [
        h('link', {
            rel: 'stylesheet',
            href: '/mercury/examples/todomvc/style.css'
        }),
        h('section#todoapp.todoapp', [
            hg.partial(partial.header, state.field, state.handles),
            hg.partial(section.main,
                state.todos, state.route, state.handles),
            hg.partial(section.stats,
                state.todos, state.route, state.handles)
        ]),
        hg.partial(partial.infoFooter)
    ]);
};


