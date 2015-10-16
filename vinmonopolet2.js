Drinks = new Mongo.Collection("drinks");

var _deps = new Deps.Dependency;
var filterDrinks = function(drinks){
  drinks = drinks.map(function(drink){
    drink.Alkoholperliterpris = drink.Alkoholperliterpris.toFixed(3);
    drink.Alkohol = drink.Alkohol.toFixed(1);
    drink.Volum = drink.Volum.toFixed(2);
    drink.Pris = Math.round(drink.Pris);
    return drink;
  });
  drinks = drinks.filter(function(drink){return !isNaN(drink.Alkoholperliterpris); });
  return drinks;
}
if (Meteor.isClient) {
  Session.setDefault("category", "");
  Session.setDefault("drinksLimit", 25)

  Tracker.autorun(function(){
    Meteor.subscribe("drinks", Session.get("category"), Session.get("drinksLimit"), function(){
      $('.sticky-header').floatThead("reflow");
    });
  })

  
  Template.body.onRendered(function(){
    $(function () {
      $('[data-toggle="popover"]').popover();
      $('.sticky-header').floatThead({
        postition: 'absolute'
      })
    })
  })
  Template.body.helpers({
    products: function(){
      var drinks = Drinks.find({}, {sort: {Alkoholperliterpris: -1}});
      var drinks = filterDrinks(drinks);
      return drinks;
    },
    beer: function(){
      return Session.get("category") === "?l";
    },
    redWine: function(){
      return Session.get("category") === "R?dvin";
    },
    sprit: function(){
      return Session.get("category") === "sprit";
    },
    hvitvin: function(){
      return Session.get("category") === "Lik?r under 22 %";
    },
    notbeer: function(){
      return Session.get("category") !== "?l";
    },
    notredWine: function(){
      return Session.get("category") !== "R?dvin";
    },
    notsprit: function(){
      return Session.get("category") !== "sprit";
    },
    nothvitvin: function(){
      return Session.get("category") !== "Lik?r under 22 %";
    }
  });

  Template.body.events({
    //increment drinksLimit for more drinks in the list
    'click .more-drinks': function( event ){
      event.preventDefault();
      Session.set("drinksLimit", Session.get("drinksLimit") + 25)
    },
    'click .beer': function(){
      if(Session.get("category") === "?l"){
        Session.set("category", "");
      }else{
        Session.set("category", "?l");
      }
    },
    'click .redWine': function(){
      if(Session.get("category") === "R?dvin"){
        Session.set("category", "");
      }else{
        Session.set("category", "R?dvin");
      }
    },
    'click .liqour':  function(){
      if(Session.get("category") === "sprit"){
        Session.set("category", "");
      }else{
        Session.set("category", "sprit");
      }
    },
    'click .hvitvin': function(){
      if(Session.get("category") === "Lik?r under 22 %" ){
        Session.set("category", "");
      }else{
        Session.set("category", "Lik?r under 22 %");
      }
    }
  })
}

if (Meteor.isServer) {
  Meteor.methods({
    "restartDatabase": function(){
      var url = "http://www.vinmonopolet.no/api/produkter";
      var npmEncoding = Meteor.npmRequire("encoding");
      getFile(url, function(error, result){
        //turn the file into utf-8 and replace all the commas with full stops
        var bufferedString = npmEncoding.convert(result.content, "ASCII", "win1252");
        var deEncodedString = bufferedString.toString('ASCII');
        var commasReplacedString = deEncodedString.replace(/,/g, ".");

        //parse the file and insert the entries into the database
        parseCsv(commasReplacedString);


        console.log("ok then");
      });
    }
  })

  Meteor.publish("drinks", function(category, drinksLimit){
    if(category === "Lik?r under 22 %"){
      category = ["Lik?r under 22 %", "?vrig Brennevin under 22 %", "Bitter under 22"];
    }else if(category === "sprit"){
      category = ["Whisky", "Druebrennevin", "Akevitt", "Lik?r", "Vodka", "Fruktbrennevin", "Rom", "Gin", "?vrig Brennevin", "Bitter", "Genever"];
    }else if(category === "R?dvin"){
      category = ["R?dvin", "Hvitvin", "Musserende vin", "Fruktvin", "Sterkvin", "Ros?vin"];
    }


    if(typeof category === "object"){
        var drinks = Drinks.find({Varetype: {$in: category}}, {sort: {Alkoholperliterpris: -1}, limit: drinksLimit})
    }else if(category === "sprit"){
      var drinks = Drinks.find({Alkohol: {$gt: 20}}, {sort: {Alkoholperliterpris: -1}, limit: drinksLimit})
    }else if(category){
      var drinks = Drinks.find({Varetype: category}, {sort: {Alkoholperliterpris: -1}, limit: drinksLimit})
    }else{
      var drinks = Drinks.find({}, {sort: {Alkoholperliterpris: -1}, limit: drinksLimit})
    }

    return drinks;
  })
  function parseCsv(parseString, config, callback){
    if(!config){
      i = 0;
      config = {
        delimiter: ";",
        header: true,
        encoding: "ASCII",
        //preview: 0,
        dynamicTyping: true,
        skipEmtyLines: true,
        error: function(error, file){
          console.log("error: "  + eror);
        },
        step: function(result){
          result.data[0].Alkoholperliterpris = result.data[0].Alkohol / result.data[0].Literpris;
          if(result.data[0].Alkoholperliterpris !== NaN){
            Drinks.insert(result.data[0]);
          }
        }
      }
    }

    Drinks.remove({});
    Baby.parse(parseString, config);
    console.log("DatabasePopulated")
  }

  function getFile(url, callback){
    HTTP.get(url,{}, callback)
  }
  Meteor.startup(function () {
    // code to run on server at startup

    
  });
}