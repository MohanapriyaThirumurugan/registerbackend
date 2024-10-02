import express from 'express'
import dotenv from 'dotenv'
import data from './src/database/index.js'
import registerrouter from './src/Router/index.js'
import cors from 'cors'
dotenv.config()

const app=express()
const port = process.env.PORT || 8000;
app.use(cors());
app.use(express.json());


data()
app.get((req,res)=>{
    res.send("hello")
})
app.use('/', registerrouter)
app.listen(port,()=>(console.log(`app is listening ${port}`)
))