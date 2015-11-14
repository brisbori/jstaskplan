(function ($) {
   'use strict';
   
   function loadTurningPoints(mapControl)  {
       var pointlist=[];
       var point;
       var i;
       $.get("bga_points.php", function(data, status) {
           if(status==='success') {
             point=JSON.parse(data[0]);
               for(i=0;i < data.length; i++)  {
                   point=JSON.parse(data[i]);
                   pointlist.push(point);
               }
              mapControl.showTps(pointlist);
           }
   }, "json");
   }
   
  $(document).ready(function () {
    var mapControl = createMapControl('map');
    mapControl.airClip=0;
    
    $('#airclip').change(function() {
             mapControl.updateAirspace(Number( $("#airclip").val()));
         });  
      
    $('#acceptor').click(function() {
      $('#disclaimer').hide();
      $('#maincontrol').show();
      mapControl.activateEvents();
      loadTurningPoints(mapControl);
  });
    
});
  
}(jQuery));