import { Router } from 'express';
import { ObjectID } from 'mongodb';

const router = Router();

router
  .route('/')
  /** GET /api/events - Get list of events */
  .get(async (req, res, next) => {
    try {
      const events = await req.mongo.Events.find().toArray();
      res.json(events);
    } catch (e) {
      next(e);
    }
  })

  /** POST /api/events - Create new event */
  .post(async (req, res, next) => {
    try {
      const {
        mongo: { Events },
        body: {
          title,
          start,
          end,
          isRecurringEvents,
          interval = 1,
          days,
          startDate,
          endDate,
        },
      } = req;
      if (!title) throw new Error('Required field "title" missing.');
      if (!start) throw new Error('Required field "start" missing.');
      if (!end) throw new Error('Required field "end" missing.');
      let newEventDoc = {
        title,
        start: new Date(start),
        end: new Date(end),
      };
      if (isRecurringEvents) {
        if (days.length < 1) throw new Error('Required field "days" missing.');
        if (!startDate) throw new Error('Required field "startDate" missing.');
        if (!endDate) throw new Error('Required field "endDate" missing.');
        newEventDoc = {
          ...newEventDoc,
          interval: +interval,
          days,
          startDate,
          endDate,
          isRecurringEvents,
        };
      }
      // Create new event doc and respond with it to keep things snappy
      const createdEvent = await Events.insertOne(newEventDoc);
      return res.json({ ...newEventDoc, _id: createdEvent.insertedId });
    } catch (e) {
      next(e);
    }
  });

router
  .route('/:eventId')
  /** GET /api/events/:eventId - Get event */
  .get(async (req, res, next) => {
    try {
      const {
        mongo: { Events },
        params: { eventId },
      } = req;
      const event = await Events.findOne({ _id: new ObjectID(eventId) });
      res.json(event);
    } catch (e) {
      next(e);
    }
  })

  /** PUT /api/events/:eventId - Update event */
  .put(async (req, res, next) => {
    try {
      const {
        mongo: { Events },
        params: { eventId },
        body,
      } = req;
      const _id = new ObjectID(eventId);
      const event = await Events.findOne({ _id });
      if (!event) throw new Error('Event not found');
      const fieldsToUpdate = {};
      Object.keys(body).forEach(k => {
        const val = body[k] || '';
        if (k === 'title') {
          if (!val.trim()) throw new Error('Event "title" can not be empty');
          fieldsToUpdate.title = val;
        } else if (k === 'start') {
          if (!val.trim()) throw new Error('Event "start" can not be empty');
          fieldsToUpdate.start = new Date(val);
        } else if (k === 'end') {
          if (!val.trim()) throw new Error('Event "end" can not be empty');
          fieldsToUpdate.end = new Date(val);
        } else if (k === 'isRecurringEvents') {
          if (val) {
            const { days, startDate, endDate, interval = 1 } = body;
            if (body.days.length < 1)
              throw new Error('Required field "days" missing.');
            if (!body.startDate)
              throw new Error('Required field "startDate" missing.');
            if (!body.endDate)
              throw new Error('Required field "endDate" missing.');
            fieldsToUpdate.days = days;
            fieldsToUpdate.startDate = startDate;
            fieldsToUpdate.endDate = endDate;
            fieldsToUpdate.interval = +interval;
            fieldsToUpdate.isRecurringEvents = val;
          }
          fieldsToUpdate.isRecurringEvents = val;
        }
      });
      await Events.updateOne({ _id }, { $set: fieldsToUpdate });
      const updatedEvent = await Events.findOne({ _id });
      res.json(updatedEvent);
    } catch (e) {
      next(e);
    }
  })

  /** DELETE /api/events/:eventId - Delete event */
  .delete(async (req, res, next) => {
    try {
      const {
        mongo: { Events },
        params: { eventId },
      } = req;
      await Events.findOneAndDelete({ _id: new ObjectID(eventId) });
      res.json({});
    } catch (e) {
      next(e);
    }
  });

export default router;
