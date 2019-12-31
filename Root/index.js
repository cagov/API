module.exports = async function (context, req) {
//Temp Redirect to home page
    context.res = { status: 302, headers: { "location": "https://alpha.ca.gov" }, body: null};
};
