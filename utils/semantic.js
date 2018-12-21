let getQueryResult = require('./query.js').getQueryResult;

function makeSemanticListQuery() {
  // make semantic list.

  query = '';
  query += 'SELECT  DISTINCT SEMANTIC_LINK_ID, ';
  query += '        SEMANTICS ';
  query += 'FROM    SEMANTIC_LINKS ';
  query += 'ORDER BY SEMANTIC_LINK_ID ';

  return query;
}

exports.fetchSemanticList = (callback) => {
  getQueryResult(makeSemanticListQuery(), (result) => {
    callback(result);
  });
}