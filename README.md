#resourceful-mongo [![Build Status](https://secure.travis-ci.org/codebrew/resourceful-mongo.png)](http://travis-ci.org/codebrew/resourceful-mongo)

A MongoDB engine for [resourceful](https://github.com/flatiron/resourceful/), a datamapper part of the [flatiron](https://github.com/flatiron/) project.

#### Credits

Ryan Fitzgerald, Follow [@TheRyanFitz on Twitter](http://twitter.com/#!/TheRyanFitz).


## Warning

This project is in a very early stage, with limited functionality. Don't use in production.

## Example

``` js
  var resourceful = require('resourceful-mongo');
  
  //Define the resources
  var Person = resourceful.define('person', function () {

    this.use('mongodb', {
      uri: "mongodb://localhost/databaseName", // required - the mongo URI of the database
      collection: "people", // required - the name of the collection
      safe: true // optional - run the driver in safe mode to ensure that the update succeeded. Defaults to false
    });
    
    this.string('name');
    this.number('age');
  });

  var Flower = resourceful.define('flower', function () {

    this.use('mongodb', {

      //The mongo URI can also be defined piecemeal
      host: "localhost", 
      database: "databaseName",
      collection: "flowers",
      safe: true 
    });
    
    this.string('color');
    this.number('petals');
  });

  //Open the mongodb connection
  resourceful.use('mongodb', {
    uri: "mongodb://localhost/databaseName", // required - the connection to be opened
    onConnect: function (err) { // required - the callback upon opening the database connection
        if (!err) app.start(8000);
    }
  });
```

## Installation

### Installing npm (node package manager)
``` bash
  $ curl http://npmjs.org/install.sh | sh
```

### Installing resourceful
``` bash 
  $ [sudo] npm install resourceful-mongo
```

## Tests
All tests are written with [mocha][0] and should be run with [npm][1]:

``` bash
  $ npm test
```

#### Author: [Ryan Fitzgerald](http://twitter.com/#!/TheRyanFitz)
#### License: [Apache 2.0](http://www.apache.org/licenses/LICENSE-2.0)

[0]: http://visionmedia.github.com/mocha/
[1]: http://npmjs.org
