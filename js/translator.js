/**
 * Created by Yasin Radi <yasin.ben.hamman@gmail.com>
 */
'use strict'

const translate = require('google-translate-api')
const updater   = require('./formUpdater')

class Translator {

  constructor(data, origin, langs, target) {
    this._data = data
    this._langs = langs
    this.langs.splice(0, 0, origin === '' ? 'auto' : origin.toLowerCase())
    this.langs.push(target.toLowerCase())
    updater.setProgressBar(this.langs.length + 1)
  }

  /**
   * Public properties
   */
  get data() {
    return this._data
  }

  set data(data) {
    this._data = data
  }

  get langs() {
    return this._langs
  }

  set langs(langs) {
    this._langs = langs
  }

  /**
   * Translates a data array to the desired language.
   * @returns {Promise}
   */
  async translate() {
    updater.disableTranslateBtn()
    return this.translateTo()
  }

  /**
   * Recursive translation using each language specified, from origin, through mid languages and finishing into target lang.
   * @returns {Promise|String[]}
   */
  async translateTo() {
    this.lang = {from: this.langs[0], to: this.langs[1]}
    this.data = await this.translateStd()
    this.langs.shift()
    return this.langs.length <= 1
      ? Promise.resolve(this.data)
      : this.translateTo()
  }

  /**
   * Translate in a regular way
   * @returns {Promise}
   */
  translateStd(lang){
    let promises = []

    updater.setTranslatingTextNumbers(this.lang.to, this.data.length)
    updater.updateProgressBar()
    
    for (const d of this.data) {
      let _id = d.id
      promises.push(
        new Promise((rs, rj) => {
          translate(d.value, this.lang).then(res => {
            rs({id: _id, value: res.text})
            rj('Error while translating.')
          })
        })
      )
    }

    return Promise.all(promises)
  }
}

module.exports = Translator