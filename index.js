const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();
const app = express();
const port = process.env.PORT || 5000;


// middleware
app.use(cors());
app.use(express.json());

//server connection 
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.z48bd.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    try {
        await client.connect();
        const serviceCollection = client.db('mcData').collection('services');

        //services api 
        app.get('/items', async (req, res) => {
            const query = {};
            const cursor = serviceCollection.find(query);
            const service = await cursor.toArray();
            res.send(service);
        })

        //finding single service data
        app.get('/item/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await serviceCollection.findOne(query);
            res.send(result);
        });

        // update item quantity 
        app.put('/item/:id', async (req, res) => {
            const id = req.params.id;
            const updateItem = req.body;
            const filter = { _id: ObjectId(id) };
            const options = { upsert: true };
            const updatedDoc = {
                $set: {
                    quantity: updateItem.quantity,
                }
            };
            const result = await serviceCollection.updateOne(filter, updatedDoc, options);
            res.send(result);

        })

        // deleting item from all item list
        app.delete('/item/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await serviceCollection.deleteOne(query);
            res.send(result);
        })

        // Posting data for adding new item
        app.post('/item', async (req, res) => {
            const newItem = req.body;
            console.log('adding new item', newItem);
            const result = await serviceCollection.insertOne(newItem);
            res.send(result)
        });


    }
    finally {
        //not going to write anything here coz I am going to communicate simultaneously
    }

}
run().catch((console.dir))


app.get('/', (req, res) => {
    res.send('Running MC Server');
});

app.listen(port, () => {
    console.log('MC Server Running on', port);
});