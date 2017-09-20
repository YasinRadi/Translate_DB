/** 
 * Created by Yasin Radi <yasin.ben.hamman@gmail.com>
 */
const { dialog } = require('electron').remote
const Validator  = require('./validator')
const validate   = new Validator()

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
   * 
   * @param {*} field 
   */
  setOpeningFunction(field) {
    dialog.showOpenDialog({filters: [
      { extensions: ['json'] }
    ]}, (files) => {
      if(typeof files !== undefined) {
        document.getElementById(field).value = files[0]
      }
    })
  }
}

module.exports = FileHandler