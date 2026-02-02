import dotenv from "dotenv"
import connectDB from "./db/index.js"
import {app} from "./app.js"
import { initCronJobs } from "./services/cron.services.js"


dotenv.config()

connectDB().then(() => {
    app.listen(process.env.PORT || 8000, () => {
        console.log(`⚙️ Server is running at port : ${process.env.PORT}`);
        // Initialize cron jobs after server starts
        initCronJobs();
    })
})
.catch((err) => {
    console.log("MONGO db connection failed !!! ", err);
})




//         await mongoose.connect(`${process.env.MONGODB_URL}/${DB_NAME}`);
//         app.on("error", (error) => {
//             console.error("Express error:", error);
//         });
//         app.listen(process.env.PORT, () => {
//             console.log(`Server is running on port ${process.env.PORT}`);
//         });
//     } catch (error) {
//         console.error("MongoDB connection error:", error);
//     }
// })();
