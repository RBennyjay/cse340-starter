const pool = require("../database/")

const invModel = {}  // <-- define the object here

/* ***************************
 * Get all classification data
 * ************************** */
invModel.getClassifications = async function () {
  return await pool.query("SELECT * FROM public.classification ORDER BY classification_name")
}

/* ***************************
 * Get all inventory items and classification_name by classification_id
 * ************************** */
invModel.getInventoryByClassificationId = async function (classification_id) {
  try {
    const data = await pool.query(
      `SELECT * FROM public.inventory AS i 
       JOIN public.classification AS c 
       ON i.classification_id = c.classification_id 
       WHERE i.classification_id = $1`,
      [classification_id]
    )
    return data.rows
  } catch (error) {
    console.error("getInventoryByClassificationId error: ", error)
  }
}

invModel.getVehicleById = async function (invId) {
  try {
    const result = await pool.query(
      "SELECT * FROM public.inventory WHERE inv_id = $1",
      [invId]
    );
    return result.rows[0];
  } catch (error) {
    throw error;
  }
}

invModel.addClassification = async function (name) {
  try {
    const sql = "INSERT INTO classification (classification_name) VALUES ($1)"
    const data = await pool.query(sql, [name])
    return data.rowCount
  } catch (error) {
    console.error("Classification insert error:", error)
    return null
  }
}

invModel.addInventory = async function (invData) {
  try {
    const sql = `INSERT INTO inventory 
      (inv_make, inv_model, classification_id, inv_description, inv_image, inv_thumbnail, inv_price, inv_year, inv_miles, inv_color) 
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`
    const data = await pool.query(sql, [
      invData.inv_make,
      invData.inv_model,
      invData.classification_id,
      invData.inv_description,
      invData.inv_image || '/images/vehicles/no-image.png',
      invData.inv_thumbnail || '/images/vehicles/no-image.png',
      invData.inv_price,
      invData.inv_year,
      invData.inv_miles,
      invData.inv_color,
    ])
    return data.rowCount
  } catch (error) {
    console.error("Inventory insert error:", error)
    return null
  }
}

invModel.updateInventory = async function (invData) {
  try {
    const sql = `
      UPDATE inventory
      SET 
        inv_make = $1,
        inv_model = $2,
        classification_id = $3,
        inv_description = $4,
        inv_image = $5,
        inv_thumbnail = $6,
        inv_price = $7,
        inv_year = $8,
        inv_miles = $9,
        inv_color = $10
      WHERE inv_id = $11
    `
    const data = await pool.query(sql, [
      invData.inv_make,
      invData.inv_model,
      invData.classification_id,
      invData.inv_description,
      invData.inv_image || '/images/vehicles/no-image.png',
      invData.inv_thumbnail || '/images/vehicles/no-image.png',
      invData.inv_price,
      invData.inv_year,
      invData.inv_miles,
      invData.inv_color,
      invData.inv_id
    ])
    return data.rowCount
  } catch (error) {
    console.error("Inventory update error:", error)
    return null
  }
}



invModel.getAllInventory = async function () {
  try {
    const sql = `
      SELECT * FROM public.inventory AS i
      JOIN public.classification AS c
      ON i.classification_id = c.classification_id
      ORDER BY i.inv_make, i.inv_model
    `
    const data = await pool.query(sql)
    return data.rows
  } catch (error) {
    console.error("getAllInventory error:", error)
    throw error
  }
}


module.exports = invModel

