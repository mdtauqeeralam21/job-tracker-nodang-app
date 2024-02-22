// import { MongoClient } from 'mongodb';

// // Function to connect to MongoDB
// const connectDB= async (uri)=> {
//     const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    
//     try {
//         await client.connect();
//         console.log('Connected to MongoDB');
//         return client.db(); // Returning the database instance
//     } catch (error) {
//         console.error('Error connecting to MongoDB:', error);
//         throw error;
//     }
// }

// export default  connectDB ;



import mongoose from "mongoose";

const connectDB = (URL) => {
  return mongoose.connect(URL);
};

export default connectDB;
