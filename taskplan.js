(function ($) {
   'use strict';
   
   function parseCup(tpLine) {
       var lineout={};
       var linearray=tpLine.split(',');
       lineout.tpname=linearray[0].replace(/"/g,"");
       lineout.latitude=parseFloat(linearray[3].substr(0,2)) + parseFloat(linearray[3].substr(2,6))/60;
       if(linearray[3].charAt(8)=='S') {
           lineout.latitude= -lineout.latitude;
       }
       lineout.longitude=parseFloat(linearray[4].substr(0,3)) + parseFloat(linearray[4].substr(3,6))/60;
       if(linearray[4].charAt(9)=='W') {
           lineout.longitude= -lineout.longitude;
       }
       return lineout;
   }
   
   function parseDat(tpLine) {
        var lineout={};
       var linearray=tpLine.split(',');
       lineout.tpname=linearray[5];
     var latdir=linearray[1].charAt(linearray[1].length-1);
     var longdir=linearray[2].charAt(linearray[2].length-1);
     var latsplit=linearray[1].split(':');
     lineout.latitude=parseFloat(latsplit[0]) + parseFloat(latsplit[1])/60;
     if(latsplit.length >2)  {
         lineout.latitude+=parseFloat(latsplit[2])/3600;
     }
     if(latdir=='S') {
         lineout.latitude= -lineout.latitude;
     }
     var longsplit=linearray[2].split(':');
     lineout.longitude=parseFloat(longsplit[0]) + parseFloat(longsplit[1])/60;
     if(longsplit.length >2)  {
         lineout.longitude+=parseFloat(longsplit[2])/3600;
     }
     if(longdir=='W') {
         lineout.longitude= -lineout.longitude;
     }
     return lineout;
   }
   
   function parseTps(tpfile,extension) {
      var listitems=[];
       var lineIndex;
       var tpLines=tpfile.split('\n');
       var line;
       var fileSize =tpLines.length;
       switch(extension)  {
           case ".CUP":
       for(lineIndex=0;lineIndex <  tpLines.length ;lineIndex++)  {
           if(/^"[\w\s]+",[\w"]*,[A-Z]{2},\d{4}.\d{3}[NS],\d{5}.\d{3}[EW],/.test(tpLines[lineIndex])) {
          line= parseCup(tpLines[lineIndex]);
          listitems.push(line);
           }
       }
       break;
        case ".DAT":
       for(lineIndex=0;lineIndex <   tpLines.length ;lineIndex++)  {
           if(/^\d+,\d{2}:\d{2}[:.]\d+[NS],\d{3}:\d{2}[.:]\d+[EW],\w*,\w*,[\w\s]+/.test(tpLines[lineIndex])) {
                          //alert(tpLines[lineIndex]);
          line= parseDat(tpLines[lineIndex]);
          listitems.push(line);
           }
       }
       break;
       }
       return listitems;
   }
   
   function loadBgaPoints(mapControl)  {
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
    
    $('#fileControl').change(function () {
           var filetypes= [".CUP",".TXT",".DAT"];
           var pointlist=[];
            if (this.files.length > 0) {
                var extension=this.value.substr(-4).toUpperCase();
               if(filetypes.indexOf(extension)  >= 0) {
                var reader = new FileReader();
                reader.onload = function(e)  {
                pointlist=parseTps(this.result,extension);
               if(pointlist.length > 1) {
                var carryon=true;
                if(pointlist.length > 1) {
                    if(pointlist.length > 3000) {
                        alert("Sorry, can't display more than 3000 points");
                        carryon="false";
                   }
                   else {
                       carryon= confirm("Large file- expect slow response\n\nContinue?");
                   }
                }
                if(carryon) {
                 mapControl.showTps(pointlist);
                  }
                }
                else {
                    alert("Sorry, file format incorrect");
                }
                };
                reader.readAsText(this.files[0]);
               }
            }
        });
    
    $('#bga').click(function() {
        loadBgaPoints(mapControl);
    });
    
    $('#acceptor').click(function() {
      $('#disclaimer').hide();
      $('#maincontrol').show();
      mapControl.activateEvents();
  });
    
});
  
}(jQuery));