'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.TupaiaDatabase = exports.JOIN_TYPES = exports.QUERY_CONJUNCTIONS = undefined;

var _toConsumableArray2 = require('babel-runtime/helpers/toConsumableArray');

var _toConsumableArray3 = _interopRequireDefault(_toConsumableArray2);

var _entries = require('babel-runtime/core-js/object/entries');

var _entries2 = _interopRequireDefault(_entries);

var _slicedToArray2 = require('babel-runtime/helpers/slicedToArray');

var _slicedToArray3 = _interopRequireDefault(_slicedToArray2);

var _keys = require('babel-runtime/core-js/object/keys');

var _keys2 = _interopRequireDefault(_keys);

var _stringify = require('babel-runtime/core-js/json/stringify');

var _stringify2 = _interopRequireDefault(_stringify);

var _getIterator2 = require('babel-runtime/core-js/get-iterator');

var _getIterator3 = _interopRequireDefault(_getIterator2);

var _extends2 = require('babel-runtime/helpers/extends');

var _extends3 = _interopRequireDefault(_extends2);

var _objectWithoutProperties2 = require('babel-runtime/helpers/objectWithoutProperties');

var _objectWithoutProperties3 = _interopRequireDefault(_objectWithoutProperties2);

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _reactAutobind = require('react-autobind');

var _reactAutobind2 = _interopRequireDefault(_reactAutobind);

var _knex = require('knex');

var _knex2 = _interopRequireDefault(_knex);

var _pgPubsub = require('pg-pubsub');

var _pgPubsub2 = _interopRequireDefault(_pgPubsub);

var _winston = require('winston');

var _winston2 = _interopRequireDefault(_winston);

var _getConnectionConfig = require('./getConnectionConfig');

var _generateId = require('./utilities/generateId');

var _multilock = require('./utilities/multilock');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var QUERY_METHODS = {
  COUNT: 'count',
  INSERT: 'insert',
  UPDATE: 'update',
  SELECT: 'select',
  DELETE: 'del'
}; /**
    * Tupaia
    * Copyright (c) 2017-2020 Beyond Essential Systems Pty Ltd
    **/

var QUERY_CONJUNCTIONS = exports.QUERY_CONJUNCTIONS = {
  AND: '_and_',
  OR: '_or_',
  RAW: '_raw_'
};

var JOIN_TYPES = exports.JOIN_TYPES = {
  INNER: 'inner',
  LEFT: 'left',
  LEFT_OUTER: 'leftOuter',
  RIGHT: 'right',
  RIGHT_OUTER: 'rightOuter',
  OUTER: 'outer',
  FULL_OUTER: 'fullOuter',
  CROSS: 'cross',
  DEFAULT: null
};

// no math here, just hand-tuned to be as low as possible while
// keeping all the tests passing
var HANDLER_DEBOUNCE_DURATION = 250;

