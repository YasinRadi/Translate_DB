/**
 * Created by Yasin Radi <yasin.ben.hamman@gmail.com>
 */
'use strict'

const FileHandler = require('./fileHandler')
const FormUpdater = require('./formUpdater')
const fh = new FileHandler()


class Preprocessor {

  constructor(path) {
    this._path  = path
    this._no_translate = this.readNonTranslationFile()
  }

  /**
   * Public properties
   */
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
   * Reads the specified non translation file and returns the array contained
   * @returns {string[]}
   */
  readNonTranslationFile() {
    return fh.readFile(this.path).no_translation
  }

  /**
   * Checks if the value of the param element is in the no_translate[]
   * @param {Object} element 
   */
  isElementNotIncluded(element) {
    return !this.no_translate.includes(element.value)
  }

  /**
   * Filter out data that should not be translated
   * @param {string[]} data 
   */
  process(data) {
    FormUpdater.setPreprocessText()
    return data.filter(this.isElementNotIncluded.bind(this))
  }
}

module.exports = Preprocessor