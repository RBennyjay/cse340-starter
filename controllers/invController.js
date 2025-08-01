const invModel = require("../models/inventory-model")
const utilities = require("../utilities/")

const invCont = {}

/* ***************************
 *  Build inventory by classification view
 * ************************** */
invCont.buildByClassificationId = async function (req, res, next) {
  try {
    const classification_id = req.params.classificationId;
    const data = await invModel.getInventoryByClassificationId(classification_id);
    const grid = await utilities.buildClassificationGrid(data);
    let nav = await utilities.getNav();
    
    if (!data.length) {
      return next({ status: 404, message: "No vehicles found for this classification" });
    }

    const className = data[0].classification_name;

    res.render("./inventory/classification", {
      title: className + " vehicles",
      nav,
      grid,
      classificationName: className,
      inventory: data,
    });
  } catch (error) {
    next(error);
  }
};

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
      inventory: data,
      classificationName: "All Vehicles"

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
      // body: vehicleHtml,
      vehicle: data,
    });
  } catch (err) {
    next(err);
  }
}

invCont.buildManagement = async function (req, res) {
  let nav = await utilities.getNav()
  res.render("inventory/management", {
    title: "Inventory Management",
    nav,
    message: req.flash("message"),
  })
}

invCont.buildAddClassification = async function (req, res) {
  let nav = await utilities.getNav()
  res.render("inventory/add-classification", {
    title: "Add Classification",
    nav,
    message: req.flash("message"),
  })
}

invCont.addClassification = async function (req, res) {
  const { classification_name } = req.body
  const result = await invModel.addClassification(classification_name)
  if (result) {
    req.flash("message", "Classification added successfully.")
    res.redirect("/inv/")
  } else {
    req.flash("message", "Failed to add classification.")
    res.redirect("/inv/add-classification")
  }
}


invCont.buildAddInventory = async function (req, res) {
  const nav = await utilities.getNav()
  const classificationList = await utilities.buildClassificationList()

  res.render("inventory/add-inventory", {
    title: "Add Inventory",
    nav,
    classificationList,
    message: req.flash("message"),
    errors: [], 
  })
}



invCont.addInventory = async function (req, res) {
  const invData = req.body
  const result = await invModel.addInventory(invData)
  if (result) {
    req.flash("success", "Vehicle added successfully.")
    res.redirect("/inv/")
  } else {
    let nav = await utilities.getNav()
    let classificationList = await utilities.buildClassificationList(invData.classification_id)
    req.flash("message", "Failed to add vehicle.")
    res.render("inventory/add-inventory", {
      title: "Add Inventory",
      nav,
      classificationList,
      ...invData,
      message: req.flash("message"),
    })
  }
}



//  Attach the detail function to the controller
invCont.buildDetailView = buildDetailView;

module.exports = invCont;
