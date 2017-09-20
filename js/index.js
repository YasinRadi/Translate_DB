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
const validate = new Validator()
const FileHandler = require('./fileHandler')
const fh = new FileHandler()

/**
 * Adds the onClick event to the Translate button to fetch and translate the data.
 */
document.getElementById('translate').addEventListener('click', () => {
  const data = {
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
    non_tra:    document.getElementById('non_tra'),
    post_proc:  document.getElementById('post_proc')
  }

  /**
   * User input validation
   */
  const validation = validate.validate()
  if(typeof validation === 'string') {
    alert(validation)
    return
  }

  /**
   * Preprocessor object setting
   */
  const preprocessor = data.non_tra.value ? new Preprocessor(data.non_tra.value) : undefined

  /**
   * Oracle db object creation
   */
  const ora = new Oracle(
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

  /**
  * Fetches the data from the db table using the PK and the specified field
  */
  ora.getDataToTranslate()
    .then(res => {
      /**
       * Processes the fetched data converting it into an Object[] having {id, value}
       */
      ora.processDataArray(res.rows)
        .then(tData => {

          /**
           * Exclude non-translatable lines
           */
          const tr_data = preprocessor !== undefined ? preprocessor.preProcess(tData) : tData

          /**
           * Translate object creation
           */
          const tr = new Translate(
            tr_data,
            data.f_lang,
            updater.processLangArray(data.m_lang),
            data.t_lang
          )

          /**
           * Executes the translation of every table row
           */
          tr.translate()
            .then(translatedData => {
              /**
               * Creates the temporary table and updates the values according to the new translation
               */
              ora.outputResult(translatedData)
                .then(() => {
                  alert(`Translation successful. Data has been output in table ${ora.tmp}.`)
                  updater.taskFinished()
                })
                .catch(err => {
                  updater.processError(err)
                })
            })
            .catch(err => {
              updater.processError(err)
            })
        })
        .catch(err => {
          updater.processError(err)
        })
    })
    .catch(err => {
      updater.processError(err)
    })
})