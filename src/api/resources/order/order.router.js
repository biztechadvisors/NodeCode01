const express = require('express');
const orderController = require('./order.controller');
const { jwtStrategy, jwtCustomerStrategy } = require('../../../middleware/strategy');

const orderRouter = express.Router();

// Track order route
orderRouter.route('/track-order').get(jwtCustomerStrategy, orderController.getOrderTracking);

// Calculate shipping cost route
orderRouter.route('/calculateShippingCost').get(orderController.calculateShippingCost);

// Shiprocket update address route
orderRouter.route('/shiprocket-updateAddress').post(jwtCustomerStrategy, orderController.getupdateOrederAddress);

// Create order route
orderRouter.route('/create').post(orderController.index);

// List all orders route
orderRouter.route('/list').post(orderController.getAllOrderList);

// List total dash orders route
orderRouter.route('/totalDash-list').get(orderController.getDetailAdmin);

// Update order status route
orderRouter.route('/status/update').post(jwtStrategy, orderController.statusUpdate);

// List orders by customer route
orderRouter.route('/list-by-customer').post(jwtCustomerStrategy, orderController.getAllOrderListById);

// Get all order statuses route
orderRouter.route('/status').post(jwtStrategy, orderController.getAllOrderStatus);

// Get order count route
orderRouter.route('/count').get(orderController.getAllOrderCount);

// Get order notifications route
orderRouter.route('/notifications').get(jwtStrategy, orderController.getOrderNotifications);

// Get order details by ID route
orderRouter.route('/details-by-id').post(jwtCustomerStrategy, orderController.getOrderDetailsById);

// Delete order by product route
orderRouter.route('/delete-by-product').post(jwtCustomerStrategy, orderController.getOrderDeleteByProduct);

// Delete order list route
orderRouter.route('/delete-list').post(jwtStrategy, orderController.deleteOrderList);

// Order status issue route
orderRouter.route('/status-issue').post(jwtCustomerStrategy, orderController.orderStatusIssue);

// Cancel order by product route
orderRouter.route('/cancel-by-product').post(jwtCustomerStrategy, orderController.getOrderCancel);

// Get return orders route
orderRouter.route('/getReturn-allOrder').post(jwtCustomerStrategy, orderController.getreturnAllOrder);

module.exports = orderRouter;
