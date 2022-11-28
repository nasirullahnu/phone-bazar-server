const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken')
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

function verifyJWT(req, res, next){
    console.log('token inside verify jwt', req.headers.authorization)
    const authHeader = req.headers.authorization
    if(!authHeader){
        return res.status(401).send('unauthorized access')
    }

    const token = authHeader.split(' ')[1]
    console.log(token)
    jwt.verify(token, process.env.ACCESS_TOKEN, function(err, decoded){
        if(err){
            return res.status(403).send({message : 'forbiden, access'})
        }
        req.decoded = decoded;
        next();
    })
}

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

        // make admin api is created 
        app.put('/allUsers/:id', verifyJWT,  async (req, res)=> {
            const decodedEmail = req.decoded.email
            const query = {email : decodedEmail}
            const user = await allUsersCollections.findOne(query)

            if(user?.identity !== 'admin'){
                return res.status(403).send({message : 'forbidden access'})
            }

            const id = req.params.id
            const filter = {_id : ObjectId(id)}
            const option = {upsert : true};
            const updatedDoc = {
                        $set : {
                            status : 'verified'
                        }
                    }
                    const result = await allUsersCollections.updateOne(filter, updatedDoc, option)
            res.send(result);
        })

    

        // get all sellers from database
        app.get('/sellers', async (req, res)=>{
            const role = req.query.role
            const query = {role : role}
            const result = await allUsersCollections.find(query).toArray();
            res.send(result);
        })
        // delete sellers from database 
        app.delete('/sellers/:id', async (req, res)=> {
            const id = req.params.id
            const filter = {_id : ObjectId(id)}
            const result = await allUsersCollections.deleteOne(filter);
            res.send(result);
        })
        


        // get all buyers from database
        app.get('/buyers', async (req, res)=>{
            const role = req.query.role
            const query = {role : role}
            const result = await allUsersCollections.find(query).toArray();
            res.send(result);
        })
        // delete sellers from database 
        app.delete('/buyers/:id', async (req, res)=> {
            const id = req.params.id
            const filter = {_id : ObjectId(id)}
            const result = await allUsersCollections.deleteOne(filter);
            res.send(result);
        })




        // issue json web token 
        app.get('/jwt', async(req, res)=> {
            const email = req.query.email;
            const query={email:email};
            const user=await allUsersCollections.findOne(query);
            if(user){
                const token = jwt.sign({email}, process.env.ACCESS_TOKEN, {expiresIn: '2h'})
                return res.status(403).send({accessToken : token})
            }
            console.log(user);
            res.status(403).send({accessToken: ''})
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
        app.get('/bookings', verifyJWT,   async (req, res) => {
            const email = req.query.email
            console.log(email)
            const decodedEmail = req.decoded.email;
            if(email !== decodedEmail){
                return res.status(403).send({message : 'forbidden access'});
            }
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
