/*This works. But using require while the rest are using import disturbs the code consistency.

require('dotenv').config({path: './env'}) //This should at the top of file as it loads the environment variables.
*/

//This is a better approach:
import dotenv from 'dotenv';
import connectDB from './db/index.js';

dotenv.config({
    path: './env'
})

connectDB()
.then( ()=> {
    app.listen(process.env.PORT || 8000, ()=> {
        console.log(`Server is running on port ${process.env.PORT}`)
    })
})
.catch((error) => {
    console.log('MongoDB connection failed', error)
})




//This is one approach. But we will use a more professional approach.
/*
(async ()=> {
    try {
        await mongoose.connect(`${process.env.MONGODB_URL}/${DB_name}`)
        console.log("Database connected")
    } catch {
        console.log(error)
        throw(error)
    }
}) ()
*/
