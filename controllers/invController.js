const invModel = require("../models/inventory-model")
const utilities = require("../utilities/")

const invCont = {}

/* ***************************
 *  Build inventory by classification view
 * ************************** */
invCont.buildByClassificationId = async function (req, res, next) {
  const classification_id = req.params.classificationId
  const data = await invModel.getInventoryByClassificationId(classification_id)
  const grid = await utilities.buildClassificationGrid(data)
  let nav = await utilities.getNav()
  const className = data[0].classification_name
  res.render("./inventory/classification", {
    title: className + " vehicles",
    nav,
    grid,
  })
}

// invCont.buildByClassificationId = async function (req, res, next) {
//   throw new Error("Deliberate server error for testing");
// }




//buildInventory method

invCont.buildInventory = async function (req, res, next) {
  try {
    const data = await invModel.getAllInventory(); 
    const grid = await utilities.buildClassificationGrid(data);
    const nav = await utilities.getNav();

    res.render("inventory/classification", {
      title: "All Vehicles",
      nav,
      grid,
    });
  } catch (error) {
    next(error);
  }
};

//testing for error handling

// invCont.buildInventory = async function (req, res, next) {
//   try {
//     throw new Error("Forced 500 error in buildInventory");
//     //  logic
//     // let nav = await utilities.getNav()
//     // res.render("inventory/inventory", { title: "Inventory", nav })
//   } catch (error) {
//     next(error);
//   }
// }


/* ***************************
 *  Build vehicle detail view
 * ************************** */
async function buildDetailView(req, res, next) {
  try {
    const invId = parseInt(req.params.inv_id);
    const data = await invModel.getVehicleById(invId);

    if (!data) {
      return next({ status: 404, message: "Vehicle not found" });
    }

    const vehicleHtml = utilities.buildVehicleDetailView(data);
    const nav = await utilities.getNav();

    res.render("inventory/detail", {
      title: `${data.inv_make} ${data.inv_model}`,
      nav,
      body: vehicleHtml,
    });
  } catch (err) {
    next(err);
  }
}

//  Attach the detail function to the controller
invCont.buildDetailView = buildDetailView;

module.exports = invCont;
