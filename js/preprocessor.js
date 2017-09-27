/**
 * Created by Yasin Radi <yasin.ben.hamman@gmail.com>
 */
'use strict'

const FileHandler = require('./fileHandler')
const updater     = require('./formUpdater')
const fh = new FileHandler()


class Preprocessor {

  constructor(path) {
    this._path  = path
    this._no_translate = this.readNonTranslationFile(path)
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
   * @param   {string}  path
   * @returns {string[]}
   */
  readNonTranslationFile(path) {
    return fh.readFile(path).no_translation
  }

  /**
   * Checks if the value of the param element is in the no_translate[]
   * @param   {Object} element 
   * @returns {bool}
   */
  isElementNotIncluded(element) {
    return !this.no_translate.includes(element.value)
  }

  /**
   * Checks if the value of the param element is in the no_translate[]
   * @param   {*} element 
   * @returns {bool}
   */
  isElementIncluded(element) {
    return this.no_translate.includes(element.value)
  }

  /**
   * Remove bracket starting from string.
   * @param   {Object[]} data 
   * @returns {Object[]}
   */
  trimBrackets(data) {
    return data.map(d => {
      d.value = d.value.charAt(0) === '[' 
        ? d.value.substring(5, d.value.length)
        : d.value
      return d
    })
  }

  /**
   * Filter out data that should not be translated
   * @param   {string[]} data 
   * @returns {Object[]}
   */
  process(data) {
    updater.setPreprocessText(data.length)
    return data.filter(this.isElementNotIncluded.bind(this))
                .filter(d => d.value.includes('&') && !d.value.includes(' & '))
  }

  /**
   * Filter out data that should be translated
   * @param {Object[]} data 
   */
  processLeftOvers(data) {
    return data.filter(this.isElementIncluded.bind(this))
      .concat(data.filter(d => d.value.includes('&') && !d.value.includes(' & ')))
  }
}

module.exports = Preprocessor