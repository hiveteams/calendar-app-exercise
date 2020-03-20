import React from 'react';
import PropTypes from 'prop-types';
import Select from 'react-select';
class EventDetailsForm extends React.Component {
  render() {
    let {
      value,
      placeholder,
      onChange,
      showDelete,
      onDelete,
      onSubmit,
      handleInput,
      handleCheckRecurringEvents,
      handleChange,
      newEvent,
    } = this.props;
    const options = [
      { value: 0, label: 'Sunday' },
      { value: 1, label: 'Monday' },
      { value: 2, label: 'Tuesday' },
      { value: 3, label: 'Wednesday' },
      { value: 4, label: 'Thursday' },
      { value: 5, label: 'Friday' },
      { value: 6, label: 'Saturday' },
    ];

    const activeDays = newEvent.days
      ? newEvent.days.map(elem => options[elem])
      : [];
    return (
      <div>
        <form onSubmit={onSubmit} className="event-form">
          <input
            className="event-title"
            type="text"
            value={value}
            onChange={onChange}
            placeholder={placeholder}
          />
          <div>
            <label htmlFor="isRecurringEvents">Recurring events</label>
            <input
              id="isRecurringEvents"
              type="checkbox"
              checked={newEvent.isRecurringEvents}
              onChange={handleCheckRecurringEvents}
            />
          </div>
          {newEvent.isRecurringEvents && (
            <div className="recurring">
              <div>
                <label htmlFor="Interval">Interval:</label>
                <select
                  id="Interval"
                  name="interval"
                  defaultValue={newEvent.interval}
                  onChange={handleInput}
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(elem => (
                    <option key={elem} value={elem}>
                      {elem}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="Daystorepeat">Days to repeat:</label>
                <Select
                  value={activeDays}
                  onChange={handleChange}
                  options={options}
                  isMulti
                />
              </div>
              <div>
                <label htmlFor="Startdate">Start date:</label>
                <input
                  type="date"
                  name="startDate"
                  id="Startdate"
                  defaultValue={newEvent.startDate}
                  value={newEvent.startDate}
                  onChange={handleInput}
                />
              </div>
              <div>
                <label htmlFor="Enddate">End date:</label>
                <input
                  type="date"
                  name="endDate"
                  id="Enddate"
                  defaultValue={newEvent.endDate}
                  value={newEvent.endDate}
                  onChange={handleInput}
                />
              </div>
            </div>
          )}
          {showDelete && (
            <div className="btn btn-warn" onClick={onDelete}>
              Delete
            </div>
          )}
        </form>
      </div>
    );
  }
}

EventDetailsForm.propTypes = {
  value: PropTypes.string,
  placeholder: PropTypes.string,
  showDelete: PropTypes.bool,
  onChange: PropTypes.func,
  onDelete: PropTypes.func,
  onSubmit: PropTypes.func,
  handleInput: PropTypes.func,
  handleCheckRecurringEvents: PropTypes.func,
  handleChange: PropTypes.func,
  newEvent: PropTypes.object,
};

EventDetailsForm.defaultProps = {
  value: '',
  placeholder: 'Event title',
  showDelete: false,
  onChange: () => {},
  onDelete: () => {},
  onSubmit: () => {},
  handleInput: () => {},
  handleCheckRecurringEvents: () => {},
  handleChange: () => {},
  newEvent: {},
};

export default EventDetailsForm;
