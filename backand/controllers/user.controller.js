import bcrypt from "bcrypt";
import crypto from "crypto";
import User from "../models/user.model.js";
import Profile from "../models/profile.model.js";
import Connection from "../models/connection.model.js";
import PDFDocument from "pdfkit";
import fs, { createWriteStream } from "fs";

const userTokens = new Map();

const covertUserDataToPDF = async (userProfile) => {
  const doc = new PDFDocument();
  const outputPath = crypto.randomBytes(32).toString("hex") + ".pdf";
  const stream = createWriteStream("uploads/" + outputPath);

  doc.pipe(stream);

  doc.fontSize(18).text("User Profile", { align: "center" });
  doc.moveDown();

  if (userProfile.userId?.profilePicture) {
    try {
      doc.image("uploads/" + userProfile.userId.profilePicture, 200, 80, {
        width: 100,
        height: 100,
      });
    } catch (err) {
      console.error("❌ Error loading profile picture:", err.message);
    }
  }

  doc.moveDown();

  doc.fontSize(12).text(`Name: ${userProfile.userId?.name || "N/A"}`);
  doc.text(`Email: ${userProfile.userId?.email || "N/A"}`);
  doc.text(`Username: ${userProfile.userId?.username || "N/A"}`);
  doc.text(`Bio: ${userProfile.bio || "N/A"}`);
  doc.text(`Current Post: ${userProfile.currentPost || "N/A"}`);

  doc.moveDown();

  doc.text("Past Work Experience:");
  (userProfile.pastWork || []).forEach((work) => {
    doc.text(`Company: ${work.company || "N/A"}`);
    doc.text(`Position: ${work.position || "N/A"}`);
    doc.text(`Duration: ${work.years || "N/A"} years`);
    doc.text(`Description: ${work.description || "N/A"}`);
    doc.moveDown();
  });

  doc.text("Generated via LinkedIn Clone App", { align: "center" });

  doc.end();
  return outputPath;
};

