import express from 'express';
import 'dotenv/config'
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();


app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(cors());
app.use(cookieParser());



const PORT = process.env.PORT || 7000;
app.listen(PORT, ()=>{
    console.log(`Server is listening on port ${PORT}`)
})