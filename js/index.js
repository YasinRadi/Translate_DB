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

  /**
   * Sets the onClick listener on the Translate button
   */
  init() {
    document.getElementById('translate').addEventListener('click', async () => {
      try {
        // Get form data and generate data object
        this.data = this.setFormData()

        // Validate form fields are valid
        this.validate()
        
        // Generate oracle object from data object
        this.ora = this.setOraObject()
  
        // Query data to translate
        const dataToTranslate = await this.ora.getDataToTranslate()
        
        // Convert query rows into object[]
        const processedDataToTranslate = this.ora.processDataArray(dataToTranslate.rows)
  
        // Generate preprocessor object using form data
        this.preprocessor = this.generatePreprocessor(this.data)

        // Preprocess data that will be translated if necessary
        const trData = this.checkPreData(processedDataToTranslate)

        // Generate translator object using data to translate and form data
        this.translator = this.setTranslatorObject(trData, this.data)
  
        // Translate data to the desired language
        const translatedData = await this.translator.translate()
        
        // Untranslated data to be affected by the postprocess
        const dataToMerge = this.checkPreNotIncludedData(processedDataToTranslate)

        // Marged data to be used from here
        const allData = translatedData.concat(dataToMerge)

        // Generate postprocessor object using form data
        this.postprocessor = this.generatePostprocessor(this.data)

        // Postprocess data that will be put in the db table
        const transData = this.checkPostData(allData)

        // Input the translation result into the db table
        await this.ora.outputResult(transData)

        // Update progress bar status, alert the user that everything went ok and hide progress ui
        updater.updateProgressBar()
        alert(`Translation successful. Data has been output in table ${this.ora.tmp}.`)
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
   * User input validation. Cuts execution flow if something is wrong.
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
   * @param {Object} data
   * @returns {Preprocessor|undefined}
   */
  generatePreprocessor(data) {
    return data.non_tra !== ''
      ? new Preprocessor(data.non_tra) 
      : undefined
  }

  /**
   * Generate postprocessor object.
   * @param {Object} data 
   * @returns {Object|undefined}
   */
  generatePostprocessor(data) {
    return data.post_proc !== ''
      ? new Postprocessor(data.post_proc) 
      : undefined
  }

  /**
   * Checks if preprocessor has been initialized and processes the data, otherwise returns the data itself.
   * @param {Object[]} data 
   * @returns {Object[]}
   */
  checkPreData(data) {
    return this.preprocessor !== undefined 
    ? this.preprocessor.process(data) 
    : data
  }

  /**
   * Checks if preprocessor has been initialized and processes the data, otherwise returns the data itself.
   * @param {Object[]} data 
   */
  checkPreNotIncludedData(data) {
    return this.preprocessor !== undefined
      ? this.preprocessor.processLeftOvers(data)
      : data
  }

  /**
   * Checks if postprocessor has been initialized and processes the data, otherwise returns the data itself.
   * @param {Object[]} data 
   * @returns {Object[]}
   */
  checkPostData(data) {
    return this.postprocessor !== undefined 
    ? this.postprocessor.process(data) 
    : data
  }
}

module.exports = Index