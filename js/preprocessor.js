/**
 * Created by Yasin Radi <yasin.ben.hamman@gmail.com>
 */
const fs = require('fs')


class Preprocessor {

  constructor(path) {
    this._path  = path
    this._no_translate = this.readFile()
    console.log(this.no_translate)
  }

  get path() {
    return this._path
  }

  set path(path) {
    this._path = path
  }

  get no_translate() {
    return this._no_translate
  }

  set no_translate(no_translate) {
    this._no_translate = no_translate
  }

  /**
   * Reads file content synchronously
   * @returns {Object}
   */
  readFile() {
    return fs.readFileSync(this.path, 'utf-8')
  }

  /**
   * Filter out data that should not be translated
   * @param {string[]} data 
   */
  preProcess(data) {
    return data.filter((l) => !this.no_translate.includes(l.value))
  }
}

module.exports = Preprocessor