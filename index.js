const express = require('express');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();
const app = express();
const port = process.env.PORT || 5000;


// middleware
app.use(cors());
app.use(express.json());

//verifying JWT
function JWTVerify(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).send({ message: 'unauthorized access' })
    }
    const token = authHeader.split(' ')[1];
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
        if (err) {
            return res.status(403).send({ message: 'Access Forbidden' })
        }
        req.decoded = decoded;
        next();
    })

}

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
        app.post('/items', async (req, res) => {
            const newItem = req.body;
            const result = await serviceCollection.insertOne(newItem);
            res.send(result)
        });

        //myitems loading from server depending on email
        app.get('/myitems', JWTVerify, async (req, res) => {
            const email = req.query.email;
            const decodedEmail = req.decoded.email;
            console.log(decodedEmail, email)
            if (email === decodedEmail) {
                const query = { email: email };
                const cursor = serviceCollection.find(query);
                const service = await cursor.toArray();
                await res.send(service);
            }
            else {
                res.status(403).send({ message: 'forbidden access' })
            }
        })

        // JWT TOken auth connection
        app.post('/login', async (req, res) => {
            const user = req.body;
            const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
                expiresIn: '1d'
            });
            res.send({ accessToken });
        })


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