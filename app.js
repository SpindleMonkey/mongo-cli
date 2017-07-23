/**
 * This app/server provides a simple interface to the 'restaurants' collection in the restaurant_db .
 * User inputs:
 *   'index': shows all documents in the restaurants collection
 *   'show': shows all documents with the specified restaurant name
 *   'add': adds a new restaurant document to the restaurants collection
 *   'edit' edits (updates) the document for the specified restaurant 
 *   'delete': removes the document for the specified restaurant from the collection
 *
 *    note: user is prompted to edit/delete one or all restaurants with the same name;
 *    at this time, though, editing/deleting only one document means the first returned
 *    document will be used since we're searching only on 'name'.
 */


// create a mongo client 
let mongo = require('mongodb').MongoClient;

// use the synchronous prompt library to get user inputs
let prompt = require('prompt-sync')();

// set up the URL to access our mongo db
let url = 'mongodb://localhost:27017/restaurant_db';

// variable used to make a pretty console display (woah! flashback to RS-232 debugging!)
const seperator = '* * * * * * * * * * * * * * * * * * * * * * * * *';

// empty object used to add/update restaurants
let newRestaurant = {
  name: '',
  address: {
    street: '',
    zipcode: '',
  },
  yelp: '',
};

// variables used to get new restaurant info (add/update)
let rName;
let rStreet;
let rZipcode;
let rYelp;

// flag used to indicate whether the first or all documents should be used
let applyToAll;


// connect to restaurant_db 
mongo.connect(url, function(err, db) {
  // use the restaurants collection
  let collection = db.collection('restaurants');

  // show the menu of possible actions
  console.log('  ');
  console.log(seperator);
  console.log('  ');
  console.log('Things you can do with the restaurant db:');
  console.log('  index: list all restaurants');
  console.log('  show: show info for a single restaurant');
  console.log('  add: add a new restaurant');
  console.log("  edit: edit a restaurant's info");
  console.log('  delete: delete a restaurant');
  console.log('  ');
  console.log('note: sorry, you\'ll have to restart to run another command :(');
  console.log('  ');
  console.log(seperator);
  console.log('  ');

  let menuChoice = prompt('What do you want to do? ');
  
  console.log('  ');
  
  switch(menuChoice) {
    case 'index':
      // show all documents
      collection.find().toArray(function(err, docs) {
        console.log(docs);
      });

      break;

    case 'show':
      // show documents for a single restaurant
      rName = prompt('Which restaurant? ');
      console.log(rName);

      collection.find({name: rName}).toArray(function(err, docs) {
        if (err) {
          console.log(err);
        } else {
          console.log(docs);
        }
      });
    
      break;

    case 'add':
      // add a document for a new restaurant
      console.log('Add a new restaurant!');
      rName = prompt('Restaurant name (required): ');
      
      if (rName) {
        newRestaurant.name = rName;
      } else {
        console.log('ERROR::cannot add a restaurant without a name!');
        break;
      }

      rStreet = prompt('Restaurant address: ');
      if (rStreet) { 
         newRestaurant.address.street = rStreet;
      }

      rZipcode = prompt('Restaurant zip code: ');
      if (rZipcode) {
        newRestaurant.address.zipcode = rZipcode;
      }

      rYelp = prompt('Restaurant\'s Yelp review URL (or n/a): ');
      if (rYelp) {
        newRestaurant.yelp = rYelp;
      }
  
      //console.log(newRestaurant);
      collection.insert(newRestaurant, function() {
        if (err) {
          console.log("ERROR::failed to add new restaurant");
        } else {
          console.log('new restaurant added: ' + newRestaurant.name);
        }
      });

      break;

    case 'edit':
      // edit the first (or all) documents for a restaurant
      console.log('Edit (update) a restaurant\'s info');

      let originalName;
      let originalInfo;

      originalName = prompt('Which restaurant? ');
      collection.find({name: originalName}).toArray(function(err, docs) {
        if (err) {
          console.log(err);
          return;
        } else {
          //console.log('docs: ' + docs);
          //console.log(docs[0]);
          originalInfo = docs[0];
          //console.log('docs[0]: ');
          //console.log(originalInfo);
        }

        let change = prompt('Edit (update) all restaurants with this name? (y/n)');
        if (change = 'y') {
          applyToAll = true;
        } else {
          applyToAll = false;
        }

        change = prompt('Change the restaurant name? (y/n) ');
        if (change == 'y') {
          rName = prompt('What\'s the new name? ');
          if (rName) {
            newRestaurant.name = rName;
          } else {
            newRestaurant.name = originalName;
          }
        }

        change = prompt('Change the street address? (y/n) ');
        if (change == 'y') {
          rStreet = prompt('New street address: ');
          if (rStreet) { 
           newRestaurant.address.street = rStreet;
          } else {
            newRestaurant.address.street = originalInfo.address.street;
          }
        }

        change = prompt('Change the zip code? (y/n) ');
        if (change == 'y') {
          rZipcode = prompt('New zip code: ');
          if (rZipcode) {
            newRestaurant.address.zipcode = rZipcode;
          } else {
            newRestaurant.address.zipcode = originalInfo.address.zipcode;
          }
        }

        change = prompt('Update the Yelp review URL? (y/n) ');
        if (change == 'y') {
          rYelp = prompt('New Yelp review URL (or n/a): ');
          if (rYelp) {
            newRestaurant.yelp = rYelp;
          } else {
            newRestaurant.yelp = originalInfo.yelp;
          }
        }

        //console.log('user inputs (name, street, zip, yelp');
        //console.log(rName);
        //console.log(rStreet);
        //console.log(rZipcode);
        //console.log(rYelp);
        //console.log('end of user inputs');

        newRestaurant.name = rName ? rName : originalInfo.name;
        newRestaurant.address.street = rStreet ? rStreet : originalInfo.address.street;
        newRestaurant.address.zipcode = rZipcode ? rZipcode : originalInfo.address.zipcode;
        newRestaurant.yelp = rYelp ? rYelp : originalInfo.yelp;
        //console.log(newRestaurant);
        //console.log(newRestaurant.name);
        //console.log(originalName);

        //console.log('original: ');
        //console.log(originalInfo);
        //console.log('new: ');
        //console.log(newRestaurant);
        collection.update({name: originalName}, {$set: newRestaurant}, {multi: applyToAll});
        console.log(originalName + ' has been updated');
      });
 
      break;

    case 'delete':
      // delete the first (or all) documents for a restaurant
      console.log('Remove (delete) a restaurant');
      rName = prompt('Which restaurant do you want to delete? ');
      let rmAll = prompt('Remove (delete) all restaurants with this name? (y/n) ');
      if (rmAll = 'y') {
        applyToAll = true;
      } else {
        applyToAll = false;
      }
      collection.remove({'name': rName}, {'justOne': applyToAll}, function(err, doc) {
        if (err) {
          console.log('ERROR::unable to remove ' + rName);
        } else {
          console.log(rName + ' has been removed');
        }
      });
      break;

    default:
      // whatever was entered is not something this app knows to do!
      console.log('that is not a valid command!');
      break;
  }
});