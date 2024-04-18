const mailer = require('../../../mailer');
const { db } = require('../../../models');
const { findVendorWithLowestPrice } = require('../../../utils');
const shiprocketService = require('../../shiprocketService/shiprocketService');
const Util = require("../../../helpers/Util");
const Sequelize = require("sequelize");
const { Op } = require("sequelize");
const axios = require('axios');
const cron = require('node-cron');


const findProductList = (array) => {
    return new Promise((resolve, reject) => {
        db.ProductVariant.findAll({
            attributes: ["id", "productName", "netPrice", "qty"],
            where: {
                productId: {
                    [Op.in]: array
                }
            },
            // include:[{ model: db.ProductVariant, attributes:["id","productName","netPrice"]},{ model: db.productphoto, attributes:["imgUrl"]}]

        })
            .then(list => {
                return Promise.all(list);
            })
            .then(r => {
                resolve(r);
            })
            .catch(err => {
                console.log(err);
                reject(err);
            })
    });
};

const findAddressList = (id) => {
    return new Promise((resolve, reject) => {
        db.Address.findOne({
            where: {
                id: id
            },
        })
            .then(list => {
                return list;
            })
            .then(r => {
                resolve(r);
            })
            .catch(err => {
                console.log(err);
                reject(err);
            })
    });
};

const sendDeliveryMail = async () => {
    try {
        const today = new Date();
        const startOfWeek = new Date(today);
        startOfWeek.setHours(0, 0, 0, 0);
        startOfWeek.setDate(today.getDate() - today.getDay());
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);
        endOfWeek.setHours(23, 59, 59, 999);
        const deliveredOrders = await db.Order.findAll({
            where: {
                createdAt: {
                    [Op.between]: [startOfWeek, endOfWeek]
                },
                status: 'delieverd'
            },
            attributes: ["id", "custId", "number", "grandtotal", "paymentmethod", "grandtotal", "status", "deliverydate", "createdAt", "shipment_id", "order_Id", "totalDiscount", "localDeliveryCharge"]
            // Include necessary associations if needed
        });
        // Filter out orders without custId
        const ordersWithCustId = deliveredOrders.map(order => order.custId);
        console.log("custIds**", ordersWithCustId);
        if (ordersWithCustId.length > 0) {
            const users = await db.customer.findAll({
                where: {
                    id: ordersWithCustId
                }
            });
            // Create a map of users by their id for easier lookup
            const usersMap = {};
            users.forEach(user => {
                usersMap[user.id] = user;
            });
            // Combine delivered orders with customer data
            const combinedData = deliveredOrders.map(order => ({
                order,
                customer: usersMap[order.custId]
            }));
            combinedData.forEach(async (data) => {
                if (data.customer && data.customer.email) {
                    await mailer.orderDelivered(data.customer.email);
                }
            });
            // res.status(200).json(combinedData);
        }
    } catch (err) {
        console.error(err);
        // res.status(500).json({ error: 'Internal server error' });
    }
}

cron.schedule('0 0 * * *', async () => {
    try {
        await sendDeliveryMail();
    } catch (err) {
        console.error('Error occurred during scheduled task:', err);
    }
});

updateOrdQuantityProd = async (ordProducts) => {
    try {
        if (!ordProducts || ordProducts.length === 0) {
            throw new Error('Invalid input. No products provided.');
        }

        const variantIds = ordProducts.map(product => product.selectedVariant.id);
        // console.log('Variant IDs:', variantIds); // Debug logging

        const variants = await db.ProductVariant.findAll({ where: { id: { [Op.in]: variantIds } } });
        // console.log('Variants found in DB:', variants); // Debug logging

        if (variants.length !== variantIds.length) {
            const foundVariantIds = variants.map(variant => variant.id);
            const notFoundVariantIds = variantIds.filter(id => !foundVariantIds.includes(id));
            throw new Error(`Variants not found for IDs: ${notFoundVariantIds.join(', ')}`);
        }

        // Update the quantity for each ordered product variant
        for (const ordProduct of ordProducts) {
            const variant = variants.find(v => v.id === ordProduct.selectedVariant.id);

            if (variant) {
                // Validate that the order quantity does not exceed the available quantity
                if (ordProduct.quantity > variant.qty) {
                    throw new Error(`Order quantity exceeds available quantity for variant ID ${variant.id}`);
                }

                // Update the variant quantity by subtracting the order quantity
                const updatedQuantity = variant.qty - ordProduct.quantity;

                // Update the variant quantity in the database
                await db.ProductVariant.update({ qty: updatedQuantity }, { where: { id: variant.id } });
            }
        }

        console.log('Product variant quantities updated successfully');
    } catch (error) {
        console.error('Error updating product variant quantities:', error.message || error);
        throw error;
    }
}

