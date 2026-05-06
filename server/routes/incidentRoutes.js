const express = require('express');
const router = express.Router();
const incidentController = require('../controllers/incidentController');

const authMiddleware = require('../middleware/authMiddleware');

router.post('/incidents', incidentController.createIncident);
router.get('/incidents', authMiddleware, incidentController.getIncidents);
router.get('/incidents/clusters', authMiddleware, incidentController.getClusters);
router.get('/incidents/:id', authMiddleware, incidentController.getIncidentById);
router.patch('/incidents/:id/status', authMiddleware, incidentController.updateIncidentStatus);
router.delete('/incidents/:id', authMiddleware, incidentController.deleteIncident);

module.exports = router;
