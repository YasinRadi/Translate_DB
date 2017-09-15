/**
 * Created by Yasin Radi <yasin.ben.hamman@gmail.com>
 */
'use strict'

const bar = document.getElementById('progBar')
const txt = document.getElementById('progressStatus')
const btn = document.getElementById('translate')
const div = document.getElementById('status')

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
  static setTranslatingTextNumbers(current, total) {
    txt.textContent = `Translating values... (${current} / ${total})`
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
   * Enable or disable translate button depending on its state
   */
  static enableDisableTranslateBtn() {
    btn.disabled = !btn.disabled
  }

  /**
   * Set progress status text to complete
   */
  static setCompleteText() {
    txt.textContent = 'Complete!'
  }

  static taskFinished() {
    bar.setAttribute('value', 0)
    FormUpdater.setCompleteText()
    FormUpdater.enableDisableTranslateBtn()
    setTimeout(() => {
      txt.textContent = ''
      div.className = 'start'
    }, 3000)
  }
}

module.exports = FormUpdater