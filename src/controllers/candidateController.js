const bcrypt = require("bcrypt");
const Candidate = require("../models/candidateModel");
const { checkAdminRole } = require("../middleware/AuthorizationMiddleware");

const addController = async (req, res) => {
  try {
    if (!(await checkAdminRole(req.user.id))) {
      return res.status(403).json({ message: "user doesnot have admin role" });
    }
    //assuming the request body conatains the user data
    const data = req.body;

    // Assuming the request body contains the candidate data
    const { citizenship } = req.body;
    // Check if a candidate with the same citizenship number already exists
    const existingCandidate = await Candidate.findOne({ citizenship });
    if (existingCandidate) {
      return res
        .status(400)
        .json({
          message: "Candidate with this citizenship number already exists",
        });
    }

    //create a candidate document using the MOngoose model
    const newCandidate = new Candidate(data);

    //save the new user  to database
    const response = await newCandidate.save();
    console.log("data saved");
    return res.status(200).json({ response: response });
  } catch (err) {
    console.log("error in signup", err);
    return res.status(500).json({ msg: "Internal server error " });
  }
};
const allCandidate = async (req, res) => {
  try {
    if (!(await checkAdminRole(req.user.id))) {
      return res.status(403).json({ message: "user doesnot have admin role" });
    };
       // Retrieve all candidates from the database
       const candidates = await Candidate.find();

         // If no candidates are found, return an appropriate message
    if (candidates.length === 0) {
        return res.status(404).json({ message: "No candidates found" });
      };

    return res.status(200).json({ candidates });
  } catch (err) {
    console.log("Error retrieving candidates", err);
    return res.status(500).json({ msg: "Internal server error" });
  }
};

const updateCandidate = async (req, res) => {
  try {
    if (!(await checkAdminRole(req.user.id))) {
      return res.status(404).json({ message: "user  doesnot have admin role" });
    }

    //extracting candidate id from url
    const candidateID = req.params.candidateId;
    //updated data for Person
    const updatedCandidateData = req.body;
    const response = await Candidate.findByIdAndUpdate(
      candidateID,
      updatedCandidateData,
      {
        new: true, //return the updated document
        runvalidators: true, //run MOngoose validattion
      }
    );
    if (!response) {
      return res.status(403).json({ error: "candidate not found" });
    }
    return res.status(200).json({ updatedData : response });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: "internal server error" });
  }
};
const deleteCandidate = async (req, res) => {
  try {
    if (!(await checkAdminRole(req.user.id))) {
      return res.status(403).json({ message: "user doesnot have admin role" });
    }

    //extracating candidate id from url
    const candidateID = req.params.candidateId;
    const response = await Candidate.findByIdAndDelete(
      candidateID,
    );
    if (!response) {
      return res.status(404).json({ error: "candidate not found" });
    }
    return res.status(200).json({ msg:"candidate deleted" });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: "internal server error" });
  }
};


module.exports = {
  addController,
  updateCandidate,
  deleteCandidate,
  allCandidate
};
