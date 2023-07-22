const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { User } = require("../models/User.js");

/* REGISTER USER */
const register = async (req, res) => {
    try {
        const {
            firstName,
            lastName,
            email,
            password,
            picturePath,
            friends,
            location,
            occupation,
        } = req.body;

        // salt generation to encrypt the password
        const salt = await bcrypt.genSalt();
        // generation password hash
        const passwordHash = await bcrypt.hash(password, salt);

        const newUser = new User({
            firstName,
            lastName,
            email,
            password: passwordHash,
            picturePath,
            friends,
            location,
            occupation,
            viewedProfile: Math.floor(Math.random() * 10000),
            impressions: Math.floor(Math.random() * 10000),
        });

        const savedUser = await newUser.save();
        console.log({ savedUser });
        res.status(201).json({
            Message: "Successfully created new User",
            data: {
                firstName: savedUser.firstName,
                lastName: savedUser.lastName,
                email: savedUser.email,
                picturePath: savedUser.picturePath,
                friends: savedUser.friends,
                location: savedUser.location,
                occupation: savedUser.occupation
            }
        });
    } catch (error) {
        console.log({ error });
        res.status(500).json({ error: error.message });
    }
}


/* LOGGING IN */
const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email: email });
        if (!user) return res.status(400).json({ msg: "User does not exist. " });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ msg: "Invalid credentials. " });

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
        delete user.password;
        return res.status(200).json({ token, user });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports = { register, login };