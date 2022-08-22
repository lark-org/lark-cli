/* eslint-disable */
if (!window.requestAnimationFrame) {
  var lastTime = 0
  var vendors = ['webkit', 'moz']

  for (var x = 0; x < vendors.length; x += 1) {
    window.requestAnimationFrame = window[vendors[x] + 'RequestAnimationFrame']
    window.cancelAnimationFrame =
      window[vendors[x] + 'CancelAnimationFrame'] ||
      window[vendors[x] + 'CancelRequestAnimationFrame']
  }

  if (!window.requestAnimationFrame) {
    window.requestAnimationFrame = function (callback) {
      var currTime = new Date().getTime()
      var timeToCall = Math.max(0, 16 - (currTime - lastTime))
      lastTime = currTime + timeToCall
      return window.setTimeout(function () {
        return callback(currTime + timeToCall)
      }, timeToCall)
    }
  }

  if (!window.cancelAnimationFrame) {
    window.cancelAnimationFrame = window.clearTimeout
  }
}
