class BetterMap extends Map {
  constructor() {
    super()
  }

  public set<T>(key: string, val: T) {
    super.set(key, val)

    return this
  }
}

export default BetterMap