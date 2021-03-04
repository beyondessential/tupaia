/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import fs from 'fs';
import { isPlainObject, set } from 'lodash';
import { extname } from 'path';

const isJs = path => extname(path) === '.js';

export class Snapshots {
  snapshotTree;

  /**
   * Method-specific, used during snapshot extraction
   */
  extractionConfig = {};

  /**
   * @param {Object<string, any>} snapshotTree
   */
  constructor(snapshotTree) {
    this.snapshotTree = snapshotTree;
  }

  static import = path => {
    const contents = fs.readFileSync(path, { encoding: 'utf-8' });
    // Note: JS parsing is a bit naive here, ideally we should use a code parsing library
    const snapshotJson = isJs(path) ? contents.replace('module.exports = ', '') : contents;
    const snapshotTree = JSON.parse(snapshotJson);
    return new Snapshots(snapshotTree);
  };

  export = path => {
    const contents = isJs(path) ? `module.exports = ${this.toString()}` : this.toString();
    fs.writeFileSync(path, contents);
  };

  toString = () => JSON.stringify(this.snapshotTree);

  equals = snapshots => {
    if (!(snapshots instanceof Snapshots)) {
      throw new Error('"Snapshots.equals" expects a Snapshots instance');
    }
    return this.toString() === snapshots.toString();
  };

  isEmpty = () => Object.keys(this.snapshotTree).length === 0;

  extractSnapshotsByKey = (key, options = {}) => {
    const extractedTree = {};
    this.extractionConfig = {
      sourceKey: key,
      targetKey: options.renameKey || key,
    };
    this.recursivelyExtractSnapshots(this.snapshotTree, extractedTree);
    return new Snapshots(extractedTree);
  };

  /**
   * @private
   * @param {Object<string, any>} resultTree New snapshots will be recursively extracted and stored here
   */
  recursivelyExtractSnapshots = (snapshotTree, resultTree, paths = []) => {
    Object.entries(snapshotTree).forEach(([key, subtree]) => {
      if (key === this.extractionConfig.sourceKey) {
        set(resultTree, [...paths, this.extractionConfig.targetKey], subtree);
      } else if (!isPlainObject(subtree)) {
        // Leaf node and no match found, do not traverse deeper
      } else {
        this.recursivelyExtractSnapshots(subtree, resultTree, [...paths, key]);
      }
    });
  };
}
