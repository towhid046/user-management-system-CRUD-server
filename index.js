const express = require("express");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();
const cors = require("cors");
const app = express();

const port = process.env.PORT || 5000;

// middleware:
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.USER_NAME}:${process.env.USER_PASSWORD}@cluster0.q1nysvk.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

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
    await client.connect();
    const allUserCollection = client.db("allUsersDB").collection("allUsers");
    const customersCollection = client
      .db("customersDB")
      .collection("customers");

    app.get("/all-users", async (req, res) => {
      const cursor = allUserCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });

    app.get("/all-users/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await allUserCollection.findOne(query);
      res.send(result);
    });

    app.post("/all-users", async (req, res) => {
      const user = req.body;
      const result = await allUserCollection.insertOne(user);
      res.send(result);
    });

    app.put("/update-user/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const user = req.body;
      const updateUser = {
        $set: { ...user },
      };
      const options = { upsert: true };
      const result = await allUserCollection.updateOne(
        filter,
        updateUser,
        options
      );
      res.send(result);
    });

    app.delete("/all-users/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await allUserCollection.deleteOne(query);
      res.send(result);
    });

    // customar related operation:
    app.get("/customers", async (req, res) => {
      const cursor = customersCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });

    app.post("/customers", async (req, res) => {
      const customer = req.body;
      const result = await customersCollection.insertOne(customer);
      res.send(result);
    });

    app.patch("/customers", async (req, res) => {
      const user = req.body;
      const filter = { email: user.email };
      const updateUser = {
        $set: { lastLogAt: user.lastLogAt },
      };
      const options = { upsert: true };
      const result = await customersCollection.updateOne(
        filter,
        updateUser,
        options
      );
      res.send(result);
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } catch (error) {
    // Ensures that the client will close when you finish/error
    console.log(error);
    // await client.close();
  }
}
run().catch(console.dir);

app.listen(port, () => {
  console.log(`User management system server is running on PORT: ${port}`);
});
