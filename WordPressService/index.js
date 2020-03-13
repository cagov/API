var pingdata = []

const committer = {
    "name": "Carter Medlin using Postman",
    "email" : "carter.medlin@alpha.ca.gov"
}

module.exports = async function (context, req) {
    //ontext.log('JavaScript HTTP trigger function processed a request.');

    const ping = req.query.ping;
    const pingcheck = req.query.pingcheck;
    const datainfo = req.query.datainfo;
    
    if(pingcheck) {
        context.res = {
            // status: 200, /* Defaults to 200 */
            body: {pingdata : pingdata}
        };
    } else if (ping) {

        pingdata.push({query : req.query, body : req.body})

        context.res = {
            // status: 200, /* Defaults to 200 */
            body: "Ping"
        };
    } else if (datainfo) {
        //Set by step commit
//https://www.levibotelho.com/development/commit-a-file-with-the-github-api/

//https://api.github.com/repos/cagov/covid19/contents/pages/

        let sourcefiles = (await fetch(`https://as-go-covid19-d-001.azurewebsites.net/wp-json/wp/v2/posts`,authoptions())
            .then(response => response.json()))
        sourcefiles.forEach(x=>x['filename']=x.slug)

       


        let targetfiles = (await fetch(`https://api.github.com/repos/cagov/covid19/contents/pages/`,authoptions())
            .then(response => response.json()))
            .filter(x=>x.type==="file"&&x.name!=="index.html");

        targetfiles.forEach(x=>x['filename']=x.name.split('.')[0])
        
        //Files to delete
        targetfiles.filter(x=>!sourcefiles.find(y=>x.filename===y.filename)).forEach(x=>{
            const options = {
                method: 'DELETE',
                headers: authheader(),
                body: JSON.stringify({
                    "message": `Delete ${x.path}`,
                    "committer": committer,
                    "branch": "master",
                    "sha": x.sha
                })
            };

            fetch(`https://api.github.com/repos/cagov/covid19/contents/${x.path}`, options)
            .then((result) => {
                console.log('DELETE Success:', result);
              })
            .catch((error) => {
                console.error('DELETE Error:', error);
              }); 
        });

        //Updates
        for(const sourcefile of sourcefiles) {
            const targetfile = targetfiles.find(y=>sourcefile.filename===y.filename);
            const base64 = Base64.encode(sourcefile.content.rendered);

            if(!targetfile) {
                //ADD
                const options = {
                    method: 'PUT',
                    headers: authheader(),
                    body: JSON.stringify({
                        "message": `ADD ${sourcefile.filename}`,
                        "committer": committer,
                        "branch": "master",
                        "content": base64
                    })
                };
    
                fetch(`https://api.github.com/repos/cagov/covid19/contents/pages/${sourcefile.filename}.html`, options)
                .then((result) => {
                    console.log('ADD Success:', result);
                })
                .catch((error) => {
                    console.error('ADD Error:', error);
                });
                
            } else {
                //UPDATE
                const targetcontent = await fetch(`https://api.github.com/repos/cagov/covid19/git/blobs/${targetfile.sha}`,authoptions())
                    .then((response) => {
                        return response.json();
                    });
                
                if(base64!==targetcontent.content.trim()) {
                    //Update file
                    const options = {
                        method: 'PUT',
                        headers: authheader(),
                        body: JSON.stringify({
                            "message": `Update ${targetfile.path}`,
                            "committer": committer,
                            "branch": "master",
                            "sha": targetfile.sha,
                            "content": base64
                        })
                    };
        
                    fetch(`https://api.github.com/repos/cagov/covid19/contents/${targetfile.path}`, options)
                    .then((result) => {
                        console.log('UPDATE Success:', result);
                    })
                    .catch((error) => {
                        console.error('UPDATE Error:', error);
                    });
                }
            }       
        }

        context.res = {
            // status: 200, /* Defaults to 200 */
            body: {targetfiles, sourcefiles},
            headers: {
                
                'Content-Type' : 'application/json'
                //"Cache-Control" : "public, max-age=84600" //1 day
            }
        };
        
    } else {

    }

    context.done();
}


function authheader() {
    return {
        'Authorization' : `Bearer ${process.env["GITHUB_TOKEN"]}`,
        'Content-Type': 'application/json'
    };
}

function authoptions() {
    return {"headers":authheader() }
}

const Base64={_keyStr:"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",encode:function(e){var t="";var n,r,i,s,o,u,a;var f=0;e=Base64._utf8_encode(e);while(f<e.length){n=e.charCodeAt(f++);r=e.charCodeAt(f++);i=e.charCodeAt(f++);s=n>>2;o=(n&3)<<4|r>>4;u=(r&15)<<2|i>>6;a=i&63;if(isNaN(r)){u=a=64}else if(isNaN(i)){a=64}t=t+this._keyStr.charAt(s)+this._keyStr.charAt(o)+this._keyStr.charAt(u)+this._keyStr.charAt(a)}return t},decode:function(e){var t="";var n,r,i;var s,o,u,a;var f=0;e=e.replace(/++[++^A-Za-z0-9+/=]/g,"");while(f<e.length){s=this._keyStr.indexOf(e.charAt(f++));o=this._keyStr.indexOf(e.charAt(f++));u=this._keyStr.indexOf(e.charAt(f++));a=this._keyStr.indexOf(e.charAt(f++));n=s<<2|o>>4;r=(o&15)<<4|u>>2;i=(u&3)<<6|a;t=t+String.fromCharCode(n);if(u!=64){t=t+String.fromCharCode(r)}if(a!=64){t=t+String.fromCharCode(i)}}t=Base64._utf8_decode(t);return t},_utf8_encode:function(e){e=e.replace(/\r\n/g,"n");var t="";for(var n=0;n<e.length;n++){var r=e.charCodeAt(n);if(r<128){t+=String.fromCharCode(r)}else if(r>127&&r<2048){t+=String.fromCharCode(r>>6|192);t+=String.fromCharCode(r&63|128)}else{t+=String.fromCharCode(r>>12|224);t+=String.fromCharCode(r>>6&63|128);t+=String.fromCharCode(r&63|128)}}return t},_utf8_decode:function(e){var t="";var n=0;var r=c1=c2=0;while(n<e.length){r=e.charCodeAt(n);if(r<128){t+=String.fromCharCode(r);n++}else if(r>191&&r<224){c2=e.charCodeAt(n+1);t+=String.fromCharCode((r&31)<<6|c2&63);n+=2}else{c2=e.charCodeAt(n+1);c3=e.charCodeAt(n+2);t+=String.fromCharCode((r&15)<<12|(c2&63)<<6|c3&63);n+=3}}return t}}
