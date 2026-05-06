const express = require('express');
const router = express.Router();
const incidentController = require('../controllers/incidentController');

router.post('/incidents', incidentController.createIncident);
router.get('/incidents', incidentController.getIncidents);
router.get('/incidents/clusters', incidentController.getClusters);
router.get('/incidents/:id', incidentController.getIncidentById);
router.patch('/incidents/:id/status', incidentController.updateIncidentStatus);
router.delete('/incidents/:id', incidentController.deleteIncident);

module.exports = router;
