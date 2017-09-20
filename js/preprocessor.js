/**
 * Created by Yasin Radi <yasin.ben.hamman@gmail.com>
 */
const FileHandler = require('./fileHandler')
const fh = new FileHandler()


class Preprocessor {

  constructor(path) {
    this._path  = path
    this._no_translate = this.readNonTranslate()
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
   * Reads a non translations file
   * @returns {string}
   */
  readNonTranslate() {
    return fh.readFile(this.path).no_translation
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