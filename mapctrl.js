
function createMapControl(elementName) {
    'use strict';
    
   var taskdef=[];
    
    function zapAirspace()  {
                if (mapLayers.airspace) {
                map.removeLayer(mapLayers.airspace);
            }
 }

 function pointDescription(coords) {
    var latdegrees= Math.abs(coords['lat']);
    var latdegreepart=Math.floor(latdegrees);
    var latminutepart=60*( latdegrees-latdegreepart);
   var latdir= (coords['lat']  >  0)?"N":"S";
   var lngdegrees= Math.abs(coords['lng']);
    var lngdegreepart=Math.floor(lngdegrees);
    var lngminutepart=60*( lngdegrees-lngdegreepart);
   var lngdir= (coords['lng']  >  0)?"E":"W";
    var retstr= latdegreepart.toString() + "&deg;" + latminutepart.toFixed(3) + "&prime;" + latdir + " " + lngdegreepart.toString() + "&deg;" + lngminutepart.toFixed(3) + "&prime;" + lngdir;
    return retstr;
}

function bindTaskButtons() {
     $('#tasktab button').on('click', function(event) {
        var li= $(this).parent().parent().index();
       if($(this).text()==="X")  {
             taskdef.splice(li,1);
       }
       else {
           var holder=taskdef[li];
           var prevpt=taskdef[li-1];
           taskdef[li]=prevpt;
           taskdef[li-1]=holder;
       }
      updateTask();
         });
}

  function updateTask()  {
    var i;
    var newrow;
    var tpref;
    var distance=0;
    var coordlist=[];
    
    $('#tasktab').html("");
    $('#tasklength').text("");
     if (mapLayers.tasklayer) {
                map.removeLayer(mapLayers.tasklayer);
            }
    for (i=0;i < taskdef.length; i++) {
        switch(i) {
            case 0:
                tpref="Start";
                break;
            case taskdef.length-1:
                tpref="Finish";
                break;
            default:
                tpref="TP" + i.toString();
        }
        newrow= "<tr><td>"  + tpref + "</td><td>" + taskdef[i].pointname + "</td><td>" + pointDescription(taskdef[i].coords) + "</td><td>";
        coordlist.push(taskdef[i].coords);
        if(i===0) {
            newrow += "&nbsp;";
        }
        else {
             newrow += "<button>&uarr;</button></td>";
        }
        newrow += "</td><td><button>X</button></td></tr>";
       $('#tasktab').append(newrow);
       if(i >0) {
           distance+=taskdef[i].coords.distanceTo(taskdef[i-1].coords);
       }
    }
    if(distance >0) {
    $('#tasklength').text("Task length: " +(distance/1000).toFixed(1) + "Km");
    mapLayers.tasklayer=L.polyline(coordlist,{color: 'black'}).addTo(map);
    }
    bindTaskButtons();
 }
 
 
 function markerClick(e) {
     var taskpoint= {coords: e.latlng, pointname: e.target.options.title};
     taskdef.push(taskpoint);
     updateTask();
 }
 
 function zapMarkers() {
     if(mapLayers.markers) {
         map.removeLayer(mapLayers.markers);
     }
 }
 
    function showAirspace() {
       var mapbounds= map.getBounds();
      // alert(JSON.stringify(mapbounds));
       //Don't show airspace if the map is zoomed out so north/south latitude distance is over 10 degrees
       //roughly 1000 Km. Too much data in the layer slows everything down.
       //Values here are a tradeoff between window size,  smooth factor and responsiveness
       if ((airClip >0) && ((mapbounds.getNorth()- mapbounds.getSouth()) < 10)) {
       $.post("getairspace.php",
           {
               maxNorth: mapbounds.getNorth(),
               minNorth: mapbounds.getSouth(),
               maxEast: mapbounds.getEast() ,
                minEast: mapbounds.getWest()
        } ,
              function(data,status) {
              if(status==="success")  {
                     var i;
                    var polyPoints;
                     var suacircle;
                     var airStyle = {
                    "color": "black",
                    "weight": 1,
                    "opacity": 0.20,
                    "fillColor": "red",
                    "clickable": false,
                    "smoothFactor": 1
                    };
                var suafeatures=[];
                  zapAirspace();
            for(i=0 ; i < data.polygons.length;i++) {
                if(data.polygons[i].base < airClip)  {
                  polyPoints=data.polygons[i].coords;
                    suafeatures.push(L.polygon(polyPoints,airStyle));
                }
            }
            for(i=0; i < data.circles.length; i++) {
                if (data.circles[i].base <  airClip)  {
                    suafeatures.push(L.circle(data.circles[i].centre, 1000*data.circles[i].radius, airStyle));
                    }
                }
                    mapLayers.airspace= L.layerGroup(suafeatures).addTo(map); 
                       }
    },"json");
        }
    else  {
        zapAirspace();
    }
    }

    // End of private methods
    
    
    
    var airClip=6000;
    var map = L.map(elementName);
         
      var mapQuestAttribution = ' | Tiles Courtesy of <a href="http://www.mapquest.com/" target="_blank">MapQuest</a> <img src="http://developer.mapquest.com/content/osm/mq_logo.png">';
     var mapLayers= L.tileLayer('http://otile1.mqcdn.com/tiles/1.0.0/map/{z}/{x}/{y}.jpg', {
            attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>' +
               mapQuestAttribution,
            maxZoom: 18}).addTo(map);
    
    map.on('click', function(e) {
        this.setView(e.latlng,10);
        $('#opener').hide();
        this.off('click');
        showAirspace();
        $('#disclaimer').show();        
});
            
    map.setView([0,0],2);
    
    return  {
         updateAirspace:  function(clip) {
             airClip=clip;
           showAirspace();
        },
showTps:  function(pointlist) {
            var marker;
            var latlng;
            var markerlist=[];
            var i;
            var myIcon = L.icon({
           iconUrl: 'lib/leaflet/images/marker-icon.png',
             iconSize: [15, 25]
             });
            zapMarkers();
            var liteicon=L.divIcon();
            for(i=0;i < pointlist.length;i++) {
            latlng=L.latLng(pointlist[i].latitude,pointlist[i].longitude)
           marker=L.marker(latlng,{title: pointlist[i].tpname, icon: myIcon}).on('click',markerClick);
            markerlist.push(marker);
            }
            mapLayers.markers=L.layerGroup(markerlist).addTo(map);
            
        },
        activateEvents: function() {
        map.on({'moveend':showAirspace,'click': function(e) {
            this.setView(e.latlng,10);
            this.off('click');
        }
        });
        }
    }
}
