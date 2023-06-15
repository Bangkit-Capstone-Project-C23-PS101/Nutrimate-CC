const express = require("express");
const router = express.Router();
const cors = require("cors");

const {signup, signin} = require("../controllers/auth");

router.use(cors({
    "origin" : "*"
}))

//Route to signup page
router.post("/signup", signup);

//Route to signin page
router.post("/signin", signin);

module.exports = router;