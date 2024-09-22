const bcrypt = require("bcrypt");
const Candidate = require("../models/candidateModel");
const { checkAdminRole } = require("../middleware/AuthorizationMiddleware");
const User = require("../models/userModel");

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
      return res.status(400).json({
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
    }
    // Retrieve all candidates from the database
    const candidates = await Candidate.find();

    // If no candidates are found, return an appropriate message
    if (candidates.length === 0) {
      return res.status(404).json({ message: "No candidates found" });
    }

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
    return res.status(200).json({ updatedData: response });
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
    const response = await Candidate.findByIdAndDelete(candidateID);
    if (!response) {
      return res.status(404).json({ error: "candidate not found" });
    }
    return res.status(200).json({ msg: "candidate deleted" });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: "internal server error" });
  }
};

//lets Start Voting
const voteCount = async (req, res) => {
  //no admin can vote
  //user can only vote once
  const candidateId = req.params.candidateId;
  const userId = req.user.id;
  try {
    //find the candidate document with the specified candidateID
    const candidate = await Candidate.findById(candidateId);
    if (!candidate) {
      return res.status(404).json({ message: "candidate not found" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "user not found" });
    }

    if (user.role == "admin") {
      res.status(403).json({ message: "admin is not allowed" });
    }
    if(user.isVoted){
      return res.status(400).json({ message: 'You have already voted' });
  }

    //update the candidate document to record the vote
    candidate.votes.push({ user: userId });

    candidate.voteCount++;
    await candidate.save();

    //updated the user document
    user.isVoted = true;
    await user.save();
    return res.status(200).json({ message: "vote  recorded sucessfully" });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: "internal server error" });
  }
};

const countVote = async(req,res)=>{
  try{ 
    //find all candidate and sort them  by voteCount in descending order
    const candidate = await Candidate.find().sort({voteCount : "desc"});

    //map the candiddates to only return their  name and votecount

    const voteRecord = candidate.map((data)=>{
      return{
        party :data.party,
        count : data.voteCount
      }
    });

    return res.status(200).json({vote: voteRecord});

  }
  catch (err) {
    console.log(err);
    return res.status(500).json({ error: "internal server error" });
  }
}



module.exports = {
  addController,
  updateCandidate,
  deleteCandidate,
  allCandidate,
  voteCount,
  countVote
  
};
