/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import fs from 'fs';
import { isPlainObject, set } from 'lodash';
import { extname } from 'path';

import { compareAsc } from '@tupaia/utils';

/**
 * NodePath is an array of two elements:
 * NodePath[0]: array of paths to reach a certain node in a tree
 * NodePath[1]: value of the node
 *
 * @typedef {[string[], any]} NodePath
 */

const nodePathsToTree = nodePaths =>
  nodePaths.reduce((agg, entry) => {
    const [path, value] = entry;
    set(agg, path, value);
    return agg;
  }, {});

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

  toString = () => JSON.stringify(this.snapshotTree, undefined, 2);

  equals = snapshots => {
    if (!(snapshots instanceof Snapshots)) {
      throw new Error('"Snapshots.equals" expects a Snapshots instance');
    }
    return this.toString() === snapshots.toString();
  };

  isEmpty = () => Object.keys(this.snapshotTree).length === 0;

  extractSnapshotsByKey = (key, options = {}) => {
    const extractedNodePaths = [];
    this.extractionConfig = {
      sourceKey: key,
      targetKey: options.renameKey || key,
    };
    this.recursivelyExtractSnapshotNodePaths(this.snapshotTree, extractedNodePaths);

    extractedNodePaths.sort(([pathA], [pathB]) => compareAsc(pathA, pathB));
    const extractedTree = nodePathsToTree(extractedNodePaths);
    return new Snapshots(extractedTree);
  };

  /**
   * @private
   * @param {NodePath[]} nodePathResults NodePaths for extracted snapshots will be recursively
   * stored here
   */
  recursivelyExtractSnapshotNodePaths = (snapshotTree, nodePathResults, paths = []) => {
    Object.entries(snapshotTree).forEach(([key, subtree]) => {
      if (key === this.extractionConfig.sourceKey) {
        nodePathResults.push([[...paths, this.extractionConfig.targetKey], subtree]);
      } else if (!isPlainObject(subtree)) {
        // Leaf node and no match found, do not traverse deeper
      } else {
        this.recursivelyExtractSnapshotNodePaths(subtree, nodePathResults, [...paths, key]);
      }
    });
  };
}
