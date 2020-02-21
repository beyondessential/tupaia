export class Multilock {
  constructor() {
    this.locks = new Set();
    this.promise = null;
    this.resolve = null;
  }

  isLocked() {
    return this.locks.size > 0;
  }

  async waitWithDebounce(debounce) {
    // wait for an unlock directly
    await this.wait();

    // then wait the debounce limit
    await new Promise(resolve => setTimeout(resolve, debounce));

    // check if it got locked while debouncing, if so, start
    // the whole process again
    if (this.isLocked()) {
      return this.waitWithDebounce(debounce);
    }

    // otherwise, wrap it up
  }

  wait() {
    if (!this.isLocked()) {
      return Promise.resolve();
    }

    if (!this.promise) {
      this.promise = new Promise((resolve, reject) => {
        this.resolve = resolve;
      });
    }

    return this.promise;
  }

  finished() {
    if (!this.resolve) return;

    this.resolve();
    this.promise = null;
    this.resolve = null;
  }

  createLock(debugLabel) {
    const key = Symbol(debugLabel);
    this.locks.add(key);

    const unlock = () => {
      this.locks.delete(key);
      if (this.resolve && this.locks.size === 0) {
        this.finished();
      }
    };

    return unlock;
  }
}
