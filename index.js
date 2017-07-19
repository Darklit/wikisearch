const readline = require('readline');
const request = require('request');
const fs = require('fs');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.question('What are you searching? ', answer => {
  request.post({
    uri: `https://en.wikipedia.org/w/api.php?action=opensearch&format=json&search=${answer}`,
    allowAllRedirects: true
  }, function(error,response,body){
    console.log('error:', error);
    if(response.statusCode == 200){
      var newString = '';
      var bodyObj = JSON.parse(body);
      var jsonObj = {
        search: bodyObj[Object.keys(bodyObj)[0]],
        terms: bodyObj[Object.keys(bodyObj)[1]],
        definitions: bodyObj[Object.keys(bodyObj)[2]],
        sites: bodyObj[Object.keys(bodyObj)[3]]
      };
      var termNum = 0;
      const retry = () =>{
        termNum++;
        rl.question('Is this what you were searching for? ', answer => {
          if(answer.toLowerCase() == 'yes'){
            rl.close();
          }else{
            if(jsonObj.terms[termNum] == undefined){
              console.log('No more terms.');
              rl.close();
            }else{
              console.log(`${jsonObj.terms[termNum]}: ${jsonObj.definitions[termNum]}\n`);
              retry();
            }
          }
        });
      }
      console.log(`${jsonObj.terms[0]}: ${jsonObj.definitions[0]}`);
      retry();
    }else{
      console.log(response.statusCode);
    }
  });
});
