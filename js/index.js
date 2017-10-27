/**
 * Created by Yasin Radi <yasin.ben.hamman@gmail.com>
 */
'use strict'

const Oracle  = require('./oracle')
const updater = require('./formUpdater')
const { dialog } = require('electron').remote
const Translate  = require('./translator')
const Validator  = require('./validator')
const Preprocessor  = require('./preprocessor')
const Postprocessor = require('./postprocessor')
const FileHandler   = require('./fileHandler')
const validator = new Validator()
const fh = new FileHandler()
const numberOfTransactions = 3

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

  /**
   * Sets the onClick listener on the Translate button
   */
  init() {
    document.getElementById('translate').addEventListener('click', async () => {
      try {
        // Validate form fields are valid
        if(!this.validate()) {
          return
        }

        // Get form data and generate data object
        const data = this.setFormData()

        // Generate oracle object from data object
        const ora = this.setOraObject(data)
  
        // Set and update progress ui
        updater.setProgressBar(numberOfTransactions)
        updater.setGatheringDataText()
        // Disable Translate button
        updater.disableTranslateBtn()

        // Query data to translate
        const dataToTranslate = await ora.getDataToTranslate()
        
        // Convert query rows into object[]
        const processedDataToTranslate = ora.processDataArray(dataToTranslate.rows)

        // Generate preprocessor object using form data
        const preprocessor = this.generatePreprocessor(data)

        // Preprocess data that will be translated if necessary
        const trData = this.checkPreData(preprocessor, processedDataToTranslate)

        // Generate translator object using data to translate and form data
        const translator = this.setTranslatorObject(trData, data)

        // Translate data to the desired language
        const translatedData = await translator.translate()

        // Untranslated data to be affected by the postprocess
        const dataToMerge = this.checkPreNotIncludedData(preprocessor, processedDataToTranslate)

        // Marged data to be used from here
        const allData = translatedData.concat(dataToMerge)

        // Generate postprocessor object using form data
        const postprocessor = this.generatePostprocessor(data)

        // Postprocess data that will be put in the db table
        const transData = this.checkPostData(postprocessor, allData)

        // Input the translation result into the db table
        await ora.outputResult(transData)

        // Update progress bar status, alert the user that everything went ok and hide progress ui
        updater.updateProgressBar()
        alert(`Translation successful. Data has been output in table ${ora.tmp}.`
        + `\n\n${ora.overflow} rows were left untouched due to column length overflow after translation.`)
        updater.taskFinished()
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
   * User input validation.
   * @returns {bool}
   */
  validate() {
    const validation = validator.validate()
    if(typeof validation === 'string') {
      alert(validation)
      return false
    }

    return true
  }

  /**
   * Creates a new oracle object using the form data.
   * @returns {Oracle}
   */
  setOraObject(data) {
    return new Oracle(
      data.user,
      data.password,
      data.connString,
      data.table,
      data.pk_field,
      data.field,
      data.tmp,
      data.condition,
      data.max_length
    )
  }

  /**
   * Creates a new translator object using the form data and sets it to the class property
   * @param   {string[]} tr_data 
   * @returns {Translate}
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
   * @param   {Object} data
   * @returns {Preprocessor|undefined}
   */
  generatePreprocessor(data) {
    return data.non_tra !== ''
      ? new Preprocessor(data.non_tra) 
      : undefined
  }

  /**
   * Generate postprocessor object.
   * @param   {Object} data 
   * @returns {Object|undefined}
   */
  generatePostprocessor(data) {
    return data.post_proc !== ''
      ? new Postprocessor(data.post_proc) 
      : undefined
  }

  /**
   * Checks if preprocessor has been initialized and processes the data, otherwise returns the data itself.
   * @param   {Object[]} data 
   * @returns {Object[]}
   */
  checkPreData(preprocessor, data) {
    const p_data = Preprocessor.staticProcess(data)
    return preprocessor !== undefined 
    ? preprocessor.process(p_data) 
    : p_data
  }

  /**
   * Checks if preprocessor has been initialized and processes the data, otherwise returns the data itself.
   * @param {Preprocessor} preprocessor
   * @param {Object[]}     data 
   */
  checkPreNotIncludedData(preprocessor, data) {
    return preprocessor !== undefined
      ? preprocessor.processLeftOvers(data)
      : []
  }

  /**
   * Checks if postprocessor has been initialized and processes the data, otherwise returns the data itself.
   * @param   {Postprocessor} postprocessor
   * @param   {Object[]}      data 
   * @returns {Object[]}
   */
  checkPostData(postprocessor, data) {
    return postprocessor !== undefined 
    ? postprocessor.process(data) 
    : data
  }
}

module.exports = Index