module.exports = async function (context, req) {
//Permanent Redirect to home page
    context.res = { status: 301, headers: { "location": "https://documenter.getpostman.com/view/9918160/SWLb8Uep" }, body: null};
};
