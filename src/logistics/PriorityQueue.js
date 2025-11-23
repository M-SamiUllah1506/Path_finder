// Simple binary min-heap priority queue for objects with 'priority' property
export default class PriorityQueue {
  constructor() { this._heap = []; }
  size() { return this._heap.length; }
  isEmpty() { return this.size() === 0; }
  push(item, priority) {
    const node = { item, priority };
    this._heap.push(node);
    this._bubbleUp(this._heap.length - 1);
  }
  pop() {
    const top = this._heap[0];
    const end = this._heap.pop();
    if (this._heap.length) {
      this._heap[0] = end;
      this._sinkDown(0);
    }
    return top ? top.item : null;
  }
  _bubbleUp(idx) {
    const heap = this._heap;
    while (idx > 0) {
      const parent = Math.floor((idx - 1) / 2);
      if (heap[idx].priority >= heap[parent].priority) break;
      [heap[parent], heap[idx]] = [heap[idx], heap[parent]];
      idx = parent;
    }
  }
  _sinkDown(idx) {
    const heap = this._heap; const len = heap.length;
    while (true) {
      let left = 2*idx + 1, right = 2*idx + 2, swap = null;
      if (left < len && heap[left].priority < heap[idx].priority) swap = left;
      if (right < len && heap[right].priority < (swap === null ? heap[idx].priority : heap[left].priority)) swap = right;
      if (swap === null) break;
      [heap[idx], heap[swap]] = [heap[swap], heap[idx]];
      idx = swap;
    }
  }
}
