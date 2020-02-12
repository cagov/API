module.exports = async function (context, req) {
    //Temp Redirect to new interface
        context.res = { status: 302, headers: { "location": "StateHolidayCalendar/.ics" }, body: null};
    };
    