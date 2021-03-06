const { google } = require("googleapis");

const token = process.env.REFRESH_TOKEN;
const client_id = process.env.CLIENT_ID;
const client_secret = process.env.CLIENT_SECRET;
const redirect_url = "localhost:5000";

const loadClient = () => {
    const auth = new google.auth.OAuth2(client_id, client_secret, redirect_url);

    auth.setCredentials({ refresh_token: token });
    google.options({ auth });
};

const makeApiCall = () => {
    const calendar = google.calendar({ version: "v3" });
};

const createEvent = (callback) => {
    // Instance of calendar
    const calendar = google.calendar({ version: "v3" });

    // Start date set to next day 3PM
    const startTime = new Date();
    startTime.setDate(startTime.getDate() + 1);
    startTime.setHours(15, 0, 0, 0);

    // End time set 1 hour after start time
    const endTime = new Date(startTime.getTime());
    endTime.setMinutes(startTime.getMinutes() + 60);

    const newEvent = {
        calendarId: "primary",
        resource: {
            start: {
                dateTime: startTime.toISOString(),
            },
            end: {
                dateTime: endTime.toISOString(),
            },
        },
    };

    getEvents(calendar, newEvent.resource, (err, busyList) => {
        if (busyList.length === 0) {
            calendar.events.insert(newEvent, (err, event) => {
                if (err) console.log(err);
                callback({
                    message: "Event successfully created",
                    link: event.data.htmlLink,
                });
            });
        } else {
            callback({
                message: `Event already exists at ${startTime.toString()}`,
            });
        }
    });
};

const getEvents = (instance, event, callback) => {
    const calendarId = "primary";
    const query = {
        resource: {
            timeMin: event.start.dateTime,
            timeMax: event.end.dateTime,
            items: [{ id: calendarId }],
        },
    };

    // Return a list of events
    instance.freebusy
        .query(query)
        .then((response) => {
            const { data } = response;
            const { calendars } = data;
            const { busy } = calendars[calendarId];

            callback(null, busy);
        })
        .catch((err) => {
            callback(err, null);
        });
};
const listEvents = (callback) => {
    const calendar = google.calendar({ version: "v3" });
    calendar.events.list(
        {
            calendarId: "primary",
            timeMin: new Date().toISOString(), // Look for events from now onwards
            maxResults: 10, // Limit to 10 events
            singleEvents: true,
            orderBy: "startTime",
        },
        (err, res) => {
            if (err) return console.log("The API returned an error: " + err);

            const events = res.data.items;
            callback(events);
        }
    );
};
module.exports = {
    listEvents,
    getEvents,
    createEvent,
    makeApiCall,
    loadClient
}