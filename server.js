require("dotenv").config();/**Loads variables from env file to protect passwords*/

/** */
const express = require("express");/** This creates a web server which acts as a middleman between frontend and backend*/
const mongoose = require("mongoose");/**This helps the js talk to the database in mongodb */

const app = express();/**This connects us to express frame(database) */
const PORT = 3000;/**localhost 300 */

app.use(express.json());/**This converts everything a user sends to JSON object */

const Trade = require("./trade");/**This imports the trade model(array) */

const dbURI = process.env.MONGO_URI;

mongoose.connect(dbURI)/**This connects  you to the backend*/
.then(() => {
    console.log("Database connected successfully 🚀");/**This shows only if the database has successfully connected */

    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
})
.catch(err => console.log(err));


app.get("/", (req, res) => {
    res.send("Trading Journal Backend Running 🚀");
});/**This gets data */


app.get("/api/trades", requireLogin, async (req, res) => {

  try {

    const trades = await Trade.find({
      userId: req.session.userId
    });

    res.json(trades);

  } catch (err) {

    res.status(500).json({ error: "Failed to fetch trades" });

  }

});


app.post("/api/trades", requireLogin, async (req, res) => {

  try {

    const trades = req.body;

    const tradesWithUser = trades.map(trade => ({
      ...trade,
      userId: req.session.userId
    }));

    await Trade.deleteMany({ userId: req.session.userId });

    await Trade.insertMany(tradesWithUser);

    res.json({ message: "Trades saved successfully" });

  } catch (err) {

    res.status(500).json({ error: "Failed to save trades" });

  }

});


app.delete("/api/trades/:id", async (req, res) => {
  try {

    await Trade.findByIdAndDelete(req.params.id);

    res.json({ message: "Trade deleted" });

  } catch (err) {

    res.status(500).json({ error: "Delete failed" });

  }
});

const session = require("express-session");

app.use(session({
  secret: "supersecretkey",
  resave: false,
  saveUninitialized: false
}));

const bcrypt = require("bcrypt");
const User = require("./models/User");

app.post("/api/signup", async (req, res) => {

  try {

    const { username, password } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      username,
      password: hashedPassword
    });

    await user.save();

    res.json({ message: "User created successfully" });

  } catch (err) {

    res.status(500).json({ error: "Signup failed" });

  }

});

app.post("/api/login", async (req, res) => {

  const { username, password } = req.body;

  const user = await User.findOne({ username });

  if (!user) {
    return res.status(400).json({ error: "User not found" });
  }

  const match = await bcrypt.compare(password, user.password);

  if (!match) {
    return res.status(400).json({ error: "Incorrect password" });
  }

  req.session.userId = user._id;

  res.json({ message: "Login successful" });

});
function requireLogin(req,res,next){

if(!req.session.userId){
return res.status(401).json({error:"Not logged in"});
}

next();

}