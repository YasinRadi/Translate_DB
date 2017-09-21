/**
 * Created by Yasin Radi <yasin.ben.hamman@gmail.com>
 */
'use strict'

const oracle  = require('oracledb')
const updater = require('./formUpdater')

class Oracle {

  constructor(user, password, connString, table, pk, field, tmp, condition, maxLength) {
    this._table = table
    this._pk = pk
    this._field = field
    this._user = user
    this._tmp = tmp
    this._data = []
    this._translated = []
    this._password = password
    this._connString = connString
    this._condition = condition
    this._maxLength = maxLength
    this._tmpExists = false


    /**
     * Setup connection
     */
    this._connection = this.connect()
  }

  /**
   * Public properties
   */
  get table() {
    return this._table
  }

  set table(table) {
    this._table = table
  }

  get pk() {
    return this._pk
  }

  set pk(pk) {
    this._pk = pk
  }

  get field() {
    return this._field
  }

  set field(field) {
    this._field = field
  }

  get user() {
    return this._user
  }

  set user(user) {
    this._user = user
  }

  get password() {
    return this._password
  }

  set password(password) {
    this._password = password
  }

  get connString() {
    return this._connString
  }

  set connString(connString) {
    this._connString = connString
  }

  get data() {
    return this._data
  }

  set data(data) {
    this._data = data
  }

  get translated() {
    return this._translated
  }

  set translated(translated) {
    this._translated = translated
  }

  get connection() {
    return this._connection
  }

  set connection(connection) {
    this._connectioin = connection
  }

  get tmp() {
    return this._tmp
  }

  set tmp(tmp) {
    this._tmp = tmp
  }

  get condition() {
    return this._condition
  }

  set condition(condition) {
    this._condition = condition
  }

  get maxLength() {
    return this._maxLength
  }

  set maxLength(maxLength) {
    this._maxLength = maxLength
  }

  get tmpExists() {
    return this._tmpExists
  }

  set tmpExists(tmpExists) {
    this._tmpExists = tmpExists
  }

  /**
   * Performs a connection to the db using the specified user, password and connection string.
   * @param {String} user 
   * @param {String} pass 
   * @param {String} cnString 
   * @returns {Promise}
   */
  connect() {
    return oracle.getConnection({
      user: this.user,
      password: this.password,
      connectString: this.connString
    });
  }

  /**
   * Gets data from db executing a SELECT query.
   * @param {String[]} fields  
   * @returns {Promise}
   */
  async getData(fields) {
    const cn = await this.connection
    const where = this.condition === '' ? '' : `WHERE ${this.condition}`
    const numRows = await this.getRowsNum()
    return this.getRowsNum().then(data => {
      const num = data.rows[0][0]
      return cn.execute(`SELECT ${this.processFields(fields)} FROM ${this.table} ${where}`, [], { maxRows: num })
      .then(res => {
        return res
      })
    })
  }

  /**
   * Performs a SELECT query of the data that will be translated making use of the specified fields.
   * @returns {Promise}
   */
  getDataToTranslate() {
    return this.getData([
      this.pk,
      this.field
    ])
  }

  /**
   * Creates a table, where the output will be dump, using the main table as a reference.
   * @returns {Promise}
   */
  async createTmpTable() {
    const cn = await this.connection
    updater.setCreatingText()
    const where = this.condition === '' ? '' : `WHERE ${this.condition}`
    return cn.execute(`CREATE TABLE ${this.tmp} AS (SELECT * FROM ${this.table} ${where})`)
  }

  /**
   * Counts the number of rows of the output table
   * @returns {Promise}
   */
  async getRowsTmp() {
    const cn = await this.connection
    return cn.execute(`SELECT count(1) FROM ${this.tmp}`)
  }

  /**
   * Gets the number of rows expected to be translated.
   * @returns {Promise}
   */
  async getRowsNum() {
    const cn = await this.connection
    const where = this.condition === '' ? '' : `WHERE ${this.condition}`
    return cn.execute(`SELECT count(1) FROM ${this.table} ${where}`)
  }

  /**
   * Updates the rows of the tmp table using the resulting translated values respecting the max length of the table field.
   * @param {Object[]} processedData 
   */
  async outputResult(processedData) {
    let updates = []
    let promise = Promise.resolve()
    const cn = await this.connection
    await this.createTmpTable()
    const values = processedData.filter((d) => d.value.length <= this.maxLength)      
    updater.setProgressBar(values.length)
    updater.setSavingText()
    let i = 1
    for (const d of values) {
      promise = promise.then(() => cn.execute(`UPDATE ${this.tmp} SET ${this.field} = '${this.processValueQuotes(d.value)}' WHERE ${this.pk} = '${d.id}'`))
       .then(() => cn.commit())
       .then(() => {
          updater.setSavingTextNumbers(i, values.length)
          updater.updateProgressBar()
          i++
      }) 
    }

    return promise
  }

  /**
   * Processes a data array to take the correct shape to be translated.
   * @param {Object[][]} data 
   * @returns {Promise}
   */
  processDataArray(data) {
    let output = []
    for (const a of data) {
      output.push({
        id: a[0],
        value: a[1]
      })
    }

    return Promise.resolve(output)
  }

  /**
   * Process string value escaping single quotes and removing spaces after @
   * @param {string} value 
   */
  processValueQuotes(value) {
    return value.replace(/'/g, "''")
  }

  /**
   * Converts the fields of the query into a comma separated string.
   * @param {Array} fields 
   */
  processFields(fields) {
    return fields.reduce((a, b) => a + ", " + b, "")
      .toString()
      .slice(1)
  }

  /**
   * Closes the database connection.
   */
  closeConnection() {
    this.connection.then(cn => {
      cn.close()
    })
  }
}

module.exports = Oracle;
