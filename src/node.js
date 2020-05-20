import extend from './extend';

class Node {
    id = null;
    parent = null;
    children = [];
    state = {};
    options = {};

    constructor(node, options) {
        extend(this, node, options);

        this.options = options || {
            childrenAttribute: 'children'
        };
        this[this.options.childrenAttribute] = this[this.options.childrenAttribute] || [];
    }
    // Returns a boolean value indicating whether a node is a descendant of a given node or not.
    // @param {object} node Specifies the node that may be contained by (a descendant of) a specified node.
    // @return {boolean} Returns true if a node is a descendant of a specified node, otherwise false. A descendant can be a child, grandchild, great-grandchild, and so on.
    contains(node) {
        while ((node instanceof Node) && (node !== this)) {
            if (node.parent === this) {
                return true;
            }
            node = node.parent;
        }
        return false;
    }
    // Gets a child node at the specified index.
    // @param {number} The index of the child node.
    // @return {object} Returns an object that defines the node, null otherwise.
    getChildAt(index) {
        let node = null;
        if ((this[this.options.childrenAttribute].length > 0) && (index >= 0) && (index < this[this.options.childrenAttribute].length)) {
            node = this[this.options.childrenAttribute][index];
        }
        return node;
    }
    // Gets the child nodes.
    // @return {array} Returns an array of objects that define the nodes.
    getChildren() {
        return this[this.options.childrenAttribute];
    }
    // Gets the first child node.
    // @return {object} Returns an object that defines the node, null otherwise.
    getFirstChild() {
        let node = null;
        if (this[this.options.childrenAttribute].length > 0) {
            node = this[this.options.childrenAttribute][0];
        }
        return node;
    }
    // Gets the last child node.
    // @return {object} Returns an object that defines the node, null otherwise.
    getLastChild() {
        let node = null;
        if (this[this.options.childrenAttribute].length > 0) {
            node = this[this.options.childrenAttribute][this[this.options.childrenAttribute].length - 1];
        }
        return node;
    }
    // Gets the next sibling node.
    // @return {object} Returns an object that defines the node, null otherwise.
    getNextSibling() {
        let node = null;
        if (this.parent) {
            const index = this.parent[this.options.childrenAttribute].indexOf(this);
            if ((index >= 0) && (index < this.parent[this.options.childrenAttribute].length - 1)) {
                node = this.parent[this.options.childrenAttribute][index + 1];
            }
        }
        return node;
    }
    // Gets the parent node.
    // @return {object} Returns an object that defines the node, null otherwise.
    getParent() {
        return this.parent;
    }
    // Gets the previous sibling node.
    // @return {object} Returns an object that defines the node, null otherwise.
    getPreviousSibling() {
        let node = null;
        if (this.parent) {
            const index = this.parent[this.options.childrenAttribute].indexOf(this);
            if ((index > 0) && (index < this.parent[this.options.childrenAttribute].length)) {
                node = this.parent[this.options.childrenAttribute][index - 1];
            }
        }
        return node;
    }
    // Checks whether this node has children.
    // @return {boolean} Returns true if the node has children, false otherwise.
    hasChildren() {
        return this[this.options.childrenAttribute].length > 0;
    }
    // Checks whether this node is the last child of its parent.
    // @return {boolean} Returns true if the node is the last child of its parent, false otherwise.
    isLastChild() {
        const hasNextSibling = this.getNextSibling();
        return !hasNextSibling;
    }
}

export default Node;
