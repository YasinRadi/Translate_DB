/**
 * Created by Yasin Radi <yasin.ben.hamman@gmail.com>
 */
'use strict'

const { dialog } = require('electron').remote
const Oracle = require('./oracle')
const Translate = require('./translator')
const updater = require('./formUpdater')
const Validator = require('./validator')
const Preprocessor = require('./preprocessor')
const Postprocessor = require('./postprocessor')
const validator = new Validator()
const FileHandler = require('./fileHandler')
const fh = new FileHandler()

class Index {

  constructor() {
    this._data = {}
    this._preprocessor = undefined
    this._postprocesor = undefined
    this._ora = undefined
    this._translator = undefined
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

  get preprocessor() {
    return this._preprocessor
  }

  set preprocessor(preprocessor) {
    this._preprocessor = preprocessor
  }

  get postprocessor() {
    return this._postprocesor
  }

  set postprocessor(postprocessor) {
    this._postprocesor = postprocessor
  }

  get ora() {
    return this._ora
  }

  set ora(ora) {
    this._ora = ora
  }

  get translator() {
    return this._translator
  }

  set translator(translator) {
    this._translator = translator
  }

  init() {
    document.getElementById('translate').addEventListener('click', async () => {
      try {
        //
        this.data = this.setFormData()

        //
        this.validate()
        
        //
        this.ora = this.setOraObject()
  
        //
        const dataToTranslate = await this.ora.getDataToTranslate()
        
        //
        const processedDataToTranslate = this.ora.processDataArray(dataToTranslate.rows)
  
        //
        this.generatePreprocessor(this.data)

        //
        const trData = this.checkPreData(processedDataToTranslate)
  
        //
        this.translator = this.setTranslatorObject(trData, this.data)
  
        //
        const translatedData = await this.translator.translate()
        
        //
        this.generatePostprocessor(this.data)

        //
        const transData = this.checkPostData(translatedData)

        //
        this.ora.outputResult(transData)
          .then(() => {
            updater.updateProgressBar()
            alert(`Translation successful. Data has been output in table ${this.ora.tmp}.`)
            updater.taskFinished()
          }).catch(err => {
            throw new Error(err)
          })
      } catch(err) {
        console.log(err)
        updater.processError(err)
      }
    })
    
  }

  /**
   * Gets the data from the index form and returns it as an object.
   * @return {Object}
   */
  setFormData() {
    return {
      user:       document.getElementById('username').value,
      password:   document.getElementById('password').value,
      connString: document.getElementById('connection_env').value,
      table:      document.getElementById('table').value,
      field:      document.getElementById('table_field').value,
      tmp:        document.getElementById('tmp_table').value,
      condition:  document.getElementById('condition').value,
      pk_field:   document.getElementById('pk_field').value,
      f_lang:     document.getElementById('orig_lang').value,
      t_lang:     document.getElementById('targ_lang').value,
      m_lang:     document.getElementById('mid_lang').value,
      max_length: document.getElementById('max_length').value,
      non_tra:    document.getElementById('non_tra').value,
      post_proc:  document.getElementById('post_proc').value
    }
  }

  /**
   * User input validation
   */
  validate() {
    const validation = validator.validate()
    if(typeof validation === 'string') {
      alert(validation)
      return
    }
  }

  /**
   * Creates a new oracle object using the form data.
   * @returns {Oracle}
   */
  setOraObject() {
    return new Oracle(
      this.data.user,
      this.data.password,
      this.data.connString,
      this.data.table,
      this.data.pk_field,
      this.data.field,
      this.data.tmp,
      this.data.condition,
      this.data.max_length
    )
  }

  /**
   * Creates a new translator object using the form data and sets it to the class property
   * @param {string[]} tr_data 
   */
  setTranslatorObject(tr_data, data) {
    return new Translate(
      tr_data,
      data.f_lang,
      updater.processLangArray(data.m_lang),
      data.t_lang
    )
  }

  /**
   * Generate preprocessor object.
   * @param {Object}
   * @returns {Preprocessor|undefined}
   */
  generatePreprocessor(data) {
    return data.non_tra 
      ? new Preprocessor(data.non_tra) 
      : undefined
  }

  /**
   * Generate postprocessor object.
   * @param {Object} data 
   * @returns {Object|undefined}
   */
  generatePostprocessor(data) {
    return data.post_proc 
      ? new Postprocessor(data.post_proc) 
      : undefined
  }

  /**
   * Checks if preprocessor has been initialized and processes the data, otherwise returns the data itself.
   * @param {Object[]} data 
   */
  checkPreData(data) {
    return this.preprocessor !== undefined 
    ? this.preprocessor.process(data) 
    : data
  }

  /**
   * Checks if postprocessor has been initialized and processes the data, otherwise returns the data itself.
   * @param {Object[]} data 
   */
  checkPostData(data) {
    return this.postprocessor !== undefined 
    ? this.postprocessor.process(data) 
    : data
  }
}

module.exports = Index

// /**
//  * Adds the onClick event to the Translate button to fetch and translate the data.
//  */
// document.getElementById('translate').addEventListener('click', () => {
//   /**
//   * Fetches the data from the db table using the PK and the specified field
//   */
//   ora.getDataToTranslate()
//     .then(res => {
//       /**
//        * Processes the fetched data converting it into an Object[] having {id, value}
//        */
//       ora.processDataArray(res.rows)
//         .then(tData => {

//           /**
//            * Exclude non-translatable lines
//            */
//           const tr_data = preprocessor !== undefined ? preprocessor.process(tData) : tData

//           /**
//            * Executes the translation of every table row
//            */
//           tr.translate()
//             .then(translatedData => {

//               /**
//                * Perform post-translation operations
//                */
//               const translated_data = postprocessor !== undefined ? postprocessor.process(translatedData) : translatedData

//               /**
//                * Creates the temporary table and updates the values according to the new translation
//                */
//               ora.outputResult(translated_data)
//                 .then(() => {
//                   updater.updateProgressBar()
//                   alert(`Translation successful. Data has been output in table ${ora.tmp}.`)
//                   updater.taskFinished()
//                 })
//                 .catch(err => {
//                   console.log(err)
//                   updater.processError(err)
//                 })
//             })
//             .catch(err => {
//               console.log(err)
//               updater.processError(err)
//             })
//         })
//         .catch(err => {
//           console.log(err)
//           updater.processError(err)
//         })
//     })
//     .catch(err => {
//       console.log(err)
//       updater.processError(err)
//     })
// })