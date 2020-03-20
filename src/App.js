import React from 'react';
import { hot } from 'react-hot-loader';
import axios from 'axios';
import moment from 'moment';
import FullCalendar from 'fullcalendar-reactwrapper';
import Modal from 'react-responsive-modal';

import EventDetailsForm from './EventDetailsForm';
import { getDates } from './getDates';

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
      newEvent: {},
      openedEventTitle: '',
      openedEventId: '',
      isRecurringEvents: false,
      selectedOption: null,
      isEdit: false,
    };

    this.fetchAndLoadEvents = this.fetchAndLoadEvents.bind(this);
    this.onEventDrop = this.onEventDrop.bind(this);
    this.onEventResize = this.onEventResize.bind(this);
    this.onEventClick = this.onEventClick.bind(this);
    this.onDayClick = this.onDayClick.bind(this);
    this.onCloseModal = this.onCloseModal.bind(this);
    this.onExitedModal = this.onExitedModal.bind(this);
    this.onTitleChange = this.onTitleChange.bind(this);
    this.onDelete = this.onDelete.bind(this);
    this.createEditEvent = this.createEditEvent.bind(this);
    this.onSubmitEvent = this.onSubmitEvent.bind(this);
    this.updateEvent = this.updateEvent.bind(this);
    this.handleInput = this.handleInput.bind(this);
    this.handleCheckRecurringEvents = this.handleCheckRecurringEvents.bind(
      this
    );
    this.handleChange = this.handleChange.bind(this);
    this.recurringEvents = this.recurringEvents.bind(this);
  }

  transformToFullcalendarEvent(event) {
    let start = new Date(event.start);
    let end = new Date(event.end);
    return {
      ...event,
      allDay: true,
      id: event._id,
      title: event.title,
      start,
      end,
      realId: event.realId || event._id,
    };
  }
  handleInput({ target }) {
    const newEvent = { ...this.state.newEvent };
    newEvent[target.name] = target.value;
    this.setState({ newEvent });
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
      .then(() => {
        const updatedEvent = { ...event, start: momentStart, end: momentEnd };
        this.updateEvent(updatedEvent);
      })
      .catch(error => {
        alert('Something went wrong! Check the console.');
        console.error(error);
      });
  }
  handleCheckRecurringEvents() {
    this.setState(({ newEvent }) => {
      const updatedEvent = { ...newEvent };
      updatedEvent.isRecurringEvents = !newEvent.isRecurringEvents;
      return { newEvent: updatedEvent };
    });
  }

  onEventDrop(event) {
    if (!event.isRecurringEvents) {
      this.updateEventDates(event);
    }
  }

  onEventResize(event) {
    this.updateEventDates(event);
  }

  onEventClick(event) {
    const _event = this.state.events.find(
      _event => _event.realId === event.realId
    );
    this.setState({
      modalOpen: true,
      openedEventTitle: event.title,
      openedEventId: event.realId,
      newEvent: { ..._event },
      isEdit: true,
    });
  }

  updateEvent(updatedEvent) {
    const { events } = this.state;
    let updatedEvents;
    if (updatedEvent.isRecurringEvents) {
      updatedEvents = events.filter(elem => elem.realId !== updatedEvent._id);
      this.recurringEvents(updatedEvent, updatedEvents);
    } else {
      updatedEvents = events.filter(
        _event => _event.realId !== updatedEvent._id
      );
      updatedEvents.push(this.transformToFullcalendarEvent(updatedEvent));
    }
    this.setState({ events: updatedEvents });
  }

  createEditEvent() {
    const { openedEventId, openedEventTitle, newEvent } = this.state;
    if (!this.state.isEdit) {
      axios
        .post('/api/events', {
          title: openedEventTitle,
          interval: newEvent.interval,
          days: newEvent.days,
          startDate: newEvent.startDate,
          endDate: newEvent.endDate,
          start: newEvent.start,
          end: newEvent.end,
          isRecurringEvents: newEvent.isRecurringEvents,
        })
        .then(({ data }) => {
          const { events } = this.state;
          const updatedEvents = [...events];
          this.recurringEvents(data, updatedEvents);
          this.setState({ events: updatedEvents });
        })
        .catch(error => {
          alert('Something went wrong! Check the console.');
          console.error(error);
        });
    } else {
      this.setState({ isEdit: false });
      axios
        .put(`/api/events/${openedEventId}`, {
          title: openedEventTitle,
          interval: newEvent.interval,
          days: newEvent.days,
          startDate: newEvent.startDate,
          start: newEvent.start,
          end: newEvent.end,
          endDate: newEvent.endDate,
          isRecurringEvents: newEvent.isRecurringEvents,
        })
        .then(({ data: updatedEvent }) => {
          // Find the event in our events array and update it accordingly
          this.updateEvent(updatedEvent);
        })
        .catch(error => {
          alert('Something went wrong! Check the console.');
          console.error(error);
        });
    }
  }
  onCloseModal() {
    const { openedEventId, openedEventTitle } = this.state;
    if (openedEventId || openedEventTitle) {
      this.createEditEvent();
    }
    // Close modal
    this.setState({
      modalOpen: false,
    });
  }

  onSubmitEvent(evt) {
    evt.preventDefault();
    this.createEditEvent();
    this.setState({
      modalOpen: false,
    });
  }
  handleChange(days) {
    this.setState(({ newEvent }) => {
      const updateEvent = { ...newEvent };
      updateEvent.days = days.map(elem => elem.value);
      return { newEvent: updateEvent };
    });
  }

  onExitedModal() {
    // Reset state on animation end? Who put this here??
    this.setState({
      openedEventId: '',
      openedEventTitle: '',
      newEvent: {},
      isEdit: false,
    });
  }

  onTitleChange(event) {
    this.setState({ openedEventTitle: event.currentTarget.value });
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
  recurringEvents(event, allEvents) {
    if (event.isRecurringEvents) {
      const eventsDays = getDates(
        event.interval,
        event.days,
        event.startDate,
        event.endDate
      );
      eventsDays.forEach(day =>
        allEvents.push(
          this.transformToFullcalendarEvent({
            ...event,
            start: moment(day)
              .add(2, 'hours')
              .utc(),
            end: moment(day)
              .utc()
              .add(5, 'hours')
              .add(-1, 'seconds'),
            _id: `${event._id}${day}`,
            realId: event._id,
          })
        )
      );
    } else {
      allEvents.push(this.transformToFullcalendarEvent(event));
    }

    return allEvents;
  }
  fetchAndLoadEvents() {
    return axios
      .get('/api/events')
      .then(({ data }) => {
        let newEvents = [];
        data.forEach(elem => {
          this.recurringEvents(elem, newEvents);
        });
        this.setState({ events: newEvents });
      })
      .catch(error => {
        alert('Something went wrong! Check the console.');
        console.error(error);
      });
  }

  componentDidMount() {
    this.fetchAndLoadEvents();
  }

  render() {
    const { events, modalOpen, openedEventTitle, newEvent } = this.state;
    return (
      <div>
        <FullCalendar
          editable={true}
          // timezone="UTC"
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
          <h5>{newEvent ? 'New Event' : 'Edit Event'}</h5>
          <EventDetailsForm
            value={openedEventTitle}
            newEvent={this.state.newEvent}
            showDelete={this.state.isEdit}
            onChange={this.onTitleChange}
            onDelete={this.onDelete}
            onSubmit={this.onSubmitEvent}
            handleCheckRecurringEvents={this.handleCheckRecurringEvents}
            handleChange={this.handleChange}
            handleInput={this.handleInput}
          />
        </Modal>
      </div>
    );
  }
}

export default hot(module)(App);
