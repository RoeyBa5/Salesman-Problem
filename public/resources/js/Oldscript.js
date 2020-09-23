




    
    //Draw a line
    document.querySelector('.calculate--btn').addEventListener('click', function(){
      
      NumOfCities = markers.length;
      FitnessIndex = NumOfCities;
    }
      
    var finalRoute = [];
    for (var i = 0; i < NumOfCities; i++){
      finalRoute[i] = markers[Popultation[0][i] - 1];
    }
      
    var line = new google.maps.Polyline({
      path: finalRoute.map(function(cur){
        return cur.position;
      }),
      strokeColor: "#000",
      strokeOpacity: 0.6,
      strokeWeight: 2
    });
    line.setMap(map);
  });
};
                        


//Genetic Algorithm//
    
    var RandomArr = function() {
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
    }
    
    var RandomPop = function() {
      for (var i = 0; i < PopulationSize; i++) {
          RandomArr();
          for (var j = 0; j < NumOfCities; j++) {
              Popultation[i][j] = Cities[j];
          }
      }
    }
    
    var Distance = function(mark1, mark2) {
      return Math.pow(mark1.location.Va.i - mark2.location.Va.i, 2) + Math.pow((mark1.location.Za.i - mark2.location.Za.i), 2);
    }
    
    var Fitness = function() {
      var fitness = 0;
      for (var i = 0; i < PopulationSize; i++) {
          for (var j = 0; j < NumOfCities - 1; j++) {
              fitness += Distance(markers[Popultation[i][j] - 1], markers[Popultation[i][j + 1] - 1]);
          }
          fitness += Distance(markers[Popultation[i][0] - 1], markers[Popultation[i][NumOfCities - 1] - 1]);
          Popultation[i][FitnessIndex] = fitness;
          fitness = 0;
      }
    }
    
    var Sort = function() {
      var temp = 0;
      for (var i = 0; i < PopulationSize - 1; i++) {
          for (var j = 0; j < PopulationSize - 1; j++) {
              if (Popultation[j][FitnessIndex] > Popultation[j + 1][FitnessIndex]) {
                  for (var k = 0; k < NumOfCities + 1; k++) {
                      temp = Popultation[j][k];
                      Popultation[j][k] = Popultation[j + 1][k];
                      Popultation[j + 1][k] = temp;
                  }
              }
          }
      } 
    }
    
    var CrossOver = function() {
      var firstPoint, secondPoint, temp = 0;
      var cities1 = new Array(NumOfCities + 1);
      var cities2 = new Array(NumOfCities + 1);
      
      for (var i = 0; i < PopulationSize * ElitismRate; i++) {
          for (var j = 0; j <= NumOfCities; j++) {
              Popultation[PopulationSize - 1 - i][j] = Popultation[i][j];
          }
      }
      for (var i = 0; i < PopulationSize * (1 - ElitismRate); i += 2) {
            for (var i = 0; i < NumOfCities + 1; i++){
              cities1[i] = 0;
              cities2[i] = 0;
            }
            cities1[0] = 1;
            cities2[0] = 1;  
            firstPoint = Math.random();
            secondPoint = Math.random() * (1 - firstPoint) + firstPoint;
            for (var j = 0; j < Math.floor(firstPoint * NumOfCities); j++) {
                temp = Popultation[i][j];
                Popultation[i][j] = Popultation[i + 1][j];
                Popultation[i + 1][j] = temp;
                cities1[Popultation[i][j]] = 1;
                cities2[Popultation[i + 1][j]] = 1;
            }
            for (var j = Math.floor(secondPoint * NumOfCities); j < NumOfCities; j++) {
                              console.log(j);    
                temp = Popultation[i][j];
                Popultation[i][j] = Popultation[i + 1][j];
                Popultation[i + 1][j] = temp;
                cities1[Popultation[i][j]] = 1;
                cities2[Popultation[i + 1][j]] = 1;
            }
            for (var j = Math.floor(firstPoint * NumOfCities); j < Math.floor(secondPoint * NumOfCities); j++) {
              if (cities1[Popultation[i][j]] == 1) {
                    var k = 0;
                    while (cities1[k] != 0) k++;
                    Popultation[i][j] = k;
                    cities1[k] = 1;
                }
                if (cities2[Popultation[i][j]] == 1) {
                    var k = 0;
                    while (cities2[k] != 0) k++;
                    Popultation[i][j] = k;
                    cities2[k] = 1;
                }
            }
        }
    }
    
    var Mutation = function() {
      var chance = 0;
      var temp;
      var index;
      for (var i = 0; i < PopulationSize; i++) {
          chance = Math.random();
          while (chance < MutationRate) {
              index = Math.floor(chance * (NumOfCities - 1));
              temp = Popultation[i][index];
              Popultation[i][index] = Popultation[i][index + 1];
              Popultation[i][index + 1] = temp;
              chance = Math.random();
          }
      }
    }