var TupaiaDatabase = exports.TupaiaDatabase = function () {
  function TupaiaDatabase(transactingConnection) {
    var _this = this;

    (0, _classCallCheck3.default)(this, TupaiaDatabase);

    (0, _reactAutobind2.default)(this);
    this.changeHandlers = {};

    // If this instance is not for a specific transaction, it is the singleton instance
    this.isSingleton = !transactingConnection;

    var connectToDatabase = function () {
      var _ref = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee() {
        return _regenerator2.default.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                _context.t0 = transactingConnection;

                if (_context.t0) {
                  _context.next = 5;
                  break;
                }

                _context.next = 4;
                return (0, _knex2.default)({
                  client: 'pg',
                  connection: (0, _getConnectionConfig.getConnectionConfig)()
                });

              case 4:
                _context.t0 = _context.sent;

              case 5:
                _this.connection = _context.t0;

                if (_this.isSingleton) {
                  _this.changeListener = new _pgPubsub2.default((0, _getConnectionConfig.getConnectionConfig)());
                  _this.changeListener.addChannel('change', _this.notifyChangeHandlers);
                }
                return _context.abrupt('return', true);

              case 8:
              case 'end':
                return _context.stop();
            }
          }
        }, _callee, _this);
      }));

      return function connectToDatabase() {
        return _ref.apply(this, arguments);
      };
    }();
    this.connectionPromise = connectToDatabase();

    this.handlerLock = new _multilock.Multilock();
  }

  (0, _createClass3.default)(TupaiaDatabase, [{
    key: 'destroy',
    value: function destroy() {
      this.changeListener.close();
      this.connection.destroy();
    }
  }, {
    key: 'addChangeHandlerForCollection',
    value: function addChangeHandlerForCollection(collectionName, changeHandler) {
      this.getChangeHandlersForCollection(collectionName).push(changeHandler);
    }
  }, {
    key: 'notifyChangeHandlers',
    value: function () {
      var _ref2 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee2(_ref3) {
        var change = _ref3.change,
            record = _ref3.record;
        var unlock, changeHandlersForCollection, i;
        return _regenerator2.default.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                unlock = this.handlerLock.createLock(change.record_id);
                _context2.prev = 1;
                changeHandlersForCollection = this.getChangeHandlersForCollection(change.record_type);
                i = 0;

              case 4:
                if (!(i < changeHandlersForCollection.length)) {
                  _context2.next = 16;
                  break;
                }

                _context2.prev = 5;
                _context2.next = 8;
                return changeHandlersForCollection[i](change, record);

              case 8:
                _context2.next = 13;
                break;

              case 10:
                _context2.prev = 10;
                _context2.t0 = _context2['catch'](5);

                _winston2.default.error(_context2.t0);

              case 13:
                i++;
                _context2.next = 4;
                break;

              case 16:
                _context2.prev = 16;

                unlock();
                return _context2.finish(16);

              case 19:
              case 'end':
                return _context2.stop();
            }
          }
        }, _callee2, this, [[1,, 16, 19], [5, 10]]);
      }));

      function notifyChangeHandlers(_x) {
        return _ref2.apply(this, arguments);
      }

      return notifyChangeHandlers;
    }()
  }, {
    key: 'waitForAllChangeHandlers',
    value: function () {
      var _ref4 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee3() {
        return _regenerator2.default.wrap(function _callee3$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                return _context3.abrupt('return', this.handlerLock.waitWithDebounce(HANDLER_DEBOUNCE_DURATION));

              case 1:
              case 'end':
                return _context3.stop();
            }
          }
        }, _callee3, this);
      }));

      function waitForAllChangeHandlers() {
        return _ref4.apply(this, arguments);
      }

      return waitForAllChangeHandlers;
    }()
  }, {
    key: 'getChangeHandlersForCollection',
    value: function getChangeHandlersForCollection(collectionName) {
      // Instantiate the array if no change handlers currently exist for the collection
      if (!this.changeHandlers[collectionName]) {
        this.changeHandlers[collectionName] = [];
      }
      return this.changeHandlers[collectionName];
    }
  }, {
    key: 'wrapInTransaction',
    value: function wrapInTransaction(wrappedFunction) {
      return this.connection.transaction(function (transaction) {
        return wrappedFunction(new TupaiaDatabase(transaction));
      });
    }
  }, {
    key: 'fetchSchemaForTable',
    value: function () {
      var _ref5 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee4(databaseType) {
        return _regenerator2.default.wrap(function _callee4$(_context4) {
          while (1) {
            switch (_context4.prev = _context4.next) {
              case 0:
                _context4.next = 2;
                return this.connectionPromise;

              case 2:
                return _context4.abrupt('return', this.connection(databaseType).columnInfo());

              case 3:
              case 'end':
                return _context4.stop();
            }
          }
        }, _callee4, this);
      }));

      function fetchSchemaForTable(_x2) {
        return _ref5.apply(this, arguments);
      }

      return fetchSchemaForTable;
    }()

    /**
     * Builds a query on the database, which can be awaited to reveal the result.
     * Implementation notes: If the connection is available, it will return the knex built query
     * without a wrapping Promise. This is necessary for nested queries to function correctly. If the
     * connection is not yet available, it will await the connection, so necessarily return the built
     * query inside a wrapped promise. This Promise-wrapped query can still be awaited as normal to
     * reveal a result, but cannot be passed back in as an innerQuery during nesting. So there is a
     * small and very rare hole whereby if on first starting the server, the connection is pending and
     * someone runs a nested query, it will crash.
     */

  }, {
    key: 'query',
    value: function query() {
      for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      if (!this.connection) {
        // If not yet connected, wait until we are, then run the query
        return this.queryWhenConnected.apply(this, args);
      }
      // We are already connected, query immediately
      return buildQuery.apply(undefined, [this.connection].concat(args));
    }

    /**
     * Asynchronously await the database connection to be made, and then build the query as per normal
     */

  }, {
    key: 'queryWhenConnected',
    value: function () {
      var _ref6 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee5() {
        for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
          args[_key2] = arguments[_key2];
        }

        return _regenerator2.default.wrap(function _callee5$(_context5) {
          while (1) {
            switch (_context5.prev = _context5.next) {
              case 0:
                _context5.next = 2;
                return this.connectionPromise;

              case 2:
                return _context5.abrupt('return', buildQuery.apply(undefined, [this.connection].concat(args)));

              case 3:
              case 'end':
                return _context5.stop();
            }
          }
        }, _callee5, this);
      }));

      function queryWhenConnected() {
        return _ref6.apply(this, arguments);
      }

      return queryWhenConnected;
    }()
  }, {
    key: 'find',
    value: function find(recordType) {
      var where = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
      var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
      var queryMethod = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : QUERY_METHODS.SELECT;

      if (options.subQuery) {
        var _options$subQuery = options.subQuery,
            subRecordType = _options$subQuery.recordType,
            subWhere = _options$subQuery.where,
            subOptions = (0, _objectWithoutProperties3.default)(_options$subQuery, ['recordType', 'where']);

        options.innerQuery = this.find(subRecordType, subWhere, subOptions);
      }
      return this.query({
        recordType: recordType,
        queryMethod: queryMethod
      }, where, options);
    }
  }, {
    key: 'findOne',
    value: function () {
      var _ref7 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee6(recordType, where, options) {
        var results;
        return _regenerator2.default.wrap(function _callee6$(_context6) {
          while (1) {
            switch (_context6.prev = _context6.next) {
              case 0:
                _context6.next = 2;
                return this.find(recordType, where, (0, _extends3.default)({}, options, { limit: 1 }));

              case 2:
                results = _context6.sent;
                return _context6.abrupt('return', results && results.length > 0 ? results[0] : null);

              case 4:
              case 'end':
                return _context6.stop();
            }
          }
        }, _callee6, this);
      }));

      function findOne(_x6, _x7, _x8) {
        return _ref7.apply(this, arguments);
      }

      return findOne;
    }()
  }, {
    key: 'findById',
    value: function findById(recordType, id, options) {
      return this.findOne(recordType, { id: id }, options);
    }
  }, {
    key: 'findRecursiveTree',
    value: function () {
      var _ref8 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee7(recordType, id) {
        var idKey = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 'id';
        var parentIdKey = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 'parent_id';
        var sql;
        return _regenerator2.default.wrap(function _callee7$(_context7) {
          while (1) {
            switch (_context7.prev = _context7.next) {
              case 0:
                // See https://stackoverflow.com/questions/34954873/get-entire-hierarchy-of-parents-from-a-given-child-in-postgresql
                sql = '\n     with recursive findParents as (\n       select * from ' + recordType + '\n         where ' + idKey + ' = \'' + id + '\'\n       union\n         select ' + recordType + '.* from ' + recordType + '\n           join findParents on findParents.' + parentIdKey + ' = ' + recordType + '.' + idKey + '\n     )\n\n     select * from findParents;\n   ';
                return _context7.abrupt('return', this.executeSql(sql));

              case 2:
              case 'end':
                return _context7.stop();
            }
          }
        }, _callee7, this);
      }));

      function findRecursiveTree(_x9, _x10) {
        return _ref8.apply(this, arguments);
      }

      return findRecursiveTree;
    }()
  }, {
    key: 'findWithParents',
    value: function () {
      var _ref9 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee8(recordType, id) {
        var idKey = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 'id';
        var parentIdKey = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 'parent_id';
        return _regenerator2.default.wrap(function _callee8$(_context8) {
          while (1) {
            switch (_context8.prev = _context8.next) {
              case 0:
                return _context8.abrupt('return', this.findRecursiveTree(recordType, id, idKey, parentIdKey));

              case 1:
              case 'end':
                return _context8.stop();
            }
          }
        }, _callee8, this);
      }));

      function findWithParents(_x13, _x14) {
        return _ref9.apply(this, arguments);
      }

      return findWithParents;
    }()
  }, {
    key: 'findWithChildren',
    value: function () {
      var _ref10 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee9(recordType, id) {
        var idKey = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 'id';
        var parentIdKey = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 'parent_id';
        return _regenerator2.default.wrap(function _callee9$(_context9) {
          while (1) {
            switch (_context9.prev = _context9.next) {
              case 0:
                return _context9.abrupt('return', this.findRecursiveTree(recordType, id, parentIdKey, idKey));

              case 1:
              case 'end':
                return _context9.stop();
            }
          }
        }, _callee9, this);
      }));

      function findWithChildren(_x17, _x18) {
        return _ref10.apply(this, arguments);
      }

      return findWithChildren;
    }()
  }, {
    key: 'findOrCreate',
    value: function () {
      var _ref11 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee10(recordType, where) {
        var extraFieldsIfCreating = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
        var record;
        return _regenerator2.default.wrap(function _callee10$(_context10) {
          while (1) {
            switch (_context10.prev = _context10.next) {
              case 0:
                _context10.next = 2;
                return this.findOne(recordType, where);

              case 2:
                record = _context10.sent;
                return _context10.abrupt('return', record || this.create(recordType, (0, _extends3.default)({}, where, extraFieldsIfCreating)));

              case 4:
              case 'end':
                return _context10.stop();
            }
          }
        }, _callee10, this);
      }));

      function findOrCreate(_x21, _x22) {
        return _ref11.apply(this, arguments);
      }

      return findOrCreate;
    }()
  }, {
    key: 'count',
    value: function () {
      var _ref12 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee11(recordType, where, options) {
        var result;
        return _regenerator2.default.wrap(function _callee11$(_context11) {
          while (1) {
            switch (_context11.prev = _context11.next) {
              case 0:
                _context11.next = 2;
                return this.find(recordType, where, options, QUERY_METHODS.COUNT);

              case 2:
                result = _context11.sent;
                return _context11.abrupt('return', parseInt(result[0].count, 10));

              case 4:
              case 'end':
                return _context11.stop();
            }
          }
        }, _callee11, this);
      }));

      function count(_x24, _x25, _x26) {
        return _ref12.apply(this, arguments);
      }

      return count;
    }()
  }, {
    key: 'create',
    value: function () {
      var _ref13 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee12(recordType, record) {
        for (var _len3 = arguments.length, additionalRecords = Array(_len3 > 2 ? _len3 - 2 : 0), _key3 = 2; _key3 < _len3; _key3++) {
          additionalRecords[_key3 - 2] = arguments[_key3];
        }

        var recordsCreated, _iteratorNormalCompletion, _didIteratorError, _iteratorError, _iterator, _step, additionalRecord, recordCreated;

        return _regenerator2.default.wrap(function _callee12$(_context12) {
          while (1) {
            switch (_context12.prev = _context12.next) {
              case 0:
                // TODO could be more efficient to put all extra objects into one query
                if (!record.id) {
                  record.id = (0, _generateId.generateId)();
                }
                _context12.next = 3;
                return this.query({
                  recordType: recordType,
                  queryMethod: QUERY_METHODS.INSERT,
                  queryMethodParameter: record
                });

              case 3:
                if (!(additionalRecords.length === 0)) {
                  _context12.next = 5;
                  break;
                }

                return _context12.abrupt('return', record);

              case 5:
                recordsCreated = [record];
                _iteratorNormalCompletion = true;
                _didIteratorError = false;
                _iteratorError = undefined;
                _context12.prev = 9;
                _iterator = (0, _getIterator3.default)(additionalRecords);

              case 11:
                if (_iteratorNormalCompletion = (_step = _iterator.next()).done) {
                  _context12.next = 20;
                  break;
                }

                additionalRecord = _step.value;
                _context12.next = 15;
                return this.create(recordType, additionalRecord);

              case 15:
                recordCreated = _context12.sent;

                recordsCreated.push(recordCreated);

              case 17:
                _iteratorNormalCompletion = true;
                _context12.next = 11;
                break;

              case 20:
                _context12.next = 26;
                break;

              case 22:
                _context12.prev = 22;
                _context12.t0 = _context12['catch'](9);
                _didIteratorError = true;
                _iteratorError = _context12.t0;

              case 26:
                _context12.prev = 26;
                _context12.prev = 27;

                if (!_iteratorNormalCompletion && _iterator.return) {
                  _iterator.return();
                }

              case 29:
                _context12.prev = 29;

                if (!_didIteratorError) {
                  _context12.next = 32;
                  break;
                }

                throw _iteratorError;

              case 32:
                return _context12.finish(29);

              case 33:
                return _context12.finish(26);

              case 34:
                return _context12.abrupt('return', recordsCreated);

              case 35:
              case 'end':
                return _context12.stop();
            }
          }
        }, _callee12, this, [[9, 22, 26, 34], [27,, 29, 33]]);
      }));

      function create(_x27, _x28) {
        return _ref13.apply(this, arguments);
      }

      return create;
    }()

    /**
     * Updates all records that match the criteria to have the values in updatedFields
     * @param {string} recordType     Records of this type will be updated
     * @param {object} where          Records matching this criteria will be updated
     * @param {object} updatedFields  The new values that should be in the record
     */

  }, {
    key: 'update',
    value: function () {
      var _ref14 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee13(recordType, where, updatedFields) {
        return _regenerator2.default.wrap(function _callee13$(_context13) {
          while (1) {
            switch (_context13.prev = _context13.next) {
              case 0:
                return _context13.abrupt('return', this.query({
                  recordType: recordType,
                  queryMethod: QUERY_METHODS.UPDATE,
                  queryMethodParameter: updatedFields
                }, where));

              case 1:
              case 'end':
                return _context13.stop();
            }
          }
        }, _callee13, this);
      }));

      function update(_x29, _x30, _x31) {
        return _ref14.apply(this, arguments);
      }

      return update;
    }()
  }, {
    key: 'updateById',
    value: function () {
      var _ref15 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee14(recordType, id, updatedFields) {
        return _regenerator2.default.wrap(function _callee14$(_context14) {
          while (1) {
            switch (_context14.prev = _context14.next) {
              case 0:
                return _context14.abrupt('return', this.update(recordType, { id: id }, updatedFields));

              case 1:
              case 'end':
                return _context14.stop();
            }
          }
        }, _callee14, this);
      }));

      function updateById(_x32, _x33, _x34) {
        return _ref15.apply(this, arguments);
      }

      return updateById;
    }()
  }, {
    key: 'updateOrCreate',
    value: function () {
      var _ref16 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee15(recordType, identifiers, updatedFields) {
        var newId, updatedFieldsWithoutUndefined, newRecord, buildQueryList, columns, values, conflict, updates, allParameterBindings, result;
        return _regenerator2.default.wrap(function _callee15$(_context15) {
          while (1) {
            switch (_context15.prev = _context15.next) {
              case 0:
                // Put together the full new record that will be created, if no matching record exists
                newId = (0, _generateId.generateId)(); // Generate a new id, in no id was provided

                updatedFieldsWithoutUndefined = JSON.parse((0, _stringify2.default)(updatedFields));
                newRecord = (0, _extends3.default)({ id: newId }, identifiers, updatedFieldsWithoutUndefined);

                buildQueryList = function buildQueryList(object, formatter) {
                  return (0, _keys2.default)(object).map(formatter).join(',');
                };

                // Build string of all column names to be inserted on new record creation


                columns = buildQueryList(newRecord, function (columnName) {
                  return ':old_column_' + columnName + ':';
                });

                // Build string of all values to be inserted on new record creation

                values = buildQueryList(newRecord, function (columnName) {
                  return ':' + columnName;
                });

                // Build string of column names to detect a conflict on, i.e. the identifying columns

                conflict = buildQueryList(identifiers, function (columnName) {
                  return ':old_column_' + columnName + ':';
                });

                // Build string of just those fields to update if a matching record exists

                updates = buildQueryList(updatedFieldsWithoutUndefined, function (columnName) {
                  return ':old_column_' + columnName + ': = :new_column_' + columnName + ':';
                });

                // Put together all parameters that may need to be bound, including the column names and values

                allParameterBindings = (0, _extends3.default)({
                  recordType: recordType
                }, newRecord);

                (0, _keys2.default)(newRecord).forEach(function (columnName) {
                  allParameterBindings['old_column_' + columnName] = columnName; // Use 'old_column_' prefix
                });
                (0, _keys2.default)(updatedFieldsWithoutUndefined).forEach(function (columnName) {
                  // If updating on conflict, we can use the special postgres "excluded" table name to refer to
                  // the record that failed to be inserted. Use 'new_column_' as the prefix
                  allParameterBindings['new_column_' + columnName] = 'excluded.' + columnName;
                });

                // Run the sql
                _context15.next = 13;
                return this.executeSql('\n        INSERT INTO :recordType: (' + columns + ')\n          VALUES (' + values + ')\n          ON CONFLICT (' + conflict + ') DO UPDATE\n            SET ' + updates + '\n          RETURNING *;\n      ', allParameterBindings);

              case 13:
                result = _context15.sent;
                return _context15.abrupt('return', result[0]);

              case 15:
              case 'end':
                return _context15.stop();
            }
          }
        }, _callee15, this);
      }));

      function updateOrCreate(_x35, _x36, _x37) {
        return _ref16.apply(this, arguments);
      }

      return updateOrCreate;
    }()
  }, {
    key: 'delete',
    value: function () {
      var _ref17 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee16(recordType) {
        var where = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
        return _regenerator2.default.wrap(function _callee16$(_context16) {
          while (1) {
            switch (_context16.prev = _context16.next) {
              case 0:
                return _context16.abrupt('return', this.query({
                  recordType: recordType,
                  queryMethod: QUERY_METHODS.DELETE
                }, where));

              case 1:
              case 'end':
                return _context16.stop();
            }
          }
        }, _callee16, this);
      }));

      function _delete(_x38) {
        return _ref17.apply(this, arguments);
      }

      return _delete;
    }()
  }, {
    key: 'deleteById',
    value: function () {
      var _ref18 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee17(recordType, id) {
        return _regenerator2.default.wrap(function _callee17$(_context17) {
          while (1) {
            switch (_context17.prev = _context17.next) {
              case 0:
                return _context17.abrupt('return', this.delete(recordType, { id: id }));

              case 1:
              case 'end':
                return _context17.stop();
            }
          }
        }, _callee17, this);
      }));

      function deleteById(_x40, _x41) {
        return _ref18.apply(this, arguments);
      }

      return deleteById;
    }()

    /**
     * Force a change to be recorded against the records matching the search criteria, and return
     * those records.
     */

  }, {
    key: 'markAsChanged',
    value: function () {
      var _ref19 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee18(recordType, where, options) {
        var records, _iteratorNormalCompletion2, _didIteratorError2, _iteratorError2, _iterator2, _step2, record;

        return _regenerator2.default.wrap(function _callee18$(_context18) {
          while (1) {
            switch (_context18.prev = _context18.next) {
              case 0:
                _context18.next = 2;
                return this.find(recordType, where, options);

              case 2:
                records = _context18.sent;
                _iteratorNormalCompletion2 = true;
                _didIteratorError2 = false;
                _iteratorError2 = undefined;
                _context18.prev = 6;

                for (_iterator2 = (0, _getIterator3.default)(records); !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                  record = _step2.value;

                  this.changeListener.publish('change', {
                    change: {
                      record_id: record.id,
                      type: 'update',
                      record_type: recordType
                    },
                    record: record
                  });
                }
                _context18.next = 14;
                break;

              case 10:
                _context18.prev = 10;
                _context18.t0 = _context18['catch'](6);
                _didIteratorError2 = true;
                _iteratorError2 = _context18.t0;

              case 14:
                _context18.prev = 14;
                _context18.prev = 15;

                if (!_iteratorNormalCompletion2 && _iterator2.return) {
                  _iterator2.return();
                }

              case 17:
                _context18.prev = 17;

                if (!_didIteratorError2) {
                  _context18.next = 20;
                  break;
                }

                throw _iteratorError2;

              case 20:
                return _context18.finish(17);

              case 21:
                return _context18.finish(14);

              case 22:
                return _context18.abrupt('return', records);

              case 23:
              case 'end':
                return _context18.stop();
            }
          }
        }, _callee18, this, [[6, 10, 14, 22], [15,, 17, 21]]);
      }));

      function markAsChanged(_x42, _x43, _x44) {
        return _ref19.apply(this, arguments);
      }

      return markAsChanged;
    }()
  }, {
    key: 'getSetting',
    value: function () {
      var _ref20 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee19(key) {
        var setting;
        return _regenerator2.default.wrap(function _callee19$(_context19) {
          while (1) {
            switch (_context19.prev = _context19.next) {
              case 0:
                _context19.next = 2;
                return this.findOne('setting', { key: key });

              case 2:
                setting = _context19.sent;
                return _context19.abrupt('return', setting ? setting.value : null);

              case 4:
              case 'end':
                return _context19.stop();
            }
          }
        }, _callee19, this);
      }));

      function getSetting(_x45) {
        return _ref20.apply(this, arguments);
      }

      return getSetting;
    }()
  }, {
    key: 'setSetting',
    value: function setSetting(key, value) {
      return this.updateOrCreate('setting', { key: key }, { value: value });
    }
  }, {
    key: 'clearSetting',
    value: function clearSetting(key) {
      return this.delete('setting', { key: key });
    }

    /**
     * Execute a sum query.
     *
     * eg:
     * this.database.sum('user_reward', ['pigs', 'coconuts'], {
     *   user_id: userId,
     * });
     * could return:
     * { coconuts: 99, pigs: 55 }
     *
     * @param {string} table
     * Database table to sum from.
     * @param {array} fields
     * An array of fields to sum.
     * @param {object} where
     * Conditions for the sum query.
     */

  }, {
    key: 'sum',
    value: function () {
      var _ref21 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee20(table) {
        var fields = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];
        var where = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
        var query, result, processedResult;
        return _regenerator2.default.wrap(function _callee20$(_context20) {
          while (1) {
            switch (_context20.prev = _context20.next) {
              case 0:
                if (this.connection) {
                  _context20.next = 3;
                  break;
                }

                _context20.next = 3;
                return this.connectionPromise;

              case 3:
                query = this.connection(table);


                fields.forEach(function (fieldToSum) {
                  query.sum(fieldToSum + ' as ' + fieldToSum);
                });

                _context20.next = 7;
                return query.where(where);

              case 7:
                result = _context20.sent;
                processedResult = {};

                // Convert counts to integers.

                (0, _keys2.default)(result[0]).forEach(function (sumKey) {
                  processedResult[sumKey] = parseInt(result[0][sumKey], 10);
                });

                return _context20.abrupt('return', processedResult);

              case 11:
              case 'end':
                return _context20.stop();
            }
          }
        }, _callee20, this);
      }));

      function sum(_x46) {
        return _ref21.apply(this, arguments);
      }

      return sum;
    }()

    /**
     * Runs an arbitrary SQL query against the database.
     *
     * Use only for situations in which Knex is not able to assemble a query.
     */

  }, {
    key: 'executeSql',
    value: function () {
      var _ref22 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee21(sqlString, parametersToBind) {
        var result;
        return _regenerator2.default.wrap(function _callee21$(_context21) {
          while (1) {
            switch (_context21.prev = _context21.next) {
              case 0:
                if (this.connection) {
                  _context21.next = 3;
                  break;
                }

                _context21.next = 3;
                return this.connectionPromise;

              case 3:
                _context21.next = 5;
                return this.connection.raw(sqlString, parametersToBind);

              case 5:
                result = _context21.sent;
                return _context21.abrupt('return', result.rows);

              case 7:
              case 'end':
                return _context21.stop();
            }
          }
        }, _callee21, this);
      }));

      function executeSql(_x49, _x50) {
        return _ref22.apply(this, arguments);
      }

      return executeSql;
    }()
  }]);
  return TupaiaDatabase;
}();

