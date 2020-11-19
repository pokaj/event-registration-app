const express = require('express');
const checkAuth = require('../middleware/check-auth');
const router = express.Router();
const EventController = require('../controllers/event');

// All routes ensure that the user is authenticated first before granting access.

// Route to get all events from the database
router.get('/', EventController.get_all_events);

// Route to get a specific event from the database
router.get('/:event_id', EventController.get_event);

// Route to register to attend an event
router.post('/attend', checkAuth, EventController.attend);

// Route to unregister from attending an event
router.post('/unattend', checkAuth, EventController.unattend);

// Route to list all events that a user is registered to attending
router.post('/myevents', checkAuth, EventController.myevents);

module.exports = router;