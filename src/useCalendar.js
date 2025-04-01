// src/useCalendar.js
import { useEffect, useState } from 'react';
import { gapi } from 'gapi-script';
import { CLIENT_ID, API_KEY, SCOPES, DISCOVERY_DOC } from './calendarConfig';

export const useCalendar = () => {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    const initClient = () => {
      gapi.client
        .init({
          apiKey: API_KEY,
          clientId: CLIENT_ID,
          discoveryDocs: [DISCOVERY_DOC],
          scope: SCOPES,
        })
        .then(() => {
          // Check if user is already signed in
          if (gapi.auth2.getAuthInstance().isSignedIn.get()) {
            listUpcomingEvents();
          }
        });
    };

    gapi.load('client:auth2', initClient);
  }, []);

  const listUpcomingEvents = () => {
    gapi.client.calendar.events
      .list({
        calendarId: 'primary',
        timeMin: new Date().toISOString(),
        showDeleted: false,
        singleEvents: true,
        maxResults: 5,
        orderBy: 'startTime',
      })
      .then((response) => {
        setEvents(response.result.items);
      });
  };

  const signIn = () => {
    gapi.auth2.getAuthInstance().signIn().then(listUpcomingEvents);
  };

  return { events, signIn };
};
