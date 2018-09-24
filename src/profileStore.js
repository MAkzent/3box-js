class ProfileStore {
  /**
   * Please use **threeBox.profileStore** to get the instance of this class
   */
  constructor (ipfs, updateRoot) {
    this.ipfs = ipfs
    this.updateRoot = updateRoot
    this.profile = null
  }

  /**
   * Get the value of the given key
   *
   * @param     {String}    key                     the key
   * @return    {String}                            the value associated with the key
   */
  async get (key) {
    if (!this.profile) throw new Error('This user has no public profile yet')
    return this.profile[key]
  }

  /**
   * Set a value for the given key
   *
   * @param     {String}    key                     the key
   * @param     {String}    value                   the value
   * @return    {Boolean}                           true if successful
   */
  async set (key, value) {
    if (!this.profile) throw new Error('_sync must be called before interacting with the store')

    this.profile[key] = value

    return this._uploadProfile()
  }

  /**
   * Remove the value for the given key
   *
   * @param     {String}    key                     the key
   * @return    {Boolean}                           true if successful
   */
  async remove (key) {
    if (!this.profile) throw new Error('_sync must be called before interacting with the store')

    delete this.profile[key]

    return this._uploadProfile()
  }

  async _uploadProfile () {
    const profile = JSON.stringify(this.profile)
    let dagNode
    try {
      dagNode = await this.ipfs.object.put(Buffer.from(profile))
    } catch (e) {
      throw new Error(e)
    }
    return this.updateRoot(dagNode.toJSON().multihash)
  }

  async _sync (hash) {
    if (hash) {
      // download profile from ipfs
      try {
        const dagNode = await this.ipfs.object.get(hash, { recursive: false })
        this.profile = JSON.parse(Buffer.from(dagNode.data).toString())
      } catch (err) {
        throw new Error(err)
      }
    } else {
      this.profile = {}
    }
  }

  async close () {
  }
}

module.exports = ProfileStore
