//Vars
var map;
var markers = [];
const ElitismRate = 0.01;
const MutationRate = 0.4;
const PopulationSize = 500;
var NumOfCities = 0;
var line;
var geneticTimer = 0;
var fact = [1, 2, 6, 24, 120, 720, 5040, 40320, 362880, 3628800, 39916800, 479001600, 6227020800, 87178291200, 1307674368000, 20922789888000, 355687428096000, 6402373705728000, 121645100408832000, 2432902008176640000, 51090942171709440000, 1124000727777607680000, 25852016738884976640000, 620448401733239439360000, 15511210043330985984000000, 403291461126605635584000000, 10888869450418352160768000000, 304888344611713860501504000000, 8841761993739701954543616000000, 265252859812191058636308480000000, 8222838654177922817725562880000000, 263130836933693530167218012160000000, 8683317618811886495518194401280000000, 295232799039604140847618609643520000000, 10333147966386144929666651337523200000000, 371993326789901217467999448150835200000000, 13763753091226345046315979581580902400000000, 523022617466601111760007224100074291200000000, 20397882081197443358640281739902897356800000000, 815915283247897734345611269596115894272000000000];

var Population = new Array(PopulationSize);
for (var i = 0; i < PopulationSize; i++){
  Population[i] = new Array(NumOfCities + 1);
}
var Cities = []; //After RandomArr contains numbers between 1 to NumofCities (no 0), randomly
var FitnessIndex = NumOfCities;

//Map Controller
function initMap () {
  //Map init
  var options = {
    center: { lat: 38.40631, lng: -98.546239 },
    zoom: 4
  };
  
  map = new google.maps.Map(document.getElementById('map'), options);

  var input = document.getElementById('search');
  var searchBox = new google.maps.places.SearchBox(input);

  map.addListener('bounds_changed', function() {
    searchBox.setBounds(map.getBounds());
  });

  //Place add
  searchBox.addListener('places_changed', function () {
    var places = searchBox.getPlaces();

    if (places.length == 0)
      return;

    var bounds = new google.maps.LatLngBounds();
    places.forEach(function(p) {
      if (!p.geometry)
        return;
      //check if exits
      var exits = false;
      for (var i = 0; i < markers.length; i++){
        if (p.name === markers[i].title) exits = true;
      }
      
      if (!exits){
        var ID;
        if (markers.length === 0) ID = 0;
        else ID = markers[markers.length - 1].id + 1;
        markers.push(new google.maps.Marker({
          id: ID,
          map: map,
          title: p.name,
          position: p.geometry.location,
          location: p.geometry.viewport
        }));
        NumOfCities = markers.length;
        FitnessIndex = NumOfCities;

        document.querySelector('.list').insertAdjacentHTML('beforeend', `<div class="item" id="item-${markers[markers.length - 1].id}"><button class="item__delete-btn" id="${markers[markers.length - 1].id}"><i class="ion-ios-close-outline"></i></button><div class="item-city">${markers[markers.length - 1].title}</div></div>`);   
        
      }
            
      if (p.geometry.viewport)
        bounds.union(p.geometry.viewport);
      else
        bounds.extend(p.geometry.location);
    });
    
    map.fitBounds(bounds);
    
    document.getElementById('search').value = '';
  });
  
    
    //UI Controller
    
    //Calculate best route and draw a line
    var x = document.querySelector('.calculate--btn');
    x.addEventListener('click', function(){
      if (line !== undefined) line.setMap(null);
      var start = (new Date()).getTime();
      genetic.Calculate();
      var end = (new Date()).getTime();
      var finalRoute = [];
      for (var i = 0; i < NumOfCities; i++){
        finalRoute[i] = markers[Population[0][i] - 1];
      }
      finalRoute[finalRoute.length] = markers[Population[0][0] - 1];
      line = new google.maps.Polyline({
        path: finalRoute.map(function(cur){
          return cur.position;
        }),
        strokeColor: "#000",
        strokeOpacity: 0.6,
        strokeWeight: 2
      });
      line.setMap(map);
      
      //Write genetic Performance
      var total = (end - start) / 1000;
      document.querySelector('.genetic-box').removeChild(document.querySelector('.load'));
      document.querySelector('.genetic-box').insertAdjacentHTML('beforeend', `<ion-icon name="checkmark" class="done"></ion-icon><p class="genetic-counter">${total}s</p>`);
      
      //Factorial Performance
      var j = 0;
      start = (new Date()).getTime();
      for (var i = 0; i < fact[NumOfCities]; i++) j++;
      end = (new Date()).getTime();
      var iterTotal = (end - start) / 1000;
      document.querySelector('.iteration-box').removeChild(document.querySelector('.load'));
      document.querySelector('.iteration-box').insertAdjacentHTML('beforeend', `<ion-icon name="checkmark" class="done"></ion-icon><p class="genetic-counter">${iterTotal}s</p>`);
    });
    
    
    //Clear the map from markers and line
    
    document.querySelector('.clear--btn').addEventListener('click', function(){
      
      //clear the map
      markers.forEach(function(cur){
        cur.setMap(null);
        document.getElementById('item-' + cur.id).remove();
      });
      markers = [];
      line.setMap(null);
      //clear the list of places
      markers = [];
      NumOfCities = 0;
      FitnessIndex = 0; 
    });
  
    //Remove an item
    document.querySelector('.list').addEventListener('click', function(element){
      var x = element.target.parentNode.parentNode;
      x.parentNode.removeChild(document.getElementById(x.id));
      for (var i = 0; i < markers.length; i++){
        console.log(x.id);
        if ('item-' + markers[i].id == x.id) {
          markers[i].setMap(null);
          markers.splice(i, 1);
        }
      }
      NumOfCities = markers.length;
      FitnessIndex = NumOfCities;
    });
  
}

