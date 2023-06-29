const express = require("express");
const router = express.Router();
const { getAllProducts, createProduct, updateProduct, deleteProduct, getProductDetails, createProductReview, getProductsReviews, deleteReview } = require("../controllers/productController");
const { isAuthenticatedUser, authorizeRoles } = require("../middleware/auth");


router.route("/products").get(getAllProducts);

router.route("/admin/product/:id").put(isAuthenticatedUser, authorizeRoles("admin"), updateProduct).delete(isAuthenticatedUser, deleteProduct);

router.route("/product/:id").get(getProductDetails);

router.route("/admin/product/new").post(isAuthenticatedUser, createProduct);

router.route("/review").put(isAuthenticatedUser, createProductReview);

router.route("/reviews").get(getProductsReviews).delete(isAuthenticatedUser, deleteReview);

module.exports = router;