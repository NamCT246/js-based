// grab express
var express = require('express');
var path = require('path');
var bodyParser = require('body-parser');
var mongodb = require('mongodb');

// get objectId
var ObjectID = mongodb.ObjectID;

// create an express app
var app = express();
app.use(bodyParser.json());

var CONTACTS_COLLECTION = 'contacts';

// Create a database variable outside of the database connection callback to reuse the connection pool in your app.
var db;

mongodb.MongoClient.connect(
  process.env.MONGODB_URI,
  function(err, database) {
    if (err) {
      console.log(err);
      process.exit(1);
    }

    // Save database object from the callback for reuse.
    // mongo version ^3.0 will return a client object containing the database object
    db = database.db('js-based');
    console.log('Database connection ready');

    // Initialize the app.
    var server = app.listen(process.env.PORT || 8080, function() {
      var port = server.address().port;
      console.log('App now running on port', port);
    });
  }
);

// home page route - popular images
app.get('/', function(req, res) {
  console.log('Test');
});

// Generic error handler used by all endpoints.
function handleError(res, reason, message, code) {
  console.log('ERROR: ' + reason);
  res.status(code || 500).json({ error: message });
}

/*  "/contacts"
 *    GET: finds all contacts
 *    POST: creates a new contact
 */

app.get('/contacts', function(req, res) {});

app.post('/contacts', function(req, res) {
  var newContact = req.body;
  newContact.createDate = new Date();

  if (!(req.body.firstName || req.body.lastName)) {
    handleError(
      res,
      'Invalid user input',
      'Must provide a first or last name.',
      400
    );
  }

  db.collection(CONTACTS_COLLECTION).insertOne(newContact, function(err, doc) {
    if (err) {
      handleError(res, err.message, 'Failed to create new contact.');
    } else {
      res.status(201).json(doc.ops[0]);
    }
  });
});

app.get('/api/contacts/:id', function(req, res) {
  db.collection(CONTACTS_COLLECTION).findOne(
    { _id: new ObjectID(req.params.id) },
    function(err, doc) {
      if (err) {
        handleError(res, err.message, 'Failed to get contact');
      } else {
        res.status(200).json(doc);
      }
    }
  );
});

app.put('/api/contacts/:id', function(req, res) {
  var updateDoc = req.body;
  delete updateDoc._id;

  db.collection(CONTACTS_COLLECTION).updateOne(
    { _id: new ObjectID(req.params.id) },
    updateDoc,
    function(err, doc) {
      if (err) {
        handleError(res, err.message, 'Failed to update contact');
      } else {
        updateDoc._id = req.params.id;
        res.status(200).json(updateDoc);
      }
    }
  );
});

app.delete('/api/contacts/:id', function(req, res) {
  db.collection(CONTACTS_COLLECTION).deleteOne(
    { _id: new ObjectID(req.params.id) },
    function(err, result) {
      if (err) {
        handleError(res, err.message, 'Failed to delete contact');
      } else {
        res.status(200).json(req.params.id);
      }
    }
  );
});
