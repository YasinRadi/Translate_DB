/**
 * Created by Yasin Radi <yasin.ben.hamman@gmail.com
 */
'use strict'

const FileHandler = require('./fileHandler')
const fh = new FileHandler()

 class Postprocessor {

  constructor(path) {
    this._path = path
    this._lines = this.readReplaceTranslationsFile()
  }

  get path() {
    return this._path
  }

  set path(path) {
    this._path = path
  }

  get lines() {
    return this._lines
  }

  set lines(lines) {
    this._lines = lines
  }

  /**
   * Reads the replace translation file using the specified path and returns the array contained in it.
   * @returns {Object[]}
   */
  readReplaceTranslationsFile() {
    return fh.readFile(this.path).replace_translation
  }

  /**
   * Replaces each specified value in the replacing file from each data row
   * @param {Object[]} data 
   * @returns {Object[]}
   */
  process(data) {
    return data.map((d) => {
      this.lines.forEach((l) => {
        d.value = d.value.replace(
          new RegExp(`\\b${l.name}\\b`, 'g'), 
          l.replacement
        )
      })
    
      return d
    })
  }
 }

 module.exports = Postprocessor