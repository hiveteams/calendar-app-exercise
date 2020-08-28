import { Router } from 'express';
import { ObjectID } from 'mongodb';

const router = Router();

/*
EventsModel = {
  title: {
    type: String,
    optional: false,
  },
  start: {
    type: Date,
    optional: false,
  },
  end: {
    type: Date,
    optional: false,
  },
  interval: {
    type: Number,
    optional: true,
  },
  daysArray: {
    type: Array,
    optional: true,
  },
  'daysArray.$ '{
    type: Number,
    optional: false,

    allowedValues: Array(10).fill().map((_, i) => i + 1),
  },
};
*/

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
        body: { title, start, end, ...rest },
      } = req;
      if (!title) throw new Error('Required field "title" missing.');
      if (!start) throw new Error('Required field "start" missing.');
      if (!end) throw new Error('Required field "end" missing.');
      // Create new event doc and respond with it to keep things snappy
      const newEventDoc = {
        title,
        start: new Date(start),
        end: new Date(end),
        ...rest,
      };
      const newEvent = await Events.insertOne(newEventDoc);
      const newEventData = newEvent.ops[0];
      res.json(newEventData);
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
        } else if (k === 'intervalValue') {
          fieldsToUpdate.intervalValue = val;
        } else if (k === 'daysArray') {
          fieldsToUpdate.daysArray = val;
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
