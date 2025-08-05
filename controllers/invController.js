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
  const nav = await utilities.getNav()
  // const classificationList = await utilities.buildClassificationList()
  const classificationSelect = await utilities.buildClassificationList()

  res.render("inventory/management", {
    title: "Inventory Management",
    nav,
    // classificationList,
     classificationSelect,
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

/* ***************************
 *  Return Inventory by Classification As JSON
 * ************************** */
invCont.getInventoryJSON = async (req, res, next) => {
  const classification_id = parseInt(req.params.classification_id)
  try {
    const invData = await invModel.getInventoryByClassificationId(classification_id)

    //  return the array — empty or not — to the frontend
    return res.json(invData)
    
  } catch (error) {
    next(error)
  }
}

/* ***************************
 *  Build edit inventory view
 * ************************** */
invCont.editInventoryView = async function (req, res, next) {
  const inv_id = parseInt(req.params.inv_id);
  let nav = await utilities.getNav();
  const itemData = await invModel.getVehicleById(inv_id);
  const classificationSelect = await utilities.buildClassificationList(itemData.classification_id);
  const itemName = `${itemData.inv_make} ${itemData.inv_model}`;

  res.render("./inventory/edit-inventory", {
    title: "Edit " + itemName,
    nav,
    classificationSelect,
    errors: [],
    message: req.flash("message"),
    inv_id: itemData.inv_id,
    inv_make: itemData.inv_make,
    inv_model: itemData.inv_model,
    inv_year: itemData.inv_year,
    inv_description: itemData.inv_description,
    inv_image: itemData.inv_image,
    inv_thumbnail: itemData.inv_thumbnail,
    inv_price: itemData.inv_price,
    inv_miles: itemData.inv_miles,
    inv_color: itemData.inv_color,
    classification_id: itemData.classification_id,
  });
};


// invCont.updateInventory = async function (req, res) {
//   const invData = req.body;
//   const result = await invModel.updateInventory(invData);

//   if (result) {
//     req.flash("success", "Vehicle updated successfully.");
//     res.redirect("/inv/");
//   } else {
//     let nav = await utilities.getNav();
//     let classificationSelect = await utilities.buildClassificationList(invData.classification_id);
//     req.flash("message", "Failed to update vehicle.");
//     res.render("inventory/edit-inventory", {
//       title: "Edit Inventory",
//       nav,
//       classificationSelect,
//       ...invData,
//       message: req.flash("message"),
//       errors: [],
//     });
//   }
// };

/* ***************************
 *  Update Inventory Data
 * ************************** */
invCont.updateInventory = async function (req, res, next) {
  let nav = await utilities.getNav();
  const {
    inv_id,
    inv_make,
    inv_model,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_year,
    inv_miles,
    inv_color,
    classification_id,
  } = req.body;

  // const updateResult = await invModel.updateInventory(
  //   inv_id,
  //   inv_make,
  //   inv_model,
  //   inv_description,
  //   inv_image,
  //   inv_thumbnail,
  //   inv_price,
  //   inv_year,
  //   inv_miles,
  //   inv_color,
  //   classification_id
  // );
  
  const updateResult = await invModel.updateInventory(req.body)

  if (updateResult) {
  const itemName = inv_make + " " + inv_model;
  req.flash("notice", `The ${itemName} was successfully updated.`);
  res.redirect("/inv/");

  } else {
    const classificationSelect = await utilities.buildClassificationList(classification_id);
    const itemName = `${inv_make} ${inv_model}`;
    req.flash("notice", "Sorry, the update failed.");
    res.status(501).render("inventory/edit-inventory", {
      title: "Edit " + itemName,
      nav,
      classificationSelect,
      errors: null,
      inv_id,
      inv_make,
      inv_model,
      inv_year,
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_price,
      inv_miles,
      inv_color,
      classification_id
    });
  }
};

/* ***************************
 *  Build Delete Confirmation View
 * ************************** */
invCont.buildDeleteInventoryView = async function (req, res) {
  const inv_id = parseInt(req.params.inv_id)
  const data = await invModel.getInventoryItemById(inv_id)

  // Check if the vehicle was found
  if (!data) {
    req.flash("notice", "Sorry, the vehicle was not found.")
    return res.redirect("/inv/")
  }

  const nav = await utilities.getNav()
  const name = `${data.inv_make} ${data.inv_model}`

  res.render("./inventory/delete-confirm", {
    title: "Delete " + name,
    nav,
    errors: null,
    inv_id: data.inv_id,
    inv_make: data.inv_make,
    inv_model: data.inv_model,
    inv_price: data.inv_price,
    inv_year: data.inv_year
  })
}


/* ***************************
 *  Delete Inventory Item
 * ************************** */
invCont.deleteInventoryItem = async function (req, res) {
  const inv_id = parseInt(req.body.inv_id)
  const deleteResult = await invModel.deleteInventoryItem(inv_id)

  if (deleteResult > 0) {  // Checks if at least one row was deleted
    req.flash("notice", "The inventory item was successfully deleted.")
    res.redirect("/inv/")
  } else {
    req.flash("notice", "Sorry, the delete failed.")
    res.redirect(`/inv/delete/${inv_id}`)
  }
}



//  Attach the detail function to the controller
invCont.buildDetailView = buildDetailView;

module.exports = invCont;
