const committer = {
    "name": "WordPressService",
    "email" : "data@alpha.ca.gov"
};

const githubApiUrl = 'https://api.github.com/repos/cagov/covid19/';
const githubSyncFolder = 'pages/synctest4'; //no slash at the end
const wordPressApiUrl = 'https://as-go-covid19-d-001.azurewebsites.net/wp-json/wp/v2/posts';

module.exports = async function (context, req) {

    //Any POST will be considered the ping
    
    if(false) {

    } else {
        const sourcefiles = await fetch(wordPressApiUrl,authoptions())
            .then(response => response.ok ? response.json() : Promise.reject(response))
            .catch(error => {
                console.error('FETCH Wordpress Error:', error);
                return Promise.reject();
            });

        sourcefiles.forEach(x=>x['filename']=x.slug);

        const targetfiles = (await fetch(`${githubApiUrl}contents/${githubSyncFolder}`,authoptions())
            .then(response => response.ok ? response.json() : Promise.reject(response))
            .catch(error => {
                console.error('FETCH Github Error:', error);
                return Promise.reject();
            })
            )
            .filter(x=>x.type==='file'&&x.name.endsWith('.html')&&x.name!=='index.html'); 

        targetfiles.forEach(x=>x['filename']=x.name.split('.')[0]);
        
        //Files to delete
        for(const deleteTarget in targetfiles.filter(x=>!sourcefiles.find(y=>x.filename===y.filename))) {
            const options = {
                method: 'DELETE',
                headers: authheader(),
                body: JSON.stringify({
                    "message": `Delete ${deleteTarget.path}`,
                    "committer": committer,
                    "branch": "master",
                    "sha": deleteTarget.sha
                })
            };

            await fetch(`${githubApiUrl}contents/${deleteTarget.path}`, options)
            .then(() => {
                console.log(`DELETE Success: ${deleteTarget}`);
            })
            .catch(error => {
                console.error('DELETE Error:', error);
            }); 
        }

        //Updates
        for(const sourcefile of sourcefiles) {
            const targetfile = targetfiles.find(y=>sourcefile.filename===y.filename);
            const base64 = Base64.encode(sourcefile.content.rendered);

            const getOptions = bodyJSON =>
                ({
                    method: 'PUT',
                    headers: authheader(),
                    body: JSON.stringify(bodyJSON)
                });
            
            let body = {
                "message": "",
                "committer": committer,
                "branch": "master",
                "content": base64
            };

            if(!targetfile) {
                //ADD
                body.message=`ADD ${sourcefile.filename}`;
    
                await fetch(`${githubApiUrl}contents/${githubSyncFolder}/${sourcefile.filename}.html`, getOptions(body))
                .then(() => {
                    console.log(`ADD Success: ${sourcefile.filename}`);
                })
                .catch(error => {
                    console.error('ADD Error:', error);
                });
                
            } else {
                //UPDATE
                const targetcontent = await fetch(`${githubApiUrl}git/blobs/${targetfile.sha}`,authoptions())
                    .then(response => response.json())
                    .catch(error => {
                        console.error('FETCH Blob Error:', error);
                    });
                
                if(base64!==targetcontent.content.replace(/\n/g,'')) {
                    //Update file
                    body.message=`Update ${targetfile.path}`;
                    body['sha']=targetfile.sha;
        
                    await fetch(`${githubApiUrl}contents/${targetfile.path}`, getOptions(body))
                    .then(() => {
                        console.log(`UPDATE Success: ${targetfile.path}`);
                    })
                    .catch(error => {
                        console.error('UPDATE Error:', error);
                    });
                } else {
                    console.log(`Files matched: ${targetfile.path}`)
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
