class KeyValueStore {
  constructor (orbitdb, name) {
    this._orbitdb = orbitdb
    this._name = name
    this._store = {}
  }
  async get (key) {
    this._requireLoad()
    return this._db.get(key)
  }

  async set (key, value) {
    this._requireLoad()
    this._db.set(key, value)
    return true
  }

  async remove (key) {
    this._requireLoad()
    this._db.remove(key)
    return true
  }

  async _sync (orbitAddress) {
    this._db = {
      all: () => {
        let allObj = {}
        Object.keys(this._store).map(key => allObj[key] = { timeStamp: 123, value: this._store[key] })
        return allObj
      },
      set: (k, v) => this._store[k] = v,
      get: (k) => this._store[k],
      remove: k => delete this._store[k]
    }
    return orbitAddress
  }

  _requireLoad () {
    if (!this._db) throw new Error('_sync must be called before interacting with the store')
  }

  async close () {
    this._requireLoad()
  }

  get log () {
    // simple mock, order and del ops not retained
    const all = this._db.all()
    return   Object.keys(all).map(key => ({'op': 'PUT', 'key': 'hash', 'value': all[key].value, 'timeStamp': all[key].timeStamp}))
  }
}

module.exports = KeyValueStore
