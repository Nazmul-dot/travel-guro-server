require("dotenv").config();
const express = require("express");
const app = express();
const cors = require("cors");
const { MongoClient } = require("mongodb");
const ObjectId = require("mongodb").ObjectId;

const port = process.env.PORT || 4000;

//middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.iohnz.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
// console.log(uri);
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
async function run() {
  try {
    await client.connect();
    const database = client.db("assig_12");
    const productCollection = database.collection("services");
    const orderCollection = database.collection("order");
    const UserCollection = database.collection("users");
    const reviwCollection = database.collection("reviw");
    console.log("db connected");
    // ****************************************************** //
    // all data get
    app.get("/services", async (req, res) => {
      const cursor = productCollection.find({});
      const services = await cursor.toArray();
      //   console.log(services);
      res.json(services);
    });
    //get single data
    app.get("/singleService/:id", async (req, res) => {
      const id = req.params.id;
      console.log("perservice=", id);
      const query = { _id: ObjectId(id) };
      const service = await productCollection.findOne(query);
      res.json(service);
    });
    //add post
    app.post("/addservice", async (req, res) => {
      console.log(req.body);
      const doc = req.body;
      const result = await productCollection.insertOne(doc);
      res.json(result);
    });

    //delete service
    app.delete("/user/serviceDelet/:id", async (req, res) => {
      console.log(req.params.id);
      const _id = req.params.id;
      const filter = { _id: ObjectId(_id) };
      const result = await productCollection.deleteOne(filter);
      console.log(result);
      res.json(result);
    });
    //add order
    app.post("/addOrder", async (req, res) => {
      const doc = req.body;
      const result = await orderCollection.insertOne(doc);
      res.json(result);
    });
    //get order by persons
    app.get("/allorder", async (req, res) => {
      const email = req.query.email;

      let orders;
      if (email) {
        const cursor = orderCollection.find({ email: email });
        orders = await cursor.toArray();
        //   console.log(services);
      } else {
        const cursor = orderCollection.find({});
        orders = await cursor.toArray();
      }
      res.json(orders);
    });
    //delete order
    app.delete("/deleteorder/:id", async (req, res) => {
      console.log(req.params.id);
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await orderCollection.deleteOne(query);
      res.json(result);
    });
    //update status
    app.put("/updatestate/:id", async (req, res) => {
      console.log(req.params.id, req.body.state);
      const id = req.params.id;
      const filter = { _id: ObjectId(id) };
      const options = { upsert: true };
      const updateDoc = {
        $set: {
          state: req.body.state,
        },
      };
      const result = await orderCollection.updateOne(
        filter,
        updateDoc,
        options
      );
      console.log(result);
      res.json(result);
    });

    // add user
    app.post("/user/add", async (req, res) => {
      const doc = req.body;
      const result = await UserCollection.insertOne(doc);
      res.json(result);
    });
    //add or update user only one time
    app.put("/user/add", async (req, res) => {
      const user = req.body;
      console.log(user);
      const email = user.email;
      const filter = { email: email };
      const options = { upsert: true };
      const updateDoc = {
        $set: {
          user,
        },
      };
      const result = await UserCollection.updateOne(filter, updateDoc, options);
      res.json(result);
    });

    // add admin
    app.put("/user/adminadd", async (req, res) => {
      const email = req.body.email;
      const filter = { email: email };
      console.log(email);
      const isUser = await UserCollection.findOne({ email: email });
      console.log(isUser);
      if (isUser) {
        const updateDoc = {
          $set: {
            role: "admin",
          },
        };
        const result = await UserCollection.updateOne(filter, updateDoc);
        console.log(result);
        res.json(result);
      } else {
        res.json({ message: "the user not exsit here" });
      }
    });

    // cheak admin
    app.get("/user/isadmin/:email", async (req, res) => {
      const email = req.params.email;
      console.log(email);
      const query = { email: email };
      const result = await UserCollection.findOne(query);
      let admin = false;
      // console.log(result);
      if (result?.role === "admin") {
        admin = true;
      }
      res.json({ admin: admin });
    });

    // ADD reviw
    app.post("/user/reviw", async (req, res) => {
      console.log(req.body);
      const doc = req.body;
      const result = await reviwCollection.insertOne(doc);
      res.json(result);
    });

    // get reviw
    app.get("/useer/reviw", async (req, res) => {
      const cursor = reviwCollection.find({});
      const result = await cursor.toArray();
      res.json(result);
    });
    // ****************************************************** //
    //
    app.get("/test", (req, res) => {
      res.json({ message: "assign_12 test ok" });
    });
  } finally {
    //   await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Hello assign_12!");
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
