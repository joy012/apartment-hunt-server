const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const MongoClient = require('mongodb').MongoClient;
const ObjectId = require('mongodb').ObjectId;
const fs = require('fs-extra');
const fileUpload = require('express-fileupload');
const admin = require('firebase-admin');
var serviceAccount = require("./config/apartment-hunt-team-firebase-adminsdk-za4y6-18c0678c8c.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://apartment-hunt-team.firebaseio.com"
});


const uri = `mongodb+srv://apartmentHuntUser:50114400@cluster0.ukskk.mongodb.net/apartmentHunt?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

const port = 3470;

client.connect(err => {
    const apartmentCollection = client.db("apartmentHunt").collection("apartment");
    const serviceCollection = client.db("apartmentHunt").collection('service');
    const userBookingCollection = client.db("apartmentHunt").collection('userBooking');

    app.get('/apartments', (req, res) => {
        apartmentCollection.find({})
            .toArray((err, documents) => {
                res.send(documents);
            })
    })

    app.post('/addApartment', (req, res) => {
        const newHouse = req.body;
        apartmentCollection.insertOne(newHouse)
            .then(result => {
                res.send(result.insertedCount > 0);
            })
    })

    app.get('/service', (req, res) => {
        serviceCollection.find({})
            .toArray((err, documents) => {
                res.send(documents);
            })
    })


    app.post('/addUserBooking', (req, res) => {
        const newBooking = req.body;
        userBookingCollection.insertOne(newBooking)
            .then(result => {
                res.send(result.insertedCount > 0);
            })
    })

    app.get('/userBooking', (req, res) => {
        const bearer = req.headers.authorization;
        if (bearer && bearer.startsWith('Bearer ')) {
            const idToken = bearer.split(' ')[1];
            admin.auth().verifyIdToken(idToken)
                .then(function (decodedToken) {
                    const tokenEmail = decodedToken.email;
                    const queryEmail = req.query.email;
                    if (tokenEmail === queryEmail) {
                        userBookingCollection.find({email: queryEmail})
                            .toArray( (err,documents) => {
                                res.status(200).send(documents);
                                
                            })
                    }
                    else{
                        res.status(401).send('Un-Authorized Access!!')
                    }
                }).catch(function (error) {
                    res.status(401).send('Un-Authorized Access!!')
                });
        }
        else{
            res.status(401).send('Un-Authorized Access!!')
        }
    })

    app.get('/allbooking', (req, res) => {
        userBookingCollection.find({})
            .toArray( (err,documents) => {
            res.status(200).send(documents);
        })    
    })

})



app.listen(process.env.PORT || port);
