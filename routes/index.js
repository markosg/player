var http = require('http');
var express = require('express');
var app = express();
var router = express.Router();
var mysql = require('mysql');
var walk = require('walk');
var ffmpeg = require("fluent-ffmpeg");
var path = require('path');
var appRoot = require('app-root-path');
var fs = require('fs');

/*var io = require('socket.io')();*/
var server = http.createServer(app).listen(3001);
var io = require('socket.io').listen(server,{log:false, origins:'*:*'});

var k = 0;
var s = 1; 
var x = 0;
var mediapath = 'media/'; 
var source = [];
var archiveRoot = appRoot + "\\ConvertedFiles";
if (!fs.existsSync(archiveRoot)) {
    fs.mkdirSync(archiveRoot);
}

/*Create mysql connection*/
var conn = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'inKaffee'
});


/* GET home page. */
router.get('/', function (req, res, next) {
    res.render('index', {title: 'Express'});
});

/* POST home page. */
router.post('/', function (req, res) {
    //Ajax response media scanner
  /*  if (req.body.getFiles == "scan") {
       
        //Ajax response media scanner
    } else if (req.body.convertFiles == "convert") {
        res.send("Converting");

        var source = ["music1.mp4", "music2.mp4"];
        var k = 0;
        var fileSrc = "d:\\m\\" + source[k];
        var fileTarget = "d:\\m\\" + source[k] + ".mp3";*/
/*
        io.listen(3001);
        io.on('connection', function (socket) {

            converter(fileSrc, fileTarget);

            function converter(S, T) {
                var proc = new ffmpeg({source: S, nolog: false})
                    .noVideo()
                    .withAudioCodec('libmp3lame')
                    .withAudioBitrate('192k')
                    .withAudioChannels(2)
                    .toFormat('mp3')
                    .on('progress', function (progress) {
                        progressMsg = 'Processing: ' + S + ' ' + Math.floor(progress.percent) + '% done';
                        io.socket.emit('convertProgress', {"path": S, "progress": progress.percent});
                    })
                    .on('error', function (err, stdout, stderr) {
                        errorMsg = 'Cannot process video: ' + err.message;
                        console.log(errorMsg);
                        io.socket.emit('convertStatus', errorMsg);
                    })
                    .on('end', function () {
                        successMsg = 'Transcoding succeeded ! ' + T;
                        console.log(successMsg);
                        io.socket.emit('convertStatus', successMsg);
                        k++;
                        if (k < source.length) {
                            fileSrc = "d:\\m\\" + source[k];
                            fileTarget = "d:\\m\\" + source[k] + ".mp3";
                            converter(fileSrc, fileTarget);
                        }
                    })
                    .save(T);
            }
        });
*/
   /* } else {
        res.send("...");
    }*/
   
    


});
io.on('connection', function(socket) {
    console.log("connected!!!!");
     getAllList();
     getAllPlayList();
     function getAllList(){
        conn.query( 'SELECT * FROM media ', function(err, rows) {
        if(typeof rows !== "undefined")   {
            if(rows.length>0){
            console.log("vvvvvvvvvvvvvvv");
            console.log(rows);
             socket.emit("getAllList",rows);
            }
        }        
          
         });


    }
    function getAllPlayList(){
        conn.query( 'SELECT playlist.playlistName,COUNT(*) AS namesCount, GROUP_CONCAT(media.path SEPARATOR "###") as play_list FROM playlist INNER JOIN playlist_media ON playlist.ID = playlist_media.playlistID INNER JOIN media ON playlist_media.mediaID = media.ID GROUP BY playlist.playlistName', function(err, rows) {
            if(typeof rows !== "undefined")   {
                if(rows.length>0){
                    console.log(rows);
                     socket.emit("getAllPlayList",rows);
                    }
                }        
              
            });
    }
    socket.on("scan",  function(dir){
        console.log("scan!!");    
        var files = [];
        var filePath = selfpath = newMediaFilePath = newMediaFile = '';

        var walker = walk.walk(dir, {followLinks: false});

        walker.on('file', function (root, stat, next) {
            var pr = stat.name.split(".");
            var popped = pr.pop();
            console.log(popped);
            var ext = ["avi", "mp4", "mp3", "wav"];
           // if (stat.name.match('^.*\.(avi|mp4|wav|)$')) {
            if(ext.indexOf(popped)!=-1){
                if(popped=="mp3"){
                        filePath = path.join(root, '\\\\', stat.name);
                        selfpath = fs.createReadStream(filePath);
                        newMediaFilePath = mediapath + stat.name;
                        newMediaFile = fs.createWriteStream("public/"+newMediaFilePath);

                        selfpath.pipe(newMediaFile);

                        files.push(newMediaFilePath);
                      
                }
               else{
                  source.push(stat.name);
                  
                }
               
            }
            next();
        });
        walker.on('end', function () {
           //res.send(files);
           socket.emit("scanRes",files);
           console.log(files);
            addScanedToDB(files);
            cons();

        });


    })
    socket.on('con',  function(msg){
        
    })
   // create play list
   socket.on('create play list', function (msg) {
        console.log(msg);
       // var queryStr = "CREATE TABLE IF NOT EXISTS playlist (id int(16) unsigned NOT NULL auto_increment, list_name varchar(1024) NOT NULL default '0', list_id int(10) NOT NULL default '0', PRIMARY KEY  (id)) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8";
        var queryStr = "CREATE TABLE IF NOT EXISTS playlist (id int not null auto_increment primary key, playlistName varchar(250) not null )";
        conn.query(queryStr, function (error, result, fields) {
            if (error) {
                console.log(error.code);
            } else {
            var qStr = "CREATE TABLE IF NOT EXISTS playlist_media ( id int not null auto_increment primary key, playlistID int not null, foreign key (playlistID) references playlist(id) ON DELETE CASCADE ON UPDATE CASCADE, mediaID int not null, foreign key (mediaID) references media(id) ON DELETE CASCADE ON UPDATE CASCADE )";
                
             conn.query(qStr, function (error, result, fields) {
            if (error) {
               console.log(error.code);
            }
        })


                var playlist_ID = '';
                 conn.query("INSERT INTO playlist (playlistName) VALUES ('" + msg.pl_list_name + "')", function (error, rows) {
                            if (error) {
                                 console.log(error.code);
                             } else {
                                 //console.log("DB rows inserted - OK");
                                  playlist_ID = rows.insertId;
                                   var pl_list_id = msg.pl_list;
                    pl_list_id.forEach(function(val){
                         conn.query("INSERT INTO playlist_media (playlistID,mediaID) VALUES ('" + playlist_ID + "','"+val+"')", function (error, rows) {
                            })
                    })
                            }
                    });  
                   
             }       
        })
    });

    socket.on('disconnect', function () {
        console.log('user disconnected');
        source= [];
      });
     function cons(){
        console.log(source);
        //source = ["music1.mp4", "music2.mp4"];
        var fileSrc = "d:\\m\\" + source[k];
      
        var fileTarget = "C:/xampp/htdocs/InKafee/app/ConvertedFiles/" + source[k] + ".mp3"; 
        fs.exists(fileTarget, function (exists) {
          console.log(exists ? "it's there" : 'no passwd!');
          if(!exists){
            ++s;
            console.log("MMMMM"+k);
            converter(fileSrc, fileTarget);
        }else{
            if(s < source.length){
                ++s;
                ++k;
                cons();
            }
            
        }
        });
        
     }   
    function converter(S, T) {
        console.log("convert");
                var proc = new ffmpeg({source: S, nolog: false})
                    .noVideo()
                    .withAudioCodec('libmp3lame')
                    .withAudioBitrate('192k')
                    .withAudioChannels(2)
                    .toFormat('mp3')
                    .on('progress', function (progress) {
                        progressMsg = 'Processing: ' + S + ' ' + Math.floor(progress.percent) + '% done';
                        socket.emit('convertProgress', {"path": S, "progress": progress.percent});
                    })
                    .on('error', function (err, stdout, stderr) {
                        errorMsg = 'Cannot process video: ' + err.message;
                        console.log(errorMsg);
                        socket.emit('convertStatus', errorMsg);
                    })
                    .on('end', function () {
                        successMsg = 'Transcoding succeeded ! ' + T;
                        console.log(successMsg);
                        socket.emit('convertStatus', successMsg);
                       k++;
                        if (k < source.length) {
                           cons();
                        }
                    })
                    .save(T);
    }

   





})
 



            function addScanedToDB(scanList) {
        var queryStr = "create table if not exists media ( id int not null auto_increment primary key, path varchar(250) not null )";
        conn.query(queryStr, function (error, result, fields) {
            if (error) {
               // console.log(error.code);
            } else {
                var stepscan = scanList.length;
                console.log("DB table created - OK");
                console.log(scanList.length);
                scanList.forEach(function (scanItem) {
                    console.log(scanItem);
                    var scanItem_rep=scanItem.replace(/\\/gi, "\\\\");
                    conn.query( 'SELECT path FROM media WHERE path="'+ scanItem_rep +'" ', function(err, rows) {
                        if(rows.length==0){
                             conn.query("INSERT INTO media (path) VALUES ('" + scanItem_rep + "')", function (error, rows) {
                             if (error) {
                                    console.log(error.code);
                                } else {
                                    //console.log("DB rows inserted - OK");
                                }
                            });
                        }

                    });
                  x++;
                  if(x == stepscan){
                        console.log("scan complited");
                  } 
                })
            }
        });
    }
module.exports = router;
