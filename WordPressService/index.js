let pinghistory = [];

const committer = {
    'name': 'WordPressService',
    'email': 'data@alpha.ca.gov'
};

const githubApiUrl = 'https://api.github.com/repos/cagov/covid19/';
const githubBranch = 'staging'
const githubSyncFolder = 'pages'; //no slash at the end
const wordPressApiUrl = 'https://as-go-covid19-d-001.azurewebsites.net/wp-json/wp/v2/';
const defaultTags = ['covid19'];
const ignoreFiles = ['index.html'];

const githubApiContents = 'contents/';

//attachments here...sourcefiles[1]._links['wp:attachment'][0].href



module.exports = async function (context, req) {
    const started = getPacificTimeNow();

    //const categories = (await fetchJSON(`${wordPressApiUrl}categories`))
    //    .map(x=>({id:x.id,name:x.name}));

    //const tags = (await fetchJSON(`${wordPressApiUrl}tags`))
    //    .map(x=>({id:x.id,name:x.name}));

    let add_count = 0;
    let update_count = 0;
    let delete_count = 0;
    let match_count = 0;

    const fetchJSON = async (URL, options) => 
        await fetch(URL,options)
        .then(response => response.ok ? response.json() : Promise.reject(response))
        .catch(async response => {
            const json = await response.json()

            context.res = {
                body: `fetchJSON error - ${options.method} - ${URL} : ${JSON.stringify(json)}`
            };
            console.error(context.res.body);
            context.done();

            return Promise.reject(context.res.body);
        });

    const sourcefiles = await fetchJSON(`${wordPressApiUrl}posts`,defaultoptions());

    sourcefiles.forEach(sourcefile => {
        sourcefile['filename'] = sourcefile.slug;

        const pagetitle = sourcefile.title.rendered;
        const meta = sourcefile.excerpt.rendered.replace(/<p>/,'').replace(/<\/p>/,'').replace(/\n/,'').trim();

        sourcefile['html'] = `---\nlayout: "page.njk"\ntitle: "${pagetitle}"\nmeta: "${meta}"\nauthor: "State of California"\npublishdate: "${sourcefile.modified_gmt}Z"\ntags: "${defaultTags.join(',')}"\n---\n`
            +sourcefile.content.rendered;
    });

    const targetfiles = (await fetchJSON(`${githubApiUrl}${githubApiContents}${githubSyncFolder}?ref=${githubBranch}`,defaultoptions()))
        .filter(x=>x.type==='file'&&x.name.endsWith('.html')&&!ignoreFiles.includes(x.name)); 

    targetfiles.forEach(x=>x['filename']=x.name.split('.')[0]);
    
    //Files to delete
    for(const deleteTarget of targetfiles.filter(x=>!sourcefiles.find(y=>x.filename===y.filename))) {
        const options = {
            method: 'DELETE',
            headers: authheader(),
            body: JSON.stringify({
                "message": `Delete ${deleteTarget.path}`,
                "committer": committer,
                "branch": githubBranch,
                "sha": deleteTarget.sha
            })
        };

        await fetchJSON(`${githubApiUrl}${githubApiContents}${deleteTarget.path}`, options)
            .then(() => {console.log(`DELETE Success: ${deleteTarget.path}`);delete_count++;})
    }

    //ADD/UPDATE
    for(const sourcefile of sourcefiles) {
        const targetfile = targetfiles.find(y=>sourcefile.filename===y.filename);
        const base64 = Base64.encode(sourcefile.html);

        const getOptions = bodyJSON =>
            ({
                method: 'PUT',
                headers: authheader(),
                body: JSON.stringify(bodyJSON)
            });
        
        let body = {
            "message": "",
            "committer": committer,
            "branch": githubBranch,
            "content": base64
        };

        if(targetfile) {
            //UPDATE
            const targetcontent = await fetchJSON(`${githubApiUrl}git/blobs/${targetfile.sha}`,defaultoptions())
            
            if(base64!==targetcontent.content.replace(/\n/g,'')) {
                //Update file
                body.message=`Update ${targetfile.path}`;
                body['sha']=targetfile.sha;

                await fetchJSON(`${githubApiUrl}${githubApiContents}${targetfile.path}`, getOptions(body))
                    .then(() => {console.log(`UPDATE Success: ${targetfile.path}`);update_count++;})
            } else {
                console.log(`Files matched: ${targetfile.path}`);
                match_count++;
            }
        } else {
            //ADD
            const newFilePath = `${githubSyncFolder}/${sourcefile.filename}.html`;
            body.message=`ADD ${newFilePath}`;
            
            await fetchJSON(`${githubApiUrl}${githubApiContents}${newFilePath}`, getOptions(body))
                .then(() => {console.log(`ADD Success: ${newFilePath}`);add_count++;})
        }
    }

    const log = {
        started,
        completed: getPacificTimeNow(),
        match_count
    };

    if(req.method==="GET") log.method = req.method;
    if(add_count>0) log.add_count = add_count;
    if(update_count>0) log.update_count = update_count;
    if(delete_count>0) log.delete_count = delete_count;

    pinghistory.unshift(log);

    context.res = {
        body: {pinghistory},
        headers: {
            'Content-Type' : 'application/json'
        }
    };

    context.done();
}

