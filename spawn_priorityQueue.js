class PriorityQueue {
    constructor() {
        this.queue = [];
    }

    /**
     * Enqueues an item into the priority queue at the correct position based on its priority.
     * @param {any} item - The item to be added to the queue.
     * @param {number} priority - The priority of the item. Lower values are considered higher priority.
     */
    enqueue(item, priority) {
        const queueElement = { item, priority }; // Create a new queue element
        if (this.isEmpty()) { // If the queue is empty
            this.queue.push(queueElement); // Add the element to the queue
        } else { // If the queue is not empty
            let added = false;
            for (let i = 0; i < this.queue.length; i++) { // Iterate over the queue
                if (queueElement.priority < this.queue[i].priority) { // If the new element's priority is less than the current element's priority
                    this.queue.splice(i, 0, queueElement); // Insert the new element at the current position
                    added = true; // Mark the element as added
                    break; // Break the loop
                }
            }
            if (!added) { // If the element was not added in the loop
                this.queue.push(queueElement); // Add the element to the end of the queue
            }
        }
    }

    /**
     * Dequeues an item from the priority queue.
     * @returns {any} The dequeued item.
     */
    dequeue() {
        if (this.isEmpty()) {
            return "Underflow";
        }
        return this.queue.shift();
    }

    /**
     * Returns the front item of the priority queue without removing it.
     * @returns {any} The front item of the queue.
     */
    isEmpty() {
        return this.queue.length === 0;
    }
}

module.exports = PriorityQueue;