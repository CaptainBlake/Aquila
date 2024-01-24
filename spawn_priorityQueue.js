class PriorityQueue {
    constructor() {
        this.items = [];
    }

    enqueue(item, priority) {
        this.items.push({ item, priority }); 
        this.items.sort((a, b) => a.priority - b.priority);
    }

    filter(callback) {
        let filteredQueue = new PriorityQueue();
        filteredQueue.items = this.items.filter(callback);
        return filteredQueue;
    }

    dequeue() {
        return this.items.shift();
    }

    isEmpty() {
        return this.items.length === 0;
    }
}

module.exports = PriorityQueue;