function getPacificTimeNow() {
    let usaTime = new Date().toLocaleString("en-US", {timeZone: "America/Los_Angeles"});
    usaTime = new Date(usaTime);
    return usaTime.toLocaleString();
}


function authheader() {
    return {
        'Authorization' : `Bearer ${process.env["GITHUB_TOKEN"]}`,
        'Content-Type': 'application/json'
    };
}

function defaultoptions() {
    return {method: 'GET', headers:authheader() }
}

const Base64={_keyStr:"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",encode:function(e){var t="";var n,r,i,s,o,u,a;var f=0;e=Base64._utf8_encode(e);while(f<e.length){n=e.charCodeAt(f++);r=e.charCodeAt(f++);i=e.charCodeAt(f++);s=n>>2;o=(n&3)<<4|r>>4;u=(r&15)<<2|i>>6;a=i&63;if(isNaN(r)){u=a=64}else if(isNaN(i)){a=64}t=t+this._keyStr.charAt(s)+this._keyStr.charAt(o)+this._keyStr.charAt(u)+this._keyStr.charAt(a)}return t},decode:function(e){var t="";var n,r,i;var s,o,u,a;var f=0;e=e.replace(/++[++^A-Za-z0-9+/=]/g,"");while(f<e.length){s=this._keyStr.indexOf(e.charAt(f++));o=this._keyStr.indexOf(e.charAt(f++));u=this._keyStr.indexOf(e.charAt(f++));a=this._keyStr.indexOf(e.charAt(f++));n=s<<2|o>>4;r=(o&15)<<4|u>>2;i=(u&3)<<6|a;t=t+String.fromCharCode(n);if(u!=64){t=t+String.fromCharCode(r)}if(a!=64){t=t+String.fromCharCode(i)}}t=Base64._utf8_decode(t);return t},_utf8_encode:function(e){e=e.replace(/\r\n/g,"n");var t="";for(var n=0;n<e.length;n++){var r=e.charCodeAt(n);if(r<128){t+=String.fromCharCode(r)}else if(r>127&&r<2048){t+=String.fromCharCode(r>>6|192);t+=String.fromCharCode(r&63|128)}else{t+=String.fromCharCode(r>>12|224);t+=String.fromCharCode(r>>6&63|128);t+=String.fromCharCode(r&63|128)}}return t},_utf8_decode:function(e){var t="";var n=0;var r=c1=c2=0;while(n<e.length){r=e.charCodeAt(n);if(r<128){t+=String.fromCharCode(r);n++}else if(r>191&&r<224){c2=e.charCodeAt(n+1);t+=String.fromCharCode((r&31)<<6|c2&63);n+=2}else{c2=e.charCodeAt(n+1);c3=e.charCodeAt(n+2);t+=String.fromCharCode((r&15)<<12|(c2&63)<<6|c3&63);n+=3}}return t}}