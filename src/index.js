import dotenv from "dotenv"
import express from "express"
import connectDB from "./db/index.js";
import  { app }  from "./app.js"


dotenv.config({
    path:'./.env'
})

connectDB()
.then(()=>{

    // app.on("error",(error)=>{
    //     console.log("ERR:",error);
    //     throw error
    //     });
    // })

   const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});

})
.catch((err)=>{
    console.log("MongoDB connection failed !!!",err);
})











/* import express from "express";
const app  = express()


( async ()=>{
    try {
        await mongoose.connect(`${process.env.MONGODB_URL}/${DB_NAME}`)
        app.on("error : ",(error)=>{
            console.log("ERROR:",error);
            throw error
        })

        app.listen(process.env.PORT,()=>{
            console.log(`App is listening on port ${process.env.PORT}`);
            
        })
    } catch (error) {
        console.log("ERROR :",error);
        throw error
    }
} )()  */