//Genetic Algorithm
var genetic = (function(){
  
  return{
  RandomArr: function() {
        var temp = [];
        for (var i = 0; i < NumOfCities; i++){
          temp[i] = 0;
        }
        for (var i = 0; i < NumOfCities; i++) {
            Cities[i] = Math.floor((Math.random() * NumOfCities) + 1);
            while (temp[Cities[i] - 1] != 0) {
                Cities[i] = Math.floor((Math.random() * NumOfCities) + 1);
            }
            temp[Cities[i] - 1] = 1;
        }
    },
    
    //Generate random population, array of arrays, each array contains numbers betwenn 1 to NumofCities (no //0)
    RandomPop: function() {
      for (var i = 0; i < PopulationSize; i++) {
          genetic.RandomArr();
          for (var j = 0; j < NumOfCities; j++) {
              Population[i][j] = Cities[j];
          }
      }
    },
    
    //Calculate distance between 2 markers
    Distance: function(mark1, mark2) {
      return Math.pow(markers[mark1].location.Va.i - markers[mark2].location.Va.i, 2) + Math.pow((markers[mark1].location.ab.i - markers[mark2].location.ab.i), 2);
    },
    
    //Calculate fitness for each population and puts it in cell #FitnessIndex
    Fitness: function() {
      var fitness = 0;
      for (var i = 0; i < PopulationSize; i++) {
          for (var j = 0; j < NumOfCities - 1; j++) {
            fitness += genetic.Distance(Population[i][j] - 1, Population[i][j + 1] - 1);
          }
          fitness += genetic.Distance(Population[i][0] - 1, Population[i][NumOfCities - 1] - 1);
          Population[i][FitnessIndex] = fitness;
          fitness = 0;
      }
    },
    
    //Sorts populations according to fitness of each one, bubble sort, not so efficient but small numbers
    Sort: function() {
      var temp = 0;
      for (var i = 0; i < PopulationSize - 1; i++) {
          for (var j = 0; j < PopulationSize - 1; j++) {
              if (Population[j][FitnessIndex] > Population[j + 1][FitnessIndex]) {
                  for (var k = 0; k < NumOfCities + 1; k++) {
                      temp = Population[j][k];
                      Population[j][k] = Population[j + 1][k];
                      Population[j + 1][k] = temp;
                  }
              }
          }
      } 
    },
    
    //Does the crossover, not finished, currently doesn't work
    CrossOver: function() {
      var firstPoint, secondPoint, temp = 0;
      var cities1 = new Array(NumOfCities + 1);
      var cities2 = new Array(NumOfCities + 1);
      
      for (var i = 0; i < PopulationSize * ElitismRate; i++) {
          for (var j = 0; j <= NumOfCities; j++) {
              Population[PopulationSize - 1 - i][j] = Population[i][j];
          }
      }
      
      for (var i = 0; i < PopulationSize * (1 - ElitismRate); i += 2) {
            
            for (var j = 0; j < cities1.length; j++){
              cities1[j] = 0;
              cities2[j] = 0;
            }
        
            firstPoint = Math.random();
            secondPoint = Math.random() * (1 - firstPoint) + firstPoint;
            for (var j = 0; j < Math.floor(firstPoint * NumOfCities); j++) {
                temp = Population[i][j];
                Population[i][j] = Population[i + 1][j];
                Population[i + 1][j] = temp;
                cities1[Math.floor(Population[i][j])] = 1;
                cities2[Math.floor(Population[i + 1][j])] = 1;
            }
            for (var j = Math.floor(secondPoint * NumOfCities); j < NumOfCities; j++) {
                temp = Population[i][j];
                Population[i][j] = Population[i + 1][j];
                Population[i + 1][j] = temp;
                cities1[Math.floor(Population[i][j])] = 1;
                cities2[Math.floor(Population[i + 1][j])] = 1;
            }
            for (var j = Math.floor(firstPoint * NumOfCities); j < Math.floor(secondPoint * NumOfCities); j++) {
                if (cities1[Math.floor(Population[i][j])] == 1) {
                    var k = 1;
                    while (cities1[k] != 0) k++;
                    Population[i][j] = k;
                    cities1[k] = 1;
                }
                else cities1[Math.floor(Population[i][j])] = 1;
                if (cities2[Math.floor(Population[i + 1][j])] == 1) {
                    var k = 1;
                    while (cities2[k] != 0) k++;
                    Population[i + 1][j] = k;
                    cities2[k] = 1;
                }
                else cities2[Math.floor(Population[i + 1][j])] = 1;
            }
        }
    },
    
    //Does the mutation
    Mutation: function() {
      var chance = 0;
      var temp;
      var index;
      for (var i = 0; i < PopulationSize; i++) {
          chance = Math.random();
          while (chance < MutationRate) {
              index = Math.floor(chance * (NumOfCities - 1));
              temp = Population[i][index];
              Population[i][index] = Population[i][index + 1];
              Population[i][index + 1] = temp;
              chance = Math.random();
          }
      }
    },
    
    Calculate: function() {
      
      genetic.RandomPop();
      for (var i = 0; i < 500; i++){
        genetic.Fitness();
        genetic.Sort();
        genetic.CrossOver();
        genetic.Mutation();
      }
      genetic.Fitness();
      genetic.Sort();
    }
  };
  
})();
