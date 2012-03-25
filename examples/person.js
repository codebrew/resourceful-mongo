var resourceful = require('../lib/resourceful-mongo');

var Person = resourceful.define('person', function () {
  //
  // Specify use of the mongodb engine
  //
  this.use('mongodb', {
    database: "example", // A database name is needed
    collection: "people", // required - the collection to use for this resource
    safe : true // optional - run the driver in safe mode to ensure that the update succeeded. Defaults to false
  });
  
  this.string('name');
  this.number('age');
});

Person.create({
  name: "Bob",
  age: 18
}, function (err, Bob) {
  console.log(err, Bob);

  Person.get(Bob._id, function (err, bob) {
    console.log(err, bob);
  });
});