/**
 * Builds the query specified by the parameters passed in. The returned query can either be
 * 'awaited' (in which case it will execute and return the result), or passed back in to
 * this.query as part of a nested query.
 */


function buildQuery(connection, queryConfig) {
  var where = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
  var options = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};
  var recordType = queryConfig.recordType,
      queryMethod = queryConfig.queryMethod,
      queryMethodParameter = queryConfig.queryMethodParameter;

  var query = connection(recordType); // Query starts as just the table, but will be built up

  // If an innerQuery is defined, make the outer query wrap it
  if (options.innerQuery) {
    query = query.from(options.innerQuery);
  }

  // Add join options if provided
  if (options.joinWith) {
    query = addJoin(query, recordType, options);
  }

  // Add multiple join options if provided
  if (options.multiJoin) {
    options.multiJoin.forEach(function (joinOptions) {
      return query = addJoin(query, recordType, joinOptions);
    });
  }

  // Add filtering (or WHERE) details if provided
  query = addWhereClause(query[queryMethod](queryMethodParameter || options.columns), where);

  // Add sorting information if provided
  if (options.sort) {
    var _iteratorNormalCompletion3 = true;
    var _didIteratorError3 = false;
    var _iteratorError3 = undefined;

    try {
      for (var _iterator3 = (0, _getIterator3.default)(options.sort), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
        var sortKey = _step3.value;

        var _sortKey$split = sortKey.split(' '),
            _sortKey$split2 = (0, _slicedToArray3.default)(_sortKey$split, 2),
            columnName = _sortKey$split2[0],
            direction = _sortKey$split2[1];

        query = query.orderBy(columnName, direction);
      }
    } catch (err) {
      _didIteratorError3 = true;
      _iteratorError3 = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion3 && _iterator3.return) {
          _iterator3.return();
        }
      } finally {
        if (_didIteratorError3) {
          throw _iteratorError3;
        }
      }
    }
  }

  // Restrict the number of rows returned if limit provided
  if (options.limit) {
    query = query.limit(options.limit);
  }

  // Allow results to be returned offset for pagination
  if (options.offset) {
    query = query.offset(options.offset);
  }

  // Alias the query result (for use in nested queries) if name provided
  if (options.name) {
    query = query.as(options.name);
  }

  if (queryMethod === QUERY_METHODS.UPDATE) {
    // Return all fields after
    query.returning('*');
  }

  // Now constructed, the query can either be 'awaited' (in which case it will execute and return
  // the result), or passed back in to this.query as part of a nested query.
  return query;
}

