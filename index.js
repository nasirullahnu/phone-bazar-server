const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
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
        const productsCollections = client.db('phoneBazar').collection('products');
        const bookingCollections = client.db('phoneBazar').collection('bookings');
        const reviewCollections = client.db('phoneBazar').collection('reviews');

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
        // load sub category products items from database 
        app.get('/products/:id', async (req, res)=> {
            const id = req.params.id
            const filter = {category_id : id}
            const result = await productsCollections.find(filter).toArray();
            res.send(result);
        })
        


        // post buyers bookings to database 
        app.post('/bookings', async (req, res)=> {
            const booking = req.body;
            console.log(booking)
            const result = await bookingCollections.insertOne(booking);
            res.send(result)
        })
        // get my orders from database 
        app.get('/bookings',  async (req, res) => {
            const email = req.query.email
            console.log(email)
            const query = {
                email : email
            }
            const result = await bookingCollections.find(query).toArray();
            res.send(result)
        })
        // delete buyer orders from database 
        app.delete('/bookings/:id', async (req, res)=> {
            const id = req.params.id
            const filter = {_id : ObjectId(id)}
            const result = await bookingCollections.deleteOne(filter);
            res.send(result);
        })



        // add products to database api 
        app.post('/products', async(req, res)=> {
            const products = req.body
            console.log(products)
            const result = await productsCollections.insertOne(products);
            res.send(result)
        })
        // get user specific products from database 
        app.get('/products',  async (req, res) => {
            const email = req.query.email
            console.log(email)
            const query = {
                sellerMail : email
            }
            const result = await productsCollections.find(query).toArray();
            res.send(result)
        })
        // delete products from database 
        app.delete('/products/:id', async (req, res)=> {
            const id = req.params.id
            const filter = {_id : ObjectId(id)}
            const result = await productsCollections.deleteOne(filter);
            res.send(result);
        })


        // add review to database api is create 
        app.post('/reviews', async (req, res)=> {
            const review = req.body;
            console.log(review)
            const result = await reviewCollections.insertOne(review);
            res.send(result)
        })



        // update json data 
        // app.get('/description', async (req, res) => {
        //     const filter = {};
        //     const options = { upsert: true };
        //     const updateDoc = {
        //         $set: {
        //             description: "This is a very good phone. 10 Days of moneyback garranty"
        //         }
        //     }
        //     const result = await productsCollections.updateMany(filter, updateDoc, options)
        //     res.send(result)
        // })
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
