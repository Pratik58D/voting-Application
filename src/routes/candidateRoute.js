const express =  require("express");
const router = express.Router();

const {authMiddleware} = require("../middleware/jwt");
const { addController, updateCandidate, deleteCandidate, allCandidate } = require("../controllers/candidateController");



router.post("/create",authMiddleware,addController);

router.get("/all",authMiddleware,allCandidate)

router.put("/update/:candidateId", authMiddleware,updateCandidate);
router.delete("/delete/:candidateId", authMiddleware,deleteCandidate);





module.exports = router;