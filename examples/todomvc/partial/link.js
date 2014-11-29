module.exports = function link(uri, text, isSelected) {
  return h('li', [
    Router.anchor({
      className: isSelected ? 'selected' : '',
      href: uri
    }, text)
  ]);
}

