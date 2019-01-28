let getQueryResult = require('./query.js').getQueryResult;
let runQueryWithoutResult = require('./query.js').runQueryWithoutResult;

function makeSemanticListQuery() {
  // make semantic list.

  query = '';
  query += 'SELECT  DISTINCT SEMANTIC_LINK_ID, ';
  query += '        SEMANTICS, ';
  query += '        DRIVER_ID ';
  query += 'FROM    SEMANTIC_LINKS ';
  query += 'ORDER BY SEMANTIC_LINK_ID ';

  return query;
}

function makeCreateSemanticQuery(semanticId, dirverId, linkId, semantics) {
  // create semantics

  let query = '';
  query += 'INSERT INTO SEMANTIC_LINKS ';
  query += '(SEMANTIC_LINK_ID, DRIVER_ID, LINK_ID, SEMANTICS) '
  query += 'VALUES (' + semanticId + ', ' + dirverId + ', \'' + linkId + '\', \'' + semantics + '\') ';
  
  return query;
}

function makeDeleteSemanticQuery(semanticId, linkId) {
  // delete semantics;
  let query = '';
  query += 'DELETE ';
  query += 'FROM    SEMANTIC_LINKS ';
  query += 'WHERE   SEMANTIC_LINK_ID = ' + semanticId + ' ';
  query += '  AND   LINK_ID = \'' + linkId + '\' ';

  return query;
}

exports.fetchSemanticList = (callback) => {
  getQueryResult(makeSemanticListQuery(), (result) => {
    callback(result);
  });
}

exports.createSemantics = (semanticId, driverId, linkId, semantics, callback) => {
  runQueryWithoutResult(makeCreateSemanticQuery(semanticId, driverId, linkId, semantics));
  callback(200, {result: 'succeeded.'});
}

exports.deleteSemantics = (semanticId, linkId, callback) => {
  let query = makeDeleteSemanticQuery(semanticId, linkId);
  runQueryWithoutResult(query);
  callback(200, {result: 'deleted.'});
}