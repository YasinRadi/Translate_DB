/**
 * Created by Yasin Radi <yasin.ben.hamman@gmail.com>
 */
'use strict'

const translate = require('google-translate-api')
const updater   = require('./formUpdater')

class Translator {

  constructor(data, origin, target) {
    this._data = data
    this._lang = { to: target }
    if (origin) this._lang.from = origin
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

  get lang() {
    return this._lang
  }

  set lang(lang) {
    this._lang = lang
  }

  /**
   * Translates a data array to the desired language.
   * @returns {Promise}
   */
  translate() {
    let result = []
    let promise = Promise.resolve()

    updater.setProgressBar(this.data.length)
    updater.setTranslatingText()
    updater.enableDisableTranslateBtn()
    
    let i = 1
    for (const d of this.data) {
      promise = promise.then(() => translate(d.value, this.lang))
        .then(res => {
          result.push({ id: d.id, value: res.text })
          updater.setTranslatingTextNumbers(i, this.data.length)
          updater.updateProgressBar()
          i++
        })
    }

    return promise.then(() => result)
  }
}

module.exports = Translator