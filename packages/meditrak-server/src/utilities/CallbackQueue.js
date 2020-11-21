export class CallbackQueue {
  constructor() {
    this.queue = [];
    this.activeTask = null;
    this.finishedTask = null;
    this.finishedResolve = null;
  }

  add(callback, friendlyName) {
    // need to check this *before* we add it to the queue, otherwise
    // (of course) the queue will have length >0
    const isFirstTask = !this.activeTask && this.queue.length === 0;

    const waiter = new Promise((resolve, reject) => {
      this.queue.push({ callback, friendlyName, resolve, reject });
    });

    if (isFirstTask) {
      this.call();
    }

    return waiter;
  }

  async call() {
    const { callback, friendlyName, resolve, reject } = this.queue.shift();

    // the queue can receive items while waiting here
    try {
      this.activeTask = callback();
      const result = await this.activeTask;
      resolve(result);
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e);
      reject(e);
    }

    this.activeTask = null;

    if (this.queue.length === 0) {
      if (this.finishedResolve) {
        this.finishedResolve();
      }
      return;
    }

    this.call();
  }

  waitUntilFinished() {
    if (!this.finishedTask) {
      this.finishedTask = new Promise(resolve => {
        this.finishedResolve = resolve;
      });
    }

    return this.finishedTask;
  }
}
