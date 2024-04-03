const close = function (instance, properties, context) {
  const event = new KeyboardEvent('keydown', {
    key: 'Escape',
    code: 'Escape',
    keyCode: 27,
    which: 27,
  });

  document.dispatchEvent(event);
}