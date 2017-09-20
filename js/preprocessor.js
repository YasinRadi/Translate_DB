/**
 * Created by Yasin Radi <yasin.ben.hamman@gmail.com>
 */
const fs = require('fs')


class Preprocessor {

  constructor(path) {
    this._path  = path
    this._no_translate = this.readFile()
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
   * @returns {string[]}
   */
  readFile() {
    return JSON.parse(fs.readFileSync(this.path, 'utf-8')).no_translate
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