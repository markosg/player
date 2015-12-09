$(document).ready(function () {


            var socket = io.connect('http://localhost:3001');

             var image_link = artist =album  =  title = '';
            socket.on('convertStatus', function (data) {
        
                $("#socketData").text(data);
            });
            socket.on('scanRes', function (data) {
               //$('#filesList').empty();

               $.each(data, function (index, value) {
                    $('#filesList').append("<li>" + value + "</li>");
               });
            })

            // Get All List Db
            socket.on('getAllList', function (list) {
                $('#dblistcont').empty();
               $.each(list, function (index, value) {
                    $('#dblistcont').append("<li><input type='checkbox' name='list' value='"+value.id+"'>" + value.path + "</li>");
               });
            })

            // Get All Palylist Db
            var x = 1;
            socket.on('getAllPlayList', function (list) {
                 $('#playlist_c').empty();
                
               $.each(list, function (index, value) {

                   var play_list = value.play_list;
                   var list_path = play_list.split("###");
                   $('#playlist_c').append("<li class='playlist_item'>" + value.playlistName + "<sup style='color:red; font-size:10px'>"+value.namesCount+"</sup><ul class='sub_list_"+x+"'></ul></li>");
                  
                      list_path.forEach(function (url){
                      var urls = url;
                        $('.sub_list_'+x).append("<li data-path='"+url+"' data-artist='"+artist+"' data-title='"+title+"' data-img='"+image_link+"'>"+url+"</li>"); 
                     })
                        x++;  
                       
                    });

                    
               });


            socket.on('convertProgress', function (data) {
                $("#p1").attr("value", data.progress);
                $("#filePath").text(data.path);
            });

            // crate play list
            $(document).on('click',".playlist_item",function(){
             var arr_list = [];
             var list_path = '';
              var pla_list = {};
              var $li= $(this).find("ul li");
              var k=0;
              var len = $li.length;
              $li.each(function(){

                list_path = $(this).attr("data-path");

                        console.log(list_path);
                        var urls = "http://localhost:3000/"+list_path;
                           ID3.loadTags(urls, function() {
                           
                            var tags = ID3.getAllTags(urls);
                            console.log(tags);
                             image = tags.picture;
                             image_link = "";
                             artist = tags.artist;
                             album  = tags.album;
                             title = tags.title;

                              
                              if (artist === undefined) {
                                artist = "Unknown artist";
                              }
                              if (title === undefined) {
                                var str = urls.split("/");
                                var str2 = str[str.length-1];
                                str2=str2.split(".mp3");
                                 title = str2[0]; 
                              } 



                             console.log(artist);
                           if (image) {
                              var base64String = "";
                              for (var i = 0; i < image.data.length; i++) {
                                  base64String += String.fromCharCode(image.data[i]);
                              }
                              var img_base64 = "data:" + image.format + ";base64," +
                              window.btoa(base64String);
                              image_link = img_base64;
                            } else {
                              image_link = "http://localhost:3000/img/player_bg.jpg";
                            }
                              pla_list = {
                              title: title,
                              artist: artist,
                              mp3: urls,
                              poster: image_link
                            }; 

                              arr_list.push(pla_list);
                             k++;
                             if(k==len){
                                 myPlaylist.setPlaylist( arr_list );
                              }
                        }, {
                          tags: ["title","artist","album","picture"]
                        })
                          

              })
              console.log(k+":"+len);
              // alert(2);
              
              
             
            })

            $("#create_playlist").click(function(){
            var pl_list = [];
                $("#dblistcont input").each(function(){
                    if($(this).is( ":checked" )){
                        //alert(this.value);
                        pl_list.push(this.value);
                    }
                })
               var pl_list_name = prompt("Please enter Play List  name", "playlist 1");
                if (pl_list_name != null) {
                   socket.emit("create play list",{pl_list:pl_list,pl_list_name:pl_list_name});
                }
            })
            
            //Scan Media Files
             $("#scanFiles").click(function (e) {
                e.preventDefault();
                 socket.emit("scan","d:/mp3");
                
            });
            $("#scanConvertFiles").click(function (e) {
                e.preventDefault();
                 socket.emit("rowTbl","C:/xampp/htdocs/InKafee/app/ConvertedFiles");
                
            });
            $("#submitButton").click(function (e) {
                e.preventDefault();
                var data = {};
                data.getFiles = "scan";
                $.ajax({
                    type: 'POST',
                    data: JSON.stringify(data),
                    contentType: 'application/json',
                    url: window.location.pathname,
                    success: function (data) {
                        $('#filesList').empty();
                        $.each(data, function (index, value) {
                            $('#filesList').append("<li>" + value + "</li>");
                        });
                    }
                });
            });

            //Convert Media Files
            $("#convertFiles").click(function (e) {
                e.preventDefault();
                var data = {};
                data.convertFiles = "convert";
                $.ajax({
                    type: 'POST',
                    data: JSON.stringify(data),
                    contentType: 'application/json',
                    url: window.location.pathname,
                    success: function (data) {
                        $('#filesList').append("<li>" + data + "</li>");
                    }
                });
            });

///////////////////////////  jPlayerPlaylist      ///////////////////////////////////////////////

var myPlaylist = new jPlayerPlaylist({
      jPlayer: "#jquery_jplayer_N",
      cssSelectorAncestor: "#jp_container_N"
      }, [
      {
      title:"Cro Magnon Man",
      artist:"The Stark Palace",
      mp3:"http://www.jplayer.org/audio/mp3/TSP-01-Cro_magnon_man.mp3",
      poster: "http://localhost:3000/img/player_bg.jpg"
      }
      ], {
      playlistOptions: {
      enableRemoveControls: true
      },
      swfPath: "../../dist/jplayer",
      supplied: "webmv, ogv, m4v, oga, mp3",
      useStateClassSkin: true,
      autoBlur: false,
      smoothPlayBar: true,
      keyEnabled: true,
      audioFullScreen: true
      });
      // Click handlers for jPlayerPlaylist method demo
      // Audio mix playlist
      $("#playlist-setPlaylist-audio-mix").click(function() {
        var obj = {
      title:"Cro Magnon Man",
      artist:"The Stark Palace",
      mp3:"http://www.jplayer.org/audio/mp3/TSP-01-Cro_magnon_man.mp3",
      oga:"http://www.jplayer.org/audio/ogg/TSP-01-Cro_magnon_man.ogg",
      poster: "http://www.jplayer.org/audio/poster/The_Stark_Palace_640x360.png"
      };
      myPlaylist.setPlaylist([
      obj
      ]);
      });
    /*  {
      title:"Cro Magnon Man",
      artist:"The Stark Palace",
      mp3:"http://www.jplayer.org/audio/mp3/TSP-01-Cro_magnon_man.mp3",
      oga:"http://www.jplayer.org/audio/ogg/TSP-01-Cro_magnon_man.ogg",
      poster: "http://www.jplayer.org/audio/poster/The_Stark_Palace_640x360.png"
      },
      {
      title:"Your Face",
      artist:"The Stark Palace",
      mp3:"http://www.jplayer.org/audio/mp3/TSP-05-Your_face.mp3",
      oga:"http://www.jplayer.org/audio/ogg/TSP-05-Your_face.ogg",
      poster: "http://www.jplayer.org/audio/poster/The_Stark_Palace_640x360.png"
      },
      {
      title:"Hidden",
      artist:"Miaow",
      free: true,
      mp3:"http://www.jplayer.org/audio/mp3/Miaow-02-Hidden.mp3",
      oga:"http://www.jplayer.org/audio/ogg/Miaow-02-Hidden.ogg",
      poster: "http://www.jplayer.org/audio/poster/Miaow_640x360.png"
      },
      {
      title:"Cyber Sonnet",
      artist:"The Stark Palace",
      mp3:"http://www.jplayer.org/audio/mp3/TSP-07-Cybersonnet.mp3",
      oga:"http://www.jplayer.org/audio/ogg/TSP-07-Cybersonnet.ogg",
      poster: "http://www.jplayer.org/audio/poster/The_Stark_Palace_640x360.png"
      },
      {
      title:"Tempered Song",
      artist:"Miaow",
      mp3:"http://www.jplayer.org/audio/mp3/Miaow-01-Tempered-song.mp3",
      oga:"http://www.jplayer.org/audio/ogg/Miaow-01-Tempered-song.ogg",
      poster: "http://www.jplayer.org/audio/poster/Miaow_640x360.png"
      },
      {
      title:"Lentement",
      artist:"Miaow",
      mp3:"http://www.jplayer.org/audio/mp3/Miaow-03-Lentement.mp3",
      oga:"http://www.jplayer.org/audio/ogg/Miaow-03-Lentement.ogg",
      poster: "http://www.jplayer.org/audio/poster/Miaow_640x360.png"
      }
   */
///////////////////////////  END jPlayerPlaylist      ///////////////////////////////////////////////



});