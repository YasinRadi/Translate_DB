/**
 * Created by Yasin Radi <yasin.ben.hamman@gmail.com>
 */
'use strict'

const languages = require('./languages')

/**
 * Elements to be validated
 */
const table = document.getElementById('table')
const field = document.getElementById('table_field')
const tmp   = document.getElementById('tmp_table')
const pk    = document.getElementById('pk_field')
const o_lg  = document.getElementById('orig_lang')
const t_lg  = document.getElementById('targ_lang')
const len   = document.getElementById('max_length')
const mid   = document.getElementById('mid_lang')
const elements = [table, field, tmp, pk, t_lg, len]

/**
 * Language codes
 */
const langs = Object.keys(languages.langs()).map((k) => k)

/**
 * Error messages object
 */
let msgs = {
  blank_msg: '', 
  not_num: 'Column length field must be a non-decimal number.',
  tbl_tmp: 'Table and Output table cannot be the same.',
  mid_arr: 'Mid languages must be valid language codes separated by commas.',
  lang_ms: '',
}

class Validator {

  constructor() {}

  /**
   * Validates the user input returning the error message if something is wrong or true otherwise.
   * @returns {string|bool}
   */
  validate() {
    if(this.isFieldBlank()) {
      return msgs.blank_msg
    } 
    
    if(!this.isMaxLengthNumeric()) {
      return msgs.not_num
    }
    
    if(this.isTableAndTmpSame()) {
      return msgs.tbl_tmp
    }
    
    if(!this.isLangValid()) {
      return msgs.lang_ms
    }

    if (!this.isMidLangArrayValid()) {
      return msgs.mid_arr
    }

    return true
  }

  /**
   * Checks if mandatory fields are blank
   * @returns {bool}
   */
  isFieldBlank() {
    const blank = elements.filter((e) => e.value === '')
    if(blank.length) {
      const fields = blank.map((f) => f.name).join(', ')
      msgs.blank_msg = `Field/s [${fields}] cannot be empty.`
      return true
    }

    return false
  }

  /**
   * Checks if the column max length is a valid non-decimal number
   * @returns {bool}
   */
  isMaxLengthNumeric() {
    return len.value == Number(len.value) && !len.value.includes('.')
  }

  /**
   * Checks if main table and tmp table are the same.
   * @returns {bool}
   */
  isTableAndTmpSame() {
    return table.value === tmp.value
  }

  /**
   * Checks if the origin and target language is a valid language code
   * @returns {bool}
   */
  isLangValid() {
    if(o_lg.value && !langs.includes(o_lg.value)) {
      msgs.lang_ms = `Origin language is not a valid language code.`
      return false
    }

    msgs.lang_ms = `Target language is not a valid language code.`
    return langs.includes(t_lg.value)
  }

  /**
   * Checks if the mid languages are valid language codes
   * @returns {bool}
   */
  isMidLangArrayValid() {
    if(mid.value !== '') {
      const lngs = mid.value.split(',').map((l) => l.toLowerCase().trim())
      return lngs.every((l) => langs.includes(l) && l.length == 2)
    }
    
    return true
  }

  /**
   * Extracts the name of the file path and the extension from it.
   * @param {string} path
   * @returns {bool} 
   */
  checkExtension(path) {
    return path.replace(/^.*(\\|\/|\:)/, '')
      .split('.')[1] === 'json'
  }
}

module.exports = Validator