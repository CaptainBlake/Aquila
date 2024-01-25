// priorityQueue.js


class PriorityQueue {
    constructor(initialArray = []) {
        this.queue = [];
        initialArray.forEach(item => this.enqueue(item.item, item.priority));
    }

    /**
     * Adds an item to the queue with the specified priority.
     * the lower the priority number, the higher the priority (0 is the highest priority).
     * @param item - The item to add to the queue.
     * @param priority - The priority of the item.
     */
    enqueue(item, priority) {
        const queueElement = { item, priority };
        if (this.isEmpty()) {
            this.queue.push(queueElement);
        } else {
            let added = false;
            for (let i = 0; i < this.queue.length; i++) {
                if (queueElement.priority < this.queue[i].priority) {
                    this.queue.splice(i, 0, queueElement);
                    added = true;
                    break;
                }
            }
            if (!added) {
                this.queue.push(queueElement);
            }
        }
    }

    /**
     * Removes and returns the first item in the queue.
     * @returns {*|string} - The first item in the queue.
     */
    dequeue() {
        if (this.isEmpty()) {
            return "Queue is empty";
        }
        return this.queue.shift();
    }

    /**
     * filter returns a new array containing all items in the queue that pass the test implemented by the provided function.
     * @param callback - Function to test each item of the queue.
     * @returns {*[]} - A new array of items that passed the test.
     */
    filter(callback) {
        return this.queue.filter(callback);
    }

    /**
     * Returns the first item in the queue without removing it.
     * @returns {*|string} - The first item in the queue.
     */
    peek() {
        if (this.isEmpty()) {
            return "Queue is empty";
        }
        return this.queue[0];
    }

    /**
     * Checks if the queue is empty.
     * @returns {boolean} - True if the queue is empty.
     */
    isEmpty() {
        return this.queue.length === 0;
    }

    /**
     * Serializes the queue and saves it to the specified memory address.
     * @param memoryAddress - The memory address to save the serialized queue to.
     */
    saveToMemory(memoryAddress) {
        Memory[memoryAddress] = JSON.stringify(this.queue);
    }

    loadFromMemory(memoryAddress) {
        const queueArray = JSON.parse(Memory[memoryAddress]);
        const pq = new PriorityQueue();
        pq.queue = queueArray;
        return pq;
    }
}

module.exports = PriorityQueue;