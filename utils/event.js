function MyEvent() {
  this.on = function (event, fn, ctx) {
    if (typeof fn != "function") {
      console.error('fn must be a function')
      return
    }

    this._stores = this._stores || {}

      ; (this._stores[event] = this._stores[event] || []).push({ cb: fn, ctx: ctx })
  }
  this.emit = function (event) {
    this._stores = this._stores || {}
    var store = this._stores[event], args
    if (store) {
      store = store.slice(0)
      args = [].slice.call(arguments, 1)
      for (var i = 0, len = store.length; i < len; i++) {
        store[i].cb.apply(store[i].ctx, args)
      }
    }
  }
  this.off = function (event, fn) {
    this._stores = this._stores || {}
    // all
    if (!arguments.length) {
      this._stores = {}
      return
    }
    // specific event
    var store = this._stores[event]
    if (!store) return
    // remove all handlers
    if (arguments.length === 1) {
      delete this._stores[event]
      return
    }
    // remove specific handler
    var cb
    for (var i = 0, len = store.length; i < len; i++) {
      cb = store[i].cb
      if (cb === fn) {
        store.splice(i, 1)
        break
      }
    }
    return
  }
}

module.exports = MyEvent;