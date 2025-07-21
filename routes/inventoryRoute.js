// Needed Resources 
const express = require("express")
const router = new express.Router() 
const invController = require("../controllers/invController")


// Route to build inventory by classification view
router.get("/type/:classificationId", invController.buildByClassificationId);
router.get("/detail/:inv_id", invController.buildDetailView);
router.get("/", invController.buildInventory)

// router.get("/error", invController.buildInventory); ///to remove after testing error handling

module.exports = router;