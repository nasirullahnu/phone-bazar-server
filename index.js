const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion } = require('mongodb');
require('dotenv').config();
const app = express();
const port = process.env.PORT || 5000;

// middleware 
app.use(cors());
app.use(express.json());



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.w5uqgn7.mongodb.net/?retryWrites=true&w=majority`;
// console.log(uri)
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run(){
    try{
        const allUsersCollections = client.db('phoneBazar').collection('allUsers');
        const categoriesCollections = client.db('phoneBazar').collection('categories');

        // post and set user information to database 
        app.post('/allUsers', async (req, res)=>{
            const user = req.body
            console.log(user);
            const result = await allUsersCollections.insertOne(user);
            res.send(result);
        })
        // get all users from database
        app.get('/allUsers', async (req, res)=>{
            const query = {}
            const result = await allUsersCollections.find(query).toArray();
            res.send(result);
        })


        // get categories from database 
        app.get('/categories', async (req, res)=> {
            const query = {}
            const result = await categoriesCollections.find(query).toArray();
            res.send(result);
        })
    }
    finally{

    }
}
run().catch(error=>console.log(error))


app.get('/', (req, res)=> {
    res.send('This is form Phone Server')
})
app.listen(port, ()=> {
    console.log(`Listening to port`, port)
})
