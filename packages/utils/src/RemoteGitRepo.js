/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import { getArticle } from './string';

/**
 * Based on http://github-tools.github.io/github/docs/3.2.3/GitHub.html
 *
 * @typedef {Object} GitProvider
 * @property {(user: string, repo: string) => RepoApi} getRepo
 */

/**
 * Based on http://github-tools.github.io/github/docs/3.2.3/Repository.html
 *
 * @typedef {Object} RepoApi
 * @property {Function} commit
 * @property {Function} createBranch
 * @property {Function} createPullRequest
 * @property {Function} createTree
 * @property {Function} getBlob
 * @property {Function} getBranch
 * @property {Function} getDetails
 * @property {Function} getSha
 * @property {Function} getSingleCommit
 * @property {Function} listBranches
 * @property {Function} updateRef
 */

/**
 * @typedef {{ path: string, content: string, mode: string | undefined }} GitFile
 * @see https://docs.github.com/en/rest/reference/git#create-a-tree
 */

const validateRequiredFnInput = (fn, input) => {
  Object.entries(input).forEach(([key, value]) => {
    if (['', undefined, null].includes(value)) {
      const keyDescription = `${getArticle(key)} ${key}`;
      throw new Error(`Please provide ${keyDescription} to "RemoteGitRepo.${fn}"`);
    }
  });
};

const isReqError = error => !!error.response;

const stringifyReqError = error => {
  const { message, errors, documentation_url: url } = error.response.data;
  return [
    error.message,
    message && message.replace('\n\n', ':'),
    errors && JSON.stringify(errors),
    url && `Check documentation at ${url}`,
  ]
    .filter(x => !!x)
    .join('\n');
};

/**
 * @param {string} url Example: git@github.com:organisation/name.git
 */
const getRepoDetailsFromUrl = url => {
  if (!url) {
    throw new Error(`Please provide a non empty git repository url`);
  }

  const [, organisation = '', name = ''] = url.match(/:([^:]+)\/([^/]+).git/) || [];
  if (!organisation || !name) {
    throw new Error(`${url} is not a valid/supported git repository url`);
  }
  return { organisation, name };
};

/**
 * @param {GitFile[]} files
 */
const filesToTree = files =>
  files.map(({ path, content, mode = '100644' }) => ({ path, content, mode, type: 'blob' }));

export class RemoteGitRepo {
  /**
   * @type {RepoApi}
   */
  api;

  constructor(api) {
    this.api = api;
  }

  /**
   * @param {GitProvider} gitProvider
   */
  static connect = (gitProvider, url) => {
    const { organisation, name } = getRepoDetailsFromUrl(url);
    const api = gitProvider.getRepo(organisation, name);
    return new RemoteGitRepo(api);
  };

  handleReq = async reqPromise => {
    try {
      const { data } = await reqPromise;
      return data;
    } catch (error) {
      const throwableError = isReqError(error) ? new Error(stringifyReqError(error)) : error;
      throw throwableError;
    }
  };

  /**
   * @param {GitFile[]} files
   */
  commitFilesToBranch = async (branch, files, message) => {
    const { sha: baseSha } = await this.getSingleCommit(branch);
    const { sha: treeSha } = await this.createTreeFromFiles(files, baseSha);
    const { sha: commitSha } = await this.commit(baseSha, treeSha, message);
    await this.updateBranchHead(branch, commitSha);
  };

  commit = async (parent, tree, message) => {
    validateRequiredFnInput('commit', { parent, tree, message });
    return this.handleReq(this.api.commit(parent, tree, message));
  };

  createBranch = async (newBranch, baseBranchInput = '') => {
    validateRequiredFnInput('createBranch', { newBranch });
    const baseBranch = baseBranchInput || (await this.getDetails()).default_branch;
    return this.handleReq(this.api.createBranch(baseBranch, newBranch));
  };

  createBranchIfNotExists = async (newBranch, baseBranch = '') => {
    const branchExists = await this.hasBranch(newBranch);
    return branchExists ? this.getBranch(newBranch) : this.createBranch(newBranch, baseBranch);
  };

  createPullRequest = async options => {
    const { head, base, title } = options;
    validateRequiredFnInput('createPullRequest', { head, base, title });
    return this.handleReq(this.api.createPullRequest(options));
  };

  createTree = async (tree, baseSha) => {
    validateRequiredFnInput('createTree', { tree, baseSha });
    return this.handleReq(this.api.createTree(tree, baseSha));
  };

  createTreeFromFiles = async (fileMap, baseSha) => {
    validateRequiredFnInput('createTreeFromFiles', { fileMap });
    const tree = filesToTree(fileMap);
    return this.createTree(tree, baseSha);
  };

  getBranch = async branch => {
    validateRequiredFnInput('getBranch', { branch });
    return this.handleReq(this.api.getBranch(branch));
  };

  getDetails = async () => this.handleReq(this.api.getDetails());

  getFile = async (branch, path) => {
    validateRequiredFnInput('getFile', { branch, path });
    const { sha } = await this.handleReq(this.api.getSha(branch, path));
    return this.handleReq(this.api.getBlob(sha));
  };

  getSingleCommit = async branch => {
    validateRequiredFnInput('getSingleCommit', { branch });
    return this.handleReq(this.api.getSingleCommit(branch));
  };

  hasBranch = async branch => {
    validateRequiredFnInput('hasBranch', { branch });
    const branches = await this.listBranches();
    return branches.some(b => b.name === branch);
  };

  listBranches = async () => this.handleReq(this.api.listBranches());

  updateHead = async (ref, commitSha, force = false) => {
    validateRequiredFnInput('updateHead', { ref, commitSha });
    return this.handleReq(this.api.updateHead(ref, commitSha, force));
  };

  updateBranchHead = async (branch, commitSha, force) =>
    this.updateHead(`heads/${branch}`, commitSha, force);
}
