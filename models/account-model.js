const pool = require("../database/")

/* *****************************
*   Register new account
* *************************** */
async function registerAccount(account_firstname, account_lastname, account_email, account_password){
  try {
    const sql = `
      INSERT INTO account (account_firstname, account_lastname, account_email, account_password, account_type)
      VALUES ($1, $2, $3, $4, 'Client') RETURNING *`
    return await pool.query(sql, [account_firstname, account_lastname, account_email, account_password])
  } catch (error) {
    return error.message
  }
}

/* *****************************
*   Get account by email
* *************************** */
async function getAccountByEmail(email) {
  try {
    const sql = 'SELECT * FROM account WHERE account_email = $1'
    const result = await pool.query(sql, [email])
    return result.rows[0]
  } catch (error) {
    throw new Error('Error getting account by email: ' + error.message)
  }
}

// Export both functions
module.exports = { 
  registerAccount,
  getAccountByEmail 
}