export const register = async (req, res) => {
  try {
    const { name, email, password, username } = req.body;
    if (!name || !email || !password || !username) {
      return res.status(400).json({ message: "All fields are required" });
    }
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: "User already exists" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
      username,
      active: true,
      createdAt: new Date(),
    });
    const newProfile = new Profile({
      userId: newUser._id,
      bio: "",
      currentPost: "",
      pastWork: [],
      workExperience: [],
      education: [],
    });
    await newProfile.save();
    return res.status(201).json({ message: "User registered successfully" });
  } catch (err) {
    console.error("❌ Register Error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = crypto.randomBytes(32).toString("hex");
    
    // Save to in-memory map
    userTokens.set(user._id.toString(), token);
    
    // Also save token in DB
    user.token = token;
    await user.save();

    return res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        username: user.username,
      },
    });
  } catch (err) {
    console.error("❌ Login Error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

export const uploadProfilePicture = async (req, res) => {
  const { token } = req.body;
  try {
    const user = await User.findOne({ token: token });

    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    user.profilePicture = req.file.filename;

    await user.save();
    return res
      .status(200)
      .json({ message: "Profile picture uploaded successfully" });
  } catch (err) {
    console.error("❌ Upload Profile Picture Error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};
export const updateUserProfile = async (req, res) => {
  try {
    const { token, ...newUserData } = req.body;

    // Check if the token exists in the in-memory store
    const userId = Array.from(userTokens.keys()).find(
      (key) => userTokens.get(key) === token
    );

    if (!userId) {
      return res.status(401).json({ message: "User not found" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    const { username, email } = newUserData;
    const existingUser = await User.findOne({ $or: [{ username }, { email }] });

    if (existingUser && String(existingUser._id) !== String(user._id)) {
      return res
        .status(409)
        .json({ message: "Username or email already exists" });
    }

    Object.assign(user, newUserData);
    await user.save();

    return res.json({ message: "User profile updated successfully" });
  } catch (err) {
    console.error("❌ Update User Profile Error:", err);
    return res.status(500).json({ message: err.message });
  }
  };
  
  export const getUserAndProfile = async (req, res) => {
    const { token } = req.query;
  
    if (!token) {
      return res.status(400).json({ message: "Token is required" });
    }
  
    try {
      const userId = Array.from(userTokens.keys()).find(
        (key) => userTokens.get(key) === token
      );
  
      if (!userId) {
        return res.status(401).json({ message: "User not found" });
      }
  
      const user = await User.findById(userId).select('-password'); // Hide password
      if (!user) {
        return res.status(401).json({ message: "User not found" });
      }
  
      const profile = await Profile.findOne({ userId: user._id });
      if (!profile) {
        return res.status(404).json({ message: "Profile not found" });
      }
  
      return res.json({
        user,      // ✅ Send full user info like name, email, username etc.
        profile    // ✅ Send profile separately if needed
      });
    } catch (err) {
      console.error("❌ Get User and Profile Error:", err);
      return res.status(500).json({ message: err.message });
    }
  };
  


export const updateProfileData = async (req, res) => {
  try {
    const { token, ...newProfileData } = req.body;

    // Check the token in the in-memory store (userTokens map)
    const userId = [...userTokens.entries()].find(
      ([key, value]) => value === token
    )?.[0];

    if (!userId) {
      return res.status(401).json({ message: "User not found" });
    }

    const userProfile = await Profile.findOne({ userId: userId });
    if (!userProfile) {
      return res.status(404).json({ message: "Profile not found" });
    }

    // Update profile with new data
    Object.assign(userProfile, newProfileData);
    await userProfile.save();

    return res.json({ message: "User profile updated successfully" });
  } catch (err) {
    console.error("❌ Update Profile Data Error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

export const getAllUserProfile = async (req, res) => {
  try {
    const profiles = await Profile.find().populate("userId", "name username profilePicture email");

    if (!profile) {
      return res.status(404).json({ message: "Profile not found" });
    }

    return res.json({ profile });
  } catch (err) {
    return res
      .status(500)
      .json({ message: "Error fetching profile", error: err.message });
  }
};

export const downloadProfile = async (req, res) => {
  const user_id = req.query.id;
  try {
    const userProfile = await Profile.findOne({ userId: user_id }).populate(
      "userId",
      "name username profilePicture email"
    );
    if (!userProfile) {
      return res.status(404).json({ message: "Profile not found" });
    }

    const outputPath = await covertUserDataToPDF(userProfile);
    const fullPath = `uploads/${outputPath}`;

    // 🔥 Wait for the stream to finish before downloading
    const stream = fs.createReadStream(fullPath);
    stream.on("open", () => {
      res.setHeader("Content-Disposition", `attachment; filename="Profile.pdf"`);
      res.setHeader("Content-Type", "application/pdf");
      stream.pipe(res);
    });

    stream.on("error", (err) => {
      console.error("❌ Stream error:", err);
      res.status(500).json({ message: "Error downloading file" });
    });

  } catch (err) {
    console.error("❌ Download Profile Error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

export const sendConnectionRequest = async (req, res) => {
  const { token, connectionId } = req.body;

  try {
    const user = await User.findOne({ token });
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    const connectionUser = await User.findOne({ _id: connectionId });
    if (!connectionUser) {
      return res.status(404).json({ message: "Connection user not found" });
    }

    // Check if a request already exists
    const existingRequest = await Connection.findOne({
      userId: user._id,
      connectionId: connectionId,
    });

    if (existingRequest) {
      return res.status(409).json({ message: "Connection request already sent" });
    }

    
    const newConnectionRequest = new Connection({
      userId: user._id,
      connectionId: connectionId,
      status: "pending", 
    });

    await newConnectionRequest.save();

    user.pendingConnections.push(connectionId);
    await user.save();

    return res.status(200).json({ message: "Connection request sent successfully" });
  } catch (err) {
    console.error("❌ Error in sending connection request:", err);
    return res.status(500).json({ message: "Server error" });
  }
};
export const getMyConnectionRequest = async (req, res) => {
  const { token } = req.body;

  try {
    const user = await User.findOne({ token });
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    const connectionRequests = await Connection.find({
      userId: user._id,
      status: "pending",
    }).populate("connectionId", "name username email profilePicture");

    if (connectionRequests.length === 0) {
      return res.status(404).json({ message: "No pending connection requests" });
    }

    return res.status(200).json({ connectionRequests });
  } catch (err) {
    console.error("❌ Error in fetching connection requests:", err);
    return res.status(500).json({ message: "Server error" });
  }
};


export const whatAreMyConnections = async (req, res) => {
  const { token } = req.body;

  try {
    const user = await User.findOne({ token });
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    const connections = await Connection.find({
      $or: [{ userId: user._id }, { connectionId: user._id }],
      status: "accepted",
    }).populate("userId connectionId", "name username profilePicture");

    if (connections.length === 0) {
      return res.status(404).json({ message: "No connections found" });
    }

    return res.status(200).json({ connections });
  } catch (err) {
    console.error("❌ Error in fetching connections:", err);
    return res.status(500).json({ message: "Server error" });
  }
};



export const acceptConnectionRequest = async (req, res) => {
  const { token, connectionId } = req.body;

  try {
    const user = await User.findOne({ token });
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    const connectionRequest = await Connection.findOne({
      userId: connectionId,
      connectionId: user._id,
      status: "pending",
    });

    if (!connectionRequest) {
      return res.status(404).json({ message: "Connection request not found" });
    }

    connectionRequest.status = "accepted";
    await connectionRequest.save();

    const reverseConnectionRequest = await Connection.findOne({
      userId: user._id,
      connectionId: connectionId,
      status: "pending",
    });

    if (reverseConnectionRequest) {
      reverseConnectionRequest.status = "accepted";
      await reverseConnectionRequest.save();
    }
    

    return res.status(200).json({ message: "Connection request accepted successfully" });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};


export const getProfileById = async (req, res) => {
  const { token, user_id } = req.body;

  try {
    const user = await User.findOne({ token });
    if (!user) return res.status(401).json({ message: "Invalid token" });

    const targetUser = await User.findById(user_id).select("name email username");
    const profile = await Profile.findOne({ userId: user_id });

    if (!targetUser) return res.status(404).json({ message: "User not found" });

    return res.status(200).json({
      user: {
        ...targetUser.toObject(),
        bio: profile?.bio || '',
        currentPost: profile?.currentPost || '',
      },
    });
  } catch (err) {
    console.error("Get profile by ID error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};
