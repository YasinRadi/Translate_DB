/**
 * Created by Yasin Radi <yasin.ben.hamman@gmail.com>
 */
'use strict'

const bar = document.getElementById('progBar')
const txt = document.getElementById('progressStatus')
const btn = document.getElementById('translate')
const div = document.getElementById('status')
const lng = document.getElementById('mid_lang')

class FormUpdater {
  
  constructor() {}

  /**
   * Initialize progress bar to the current transaction max value
   * @param {number} maxValue 
   */
  static setProgressBar(maxValue) {
    const realMaxValue = maxValue
    bar.setAttribute('max', realMaxValue)
    bar.setAttribute('value', 1)
    div.classList.remove('start')
  }

  /**
   * Update the progress bar by one
   */
  static updateProgressBar() {
    const current = bar.value
    bar.setAttribute('value', current + 1)
  }

  /**
   * Set progress status text to Translating
   */
  static setTranslatingText() {
    txt.textContent = `Translating values...`
  }

  /**
   * Set progress status text to Translating values informing of current number
   * @param {number} current 
   * @param {number} total 
   */
  static setTranslatingTextNumbers(lang, current, total) {
    txt.textContent = `Translating values to ${lang}... (${current} / ${total})`
  }

  /**
   * Set progress status text to creating tmp table
   */
  static setCreatingText() {
    txt.textContent = 'Creating tmp table...'
  }

  /**
   * Set progress status text to saving values
   */
  static setSavingText() {
    txt.textContent = 'Saving values...'
  }

  /**
   * Set progress status text to saving values informing of current number
   * @param {number} current 
   * @param {number} total 
   */
  static setSavingTextNumbers(current, total) {
    txt.textContent = `Saving values... (${current} / ${total})`
  }

  /**
   * Set progress status text to pre-process information
   */
  static setPreprocessText() {
    txt.textContent = `Pre-processing values...`
  }

  /**
   * Set progress status text to post-process information
   */
  static setPostprocessText() {
    txt.textContent = `Post-processing values...`
  }

  /**
   * Disables translate button
   */
  static disableTranslateBtn() {
    btn.disabled = true
  }

  /**
   * Enables translate button
   */
  static enableTranslateBtn() {
    btn.disabled = false
  }

  /**
   * Set progress status text to complete
   */
  static setCompleteText() {
    txt.textContent = 'Complete!'
  }

  /**
   * Informs that task has been completed successfully and resets progress ui
   */
  static taskFinished() {
    bar.setAttribute('value', 0)
    FormUpdater.setCompleteText()
    FormUpdater.enableTranslateBtn()
    setTimeout(() => {
      txt.textContent = ''
      div.className = 'start'
    }, 3000)
  }

  /**
   * Process mid languages into an array
   * @returns {string[]}
   */
  static processLangArray(lngs) {
    return lngs.split(',').map((l) => l.toLowerCase().trim())
  }

  /**
   * Alert the user about the error and remove the progress bar and its status text
   * @param {string} err 
   */
  static processError(err) {
    div.className = 'start'
    FormUpdater.enableTranslateBtn()
    console.log(err)
    alert(err)
  }
}

module.exports = FormUpdater