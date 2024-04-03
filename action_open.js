const open = function (instance, properties, context) {
  const event = new KeyboardEvent('keydown', {
    key: 'k',
    code: 'KeyK',
    keyCode: 75,
    which: 75,
    metaKey: true,
  });
  document.dispatchEvent(event);
}