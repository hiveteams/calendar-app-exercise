import React from 'react';
import { hot } from 'react-hot-loader';
import axios from 'axios';
import moment from 'moment';
import FullCalendar from 'fullcalendar-reactwrapper';
import Modal from 'react-responsive-modal';

import EventDetailsForm from './EventDetailsForm';

// eslint-disable-next-line no-unused-vars
const getDates = (interval, days, startDate, endDate) => {
  const start = moment(startDate);
  const end = moment(endDate);
  const dateArray = [];
  for (
    let date = start.clone();
    date.isBefore(end);
    date.add(7 * interval, 'days')
  ) {
    days.forEach(dayNumber => {
      const dateByDayNumber = date.clone().day(dayNumber);
      if (dateByDayNumber.isBefore(end) && dateByDayNumber.isAfter(start)) {
        dateArray.push(dateByDayNumber.format('MM/DD/YYYY'));
      }
    });
  }
  return dateArray;
};

const getValue = ({ value }) => value;

// See the FullCalendar API for details on how to use it:
// https://fullcalendar.io/docs
// We're using fullcalendar-reactwrapper to wrap it in a React
// component.
class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      events: [],
      modalOpen: false,
      newEvent: false,
      openedEventTitle: '',
      openedEventId: '',
      isRecurring: false,
      intervalValue: 1,
      daysArray: [],
      startDate: new Date(),
      endDate: new Date(),
      errorMessage: '',
    };

    this.fetchAndLoadEvents = this.fetchAndLoadEvents.bind(this);
    this.onEventDrop = this.onEventDrop.bind(this);
    this.onEventResize = this.onEventResize.bind(this);
    this.onEventClick = this.onEventClick.bind(this);
    this.onDayClick = this.onDayClick.bind(this);
    this.onCloseModal = this.onCloseModal.bind(this);
    this.onExitedModal = this.onExitedModal.bind(this);
    this.onFieldChange = this.onFieldChange.bind(this);
    this.onDelete = this.onDelete.bind(this);
    this.onEventUpdate = this.onEventUpdate.bind(this);
    this.onEventCreate = this.onEventCreate.bind(this);
  }

  transformToFullcalendarEvent(event) {
    const start = new Date(event.start);
    const end = new Date(event.end);
    return {
      allDay: true,
      id: event._id,
      title: event.title,
      start,
      end,
    };
  }

  updateEventDates(event) {
    // start = midnight on day of in UTC
    // end = start + 24 hours - 1 second
    const momentStart = moment(event.start.toDate());
    let momentEnd = moment(event.start.toDate())
      .add(24, 'hours')
      .add(-1, 'seconds');
    // Use event.end if it's present. 1 day events
    // do not have event.end if they're coming from Fullcalendar.
    if (event.end) {
      momentEnd = event.end;
    }
    axios
      .put(`/api/events/${event.id}`, {
        start: momentStart.toDate(),
        end: momentEnd.toDate(),
      })
      .then(({ data: updatedEvent }) => {
        const { events } = this.state;
        const updatedEvents = events.map(event => {
          if (event.id === updatedEvent._id) {
            return this.transformToFullcalendarEvent(updatedEvent);
          }
          return event;
        });
        this.setState({ events: updatedEvents });
      })
      .catch(error => {
        alert('Something went wrong! Check the console.');
        console.log(error);
      });
  }

  onEventDrop(event) {
    this.updateEventDates(event);
  }

  onEventResize(event) {
    this.updateEventDates(event);
  }

  onEventClick(event) {
    this.setState({
      modalOpen: true,
      openedEventTitle: event.title,
      openedEventId: event.id,
    });
  }

  onEventUpdate() {
    const {
      openedEventId,
      openedEventTitle,
      isRecurring,
      intervalValue,
      daysArray,
      startDate,
      endDate,
    } = this.state;

    if (!openedEventTitle) {
      this.setState({ errorMessage: 'Title is a required field.' });
    } else {
      const eventData = isRecurring
        ? {
          title: openedEventTitle,
          intervalValue,
          daysArray: daysArray.map(getValue),
          start: startDate,
          end: endDate,
        }
        : {
          title: openedEventTitle,
        };
      axios
        .put(`/api/events/${openedEventId}`, eventData)
        .then(({ data: updatedEvent }) => {
          // Find the event in our events array and update it accordingly
          const { events } = this.state;
          const updatedEvents = events.map(_event => {
            if (_event.id === updatedEvent._id) {
              return this.transformToFullcalendarEvent(updatedEvent);
            }
            return _event;
          });
          this.setState({ events: updatedEvents });
        })
        .catch(error => {
          alert('Something went wrong! Check the console.');
          console.log(error);
        });
      this.onCloseModal();
    }
  }

  onEventCreate() {
    const {
      openedEventTitle,
      isRecurring,
      intervalValue,
      daysArray,
      startDate,
      endDate,
      newEvent,
    } = this.state;

    if (!openedEventTitle) {
      this.setState({ errorMessage: 'Title is required field.' });
    } else {
      const eventData = isRecurring
        ? {
          title: openedEventTitle,
          intervalValue,
          daysArray: daysArray.map(getValue),
          start: startDate,
          end: endDate,
        }
        : {
          ...newEvent,
          title: openedEventTitle,
        };
      axios
        .post('/api/events', eventData)
        .then(({ data }) => {
          const { events } = this.state;
          events.push(this.transformToFullcalendarEvent(data));
          this.setState({ events });
        })
        .catch(error => {
          alert('Something went wrong! Check the console.');
          console.log(error);
        });
      this.onCloseModal();
    }
  }

  onCloseModal() {
    // Close modal
    this.setState({
      modalOpen: false,
    });
  }

  onExitedModal() {
    // Reset state on animation end? Who put this here??
    this.setState({
      openedEventId: '',
      openedEventTitle: '',
      errorMessage: '',
      newEvent: false,
      isRecurring: false,
      intervalValue: 1,
      daysArray: [],
      startDate: new Date(),
      endDate: new Date(),
    });
  }

  onFieldChange(field, value) {
    this.setState({ [field]: value });
  }

  onDelete() {
    const { openedEventId } = this.state;
    axios.delete(`/api/events/${openedEventId}`).then(() => {
      this.fetchAndLoadEvents();
    });
    // Close modal
    this.setState({
      modalOpen: false,
    });
  }

  onDayClick(clickedDate) {
    // clicked date = midnight on day of in UTC
    // start = clicked date
    // end = start + 24 hours - 1 second
    const momentStart = moment(clickedDate.toDate());
    const momentEnd = moment(clickedDate.toDate())
      .add(24, 'hours')
      .add(-1, 'seconds');
    const newEvent = {
      title: 'New event',
      start: momentStart.toDate(),
      end: momentEnd.toDate(),
    };
    this.setState({
      newEvent,
      modalOpen: true,
    });
  }

  fetchAndLoadEvents() {
    return axios
      .get('/api/events')
      .then(({ data }) => {
        const newEvents = data.map(this.transformToFullcalendarEvent);
        this.setState({ events: newEvents });
      })
      .catch(error => {
        alert('Something went wrong! Check the console.');
        console.log(error);
      });
  }

  componentDidMount() {
    this.fetchAndLoadEvents();
  }

  render() {
    const {
      events,
      modalOpen,
      openedEventTitle,
      newEvent,
      errorMessage,
      isRecurring,
      intervalValue,
      daysArray,
      startDate,
      endDate,
    } = this.state;
    return (
      <div>
        <FullCalendar
          editable={true}
          timezone="UTC"
          events={events}
          eventDrop={this.onEventDrop}
          eventResize={this.onEventResize}
          eventClick={this.onEventClick}
          dayClick={this.onDayClick}
        />
        <Modal
          open={modalOpen}
          onClose={this.onCloseModal}
          onExited={this.onExitedModal}
          center
          closeIconSize={14}
          classNames={{ modal: 'event-modal', closeIcon: 'modal-close' }}
        >
          <h3>{newEvent ? 'New Event' : 'Edit Event'}</h3>
          <EventDetailsForm
            errorMessage={errorMessage}
            title={openedEventTitle}
            interval={intervalValue}
            isRecurring={isRecurring}
            daysArray={daysArray}
            startDate={startDate}
            endDate={endDate}
            isNewEvent={!!newEvent}
            onFieldChange={this.onFieldChange}
            onDelete={this.onDelete}
            onClose={this.onCloseModal}
            onEventCreate={this.onEventCreate}
            onEventUpdate={this.onEventUpdate}
          />
        </Modal>
      </div>
    );
  }
}

export default hot(module)(App);