function addWhereClause(baseQuery, where) {
  if (!where) {
    return baseQuery;
  }
  return (0, _entries2.default)(where).reduce(function (querySoFar, _ref23) {
    var _ref24 = (0, _slicedToArray3.default)(_ref23, 2),
        key = _ref24[0],
        value = _ref24[1];

    // Providing the _and_ or the _or_ keys will use the contained criteria as a bracket wrapped
    // subsection of the broader WHERE clause
    if (key === QUERY_CONJUNCTIONS.AND) {
      return querySoFar.andWhere(function () {
        addWhereClause(this, value); // Within the function, 'this' refers to the query so far
      });
    } else if (key === QUERY_CONJUNCTIONS.OR) {
      return querySoFar.orWhere(function () {
        addWhereClause(this, value); // Within the function, 'this' refers to the query so far
      });
    } else if (key === QUERY_CONJUNCTIONS.RAW) {
      var _value$sql = value.sql,
          sql = _value$sql === undefined ? value : _value$sql,
          parameters = value.parameters;

      return querySoFar.whereRaw(sql, parameters);
    }
    if (value === undefined) {
      return querySoFar; // Ignore undefined criteria
    }
    if (value === null) {
      return querySoFar.whereNull(key);
    }
    var _value$comparisonType = value.comparisonType,
        comparisonType = _value$comparisonType === undefined ? 'where' : _value$comparisonType,
        _value$comparator = value.comparator,
        comparator = _value$comparator === undefined ? Array.isArray(value) ? 'in' : '=' : _value$comparator,
        _value$comparisonValu = value.comparisonValue,
        comparisonValue = _value$comparisonValu === undefined ? value : _value$comparisonValu,
        _value$ignoreCase = value.ignoreCase,
        ignoreCase = _value$ignoreCase === undefined ? false : _value$ignoreCase;

    if (ignoreCase) {
      return querySoFar.whereRaw('LOWER(:key:) ' + comparator + ' LOWER(:comparisonValue)', {
        key: key,
        comparisonValue: comparisonValue
      });
    }
    var _value$args = value.args,
        args = _value$args === undefined ? [comparator, comparisonValue] : _value$args;

    return querySoFar[comparisonType].apply(querySoFar, [key].concat((0, _toConsumableArray3.default)(args)));
  }, baseQuery);
}

