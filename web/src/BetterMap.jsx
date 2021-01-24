class BetterMap extends Map {
  constructor() {
    super()
  }

  set(key, val) {
    super.set(key, val)
    return this
  }
}

export default BetterMap