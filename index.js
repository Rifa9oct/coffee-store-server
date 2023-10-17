const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const port = process.env.PORT || 5000;

// middlewire
app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.6vyreuj.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        await client.connect();

        const coffeesCollection = client.db('coffeesDB').collection('coffees');
        const usersCollection = client.db('coffeesDB').collection('users');

        app.get("/coffees", async(req, res) => {
            const cursor = coffeesCollection.find();
            const result = await cursor.toArray();
            res.send(result);
        })

        app.get("/coffees/:id", async(req, res) => {
            const id = req.params.id;
            const query = {_id: new ObjectId(id)}
            const result = await coffeesCollection.findOne(query);
            res.send(result);
        })

        app.post("/coffees", async(req, res) => {
            const coffees = req.body;
            console.log("add coffee", coffees);
            const result = await coffeesCollection.insertOne(coffees);
            res.send(result);
        })

        app.put("/coffees/:id", async(req, res)  => {
            const id = req.params.id;
            const coffee = req.body;
            console.log(coffee)
            const filter = {_id: new ObjectId(id)}
            const options = {upsert: true}
            const updatedCoffee ={
                $set: {
                    name:coffee.name, 
                    price: coffee.price, 
                    supplier: coffee.supplier, 
                    taste: coffee.taste, 
                    category: coffee.category, 
                    details: coffee.details, 
                    photo: coffee.photo
                }
            }
            const result = await coffeesCollection.updateOne(filter,updatedCoffee,options);
            res.send(result);
        })

        app.delete("/coffees/:id", async(req, res) => {
            const id = req.params.id;
            const query = {_id: new ObjectId(id)};
            const result = await coffeesCollection.deleteOne(query);
            res.send(result);
        })

        //Users API
        app.get("/users", async(req,res) =>{
            const cursor = usersCollection.find();
            const result = await cursor.toArray();
            res.send(result); 
        })

        app.post("/users", async(req, res) =>{
            const user = req.body;
            console.log(user)
            const result = await usersCollection.insertOne(user);
            res.send(result);
        })

        app.delete("/users/:id", async(req, res) => {
            const id = req.params.id;
            const query = {_id: new ObjectId(id)};
            const result = await usersCollection.deleteOne(query);
            res.send(result);
        })



        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);

app.get('/', (req, res) => {
    res.send("COFFEE MAKING SERVER IS RUNNING...")
})

app.listen(port, () => {
    console.log(`Coffee server is running on port: ${port}`)
})

