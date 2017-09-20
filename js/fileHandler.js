/** 
 * Created by Yasin Radi <yasin.ben.hamman@gmail.com>
 */
const { dialog } = require('electron').remote
const fs = require('fs')
const Validator = require('./validator')
const validate = new Validator()

class FileHandler {

  constructor() {
    this._files = []
  }

  get files() {
    return this._files
  }

  set files(files) {
    this._files = files
  }

  /**
   * Reads file content synchronously
   * @returns {string[]}
   */
  readFile(path) {
    return JSON.parse(fs.readFileSync(path, 'utf-8'))
  }

  /**
   * 
   * @param {*} field 
   */
  setOpeningFunction(field) {
    dialog.showOpenDialog(
      {
        filters: [
          { name: 'JSON Files', extensions: ['json'] }
        ]
      }, (files) => {
        if (files) {
          document.getElementById(field).value = files[0]
        }
      })
  }
}

module.exports = FileHandler