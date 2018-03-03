
var mymap = L.map('map').setView([19.43033411163795, -98.4038543701172], 10),
    format = d3.format(".0%");

L.tileLayer('http://{s}.tiles.wmflabs.org/bw-mapnik/{z}/{x}/{y}.png', {
    attribution: '',
    maxZoom: 18
}).addTo(mymap);


/*
var brew = new classyBrew();
brew.setSeries([30.01, 14.9, 22.71, 24.96, 7.17, ...]);
brew.setNumClasses(5);
brew.setColorCode("BuGn");

brew.classify('jenks');
*/



d3.csv("gobernador_2016_tlaxcala.csv", function(error, data){

  data.forEach(function(item){
    var loc = ineToInegi.filter(function(dd){
      return +dd.ineCity == item.ID_MUNICIPIO && +dd.ineSstate == item.ID_ESTADO;
    })[0];

    item.ID_MUNICIPIO = +loc.inegiCity;
  });

  var tlaxData = Object.create(municipios.filter(function(ct){return ct.state == 29})),
      values;


  tlaxData.map(function(city){
    var items = data.filter(function(item){
      return item.ID_MUNICIPIO == city.city && item.ID_ESTADO == city.state;
    });

    city.items = items;
    city.total = d3.sum(city.items, function(it){
      return it.TOTAL_VOTOS;
    });
    city.pri = d3.sum(city.items, function(it){
      return it.PRI;
    });

    city._pri100 = format(city.pri / city.total);
    city.pri100  = city.pri / city.total;
  });

  values = tlaxData.map(function(it){
    return it.pri100;
  });

  console.log(tlaxData, values);


  
  var brew = new classyBrew();
  brew.setSeries(values);
  brew.setNumClasses(6);
  brew.setColorCode("BuGn");

  brew.classify('jenks');



  L.geoJSON(geojson_tlaxcala.municipios, {
    // brew.getColorInRange(7.5);
    onEachFeature : function(feature, layer){
      var dataObj = tlaxData.filter(function(it){
        return it.city == feature.properties.city && it.state == feature.properties.state;
      })[0];

      layer.bindPopup(dataObj.name + ": " + dataObj._pri100);
    },

    style: function(feature) {
      //console.log(feature);
      var dataObj = tlaxData.filter(function(it){
        return it.city == feature.properties.city && it.state == feature.properties.state;
      })[0];

       return {
        "weight"       : 0.4,
    "opacity"      : 0.8,
    "color"        : brew.getColorInRange(dataObj.pri100),
    "dashArray"    : "",
    "fillOpacity":0.8
       }
    }
  }).addTo(mymap);

});