module.exports = {
    //    Shiprocket -------------Start
    // Modify the getOrderTracking function to handle Shiprocket webhook payload
    getOrderTracking: async (req, res, next) => {
        try {
            console.log('req.body**', req.body);
            const { awb, order_id } = req.body; // Retrieve awb and order_id from request body
            console.log("awb", awb);
            console.log("order_id", order_id);

            // if (!awb || !order_id) {
            //     return res.status(400).json({ success: false, message: 'Missing awb or order_id' });
            // }

            // // Assuming db.Orders is your Sequelize model
            // const order = await db.Order.findOne({ where: { sr_order_id: order_id } });

            // if (!order) {
            //     return res.status(400).json({ success: false, message: 'Order not found' });
            // }

            // // Assuming db.customer is your Sequelize model for customers
            // const customer = await db.customer.findOne({ where: { id: order.custId } });
            // const customer_email = customer?.dataValues?.email;

            // console.log("customer_email", customer_email);

            // if (!customer_email) {
            //     return res.status(400).json({ success: false, message: 'Missing customer_email' });
            // }

            // // Assuming db.OrdersScans is your Sequelize model for order scans
            // const scans = req.body.scans;
            // console.log("scans", scans);

            // let current_status = req.body.current_status;

            // // Construct the trackingLink based on the provided data
            // let trackingLink = `https://www.shiprocket.in/track/${awb}`;

            // const htmlContent = `
            //     <html>
            //     <body>
            //         <p>Your order with tracking ID ${awb} has the following status:</p>
            //         <p>${current_status}</p>
            //         <p>You can track your order <a href="${trackingLink}">here</a>.</p>
            //         <p>If you have any questions or concerns, feel free to contact us at ninobyvani@gmail.com.</p>
            //         <p>Thank you for shopping with us!</p>
            //     </body>
            //     </html>`;

            // await mailer.sendOrderTrackingEmail(customer_email, htmlContent);

            res.status(200).json({ success: true, message: 'Order tracking email sent successfully' });
        } catch (error) {
            console.error('Error retrieving or sending order tracking:', error);
            res.status(500).json({ success: false, message: 'Error retrieving or sending order tracking' });
        }
    },



    async calculateShippingCost(req, res) {
        try {
            const shippingData = {
                pickup_postcode: req.body.pickup_postcode,
                delivery_postcode: req.body.delivery_postcode,
                weight: req.body.weight,
                cod: req.body.cod
            }
            // Call the calculateShippingCost method
            const shippingCost = await shiprocketService.calculateShippingCost(shippingData);
            const json = shippingCost.data;
            const recommendedCourierId = json.recommended_courier_company_id;
            const filteredCharges = json.available_courier_companies.filter(charge => charge.courier_company_id === recommendedCourierId);

            const rateCharges = filteredCharges[0];
            const rate = rateCharges.rate;
            // console.log(rate);
            res.json({ success: true, rate });
        } catch (error) {
            res.status(500).json({ success: false, message: 'Error during shipping cost calculation' });
        }
    },

    async returnShiprocketOrder(req, res, next) {
        try {
            const { order_id } = req.body;

            // 1. Fetch all details of the order_id from db.Orders table
            const order = await db.Orders.findOne({ where: { order_id } });

            if (!order) {
                return res.status(500).json({ errors: ['Order not found'] });
            }

            const { addressId, custId } = order;

            // 2. Retrieve the details of the addressId from db.Address table
            const address = await db.Address.findOne({
                where: { id: addressId, custId },
            });

            if (!address) {
                return res.status(500).json({ errors: ['Address not found'] });
            }

            const productList = req.body.order_items;
            // 3. Filter the product details from db.ProductVariant table using the sku
            const products = await Promise.all(
                productList.map(async (product) => {
                    const productVariant = await db.ProductVariant.findOne({
                        where: { sku: product.sku },
                    });

                    return {
                        name: productVariant.name,
                        sku: productVariant.sku,
                        units: product.units,
                        selling_price: productVariant.selling_price,
                        discount: productVariant.discount ? productVariant.discount : product.discount,
                        qc_enable: productVariant.qc_enable,
                        qc_size: productVariant.qc_size ? productVariant.qc_size : '',
                        hsn: productVariant.hsn ? productVariant.hsn : '',
                    };
                })
            );
            // 4. Retrieve the customer details from db.Customer table
            const customer = await db.Customer.findOne({ where: { id: custId } });

            if (!customer) {
                return res.status(500).json({ errors: ['User not found'] });
            }
            const orderData = {
                order_id: order.order_id,
                order_date: order.order_date,
                channel_id: order.channel_id ? order.channel_id : '',
                pickup_customer_name: address.pickup_customer_name,
                pickup_last_name: address.pickup_last_name,
                company_name: address.company_name,
                pickup_address: address.pickup_address,
                pickup_address_2: address.pickup_address_2,
                pickup_city: address.pickup_city,
                pickup_state: address.pickup_state,
                pickup_country: address.pickup_country,
                pickup_pincode: address.pickup_pincode,
                pickup_email: address.pickup_email,
                pickup_phone: address.pickup_phone,
                pickup_isd_code: address.pickup_isd_code,
                shipping_customer_name: req.body.shipping_customer_name,
                shipping_last_name: req.body.shipping_last_name,
                shipping_address: req.body.shipping_address,
                shipping_address_2: req.body.shipping_address_2,
                shipping_city: req.body.shipping_city,
                shipping_country: req.body.shipping_country,
                shipping_pincode: req.body.shipping_pincode,
                shipping_state: req.body.shipping_state,
                shipping_email: req.body.shipping_email,
                shipping_isd_code: req.body.shipping_isd_code,
                shipping_phone: req.body.shipping_phone,
                order_items: products,
                payment_method: req.body.payment_method,
                total_discount: req.body.total_discount,
                sub_total: order.sub_total,
                length: req.body.length,
                breadth: req.body.breadth,
                height: req.body.height,
                weight: req.body.weight,
            };
            try {
                const shiprocketResponse = await shiprocketService.returnShiprocketOrder(orderData);
                const combinedResponse = {
                    shiprocketResponse: shiprocketResponse,
                    success: true,
                    message: 'Address updated successfully',
                };
                res.status(200).json(combinedResponse);
            } catch (error) {
                console.error(error);
                res.status(500).json({ error: 'Internal server error' });
            }
        } catch (err) {
            next(err);
        }
    },

    /* Add user api start here................................*/
    async index(req, res, next) {
        try {
            const { razorpay_payment_id, paymentMethod, deliveryAddress, grandTotal, deliveryId, total_discount, shipping_charges } = req.body;
            const productList = req.body.product;

            const customer = await db.customer.findOne({ where: { id: req.body.id ? req.body.id : null } });

            console.log("Ram")

            // if (!customer) {
            //     return res.status(500).json({ errors: ['User is not found'] });
            // }
            const t = await db.sequelize.transaction();
            try {
                const orderId = "OD" + Math.floor(Math.random() * Date.now());
                const orderData = {
                    order_id: orderId,
                    order_date: new Date().toISOString(),
                    pickup_location: "Primary",
                    channel_id: "",
                    comment: "",
                    billing_customer_name: deliveryAddress.name,
                    billing_last_name: deliveryAddress.lastName,
                    billing_address: deliveryAddress.StreetAddress,
                    billing_address_2: deliveryAddress.ShippingAddress,
                    billing_city: deliveryAddress.city,
                    billing_pincode: deliveryAddress.pincode,
                    billing_state: deliveryAddress.states,
                    billing_country: deliveryAddress.country,
                    billing_email: deliveryAddress.email,
                    billing_phone: deliveryAddress.phone,
                    shipping_is_billing: deliveryAddress.shipping_is_billing,
                    shipping_customer_name: deliveryAddress.name2 ? deliveryAddress.name2 : deliveryAddress.name,
                    shipping_last_name: deliveryAddress.lastName2 ? deliveryAddress.lastName2 : deliveryAddress.lastName,
                    shipping_address: deliveryAddress.StreetAddress2 ? deliveryAddress.StreetAddress2 : deliveryAddress.StreetAddress,
                    shipping_address_2: deliveryAddress.ShippingAddress2 ? deliveryAddress.ShippingAddress2 : deliveryAddress.ShippingAddress,
                    shipping_city: deliveryAddress.city2 ? deliveryAddress.city2 : deliveryAddress.city,
                    shipping_pincode: deliveryAddress.pincode2 ? deliveryAddress.pincode2 : deliveryAddress.pincode,
                    shipping_country: deliveryAddress.country2 ? deliveryAddress.country2 : deliveryAddress.country,
                    shipping_state: deliveryAddress.states2 ? deliveryAddress.states2 : deliveryAddress.states,
                    shipping_email: deliveryAddress.email2 ? deliveryAddress.email2 : deliveryAddress.email,
                    shipping_phone: deliveryAddress.phone2 ? deliveryAddress.phone2 : deliveryAddress.phone,
                    order_items: productList.map(product => ({
                        name: product.Name,
                        sku: product.productCode,
                        units: product.quantity,
                        selling_price: product.netPrice,
                        discount: product.discount ? product.discount : product.discountPer,
                        tax: product.tax ? product.tax : "0.00",
                        hsn: ""
                    })),
                    payment_method: paymentMethod ? paymentMethod : "postpaid",
                    shipping_charges: shipping_charges ? shipping_charges : 0,
                    giftwrap_charges: 0,
                    transaction_charges: 0,
                    total_discount: total_discount ? total_discount : 0,
                    sub_total: grandTotal,
                    length: req.body.length,
                    breadth: req.body.breadth,
                    height: req.body.height,
                    weight: req.body.weight
                };

                const shiprocketResponse = await shiprocketService.createOrder(orderData);

                console.log("shiprocketResponse*", shiprocketResponse)

                const order_id = shiprocketResponse.order_id; // Extract the order_id from the Shiprocket response
                const shipment_id = shiprocketResponse.shipment_id;

                let address;
                if (deliveryAddress) {
                    address = await db.Address.create({
                        orderId: order_id,
                        custId: req.body.id ? req.body.id : null,
                        fullname: deliveryAddress.name2 ? deliveryAddress.name2 : deliveryAddress.name,
                        phone: deliveryAddress.phone2 ? deliveryAddress.phone2 : deliveryAddress.phone,
                        city: deliveryAddress.city2 ? deliveryAddress.city2 : deliveryAddress.city,
                        discrict: deliveryAddress.discrict2 ? deliveryAddress.discrict2 : deliveryAddress.discrict,
                        states: deliveryAddress.states2 ? deliveryAddress.states2 : deliveryAddress.states,
                        StreetAddress: deliveryAddress.StreetAddress2 ? deliveryAddress.StreetAddress2 : deliveryAddress.StreetAddress,
                        shipping: deliveryAddress.ShippingAddress2 ? deliveryAddress.ShippingAddress2 : deliveryAddress.ShippingAddress,
                    }, { transaction: t });
                }
                const order = await db.Order.create({
                    addressId: address ? address.id : parseInt(deliveryId),
                    custId: customer ? customer.id : null,
                    number: deliveryAddress.phone2 ? deliveryAddress.phone2 : deliveryAddress.phone,
                    grandtotal: grandTotal,
                    paymentmethod: paymentMethod,
                    shipment_id: shipment_id,
                    order_Id: order_id,
                    razorpay_payment_id: razorpay_payment_id,
                    totalDiscount: req.body.total_discount ? req.body.total_discount : null,
                    localDeliveryCharge: shipping_charges,
                    couponCode: req.body.couponCode ? req.body.couponCode : null
                }, { transaction: t });

                const cartEntries = productList.map((product) => {
                    // console.log("Variant")
                    return {
                        orderId: order.id,
                        custId: customer ? customer.id : null,
                        addressId: address ? address.id : parseInt(deliveryId),
                        productId: product ? product.id : "",
                        varientId: product ? product.variantId : "",
                        qty: product ? product.quantity : "",
                    };
                });

                // console.log("cartEntries");

                if (cartEntries.length > 0) {
                    await db.Cart_Detail.bulkCreate(cartEntries, { transaction: t });
                }

                await db.OrderNotification.create({
                    orderId: order.id,
                    userId: customer ? customer.id : null
                }, { transaction: t });

                // Update product variant quantities
                await updateOrdQuantityProd(productList, t);

                await mailer.sendInvoiceForCustomerNew(
                    req.body,
                    address,
                    order_id,
                    shipment_id,
                    customer,
                    deliveryAddress,
                    { transaction: t }
                );

                await t.commit();

                res.status(200).json({ success: true, shiprocketResponse });
            } catch (err) {
                console.log(err);
                await t.rollback();
                throw new RequestError('Error', err);
            }
        } catch (err) {
            next(err); // Pass the error to the error handler middleware
        }
    },

    async getAllOrderList(req, res, next) {
        try {
            const arrData = [];
            const query = {
                where: {},
                attributes: ["id", "paymentmethod", "number", "grandtotal", "createdAt", "shipment_id", "order_Id"],
                order: [["createdAt", "DESC"]], // Sort by createdAt in descending order
                include: [
                    {
                        model: db.Cart_Detail,
                        include: [
                            {
                                model: db.ProductVariant,
                                as: "varient",
                                attributes: [
                                    "id",
                                    "productId",
                                    "productName",
                                    "thumbnail",
                                    "actualPrice",
                                    "discount",
                                    "netPrice"
                                ],
                                include: [
                                    {
                                        model: db.product,
                                        attributes: ["id", "photo"],
                                        include: [
                                            {
                                                model: db.user,
                                                as: "users",
                                                attributes: ["id", "firstName", "lastName"]
                                            }
                                        ]
                                    }
                                ]
                            }
                        ],
                        where: req.body.status ? { status: req.body.status } : {}
                    },
                    { model: db.customer, as: "user", attributes: ["id", "email"] },
                    { model: db.Address, as: "address" }
                ]
            };

            const limit = req.body.limit ? Number(req.body.limit) : 10;
            const page = req.body.page ? Number(req.body.page) : 1;
            const offset = (page - 1) * limit;

            query.offset = offset;
            query.limit = limit;

            const orderList = await db.Order.findAndCountAll(query);

            if (orderList) {
                orderList.rows.forEach((value) => {
                    const dataList = {
                        id: value.id,
                        payment: value.paymentmethod,
                        OrderNo: value.number,
                        CustomerName: value.address ? value.address.fullname : null,
                        shipping: value.address ? value.address.shipping : null,
                        phone: value.address ? value.address.phone : null,
                        StreetAddress: value.address ? value.address.StreetAddress : null,
                        email: value.user ? value.user.email : null,
                        OrderDate: value.createdAt,
                        Status: value.name,
                        Total: value.grandtotal,
                        count: value.Cart_Details.length,
                        Items: value.Cart_Details,
                        shipment_id: value.shipment_id,
                        order_Id: value.order_Id
                    };
                    arrData.push(dataList);
                });

                let filteredData = arrData;
                if (req.body.searchString) {
                    const Keys = ["payment", "OrderNo", "CustomerName", "OrderDate", "shipping", "phone", "order_Id", "id"];
                    filteredData = arrData.filter(item =>
                        Keys.some((key) => {
                            const value = item[key];
                            return typeof value === "string" && value.toLowerCase().includes(req.body.searchString);
                        })
                    );
                }

                const pages = Math.ceil(orderList.count / limit);
                const finalResult = {
                    count: orderList.count,
                    pages: pages,
                    items: filteredData,
                };
                const response = Util.getFormatedResponse(false, finalResult, {
                    message: "Success"
                });
                res.status(response.code).json(response);
            } else {
                const response = Util.getFormatedResponse(false, {
                    message: "No data found"
                });
                res.status(response.code).json(response);
            }
        } catch (err) {
            res.status(500).json({ errors: "" + err });
        }
    },

    async statusUpdate(req, res, next) {
        try {
            const { id, status, deliverydate } = req.body;
            db.Cart_Detail.findOne({ where: { id: id } })
                .then(list => {
                    return db.Cart_Detail.update({
                        status: status,
                        deliveryDate: deliverydate ? deliverydate : list.deliverydate
                    }, { where: { id: id } })
                })
                .then((success) => {
                    res.status(200).json({ 'success': true, msg: "Successfully Updated Status" });
                })
                .catch(function (err) {
                    next(err)
                });
        }
        catch (err) {
            res.status(500).json({ 'errors': "" + err });
        }
    },

    async getAllOrderListById(req, res, next) {
        try {
            db.Order.findAll({
                attributes: ["id", "number", "grandtotal", "status", "createdAt", "paymentmethod", "deliverydate", "couponCode", "shipment_id"],
                where: { custId: req.body.id },
                order: [['createdAt', 'DESC']],
                include: [
                    {
                        model: db.Cart_Detail, attributes: ["id", "qty", "status", "deliveryDate"],
                        include: [
                            { model: db.product, as: "product", attributes: ["id", "name", "photo"] },
                            { model: db.ProductVariant, as: "varient" },
                            { model: db.productphoto, as: "thumbnail", attributes: ["productId", "imgUrl"] },
                        ]
                    },
                    { model: db.Address }
                ],
            })
                .then(list => {
                    res.status(200).json({ 'success': true, order: list });
                })
                .catch(function (err) {
                    console.log(err)
                    next(err)
                });
        }
        catch (err) {
            console.log(err)
            res.status(500).json({ 'errors': "" + err });
        }
    },

    async getAllOrderStatus(req, res, next) {
        try {
            db.Order.findAll({
                where: { status: req.body.status },
                order: [['createdAt', 'DESC']],
                include: [{ model: db.Address, include: [{ model: db.Cart }] }],
            })
                .then(list => {
                    res.status(200).json({ 'success': true, order: list });
                })
                .catch(function (err) {
                    next(err)
                });
        }
        catch (err) {
            res.status(500).json({ 'errors': "" + err });
        }
    },

    async getAllOrderCount(req, res, next) {
        try {
            db.Cart_Detail.findAll({
                attributes: ['status', [Sequelize.fn('COUNT', Sequelize.col('status')), 'total']],
                group: ['status']
            })
                .then(list => {
                    res.status(200).json({ 'success': true, data: list });
                })
                .catch(function (err) {
                    next(err)
                });
        }
        catch (err) {
            res.status(500).json({ 'errors': "" + err });
        }
    },

    async getOrderNotifications(req, res, next) {
        const TODAY_START = new Date().setHours(0, 0, 0, 0);
        const tomorrow = new Date(TODAY_START)
        tomorrow.setDate(tomorrow.getDate() + 1)
        try {
            db.OrderNotification.findAll({
                attributes: ["id", "orderId"],
                where: {
                    createdAt: {
                        [Op.gt]: TODAY_START,
                        [Op.lt]: tomorrow
                    }
                },
                include: [
                    {
                        model: db.Cart_Detail, attributes: ["id", "productId"], as: "details",
                        include: [{
                            model: db.product, as: "product_detail",
                            include: [{ model: db.productphoto, attributes: ["imgurl"] }]
                        }]
                    }
                ],
            })
                .then(list => {
                    res.status(200).json({ 'success': true, data: list, count: list.length });
                })
                .catch(function (err) {
                    next(err)
                });
        }
        catch (err) {
            res.status(500).json({ 'errors': "" + err });
        }
    },

    async getOrderDetailsById(req, res, next) {
        try {
            db.Cart_Detail.findOne({
                attributes: ["id", "qty", "status", "deliveryDate"],
                where: { id: req.body.id, /* custId: req.user.id */ },
                include: [
                    { model: db.Address, as: "address" },
                    { model: db.Order, as: "order", attributes: ["id", "number"] },
                    { model: db.product, as: "product", attributes: ["id", "name"] },
                    { model: db.ProductVariant, as: "varient" },
                    { model: db.productphoto, as: "thumbnail", attributes: ["productId", "imgUrl"] },
                ]
            })
                .then(list => {
                    res.status(200).json({ 'success': true, data: list });
                })
                .catch(function (err) {
                    next(err)
                });
        }
        catch (err) {
            res.status(500).json({ 'errors': "" + err });
        }
    },

    async getOrderDeleteByProduct(req, res, next) {
        let { orderId, cartId, price } = req.body;
        try {
            db.Order.findOne({
                where: { id: orderId, custId: req.user.id },
                include: [{ model: db.Cart_Detail }]
            })
                .then(async list => {
                    const t = await db.sequelize.transaction();
                    if (list) {
                        let newPrice = Math.round(list.grandtotal - price)
                        try {
                            let cart = await db.Cart_Detail.destroy({
                                where: { id: cartId }
                            }, { transaction: t })

                            let order = await db.Order.update({
                                grandtotal: newPrice
                            }, { where: { id: orderId } })

                            return t.commit();
                        }
                        catch (err) {
                            console.log(err)
                            await t.rollback()
                            throw new RequestError('Error', err);
                        }

                    }
                })
                .then(success => {
                    res.status(200).json({ 'success': true, message: "Successfully Deleted Product from list" });
                })

        }
        catch (err) {
            res.status(500).json({ 'errors': "" + err });
        }
    },

    async deleteOrderList(req, res, next) {
        try {
            const order = await db.Order.findOne({ where: { id: req.body.id } });
            // const order_Id = Order.order_Id;
            // const shiprocketResponse = await shiprocketService.cancelOrder(order_Id);
            db.Order.destroy({
                where: { id: order.id },
            });
            const result = await db.Cart_Detail.destroy({
                where: { orderId: order.id },
            });
            if (result) {
                return res.status(200).json({
                    success: true,
                    message: "Successfully canceled order list",
                });
            } else {
                return res.status(500).json({
                    'errors': "Failed to delete cart details",
                });
            }
        } catch (err) {
            res.status(500).json({ 'errors': "" + err });
        }
    },

    async orderStatusIssue(req, res, next) {
        let { id, orderId, productId, issue, comment } = req.body;
        try {
            db.Order_Details_Status.findOne({
                where: { id: id, custId: req.user.id },
            })
                .then(async list => {
                    if (!list) {
                        return db.Order_Details_Status.create({
                            orderId: orderId,
                            issue: issue,
                            comment: comment,
                        })
                    }
                })
                .then(success => {
                    res.status(200).json({ 'success': true, message: "Successfully add status in the list" });
                })

        }
        catch (err) {
            res.status(500).json({ success: false, message: "Unfortuntely something is wrong" });
        }
    },

    async getOrderCancel(req, res, next) {
        let { cartId, orderId, issue, comment } = req.body;
        try {
            const Order = await db.Order.findOne({ where: { id: orderId } });
            const order_Id = Order.order_Id;
            const shiprocketResponse = await shiprocketService.cancelOrder(order_Id);

            const list = await db.Cart_Detail.findOne({
                where: { id: cartId, orderId: orderId },
            });

            if (list) {
                const t = await db.sequelize.transaction();
                try {
                    await db.Order_Details_Status.create(
                        {
                            orderId: orderId,
                            custId: Order.custId,
                            productId: list.productId,
                            status: 0,
                            issue: issue,
                            comment: comment,
                        },
                        { transaction: t }
                    );

                    await db.Cart_Detail.update(
                        {
                            status: "cancelRequest",
                            deliveryDate: new Date(),
                        },
                        { where: { id: list.id }, transaction: t }
                    );

                    await t.commit();

                    res.status(200).json({
                        success: true,
                        message: "Successfully canceled order list",
                        shiprocketResponse,
                    });
                } catch (err) {
                    console.log(err);
                    await t.rollback();
                    throw new RequestError('Error', err);
                }
            } else {
                res.status(404).json({
                    success: false,
                    message: "Cart detail not found",
                });
            }
        } catch (err) {
            console.log(err);
            res
                .status(500)
                .json({ success: false, message: "Unfortunately, something went wrong" });
        }
    },

    async getupdateOrederAddress(req, res, next) {
        try {
            const {
                addressId,
                custId,
                fullname,
                phone,
                StreetAddress,
                ShippingAddress,
                city,
                district = "",
                states,
                pincode,
            } = req.body;


            const address = await db.Address.findOne({
                where: { id: addressId, custId: custId },
            });


            if (!address) {
                return res.status(500).json({ errors: ['User is not found'] });
            }

            const t = await db.sequelize.transaction();
            try {
                await db.Address.update(
                    {
                        fullname: fullname,
                        phone: phone,
                        shipping: ShippingAddress,
                        StreetAddress: StreetAddress,
                        city: city,
                        district: district,
                        states: states,
                        pincode: pincode,
                    },
                    { where: { id: addressId, custId: custId }, transaction: t }
                );

                await t.commit();

                // Call updateCustomerAddress function with the updated address data
                const orderData = {
                    order_id: address.orderId,
                    shipping_customer_name: fullname,
                    shipping_phone: phone,
                    shipping_address: ShippingAddress,
                    shipping_address_2: StreetAddress,
                    shipping_city: city,
                    shipping_state: states,
                    shipping_country: "India",
                    shipping_pincode: pincode,
                };

                try {
                    const shiprocketResponse = await shiprocketService.updateCustomerAddress(orderData);
                    const combinedResponse = {
                        shiprocketResponse: shiprocketResponse,
                        success: true,
                        message: 'Address updated successfully'
                    };
                    res.status(200).json(combinedResponse);
                } catch (error) {
                    console.error(error); // Log the error for debugging purposes
                    res.status(500).json({ error: 'Internal server error' }); // Send a generic error response
                }
            } catch (err) {
                console.log(err);
                await t.rollback();
                throw new RequestError('Error', err);
            }
        } catch (err) {
            next(err); // Pass the error to the error handler middleware
        }
    },

    async getDetailAdmin(req, res, next) {
        try {
            // Fetch data from the database using Sequelize or any other ORM
            const orders = await db.Order.findAll({
                attributes: [
                    [db.Sequelize.fn("sum", db.Sequelize.col("totalDiscount")), "totalDiscount"],
                    [db.Sequelize.fn("sum", db.Sequelize.col("grandtotal")), "grandtotal"],
                    // [db.Sequelize.fn("sum", db.Sequelize.col("grandtotal")), "totalSales"],
                ],
            });

            // Extract the calculated totals from the result
            const totalDiscount = orders[0].get("totalDiscount");
            const grandtotal = orders[0].get("grandtotal");
            // const totalSales = orders[0].get("totalSales");

            // Add the totals to the arrData array
            const arrData = [
                { name: "Total Discount", value: totalDiscount },
                { name: "Total Selling", value: grandtotal },
                // { name: "Total Sales", value: totalSales },
            ];
            // Send the response with the data
            res.status(200).json(arrData);
        } catch (err) {
            res.status(500).json({ errors: "" + err });
        }
    },

    async getreturnAllOrder(req, res, next) {
        try {
            response = shiprocketService.returnAllShiprocketOrder()

            res.status(200).json({ 'success': true, message: "Successfully Deleted Order from list", response });

        }
        catch (err) {
            res.status(500).json({ 'errors': "" + err });
        }
    },

    async getAllOrderGraph(req, res, next) {
        try {
            const arrData = [];
            const query = {
                where: {},
                attributes: ["id", "paymentmethod", "number", "grandtotal", "createdAt", "shipment_id", "order_Id"],
                order: [["createdAt", "DESC"]],
                include: [
                    {
                        model: db.Cart_Detail,
                        include: [
                            {
                                model: db.ProductVariant,
                                as: "varient",
                                attributes: [
                                    "id",
                                    "productId",
                                    "productName",
                                    "thumbnail",
                                    "actualPrice",
                                    "discount",
                                    "netPrice"
                                ],
                                include: [
                                    {
                                        model: db.product,
                                        attributes: ["id", "photo"],
                                        include: [
                                            {
                                                model: db.user,
                                                as: "users",
                                                attributes: ["id", "firstName", "lastName"]
                                            }
                                        ]
                                    }
                                ]
                            }
                        ],
                        // Use separate subquery to filter based on status from cart_detail table
                        where: req.body.status ? { status: req.body.status } : {}
                    },
                    { model: db.customer, as: "user", attributes: ["id", "email"] },
                    { model: db.Address, as: "address" }
                ]
            }

            const orderList = await db.Order.findAndCountAll(query);
            if (orderList) {
                orderList.rows.forEach((value) => {
                    const dataList = {
                        id: value.id,
                        payment: value.paymentmethod,
                        OrderNo: value.number,
                        CustomerName: value.address ? value.address.fullname : null,
                        shipping: value.address ? value.address.shipping : null,
                        phone: value.address ? value.address.phone : null,
                        StreetAddress: value.address ? value.address.StreetAddress : null,
                        email: value.user ? value.user.email : null,
                        OrderDate: value.createdAt,
                        Status: value.name,
                        Total: value.grandtotal,
                        count: value.Cart_Details.length,
                        Items: value.Cart_Details,
                        shipment_id: value.shipment_id,
                        order_Id: value.order_Id
                    };
                    arrData.push(dataList);
                });

                const finalResult = {
                    count: arrData.count,
                    items: arrData,
                };
                const response = Util.getFormatedResponse(false, finalResult, {
                    message: "Success"
                });
                res.status(response.code).json(response);
            } else {
                const response = Util.getFormatedResponse(false, {
                    message: "No data found"
                });
                res.status(response.code).json(response);
            }
        } catch (err) {
            res.status(500).json({ errors: "" + err });
        }
    },



}

