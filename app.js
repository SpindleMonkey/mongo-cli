
// create a mongo client 
let mongo = require('mongodb').MongoClient;

let prompt = require('prompt-sync')();

// set up the URL to access our mongo db
let url = "mongodb://localhost:27017/restaurant_db";

const seperator = "* * * * * * * * * * * * * * * * * * * * * * * * *";

let newRestaurant = {
  name: "",
  address: {
    street: "",
    zipcode: "",
  },
  yelp: "",
};

let rName;
let rStreet;
let rZipcode;
let rYelp;

mongo.connect(url, function(err, db) {
  let collection = db.collection('restaurants');

  // show the menu of possible actions
  console.log("  ");
  console.log(seperator);
  console.log("  ");
  console.log("Things you can do with the restaurant db:");
  console.log("  index: list all restaurants");
  console.log("  show: show info for a single restaurant");
  console.log("  add: add a new restaurant");
  console.log("  edit: edit a restaurant's info");
  console.log("  delete: delete a restaurant");
  console.log(" ");
  console.log("note: sorry, you'll have to CTRL-C to run another command");
  console.log(" ");

  let menuChoice = prompt("What do you want to do? ");
  
  console.log("  ");
  console.log(seperator);
  console.log("  ");
  
  switch(menuChoice) {
    case "index":
      collection.find().toArray(function(err, docs) {
        console.log(docs);
      });

      break;

    case "show":
      rName = prompt("Which restaurant? ");
      console.log(rName);

      collection.find({name: rName}).toArray(function(err, docs) {
        if (err) {
          console.log(err);
        } else {
          console.log(docs);
        }
      });
    
      break;

    case "add":
      console.log("Add a new restaurant!");
      rName = prompt("Restaurant name (required): ");
      
      if (rName) {
        newRestaurant.name = rName;
      } else {
        console.log("ERROR::cannot add a restaurant without a name!");
        break;
      }

      rStreet = prompt("Restaurant address: ");
      if (rStreet) { 
         newRestaurant.address.street = rStreet;
      }

      rZipcode = prompt("Restaurant zip code: ");
      if (rZipcode) {
        newRestaurant.address.zipcode = rZipcode;
      }

      rYelp = prompt("Restaurant's Yelp review URL (or n/a): ");
      if (rYelp) {
        newRestaurant.yelp = rYelp;
      }
  
      console.log(newRestaurant);
      collection.insert(newRestaurant);
      console.log("new restaurant added: " + newRestaurant.name);

      break;

    case "edit":
      console.log("Edit (update) a restaurant's info");

      let originalName;
      let originalInfo;

      originalName = prompt("Which restaurant? ");
      collection.find({name: originalName}).toArray(function(err, docs) {
        if (err) {
          console.log(err);
          return;
        } else {
          console.log("docs: " + docs);
          //console.log(docs[0]);
          originalInfo = docs[0];
          //console.log("docs[0]: ");
          //console.log(originalInfo);
        }

        let change = prompt("Change the restaurant name? (y/n) ");
        if (change == 'y') {
          rName = prompt("What's the new name? ");
          if (rName) {
            newRestaurant.name = rName;
          } else {
            newRestaurant.name = originalName;
          }
        }

        change = prompt("Change the street address? (y/n) ");
        if (change == 'y') {
          rStreet = prompt("New street address: ");
          if (rStreet) { 
           newRestaurant.address.street = rStreet;
          } else {
            newRestaurant.address.street = originalInfo.address.street;
          }
        }

        change = prompt("Change the zip code? (y/n) ");
        if (change == 'y') {
          rZipcode = prompt("New zip code: ");
          if (rZipcode) {
            newRestaurant.address.zipcode = rZipcode;
          } else {
            newRestaurant.address.zipcode = originalInfo.address.zipcode;
          }
        }

        change = prompt("Update the Yelp review URL? (y/n) ");
        if (change == 'y') {
          rYelp = prompt("New Yelp review URL (or n/a): ");
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

        //console.log("original: ");
        //console.log(originalInfo);
        //console.log("new: ");
        //console.log(newRestaurant);
        collection.update({name: originalName}, { $set: newRestaurant});
        console.log(originalName + " has been updated");
      });
 
      break;

    case "delete":
      console.log("Remove (delete) a restaurant");
      rName = prompt("Which restaurant do you want to delete? ");
      collection.remove({"name": rName}, function(err, doc) {
        if (err) {
          console.log("ERROR::unable to remove " + rName);
        } else {
          console.log(rName + " has been removed");
        }
      });
      break;

    default:
      console.log("that is not a valid command!");
      break;
  }
});