function addJoin(baseQuery, recordType, joinOptions) {
  // Default join condition is of the form 'primary.id = secondary.primary_id',
  // e.g. survey_response.id = answer.survey_response_id
  var joinWith = joinOptions.joinWith,
      _joinOptions$joinType = joinOptions.joinType,
      joinType = _joinOptions$joinType === undefined ? JOIN_TYPES.DEFAULT : _joinOptions$joinType,
      _joinOptions$joinCond = joinOptions.joinCondition,
      joinCondition = _joinOptions$joinCond === undefined ? [recordType + '.id', joinWith + '.' + recordType + '_id'] : _joinOptions$joinCond,
      _joinOptions$joinCond2 = joinOptions.joinConditions,
      joinConditions = _joinOptions$joinCond2 === undefined ? [joinCondition] : _joinOptions$joinCond2;

  var joinMethod = joinType ? joinType + 'Join' : 'join';
  return baseQuery[joinMethod](joinWith, function () {
    var joining = this.on.apply(this, (0, _toConsumableArray3.default)(joinConditions[0]));
    for (var joinConditionIndex = 1; joinConditionIndex < joinConditions.length; joinConditionIndex++) {
      joining.andOn.apply(joining, (0, _toConsumableArray3.default)(joinConditions[joinConditionIndex]));
    }
  });
}