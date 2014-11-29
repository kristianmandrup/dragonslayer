module.exports = function infoFooter() {
  return h('footer#info.info', [
    h('p', 'Double-click to edit a todo'),
    h('p', [
      'Written by ',
      h('a', { href: 'https://github.com/Raynos' }, 'Raynos')
    ]),
    h('p', [
      'Part of ',
      h('a', { href: 'http://todomvc.com' }, 'TodoMVC')
    ])
  ]);
}