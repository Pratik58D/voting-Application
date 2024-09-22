const express =  require("express");
const router = express.Router();

const {authMiddleware} = require("../middleware/jwt");
const { addController, updateCandidate, deleteCandidate, allCandidate, voteCount, countVote } = require("../controllers/candidateController");



router.post("/create",authMiddleware,addController);

router.get("/all",authMiddleware,allCandidate)

router.put("/update/:candidateId", authMiddleware,updateCandidate);
router.delete("/delete/:candidateId", authMiddleware,deleteCandidate);

router.post("/vote/:candidateId",authMiddleware,voteCount);

router.get("/vote/count",countVote)



module.exports = router;