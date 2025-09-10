import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"

const app = express()

app.use(cors())

app.use(express.json({limit:"16kb"}))
app.use(express.urlencoded({extended:true,limit:"16kb"}))
app.use(express.static("public"))
app.use(cookieParser())


app.use((req, res, next) => {
    console.log("--- New Request Received ---");
    console.log("URL:", req.originalUrl);
    console.log("METHOD:", req.method);
    console.log("HEADERS:", req.headers); // <-- This will tell us the content-type
    console.log("BODY:", req.body);       // <-- This will show us if the body is empty
    console.log("--------------------------");
    next();
});

import userRouter from "./routes/user.routes.js"

app.use("/api/v1/users",userRouter)

export {app}