// async getAllOrderList(req, res, next) {
//     try {
//         const config = {
//             method: 'get',
//             maxBodyLength: Infinity,
//             url: 'https://apiv2.shiprocket.in/v1/external/orders',
//             headers: {
//                 'Content-Type': 'application/json',
//                 'Authorization': `Bearer ${process.env.SHIPROCKET_TOKEN}`,
//             },
//         };

//         const responseData = await axios(config);
//         const allOrders = responseData.data.data;

//         // Filter active orders (excluding canceled)
//         const activeOrders = allOrders.filter(order => order.status !== 'CANCELED');

//         async function getProduct(productName) {
//             const productData = await db.product.findOne({
//                 where: { name: productName },
//             });
//             return productData;
//         }

//         const formattedOrders = await Promise.all(
//             activeOrders.map(async (order) => {
//                 const formattedProducts = await Promise.all(
//                     order.products.map(async (product) => {
//                         const productName = product.name;
//                         const productData = await getProduct(productName);
//                         return {
//                             id: product.id,
//                             orderId: order.id,
//                             addressId: null,
//                             productId: productData.product_id,
//                             varientId: product.id,
//                             qty: product.quantity,
//                             status: product.status,
//                             deliveryDate: product.delivered_date || null,
//                             createdAt: order.created_at,
//                             updatedAt: order.updated_at,
//                             varient: {
//                                 id: product.id,
//                                 productId: productData.id,
//                                 productName: product.name,
//                                 thumbnail: productData.photo,
//                                 actualPrice: parseFloat(product.price),
//                                 discount: parseFloat(product.discount),
//                                 netPrice: parseFloat(product.product_cost),
//                                 product: {
//                                     id: productData.id,
//                                     users: null,
//                                 },
//                             },
//                         };
//                     })
//                 );
//                 return {
//                     id: order.id,
//                     payment: order.payment_method,
//                     OrderNo: order.channel_order_id,
//                     CustomerName: order.customer_name,
//                     shipping: order.customer_address_2,
//                     phone: order.customer_phone,
//                     StreetAddress: order.customer_address,
//                     city: order.customer_city,
//                     state: order.customer_state,
//                     pincode: order.customer_pincode,
//                     country: order.customer_country,
//                     email: order.customer_email,
//                     OrderDate: order.created_at,
//                     Total: parseFloat(order.total),
//                     count: order.products.length,
//                     Items: formattedProducts,
//                     shipment_id: order.shipments[0].id,
//                     order_Id: order.id,
//                 };
//             })
//         );

//         // Pagination
//         const limit = 10;
//         const page = 1;
//         const startIndex = (page - 1) * limit;
//         const endIndex = startIndex + limit;
//         const paginatedData = formattedOrders.slice(startIndex, endIndex);
//         const finalResult = {
//             count: formattedOrders.length,
//             pages: Math.ceil(formattedOrders.length / limit),
//             items: paginatedData,
//         };

//         const response = Util.getFormatedResponse(false, finalResult, {
//             message: 'Success',
//         });
//         res.status(response.code).json(response);
//     } catch (err) {
//         console.error(err);
//         res.status(500).json({ errors: "An error occurred" });
//     }
// }