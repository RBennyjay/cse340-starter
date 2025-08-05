const pool = require("../database/")
const db = require("../database/");


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
    throw new Error('Database error')
  }
}
/* **********************
 *   Check for existing email
 * ********************* */
async function checkExistingEmail(account_email) {
  try {
    const sql = "SELECT * FROM account WHERE account_email = $1"
    const email = await pool.query(sql, [account_email])
    return email.rowCount
  } catch (error) {
    return error.message
  }
}
const getAccountById = async (account_id) => {
  const data = await db.query("SELECT * FROM account WHERE account_id = $1", [account_id]);
  return data.rows[0];
};
const updateAccount = async ({ account_firstname, account_lastname, account_email, account_id }) => {
  const sql = `
    UPDATE account 
    SET account_firstname = $1, account_lastname = $2, account_email = $3 
    WHERE account_id = $4
    RETURNING *;
  `;
  const result = await db.query(sql, [account_firstname, account_lastname, account_email, account_id]);
  return result.rowCount;
};
// const updatePassword = async ({ hashedPassword, account_id }) => {
//   const sql = `
//     UPDATE account
//     SET account_password = $1
//     WHERE account_id = $2
//     RETURNING *;
//   `;
//   const result = await db.query(sql, [hashedPassword, account_id]);
//   return result.rowCount;
// };

async function updatePassword(account_id, hashedPassword) {
  try {
    const sql = `UPDATE account SET account_password = $1 WHERE account_id = $2`;
    const data = await pool.query(sql, [hashedPassword, account_id]);
    return data.rowCount;
  } catch (error) {
    throw new Error("Password update failed.");
  }
}



// Export both functions
module.exports = { 
  registerAccount,
  getAccountByEmail,
  checkExistingEmail,
  getAccountById,
  updateAccount,
  updatePassword,
 }
