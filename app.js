const express = require("express")
const cors = require("cors")
const app = express();

//Enable Cross Origin Sharing Resources
app.use(cors());

//Routes 
const authRoutes = require("./routes/auth")

//Middlewares
app.use(express.json)

//Routes
app.use("/api",authRoutes)

//PORT 
const PORT = process.env.PORT || 3000

//Starting Server 
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
})