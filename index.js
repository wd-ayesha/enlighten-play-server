const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();
const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

console.log(process.env.DB_PASS);

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ss27qd4.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    client.connect();

    const toysCollection = client.db("enlightenToys").collection("allToys");
    const insertedToysCollection = client.db('enlightenToys').collection('allInsertedToys');


    app.get("/allToys", async (req, res) => {
      const result = await toysCollection.find({}).limit(20).toArray();
      res.send(result);
    });

    // toyDetails data fetch
    app.get('/allToys/:id', async(req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }
      const result = await toysCollection.findOne(query);
      console.log(result)
      res.send(result);
    });

    app.post('/postToy', async(req, res) => {
      const body = req.body;
      const result = await toysCollection.insertOne(body);
      console.log(result);
      res.send(result);
    })

    app.get('/allSelectedToys', async(req, res) => {
      console.log(req.query.email);
      let query = {};
      if(req.query?.email){
        query = { email: req.query.email }
      }
      const result = await toysCollection.find(query).toArray();
      res.send(result);
    })

    app.get('/singleSelectedToy/:id', async(req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }
      const result = await toysCollection.findOne(query);
      res.send(result);
    });

    app.put('/allSelectedToys/:id', async (req, res) => {
      const id = req.params.id;
      const body = req.body;

      const option = {
        upsert: true,
      };
      const query = { _id: new ObjectId(id) };

      const toyData = {
        $set: {
          name: body.name,
          price: body.price,
          quantity: body.quantity,
          description: body.description,
        },
      };
      const result = await toysCollection.updateOne(
        query,
        toyData,
        option
      );
      res.send(result);
    });

    
    app.get("/toySearchByName/:text", async (req, res) => {
      const searchText = req.params.text;
      const result = await toysCollection
        .find({
          $or: [
            { toyName: { $regex: searchText, $options: "i" } },
            { subCategory: { $regex: searchText, $options: "i" } },
          ],
        })
        .toArray();
      res.send(result);
    });


    app.delete('/allSelectedToys/:id', async(req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }
      const result = await toysCollection.deleteOne(query);
      res.send(result);
    })

    
    app.get('/insertedToys', async(req, res) => {
      const result = await insertedToysCollection.find().toArray();
      res.send(result);
    })

  
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("enlighten is running");
});

app.listen(port, () => {
  console.log(`Enlighten Play is running on port ${port}`);
});
