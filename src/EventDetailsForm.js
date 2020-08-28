import React from 'react';
import PropTypes from 'prop-types';
import Select from 'react-select';
import DatePicker from 'react-datepicker';

const intervalOptions = Array(10)
  .fill()
  .map((_, i) => ({ value: i + 1, label: i + 1 }));

const daysOptions = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
].map((label, i) => ({ value: i, label }));

const EventDetailsForm = ({
  errorMessage,
  title,
  placeholder,
  onFieldChange,
  isNewEvent,
  onDelete,
  onEventUpdate,
  onEventCreate,
  isRecurring,
  interval,
  daysArray,
  startDate,
  endDate,
}) => {
  return (
    <div className="form">
      <div className="field-container">
        <label>Title:</label>
        <input
          className="styled-input"
          type="text"
          value={title}
          onChange={e => onFieldChange('openedEventTitle', e.target.value)}
          placeholder={placeholder}
        />
      </div>
      <div>
        <input
          id="check"
          type="checkbox"
          checked={isRecurring}
          onChange={e => onFieldChange('isRecurring', e.target.checked)}
        />
        <label htmlFor="check">Recurring</label>
      </div>
      {isRecurring && (
        <>
          <div className="field-container">
            <label>Interval:</label>
            <Select
              value={{ label: interval, value: interval }}
              options={intervalOptions}
              onChange={({ value }) => onFieldChange('intervalValue', value)}
            />
          </div>
          <div className="field-container">
            <label>Days to repeat:</label>
            <Select
              isMulti
              value={daysArray}
              options={daysOptions}
              onChange={values => onFieldChange('daysArray', values)}
            />
          </div>
          <div className="field-container">
            <label>Start date:</label>
            <DatePicker
              className="styled-input"
              selected={startDate}
              onChange={date => onFieldChange('startDate', date)}
            />
          </div>
          <div className="field-container">
            <label>End date:</label>
            <DatePicker
              className="styled-input"
              selected={endDate}
              onChange={date => onFieldChange('endDate', date)}
            />
          </div>
        </>
      )}
      {errorMessage && <p className="error-message">{errorMessage}</p>}
      {isNewEvent ? (
        <>
          <div className="btn btn-success" onClick={onEventCreate}>
            Create
          </div>
        </>
      ) : (
        <>
          <div className="btn btn-success" onClick={onEventUpdate}>
            Update
          </div>
          <div className="btn btn-warn" onClick={onDelete}>
            Delete
          </div>
        </>
      )}
    </div>
  );
};

EventDetailsForm.propTypes = {
  errorMessage: PropTypes.string,
  title: PropTypes.string,
  isRecurring: PropTypes.bool,
  interval: PropTypes.number,
  daysArray: PropTypes.array,
  startDate: PropTypes.instanceOf(Date),
  endDate: PropTypes.instanceOf(Date),
  placeholder: PropTypes.string,
  isNewEvent: PropTypes.bool,
  onFieldChange: PropTypes.func,
  onDelete: PropTypes.func,
  onEventUpdate: PropTypes.func,
  onEventCreate: PropTypes.func,
};

EventDetailsForm.defaultProps = {
  errorMessage: '',
  title: '',
  placeholder: 'Event title',
  isNewEvent: false,
  isRecurring: false,
  interval: 1,
  daysArray: [],
  startDate: new Date(),
  endDate: new Date(),
  onFieldChange: () => {},
  onDelete: () => {},
  onEventUpdate: () => {},
  onEventCreate: () => {},
};

export default EventDetailsForm;
