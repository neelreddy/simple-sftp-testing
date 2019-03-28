const SFTPServer = require('node-sftp-server');
var fs = require('fs');

var myServer = new SFTPServer({ privateKeyFile: "./key.txt", debug: true });

myServer.listen(999);

myServer.on('connect', (auth, info) => {
  console.warn("authentication attempted, client info is: " + JSON.stringify(info)+", auth method is: " + auth.method);
  return auth.accept(function(session) {
    try {
      console.warn("Okay, we've accepted, allegedly?");
      session.on("readdir", function(path, responder) {
        var dirs, i, j, results;
        console.warn("Readdir request for path: " + path);
        dirs = (function() {
          results = [];
          for (j = 1; j < 10000; j++){ results.push(j); }
          return results;
        }).apply(this);
        i = 0;
        responder.on("dir", function() {
          if (dirs[i]) {
            console.warn("Returning directory: " + dirs[i]);
            responder.file(dirs[i]);
            return i++;
          } else {
            return responder.end();
          }
        });
        return responder.on("end", function() {
          return console.warn("Now I would normally do, like, cleanup stuff, for this directory listing");
        });
      });

      session.on("readfile", function(path, writestream) {
        return fs.createReadStream("/tmp/grumple.txt").pipe(writestream);
      });

      return session.on("writefile", function(path, readstream) {
        var something;
        something = fs.createWriteStream(`.${path}`);
        readstream.on("end",function() {
          console.warn("Writefile request has come to an end!!!")
        });
        return readstream.pipe(something);
      });

    } catch (err) {
      console.log(err.message)
    }
  });
});

myServer.on("error", function() {
  return console.warn("Example server encountered an error");
});
myServer.on("end", function() {
  return console.warn("Example says user disconnected");
});