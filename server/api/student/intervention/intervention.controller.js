'use strict';

var _ = require('lodash');
var auth = require('../../../auth/auth.service');
var Intervention = require('./intervention.model');
var Student = require('../student.model');

/**
 * Get list of interventions for a student.
 * restriction: 'teacher'
 */
exports.index = function(req, res) {
  Intervention.find({student: req.student.id}, function(err, interventions) {
    if (err) return handleError(res, err);
    return res.status(201).json(interventions);
  });
};

/**
 * Creates an intervention in the DB.
 * restriction: 'teacher'
 */
exports.create = function(req, res) {
  Intervention.create(req.body, function(err, intervention) {
    if (err) return handleError(res, err);
    return res.status(201).json(intervention);
  });
};

/**
 * Add a note to an existing intervention.
 * restriction: 'teacher'
 */
exports.createNote = function(req, res) {
  Intervention
    .findById(req.params.interventionId)
    .exec(function(err, intervention) {
      if (err) return handleError(res, err);
      if (!intervention) return res.status(404).send('Not Found');
      intervention.notes.push({
        user: req.user.id,
        note: req.body.note
      });
      intervention.save(function(err) {
        if (err) return handleError(res, err);
        Intervention.populate(intervention, {path: 'notes.user'},
          function(err, intervention) {
            if (err) return handleError(res, err);
            return res.status(200).json(intervention);
          });
      });
    });
};

exports.updateArchived = function(req, res) {
  Intervention
    .findById(req.params.interventionId)
    .exec(function(err, intervention) {
      if (err) return handleError(res, err);
      if (!intervention) return res.send(404);
      intervention.archived = req.body.archived;
      intervention.save(function(err) {
        if (err) return handleError(res, err);
        return res.status(200).json(intervention);
      });
    });
};

exports.delete = function(req, res) {
  Intervention
    .findById(req.params.interventionId)
    .exec(function(err, intervention) {
      if (err) return handleError(res, err);
      if (!intervention) return res.send(404);
      intervention.remove(function(err) {
        if (err) return handleError(res, err);
        return res.status(204).send('No Content');
      });
    });
};

function handleError(res, err) {
  console.log(err);
  return res.status(500).send(err);
}