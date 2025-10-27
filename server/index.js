import express from 'express';
import 'dotenv/config'
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();


app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(cors());
app.use(cookieParser());



import authRoutes from './routes/auth.routes.js';
import userRoutes from './routes/user.routes.js';
//Routes
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);



const PORT = process.env.PORT || 7000;
app.listen(PORT, ()=>{
    console.log(`Server is listening on port ${PORT}`)
})