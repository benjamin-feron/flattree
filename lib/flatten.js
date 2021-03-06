'use strict';

exports.__esModule = true;

var _extend = require('./extend');

var _extend2 = _interopRequireDefault(_extend);

var _node = require('./node');

var _node2 = _interopRequireDefault(_node);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

// @param {object|array} nodes The tree nodes
// @param {object} [options] The options object
// @param {boolean} [options.openAllNodes] True to open all nodes. Defaults to false.
// @param {array} [options.openNodes] An array that contains the ids of open nodes
// @return {array}
/* eslint no-console: 0 */
var flatten = function flatten() {
    var nodes = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    nodes = [].concat(nodes);

    var flatten = [];
    var stack = [];
    var pool = {
        lastChild: {}
    };

    options.openAllNodes = !!options.openAllNodes;
    options.openNodes = options.openNodes || [];
    options.childrenAttribute = options.childrenAttribute || 'children';
    options.throwOnError = !!options.throwOnError;

    {
        var _ref;

        // root node
        var firstNode = nodes.length > 0 ? nodes[0] : null;
        var parentNode = firstNode ? firstNode.parent : null;
        if (parentNode && !(parentNode instanceof _node2['default'])) {
            parentNode = new _node2['default'](parentNode, {
                childrenAttribute: options.childrenAttribute
            });
        }
        var rootNode = parentNode || new _node2['default']((_ref = { // defaults
            parent: null
        }, _ref[options.childrenAttribute] = nodes, _ref.state = {
            depth: -1,
            open: true, // always open
            path: '',
            prefixMask: '',
            total: 0
        }, _ref), {
            childrenAttribute: options.childrenAttribute
        });

        if (rootNode === parentNode) {
            var subtotal = rootNode.state.total || 0;

            // Traversing up through its ancestors
            var p = rootNode;
            while (p) {
                var _p$state = p.state,
                    path = _p$state.path,
                    _p$state$total = _p$state.total,
                    total = _p$state$total === undefined ? 0 : _p$state$total;

                // Rebuild the lastChild pool

                if (p.isLastChild() && path) {
                    pool.lastChild[path] = true;
                }

                // Subtract the number 'subtotal' from the total of the root node and all its ancestors
                p.state.total = total - subtotal;
                if (p.state.total < 0) {
                    if (options.throwOnError) {
                        throw new Error('The node might have been corrupted: id=' + JSON.stringify(p.id) + ', state=' + JSON.stringify(p.state));
                    } else {
                        console && console.log('Error: The node might have been corrupted: id=%s, parent=%s, %s=%s, state=%s', JSON.stringify(p.id), p.parent, options.childrenAttribute, p[options.childrenAttribute], JSON.stringify(p.state));
                    }
                }

                p = p.parent;
            }
        }

        stack.push([rootNode, rootNode.state.depth, 0]);
    }

    while (stack.length > 0) {
        var _stack$pop = stack.pop(),
            current = _stack$pop[0],
            depth = _stack$pop[1],
            index = _stack$pop[2];

        var _loop = function _loop() {
            var node = current[options.childrenAttribute][index];
            if (!(node instanceof _node2['default'])) {
                node = new _node2['default'](node, {
                    childrenAttribute: options.childrenAttribute
                });
            }
            node.parent = current;
            node[options.childrenAttribute] = node[options.childrenAttribute] || [];

            // Ensure parent[options.childrenAttribute][index] is equal to the current node
            node.parent[options.childrenAttribute][index] = node;

            var path = current.state.path + '.' + index;
            var open = node.hasChildren() && function () {
                var openAllNodes = options.openAllNodes,
                    openNodes = options.openNodes;

                if (openAllNodes) {
                    return true;
                }
                // determine by node object
                if (openNodes.indexOf(node) >= 0) {
                    return true;
                }
                // determine by node id
                if (openNodes.indexOf(node.id) >= 0) {
                    return true;
                }
                return false;
            }();
            var prefixMask = function (prefix) {
                var mask = '';
                while (prefix.length > 0) {
                    prefix = prefix.replace(/\.\d+$/, '');
                    if (!prefix || pool.lastChild[prefix]) {
                        mask = '0' + mask;
                    } else {
                        mask = '1' + mask;
                    }
                }
                return mask;
            }(path);

            if (node.isLastChild()) {
                pool.lastChild[path] = true;
            }

            // This allows you to put extra information to node.state
            node.state = (0, _extend2['default'])({}, node.state, {
                depth: depth + 1,
                open: open,
                path: path,
                prefixMask: prefixMask,
                total: 0
            });

            var parentDidOpen = true;

            {
                // Check the open state from its ancestors
                var _p = node;
                while (_p.parent !== null) {
                    if (_p.parent.state.open === false) {
                        parentDidOpen = false;
                        break;
                    }
                    _p = _p.parent;
                }
            }

            if (parentDidOpen) {
                // Push the node to flatten list only if all of its parent nodes have the open state set to true
                flatten.push(node);

                // Update the total number of visible child nodes
                var _p2 = node;
                while (_p2.parent !== null) {
                    _p2.parent.state.total++;
                    _p2 = _p2.parent;
                }
            }

            ++index;

            if (node.hasChildren()) {
                // Push back parent node to the stack that will be able to continue
                // the next iteration once all the child nodes of the current node
                // have been completely explored.
                stack.push([current, depth, index]);

                index = 0;
                depth = depth + 1;
                current = node;
            }
        };

        while (index < current[options.childrenAttribute].length) {
            _loop();
        }
    }

    return flatten;
};

exports['default'] = flatten;