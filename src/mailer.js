const nodemailer = require("nodemailer");
const config = require("./config");
const { db } = require("./models");
const CryptoJS = require("crypto-js");
const PDFDocument = require('pdfkit');
// const puppeteer = require('puppeteer');
const fs = require('fs')
const pdf = require('html-pdf');


module.exports = {
  sendOtp: (email, key, otp) => {
    return new Promise((resolve, reject) => {
      try {
        db.customer.findOne({ where: { email: email } }).then((user) => {
          if (user) {
            var smtpTransport = nodemailer.createTransport({
              host: process.env.MAIL_HOST,
              port: process.env.MAIL_PORT,
              secure: true,
              auth: {
                user: process.env.MAIL_USERNAME,
                pass: process.env.MAIL_PASSWORD,
              },
              //tls: { rejectUnauthorized: false },
            });
            smtpTransport.sendMail(
              {
                from: process.env.MAIL_FROM,
                to: email,
                subject: "NinoByVani: OTP for Verify Email",
                html:
                  "Dear user,<br><br> Thank you for registering with Nino.<br> <br> <b> <strong>One Time OTP:</strong> " +
                  otp +
                  " </b><br> <br> This is a system generated mail. Please do not reply to this email ID.<br>Warm Regards,<br> Customer Care<br> Nino",
              },
              function (error, info) {
                if (error) {
                  return reject({
                    name: "NinoByVaniException",
                    message: "Email Sending Failed",
                    error: error,
                  });
                }
                return resolve(true);
              }
            );
          } else
            throw {
              name: "NinoByVaniException",
              msg: "Email Body not available",
            };
        });
      } catch (err) {
        reject(err);
      }
    });
  },

  //**************************************// 
  sendResetUserPassword: (email) => {
    return new Promise((resolve, reject) => {
      try {
        db.user.findOne({ where: { email: email } }).then((user) => {
          if (user) {
            var smtpTransport = nodemailer.createTransport({
              host: process.env.MAIL_HOST,
              port: process.env.MAIL_PORT,
              secure: true,
              auth: {
                user: process.env.MAIL_USERNAME,
                pass: process.env.MAIL_PASSWORD,
              },
              tls: { rejectUnauthorized: false },
            });

            const link = `${process.env.SHOP_URL}/auth/ForgotPass?email=${email}`

            const emailContent = `
      <html>
      <head>
          <style>
              body {
                  font-family: Arial, sans-serif;
                  background-color: #f2f2f2;
                  padding: 20px;
              }
              .email-container {
                  background-color: #ffffff;
                  padding: 20px;
                  border-radius: 10px;
                  box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.1);
              }
              .link {
                  color: #007bff;
                  text-decoration: none;
              }
              .footer {
                  font-size: 12px;
                  color: #777;
                  margin-top: 20px;
              }
          </style>
      </head>
      <body>
          <div class="email-container">
              <h2>Ninobyvani: Reset Password</h2>
              <p>Dear user,</p>
              <p>Thank you for resetting your password with Ninobyvani.</p>
              
              <p>Click on the following link to create a new password:</p>
              <p><a class="link" href="${link}">Reset Password</a></p>
              
              <p>This link will expire in 2 minute.</p>
              <p class="footer">This is a system-generated email. Please do not reply to this email ID.</p>
              
              <p class="footer">Warm Regards,<br>Customer Care<br>Ninobyvani</p>
          </div>
      </body>
      </html>
  `;
            smtpTransport.sendMail(
              {
                from: process.env.MAIL_FROM,
                to: email,
                subject: "Ninobyvani: Reset Password",
                html: emailContent,
              },
              function (error, info) {
                if (error) {
                  return reject({
                    name: "NinobyvaniException",
                    message: "Email Sending Failed",
                    error: error,
                  });
                }
                return resolve(true);
              }
            );
          } else
            throw {
              name: "TilitsoException",
              msg: "Email Body not available",
            };
        });
      } catch (err) {
        reject(err);
      }
    });
  },


  //   successfullyRegister: async (email) => {
  //     try {
  //         const user = await db.customer.findOne({ where: { email: email } });
  //         if (user) {
  //             const smtpTransport = nodemailer.createTransport({
  //                 host: process.env.MAIL_HOST,
  //                 port: process.env.MAIL_PORT,
  //                 secure: true,
  //                 auth: {
  //                     user: process.env.MAIL_USERNAME,
  //                     pass: process.env.MAIL_PASSWORD,
  //                 },
  //             });
  //             await smtpTransport.sendMail({
  //                 from: process.env.MAIL_FROM,
  //                 to: email,
  //                 subject: "Registration Successful",
  //                 html: "Dear user,<br><br> Congratulations! Your registration with Nino has been successfully completed.<br><br>Thank you for choosing Nino. Enjoy shopping with us!<br><br>This is a system-generated email. Please do not reply to this email ID.<br><br>Warm Regards,<br>Customer Care<br>Nino",
  //             });
  //             return true; // Email sent successfully
  //         } else {
  //             throw {
  //                 name: "NinoByVaniException",
  //                 msg: "User not found",
  //             };
  //         }
  //     } catch (error) {
  //         throw {
  //             name: "NinoByVaniException",
  //             message: "Email Sending Failed",
  //             error: error,
  //         };
  //     }
  // },


  sendEmployeePassword: (email, key) => {
    return new Promise((resolve, reject) => {
      try {
        db.customer.findOne({ where: { email: email } }).then((user) => {
          if (user) {
            var smtpTransport = nodemailer.createTransport({
              host: process.env.MAIL_HOST,
              port: process.env.MAIL_PORT,
              secure: true,
              auth: {
                user: process.env.MAIL_USERNAME,
                pass: process.env.MAIL_PASSWORD,
              },
              //tls: { rejectUnauthorized: false },
            });
            smtpTransport.sendMail(
              {
                from: process.env.MAIL_FROM,
                to: email,
                subject: "souqarena: Online Shopping Center",
                html:
                  "Dear user,<br><br> Thank you for registering with Janakpur.<br> <br> <b> <strong>Click Here:</strong> " +
                  process.env.SALON_URL +
                  "/verify/" +
                  email +
                  "/" +
                  key +
                  " </b><br> <br> This link will expire in 30sec. <br> This is a system generated mail. Please do not reply to this email ID.<br>Warm Regards,<br> Customer Care<br> souqarena",
                // html: "Hi <br>" + "Your One Time Password(OTP) for completing your registeration on KDMARC is  " + password + " .Please do not share OTP with anyone .<br> Best Regards, <br> Team KDMARC",
              },
              function (error, info) {
                if (error) {
                  return reject({
                    name: "souqarenaException",
                    msg: "Email Sending Failed",
                  });
                }
                return resolve(true);
              }
            );
          } else
            throw {
              name: "GrocerrryException",
              msg: "Email Body not available",
            };
        });
      } catch (err) {
        reject(err);
      }
    });
  },
  sendEmailToVendor: (email, productName) => {
    var smtpTransport = nodemailer.createTransport({
      host: process.env.MAIL_HOST,
      port: process.env.MAIL_PORT,
      // ignoreTLS: false,
      secure: true,
      auth: {
        user: process.env.MAIL_USERNAME,
        pass: process.env.MAIL_PASSWORD,
      },
      //tls: { rejectUnauthorized: false },
    });
    smtpTransport.sendMail(
      {
        from: process.env.MAIL_FROM,
        to: email,
        subject: "New Order",
        text: `You Just received an order for ${productName}`,
      },
      function (error, info) {
        if (error || (info && info.rejected.length)) {
          return reject({
            name: "Exception",
            msg: "Email Sending Failed",
            error: error,
          });
        }
        return resolve(true);
      }
    );
  },

  //**************************************// 
  sendResetPassword: (email) => {
    return new Promise((resolve, reject) => {
      try {
        db.customer.findOne({ where: { email: email } }).then((user) => {
          if (user) {
            var smtpTransport = nodemailer.createTransport({
              host: process.env.MAIL_HOST,
              port: process.env.MAIL_PORT,
              secure: true,
              auth: {
                user: process.env.MAIL_USERNAME,
                pass: process.env.MAIL_PASSWORD,
              },
              //tls: { rejectUnauthorized: false },
            });

            var encryptEmail = CryptoJS.AES.encrypt(email, 'TEDbuddyIndsFia').toString();
            const link = `https://nino-seven.vercel.app/page-create-password?email=${encodeURIComponent(encryptEmail)}`

            const emailContent = `
    <html>
    <head>
        <style>
            body {
                font-family: Arial, sans-serif;
                background-color: #f2f2f2;
                padding: 20px;
            }
            .email-container {
                background-color: #ffffff;
                padding: 20px;
                border-radius: 10px;
                box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.1);
            }
            .link {
                color: #007bff;
                text-decoration: none;
            }
            .footer {
                font-size: 12px;
                color: #777;
                margin-top: 20px;
            }
        </style>
    </head>
    <body>
        <div class="email-container">
            <h2>NinoByVani: Reset Password</h2>
            <p>Dear user,</p>
            <p>Thank you for resetting your password with NinoByVani.</p>
            
            <p>Click on the following link to create a new password:</p>
            <p><a class="link" href="${link}">Create New Password</a></p>
            
            <p>This link will expire in 30 seconds.</p>
            <p class="footer">This is a system-generated email. Please do not reply to this email ID.</p>
            
            <p class="footer">Warm Regards,<br>Customer Care<br>NinoByVani</p>
        </div>
    </body>
    </html>
`;
            smtpTransport.sendMail(
              {
                from: process.env.MAIL_FROM,
                to: email,
                subject: "NinoByVani: Reset Password",
                html: emailContent,
              },
              function (error, info) {
                if (error) {
                  return reject({
                    name: "NinoByVaniException",
                    message: "Email Sending Failed",
                    error: error,
                  });
                }
                return resolve(true);
              }
            );
          } else
            throw {
              name: "NinoByVaniException",
              msg: "Email Body not available",
            };
        });
      } catch (err) {
        reject(err);
      }
    });
  },

  sendInvoiceForCustomer: (body, list, address, name, orderNo, user) => {
    const htmlHeader = `<html>
        <body
          style="background-color:#fbfbfb;font-family: Open Sans, sans-serif;font-size:100%;font-weight:400;line-height:1.4;color:#000;">
          <table
            style="min-width:650px;margin:50px auto 10px;background-color:#fff;padding:50px;-webkit-border-radius:3px;-moz-border-radius:3px;border-radius:3px;-webkit-box-shadow:0 1px 3px rgba(0,0,0,.12),0 1px 2px rgba(0,0,0,.24);-moz-box-shadow:0 1px 3px rgba(0,0,0,.12),0 1px 2px rgba(0,0,0,.24);box-shadow:0 1px 3px rgba(0,0,0,.12),0 1px 2px rgba(0,0,0,.24); border-top: solid 10px #88b433;">
            <thead>
              <tr>
                <th style="text-align:left;"><img style="max-width: 80px;height:70px"
                    src="https://grociproduct.s3.ap-south-1.amazonaws.com/favicon.png" width='80' alt="souqarena"></th>
                <th style="text-align:right;font-weight:bold;font-size: 14px;">${new Date()
        .toISOString()
        .slice(0, 10)}</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style="height:35px;"></td>
              </tr>
              <tr>
                <td style="width:50%;padding:2px;vertical-align:top">
                  <p style="margin:0 0 10px 0;padding:0;font-size:14px;"><span
                      style="display:block;font-weight:bold;font-size:14px">Name</span> ${name}</p>
                </td>
                <td style="width:50%;padding:2px;vertical-align:top">
                  <p style="margin:0 0 10px 0;padding:0;font-size:14px;"><span
                      style="display:block;font-weight:bold;font-size:14px;">Email</span> ${user.email}</p>
                </td>
              </tr>
              <tr>
                <td colspan="2" style="border: solid 1px #ddd; padding:10px 20px;">
                  <p style="font-size:14px;margin:0 0 6px 0;"><span
                      style="font-weight:bold;display:inline-block;min-width:150px">Order status</span><b
                      style="color:green;font-weight:normal;margin:0">Success</b></p>
                  <p style="font-size:14px;margin:0 0 6px 0;"><span
                      style="font-weight:bold;display:inline-block;min-width:146px">Order ID</span> ${orderNo}</p>
                  <p style="font-size:14px;margin:0 0 0 0;"><span
                      style="font-weight:bold;display:inline-block;min-width:146px">Order amount</span> Rs. ${body.grandTotal
      }</p>
                <p style="font-size:14px;margin:0 0 6px 0;"><span style="font-weight:bold;display:inline-block;min-width:146px">Phone No</span> ${address ? address.phone : body.deliveryAddress.phone
      }</p>
                      <p style="font-size:14px;margin:0 0 0 0;"><span style="font-weight:bold;display:inline-block;min-width:146px">Shipping Address</span>${address
        ? address.shipping
        : body.deliveryAddress.ShippingAddress
      }  </p>
                </td>
              </tr>
              <tr>
                <td style="height:20px;"></td>
              </tr>
        
              <tr>
                <td colspan="2" style="font-size:14px;padding:2px;font-weight: bold;">Items</td>
              </tr>
              ${list
        .map(function (item) {
          return `
              <tr style="border:solid 1px #ddd;">
                <td style="padding:2px;width:50%;">
                  <p style="font-size:14px;margin:0;">${item.productName}</p>
                </td>
                <td style="padding:2px;width:50%;text-align: right;">
                  <p style="font-size:14px;margin:0;"> Rs.${item.qty + "*" + item.netPrice
            }</p>
                </td>
              </tr>
              `;
        })
        .join("")}`;

    const htmlFooter = ` </tbody>
            <tfooter>
              <tr>
              <tr>
                <td style="height:50px;"></td>
              </tr>
              <td colspan="2" style="font-size:14px;padding:2px;">
                <strong style="display:block;margin:0 0 10px 0;">Regards,</strong>Team NinobyVani<br><br>
                For any queries please contact us at: <b>support@ninobyvani.com</b>
              </td>
              </tr>
            </tfooter>
            
          </table>
        </body>
        </html>`;
    const totalHtml = htmlHeader + htmlFooter;
    return new Promise((resolve, reject) => {
      try {
        db.customer.findOne({ where: { email: user.email } }).then((user) => {
          if (user && user.verify == 1) {
            var key = Math.random().toString(36).slice(2);
            db.customer
              .update({ verf_key: key }, { where: { id: user.id } })
              .then((r) => {
                var smtpTransport = nodemailer.createTransport({
                  host: process.env.MAIL_HOST,
                  port: process.env.MAIL_PORT,
                  // ignoreTLS: false,
                  secure: true,
                  auth: {
                    user: process.env.MAIL_USERNAME,
                    pass: process.env.MAIL_PASSWORD,
                  },
                  //tls: { rejectUnauthorized: false },
                });
                smtpTransport.sendMail(
                  {
                    from: process.env.MAIL_FROM,
                    to: user.email,
                    subject:
                      "Your NinobyVani Order Confirmation. Please share your feedback",
                    html: totalHtml,
                  },
                  function (error, info) {
                    if (error || (info && info.rejected.length)) {
                      return reject({
                        name: "Exception",
                        msg: "Email Sending Failed",
                        error: error,
                      });
                    }
                    return resolve(true);
                  }
                );
              });
          } else {
            reject(new Error("user not valid"));
          }
        });
      } catch (err) {
        reject(err);
      }
    });
  },


  // sendInvoiceForCustomerNew: (body, address, order_id, shipment_id, customer, deliveryAddress) => {

  //   const units = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
  //   const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  //   const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
  //   const thousands = ['', 'Thousand', 'Million', 'Billion'];

  //   // Define the convertNumberToWords function
  //   function convertNumberToWords(number) {
  //       if (number === 0) return 'Zero';

  //       let words = '';
  //       for (let i = 0; number > 0; i++) {
  //           if (number % 1000 !== 0) {
  //               words = convertHundreds(number % 1000) + thousands[i] + ' ' + words;
  //           }
  //           number = Math.floor(number / 1000);
  //       }
  //       return words.trim();
  //   }

  //   function convertHundreds(number) {
  //       if (number > 99) {
  //           return units[Math.floor(number / 100)] + ' Hundred ' + convertTens(number % 100);
  //       } else {
  //           return convertTens(number);
  //       }
  //   }

  //   function convertTens(number) {
  //       if (number < 10) {
  //           return units[number];
  //       } else if (number >= 10 && number < 20) {
  //           return teens[number - 10];
  //       } else {
  //           return tens[Math.floor(number / 10)] + ' ' + units[number % 10];
  //       }
  //   };

  //   // Calculate grand total
  //   const grandTotal = `${body.grandTotal}`;

  //   const grandTotalInWords = convertNumberToWords(grandTotal);

  //   const htmlHeader = `<html lang="en">

  //   <head>
  //       <title>Invoice</title>
  //   </head>   
  //   <body style="background:rgb(254, 252, 252);">
  //       <div class="invoice"
  //           style=" font-family: Arial, sans-serif; max-width: full ;margin: 20px auto;padding: 20px;border: 1px solid #ddd;box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);display: flex;flex-direction: column;align-items: center;  ">
  //           <div class="invoice-header"
  //               style="  display:flex; justify-content: space-between;align-items: center;width: 100%;;">

  //               <img style="max-width: 80px;height:70px" src="https://www.ninobyvani.com/assets/imgs/theme/logo.png" width='80' alt="codenox">
  //               <h3 style="margin-top:20px;color:rgb(0, 0, 0);display:block;text-aling:right;">Tax Invoice/Bill of
  //                   Supply/Cash Memo
  //               </h3>
  //           </div>
  //           <div class="invoice-body" style="display:flex;justify-content:space-between;width:100%;">
  //               <div style="flex: 0 0 47%;text-align:left;">
  //                   <h4 style="text-align:left;">Sold By:</h4>
  //                   <p style="text-align: left;">Nino</p>
  //                   <p style="text-align:left;">Gali no. 209, </p>
  //                   <p style="text-align:left;">
  //                   Universital Industrial Estate, Next to Wadia school,
  //                   </p>
  //                   <p style="text-align:left;">
  //                   J.P. Road, Andheri-west, Mumbai- 400058
  //                   </p>
  //                   <br>
  //                   <p style="text-align:left;"><b>PAN No:</b>Hard_Code AC02BFRT56</p>
  //                   <p style="text-align:left;"><b>GST Registration No:</b>6723829829</p>
  //                   <div class="order-details" style="margin-top: 20px;text-align:left;">
  //                       <p style="text-align:left;margin-top:20px"><b>Order Number:</b> </p>
  //                       <p style="text-align:left;"><b>Order Date:</b>28/03/2024</p>

  //                   </div>
  //               </div>
  //               <div style="flex: 0 0 50%;text-align:right;text-align:right;">
  //                   <div class="buyer" style="margin-top: 20px;text-align:right;">
  //                       <h4 style="margin-top: 20px;text-align:right;">Billing Address:</h4>
  //                       <p style="margin-top: 20px;text-align:right;">${ deliveryAddress.id}</p>
  //                       <p style="margin-top: 20px;text-align:right;">${ deliveryAddress.name} ${deliveryAddress.lastName}</p>
  //                       <p style="margin-top: 20px;text-align:right;">
  //                           ${deliveryAddress.StreetAddress} ${deliveryAddress.ShippingAddress}
  //                           ${deliveryAddress.city}</p>
  //                       <p style="margin-top: 20px;text-align:right;">
  //                           ${deliveryAddress.state} ${deliveryAddress.country}
  //                           ${deliveryAddress.pincode}
  //                       </p>

  //                   </div>
  //                   <div class="buyer" style="margin-top: 20px;text-align:right;">
  //                       <h4 style="margin-top: 20px;text-align:right;">Shipping Address:</h4>
  //                       <p style="margin-top: 20px;text-align:right;">${ deliveryAddress.name2} ${deliveryAddress.lastName2}</p>
  //                       <p style="margin-top: 20px;text-align:right;">${deliveryAddress.StreetAddress2} ${deliveryAddress.ShippingAddress2}
  //                           ${deliveryAddress.city2}</p>
  //                       <p style="margin-top: 20px;text-align:right;">${deliveryAddress.state2}
  //                           ${deliveryAddress.country2} ${deliveryAddress.pincode2}</p>

  //                   </div>
  //                   <p style="margin-top: 20px;text-align:right;"><b>Invoice Number:</b>{{created_at}}</p>
  //                   <p style="margin-top: 20px;text-align:right;"><b>Invoice Details:</b> (HARD CODE)MP-FIDA-1034-2324</p>
  //                   <p style="margin-top: 20px;text-align:right;"><b>Invoice Date:</b>{{invoice_date}}</p>
  //               </div>
  //           </div>
  //           <table
  //               style="width: 100%; border-collapse: collapse;margin-bottom: 20px; margin-top: 20px; border: 2px solid black;">
  //               <thead style="border:2px solid black">
  //                   <tr style="border:2px solid black">
  //                       <th style="border: 2px solid black;">SL No.</th>
  //                       <th style="border: 2px solid black;">Description</th>
  //                       <th style="border: 2px solid black;">Unit Price</th>
  //                       <th style="border: 2px solid black;">Quantity</th>
  //                       <th style="border: 2px solid black;">Net Amount</th>
  //                       <th style="border: 2px solid black;">Tax Rate</th>
  //                       <th style="border: 2px solid black;">Tax Amount</th>
  //                       <th style="border: 2px solid black;">Total Amount</th>
  //                   </tr>
  //               </thead>
  //               <tbody>
  //               ${body.product.map(function (item){
  //                 var amount = item.netPrice - item.discount;
  //                var totalPrice = item.selectedVariant.qty * item.netPrice;
  //                var rate = (item.discount / amount) * 100
  //                 return `
  //                 <tr style="border: 2px solid black">
  //                       <td style="border: 2px solid black;">${item.selectedVariant.id}</td>
  //                       <td style="border: 2px solid black;">${item.Name} </td>
  //                       <td style="border: 2px solid black;">${item.netPrice}</td>
  //                       <td style="border: 2px solid black;">${item.selectedVariant.qty}</td>
  //                       <td style="border: 2px solid black;">${totalPrice}</td>
  //                       <td style="border: 2px solid black;">${rate}%</td>
  //                      <td style="border: 2px solid black;">${item.discount}</td>
  //                       <td style="border: 2px solid black;">${totalPrice}</td>
  //                   </tr>`
  //                   ;
  //               }).join("")}
  //                   <tr style="border:2px solid black">
  //                       <td colspan="6" style="border: 2px solid black; text-align: left;"><b>TOTAL:</b></td>
  //                       <td style="border: 2px solid black;">${body.total_discount}</td>
  //                       <td style="border: 2px solid black;">${body.grandTotal}</td>
  //                   </tr>
  //                   <tr>
  //                       <td colspan="9" style="border: 2px solid black; text-align: left;"><b>Amount in Words:</b>
  //                          <span style="margin-left:70px;">${grandTotalInWords}</span></td>
  //                   </tr>
  //                   <tr>
  //                       <td colspan="9" style="text-align: right;"><b>Nino</b><br></td>
  //                   </tr>
  //                   <tr>
  //                       <td colspan="9" style="text-align: right;"><b>Authorized Signatory</b></td>
  //                   </tr>
  //               </tbody>
  //           </table>
  //           <!-- Payment Details Table -->
  //           <table style="width: 100%; border-collapse: collapse; margin-top: 20px; border: 2px solid black;">
  //               <tbody>
  //                   <tr style="border:2px solid black">
  //                       <td style="border:2px solid black">Payment Transaction ID: <br>
  //                           <p style="font-size: 12px;">paymentInfo.payment_id</p>
  //                       </td>
  //                       <td style="border:2px solid black">Date & Time: <p style="font-size: 12px;">{{invoice_date}}
  //                           </p>
  //                       </td>
  //                       <td rowSpan="2" style="border:2px solid black">Invoice Value:<p style="font-size: 12px;">
  //                               ${body.grandTotal} </p>
  //                       </td>
  //                       <td style="border:2px solid black">Mode of Payment:<p style="font-size: 12px;">Gift_Card
  //                               paymentMethod</p>
  //                       </td>
  //                   </tr>
  //                   <tr style="border:2px solid black">
  //                       <td style="border:2px solid black">Payment Transaction ID: <br>
  //                           <p style="font-size: 12px;">paymentInfo.payment_id</p>
  //                       </td>
  //                       <td style="border:2px solid black">Date & Time: <p style="font-size: 12px;">{{invoice_date}}
  //                           </p>
  //                       </td>
  //                       <td colspan="2" style="border:2px solid black">Mode of Payment:<p style="font-size: 12px;">
  //                               ${body.paymentMethod}</p>
  //                       </td>
  //                   </tr>
  //               </tbody>
  //           </table>

  //       </div>
  //   </body>

  //   </html>`;
  //   const htmlFooter = `<tfooter>
  //   <tr>
  //     <td style="height:50px;"></td>
  //   </tr>
  //   <tr>
  //   <td colspan="5" style="font-size:14px;padding:5px;">
  //   <p style="font-size:14px;margin:0 0 6px 0;">If you use a mobile device, you can receive notifications about the delivery of your package and track it from our free <a href="#">ninobyvani.com</a>.</p>
  //       <strong style="display:block;margin:0 0 10px 0;">Regards,</strong>Team codenox<br><br>
  //       For any queries please contact us at: <b>ninobyvani@gmail.com</b>
  //     </td>
  //   </tr>
  // </tfooter>`;
  //   //`<html>
  // //   <body style="background-color:#fbfbfb;font-family: Open Sans, sans-serif;font-size:100%;font-weight:400;line-height:1.4;color:#000;">
  // //     <table style="min-width:650px;margin:50px auto 10px;background-color:#fff;padding:50px;-webkit-border-radius:3px;-moz-border-radius:3px;border-radius:3px;-webkit-box-shadow:0 1px 3px rgba(0,0,0,.12),0 1px 2px rgba(0,0,0,.24);-moz-box-shadow:0 1px 3px rgba(0,0,0,.12),0 1px 2px rgba(0,0,0,.24);box-shadow:0 1px 3px rgba(0,0,0,.12),0 1px 2px rgba(0,0,0,.24); border-top: solid 10px #88b433;">
  // //       <thead>
  // //         <tr>
  // //           <th style="text-align:left;"><img style="max-width: 80px;height:70px" src="https://www.ninobyvani.com/assets/imgs/theme/logo.png" width='80' alt="codenox"></th>
  // //           <th style="text-align:right;font-weight:bold;font-size: 14px;">${new Date().toISOString().slice(0, 10)}</th>
  // //         </tr>
  // //       </thead>
  // //       <tbody>
  // //         <tr>
  // //           <td style="height:35px;"></td>
  // //         </tr>
  // //         <tr>
  // //           <td style="width:50%;padding:2px;vertical-align:top">
  // //             <p style="margin:0 0 10px 0;padding:0;font-size:14px;"><span style="display:block;font-weight:bold;font-size:14px">Name</span> ${address.fullname}</p>
  // //           </td>
  // //           <td style="width:50%;padding:2px;vertical-align:top">
  // //             <p style="margin:0 0 10px 0;padding:0;font-size:14px;"><span style="display:block;font-weight:bold;font-size:14px;">Email</span> ${customer ? customer.email : deliveryAddress.email}</p>
  // //           </td>
  // //         </tr>
  // //         <tr>
  // //           <td colspan="2" style="border: solid 1px #ddd; padding:10px 20px;">
  // //             <p style="font-size:14px;margin:0 0 6px 0;"><span style="font-weight:bold;display:inline-block;min-width:150px">Order status</span><b style="color:green;font-weight:normal;margin:0">Success</b></p>
  // //             <p style="font-size:14px;margin:0 0 6px 0;"><span style="font-weight:bold;display:inline-block;min-width:146px">Order ID</span> ${order_id}</p>
  // //             <p style="font-size:14px;margin:0 0 6px 0;"><span style="font-weight:bold;display:inline-block;min-width:146px">Shipping ID</span> ${shipment_id}</p>
  // //             <p style="font-size:14px;margin:0 0 0 0;"><span style="font-weight:bold;display-inline-block;min-width:146px">Order amount</span> Rs. ${body.grandTotal}</p>
  // //             <p style="font-size:14px;margin:0 0 6px 0;"><span style="font-weight:bold;display:inline-block;min-width:146px">Phone No</span> ${address ? address.phone : body.deliveryAddress.phone}</p>
  // //             <p style="font-size:14px;margin:0 0 0 0;"><span style="font-weight:bold;display:inline-block;min-width:146px">Shipping Address</span>${address.shipping + ", " + address.city + ", " + address.states}</p>
  // //           </td>
  // //         </tr>
  // //         <tr>
  // //           <td style="height:20px;"></td>
  // //         </tr>
  // //         <tr>
  // //           <td colspan="2" style="font-size:14px;padding:2px;font-weight: bold;">Items</td>
  // //         </tr>
  // //         ${body.product.map(function (item) {
  // //     return `
  // //             <tr style="border:solid 1px #ddd;">
  // //               <td style="padding:2px;width:50%;">
  // //                 <p style="font-size:14px;margin:0;"><img src=${item.thumbnail} alt=${item.Name} height="50px"/></p>
  // //               </td>
  // //               <td style="padding:2px;width:50%;">
  // //                 <p style="font-size:14px;margin:0;">${item.Name}</p>
  // //               </td>
  // //               <td style="padding:2px;width:50%;text-align: right;">
  // //                 <p style="font-size:14px;margin:0;"> Rs.${item.quantity + "*" + item.netPrice + "=" + item.quantity * item.netPrice}</p>
  // //               </td>
  // //             </tr>
  // //           `;
  // //   }).join("")}
  // //       </tbody>
  // //     </table>
  // //   </body>
  // // </html>`;


  // //   const htmlFooter = `<tfooter>
  // //   <tr>
  // //     <td style="height:50px;"></td>
  // //   </tr>
  // //   <tr>
  // //   <td colspan="5" style="font-size:14px;padding:5px;">
  // //   <p style="font-size:14px;margin:0 0 6px 0;">If you use a mobile device, you can receive notifications about the delivery of your package and track it from our free <a href="#">ninobyvani.com</a>.</p>
  // //       <strong style="display:block;margin:0 0 10px 0;">Regards,</strong>Team codenox<br><br>
  // //       For any queries please contact us at: <b>ninobyvani@gmail.com</b>
  // //     </td>
  // //   </tr>
  // // </tfooter>`;
  //   const totalHtml = htmlHeader + htmlFooter ;
  //   return new Promise((resolve, reject) => {
  //     try {
  //       // db.customer.findOne({ where: { email: customer.email } }).then((user) => {
  //       //   if (user && user.verify == 1) {
  //       //     var key = Math.random().toString(36).slice(2);
  //       //     db.customer
  //       //       .update({ verf_key: key }, { where: { id: user.id } })
  //       //       .then((r) => {
  //       var smtpTransport = nodemailer.createTransport({
  //         host: process.env.MAIL_HOST,
  //         port: process.env.MAIL_PORT,
  //         // ignoreTLS: false,
  //         secure: true,
  //         auth: {
  //           user: process.env.MAIL_USERNAME,
  //           pass: process.env.MAIL_PASSWORD,
  //         },
  //         //tls: { rejectUnauthorized: false },
  //       });
  //       smtpTransport.sendMail(
  //         {
  //           from: process.env.MAIL_FROM,
  //           // to: customer ? customer.email : deliveryAddress.email,
  //           to:"radhikaji.varfa@outlook.com",
  //           subject:
  //             "Your NinoByWani Order Confirmation. Please share your feedback",
  //           html: totalHtml,
  //         },
  //         function (error, info) {
  //           if (error || (info && info.rejected.length)) {
  //             return reject({
  //               name: "Exception",
  //               msg: "Email Sending Failed",
  //               error: error,
  //             });
  //           }
  //           return resolve(true);
  //         }
  //       );
  //       //       });
  //       //   } else {
  //       //     reject(new Error("user not valid"));
  //       //   }
  //       // });
  //     } catch (err) {
  //       reject(err);
  //     }
  //   });
  // },



  sendInvoiceForCustomerNew: (body, address, order_id, shipment_id, customer, deliveryAddress) => {
    // Your existing code here...
    const units = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
    const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
    const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
    const thousands = ['', 'Thousand', 'Million', 'Billion'];

    // Define the convertNumberToWords function
    function convertNumberToWords(number) {
      if (number === 0) return 'Zero';

      let words = '';
      for (let i = 0; number > 0; i++) {
        if (number % 1000 !== 0) {
          words = convertHundreds(number % 1000) + thousands[i] + ' ' + words;
        }
        number = Math.floor(number / 1000);
      }
      return words.trim();
    }

    function convertHundreds(number) {
      if (number > 99) {
        return units[Math.floor(number / 100)] + ' Hundred ' + convertTens(number % 100);
      } else {
        return convertTens(number);
      }
    }

    function convertTens(number) {
      if (number < 10) {
        return units[number];
      } else if (number >= 10 && number < 20) {
        return teens[number - 10];
      } else {
        return tens[Math.floor(number / 10)] + ' ' + units[number % 10];
      }
    };

    // Calculate grand total
    const grandTotal = `${body.grandTotal}`;

    const grandTotalInWords = convertNumberToWords(grandTotal);

    // Create a PDF document
    const doc = new PDFDocument({ margin: 50 });

    // Pipe the PDF content to a file stream
    const pdfPath = 'invoice.pdf';
    const pdfStream = fs.createWriteStream(pdfPath);
    doc.pipe(pdfStream);

    const htmlHeader = `<html lang="en">

  <head>
      <title>Invoice</title>
  </head>   
  <body style="background:rgb(254, 252, 252);">
      <div class="invoice"
          style=" font-family: Arial, sans-serif; max-width: full ;margin: 20px auto;padding: 20px;border: 1px solid #ddd;box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);display: flex;flex-direction: column;align-items: center;  ">
          <div class="invoice-header"
              style="  display:flex; justify-content: space-between;align-items: center;width: 100%;;">

              <img style="max-width: 80px;height:70px" src="https://www.ninobyvani.com/assets/imgs/theme/logo.png" width='80' alt="codenox">
              <h3 style="color:rgb(0, 0, 0);display:block;text-aling:right;margin-left:65%">Tax Invoice/Bill of
                  Supply/Cash Memo
              </h3>
          </div>
          <div class="invoice-body" style="display:flex;justify-content:space-between;width:100%;">
              <div style="flex: 0 0 47%;text-align:left;">
                  <h4 style="text-align:left;">Sold By:</h4>
                  <p style="text-align: left;">Nino</p>
                  <p style="text-align:left;">Gali no. 209, </p>
                  <p style="text-align:left;">
                  Universital Industrial Estate, Next to Wadia school,
                  </p>
                  <p style="text-align:left;">
                  J.P. Road, Andheri-west, Mumbai- 400058
                  </p>
                  <br>
                  <p style="text-align:left;"><b>PAN No:</b>Hard_Code AC02BFRT56</p>
                  <p style="text-align:left;"><b>GST Registration No:</b>6723829829</p>
                  <div class="order-details" style="margin-top: 20px;text-align:left;">
                      <p style="text-align:left;margin-top:20px"><b>Order Number:</b> </p>
                      <p style="text-align:left;"><b>Order Date:</b></p>
  
                  </div>
              </div>
              <div style="flex: 0 0 50%;text-align:right;text-align:right;">
                  <div class="buyer" style="margin-top: 20px;text-align:right;">
                      <h4 style="margin-top: 20px;text-align:right;">Billing Address:</h4>
                      
                      <p style="margin-top: 20px;text-align:right;">
                          ${deliveryAddress.StreetAddress} ${deliveryAddress.ShippingAddress}
                          ${deliveryAddress.city}</p>
                      <p style="margin-top: 20px;text-align:right;">
                          ${deliveryAddress.state} ${deliveryAddress.country}
                          ${deliveryAddress.pincode}
                      </p>
                      <p style="margin-top: 20px;text-align:right;">
                          ${deliveryAddress.phone} 
                      </p>
  
                  </div>
                  <div class="buyer" style="margin-top: 20px;text-align:right;">
                      <h4 style="margin-top: 20px;text-align:right;">Shipping Address:</h4>
                      <p style="margin-top: 20px;text-align:right;">${deliveryAddress.StreetAddress} ${deliveryAddress.ShippingAddress}</p></p>
  
                  </div>
                  <p style="margin-top: 20px;text-align:right;"><b>Invoice Number:</b>{{created_at}}</p>
                  <p style="margin-top: 20px;text-align:right;"><b>Invoice Details:</b> (HARD CODE)MP-FIDA-1034-2324</p>
                  <p style="margin-top: 20px;text-align:right;"><b>Invoice Date:</b>{{invoice_date}}</p>
              </div>
          </div>
          <table
              style="width: 100%; border-collapse: collapse;margin-bottom: 20px; margin-top: 20px; border: 2px solid black;">
              <thead style="border:2px solid black">
                  <tr style="border:2px solid black">
                      <th style="border: 2px solid black;">SL No.</th>
                      <th style="border: 2px solid black;">Description</th>
                      <th style="border: 2px solid black;">Unit Price</th>
                      <th style="border: 2px solid black;">Quantity</th>
                      <th style="border: 2px solid black;">Net Amount</th>
                      <th style="border: 2px solid black;">Tax Rate</th>
                      <th style="border: 2px solid black;">Tax Amount</th>
                      <th style="border: 2px solid black;">Total Amount</th>
                  </tr>
              </thead>
              <tbody>
              ${body.product.map(function (item, index) {
      var amount = item.netPrice - item.discount;
      var totalPrice = item.quantity * item.netPrice;
      var rate = (item.discount / amount) * 100;
      var serialNumber = index + 1; // Start serial numbers from 1

      return `
                <tr style="border: 2px solid black">
                    <td style="border: 2px solid black;">${serialNumber}</td> <!-- Use the generated serial number -->
                    <td style="border: 2px solid black;">${item.Name}</td>
                    <td style="border: 2px solid black;">${item.netPrice}</td>
                    <td style="border: 2px solid black;">${item.quantity}</td>
                    <td style="border: 2px solid black;">${totalPrice}</td>
                    <td style="border: 2px solid black;">${item.discountPer}%</td>
                    <td style="border: 2px solid black;">${item.discount}</td>
                    <td style="border: 2px solid black;">${totalPrice}</td>
                </tr>`;
    }, this).join("")}
            
              
              ${body.product.map(function (item) {
      var totalDiscount = body.product.reduce((total, item) => total + item.discount, 0);
      console.log("TotalDiscount", totalDiscount)
      return `
                  <tr style="border:2px solid black">
                      <td colspan="6" style="border: 2px solid black; text-align: left;"><b>TOTAL:</b></td>
                      <td style="border: 2px solid black;">${totalDiscount === 0 ? 0 : item.totalDiscount}</td>
                      <td style="border: 2px solid black;">${body.grandTotal}</td>
                  </tr>`
    }).join("")}
                  <tr>
                      <td colspan="9" style="border: 2px solid black; text-align: left;"><b>Amount in Words:</b>
                         <span style="margin-left:70px;">${grandTotalInWords}</span></td>
                  </tr>
                  <tr>
                      <td colspan="9" style="text-align: right;"><b>Nino</b><br></td>
                  </tr>
                  <tr>
                      <td colspan="9" style="text-align: right;"><b>Authorized Signatory</b></td>
                  </tr>
              </tbody>
          </table>
          <!-- Payment Details Table -->
          <table style="width: 100%; border-collapse: collapse; margin-top: 20px; border: 2px solid black;">
              <tbody>
                  <tr style="border:2px solid black">
                      <td style="border:2px solid black">Payment Transaction ID: <br>
                          <p style="font-size: 12px;">paymentInfo.payment_id</p>
                      </td>
                      <td style="border:2px solid black">Date & Time: <p style="font-size: 12px;">{{invoice_date}}
                          </p>
                      </td>
                      <td rowSpan="2" style="border:2px solid black">Invoice Value:<p style="font-size: 12px;">
                              ${body.grandTotal} </p>
                      </td>
                      <td style="border:2px solid black">Mode of Payment:<p style="font-size: 12px;">Gift_Card
                              paymentMethod</p>
                      </td>
                  </tr>
                  <tr style="border:2px solid black">
                      <td style="border:2px solid black">Payment Transaction ID: <br>
                          <p style="font-size: 12px;">paymentInfo.payment_id</p>
                      </td>
                      <td style="border:2px solid black">Date & Time: <p style="font-size: 12px;">{{invoice_date}}
                          </p>
                      </td>
                      <td colspan="2" style="border:2px solid black">Mode of Payment:<p style="font-size: 12px;">
                              ${body.paymentMethod}</p>
                      </td>
                  </tr>
              </tbody>
          </table>
  
      </div>
  </body>
  
  </html>`;
    const htmlFooter = `<tfooter>
  <tr>
    <td style="height:50px;"></td>
  </tr>
  <tr>
  <td colspan="5" style="font-size:14px;padding:5px;">
  <p style="font-size:14px;margin:0 0 6px 0;">If you use a mobile device, you can receive notifications about the delivery of your package and track it from our free <a href="#">ninobyvani.com</a>.</p>
      <strong style="display:block;margin:0 0 10px 0;">Regards,</strong>Team codenox<br><br>
      For any queries please contact us at: <b>ninobyvani@gmail.com</b>
    </td>
  </tr>
</tfooter>`;
    const totalHtml = htmlHeader + htmlFooter;

    // Define PDF options
    const pdfOptions = {
      format: 'Letter',
      orientation: 'portrait',
      border: {
        top: '0.5in',
        right: '0.5in',
        bottom: '0.5in',
        left: '0.5in'
      },
    };

    return new Promise((resolve, reject) => {
      try {
        pdf.create(totalHtml, pdfOptions).toBuffer((err, buffer) => {
          if (err) {
            reject(err);
          } else {
            const attachment = {
              filename: 'invoice.pdf',
              content: buffer,
            };

            const smtpTransport = nodemailer.createTransport({
              host: process.env.MAIL_HOST,
              port: process.env.MAIL_PORT,
              secure: true,
              auth: {
                user: process.env.MAIL_USERNAME,
                pass: process.env.MAIL_PASSWORD,
              },
            });

            smtpTransport.sendMail({
              from: process.env.MAIL_FROM,
              to: customer ? customer.email : deliveryAddress.email,
              subject: "Your NinoByWani Order Confirmation. Please share your feedback",
              html: 'Please see the attached PDF for your order confirmation.',
              attachments: [attachment],
            }, (error, info) => {
              if (error || (info && info.rejected.length)) {
                reject({
                  name: "Exception",
                  msg: "Email Sending Failed",
                  error: error,
                });
              } else {
                resolve(true);
              }
            });
          }
        });
      } catch (err) {
        reject(err);
      }
    });
  },

  sendInvoiceForSeller: (body, address, orderNo, customer, email) => {
    const htmlHeader = `<html>
        <body
          style="background-color:#fbfbfb;font-family: Open Sans, sans-serif;font-size:100%;font-weight:400;line-height:1.4;color:#000;">
          <table
            style="min-width:650px;margin:50px auto 10px;background-color:#fff;padding:50px;-webkit-border-radius:3px;-moz-border-radius:3px;border-radius:3px;-webkit-box-shadow:0 1px 3px rgba(0,0,0,.12),0 1px 2px rgba(0,0,0,.24);-moz-box-shadow:0 1px 3px rgba(0,0,0,.12),0 1px 2px rgba(0,0,0,.24);box-shadow:0 1px 3px rgba(0,0,0,.12),0 1px 2px rgba(0,0,0,.24); border-top: solid 10px #88b433;">
            <thead>
              <tr>
                <th style="text-align:left;"><img style="max-width: 80px;height:70px"
                    src="https://grociproduct.s3.ap-south-1.amazonaws.com/favicon.png" width='80' alt="souqarena"></th>
                <th style="text-align:right;font-weight:bold;font-size: 14px;">${new Date()
        .toISOString()
        .slice(0, 10)}</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style="height:35px;"></td>
              </tr>
        
              <tr>
                <td style="width:50%;padding:2px;vertical-align:top">
                  <p style="margin:0 0 10px 0;padding:0;font-size:14px;"><span
                      style="display:block;font-weight:bold;font-size:14px">Name</span> ${address.fullname
      }</p>
        
                </td>
                <td style="width:50%;padding:2px;vertical-align:top">
                  <p style="margin:0 0 10px 0;padding:0;font-size:14px;"><span
                      style="display:block;font-weight:bold;font-size:14px;">Email</span> ${email
      }</p>
        
                </td>
              </tr>
    
              <tr>
                <td colspan="2" style="border: solid 1px #ddd; padding:10px 20px;">
                  <p style="font-size:14px;margin:0 0 6px 0;"><span
                      style="font-weight:bold;display:inline-block;min-width:150px">Order status</span><b
                      style="color:green;font-weight:normal;margin:0">Success</b></p>
                  <p style="font-size:14px;margin:0 0 6px 0;"><span
                      style="font-weight:bold;display:inline-block;min-width:146px">Order ID</span> ${orderNo}</p>
                  <p style="font-size:14px;margin:0 0 0 0;"><span
                      style="font-weight:bold;display:inline-block;min-width:146px">Order amount</span> Rs. ${body.netPrice
      }</p>
                <p style="font-size:14px;margin:0 0 6px 0;"><span style="font-weight:bold;display:inline-block;min-width:146px">Phone No</span> ${address ? address.phone : body.deliveryAddress.phone
      }</p>
                <p style="font-size:14px;margin:0 0 6px 0;"><span
                style="font-weight:bold;display:inline-block;min-width:146px">CustName</span> ${customer.name
      }</p>
                      <p style="font-size:14px;margin:0 0 0 0;"><span style="font-weight:bold;display:inline-block;min-width:146px">Shipping Address</span>${address.shipping +
      ", " +
      address.city +
      ", " +
      address.states
      }  </p>
                </td>
              </tr>
              <tr>
                <td style="height:20px;"></td>
              </tr>
        
              <tr>
                <td colspan="2" style="font-size:14px;padding:2px;font-weight: bold;">Items</td>
              </tr>
              
              <tr style="border:solid 1px #ddd;">
                <td style="padding:2px;width:50%;">
                  <p style="font-size:14px;margin:0;"><img src=${body.thumbnail
      } alt=${body.productName} height="50px"/></p>
                </td>
                <td style="padding:2px;width:50%;">
                  <p style="font-size:14px;margin:0;">${body.productName}</p>
                </td>
                
                <td style="padding:2px;width:50%;text-align: right;">
                  <p style="font-size:14px;margin:0;"> Rs.${body.qty + "*" + body.netPrice + "=" + body.qty * body.netPrice}</p>
                </td>
              </tr>
              `;

    const htmlFooter = `</tbody> <tfooter> <tr> <tr> <td style="height:50px;"></td> </tr> <td colspan="2" style="font-size:14px;padding:2px;"> <strong style="display:block;margin:0 0 10px 0;">Regards,</strong>Team souqarena<br><br> For any queries please contact us at: <b>support@souqarena.com</b> </td> </tr> </tfooter> </table> </body> </html>`;
    const totalHtml = htmlHeader + htmlFooter;
    return new Promise((resolve, reject) => {
      try {
        const query = {};
        query.where = {};

        query.where.email = email;
        query.where.role = "seller";
        query.where.verify = 1;

        db.user.findOne(query).then((user) => {
          if (user && user.id) {
            const smtpTransport = nodemailer.createTransport({
              host: process.env.MAIL_HOST,
              port: process.env.MAIL_PORT,
              // ignoreTLS: false,
              secure: true,
              auth: {
                user: process.env.MAIL_USERNAME,
                pass: process.env.MAIL_PASSWORD,
              },
              //tls: { rejectUnauthorized: false },
            });
            smtpTransport.sendMail(
              {
                from: process.env.MAIL_FROM,
                to: user.email,
                subject:
                  "You have order. please check your dashboard for more details",
                html: totalHtml,
              },
              function (error, info) {
                if (error || (info && info.rejected.length)) {
                  return reject({
                    name: "Exception",
                    msg: "Email Sending Failed",
                    error: error,
                  });
                }
                return resolve(true);
              }
            );
          } else {
            reject(new Error("user not valid"));
          }
        });
      } catch (err) {
        reject(err);
      }
    });
  },

  sendAbandonedCartEmail: (email, products) => {
    const productDetails = Object.values(products).map(product => ({
      thumbnail: product.Thumbnail ? product.Thumbnail : 'Default Thumbnail URL', // Replace with the actual default thumbnail URL
      name: product.Name,
      netPrice: product.netPrice,
    }));

    const productsList = productDetails
      .map(
        product =>
          `<div style="display: flex; align-items: center;">
            <img src="${product.thumbnail}" alt="Product Thumbnail" style="width: 100px; height: 100px; object-fit: cover;">
            <div style="margin-left: 20px;">
              <p><strong>${product.name}</strong></p>
              <p>Net Price: $${product.netPrice}</p>
            </div>
          </div>`
      )
      .join('<hr>');

    const emailContent = `
      <html>
        <head>
          <style>
            /* Add your CSS styles here */
          </style>
        </head>
        <body>
          <h2>Hello!</h2>
          <p>You have left the following items in your cart:</p>
          ${productsList}
          <p>Come back and complete your purchase today!</p>
        </body>
      </html>
    `;

    const smtpTransport = nodemailer.createTransport({
      host: process.env.MAIL_HOST,
      port: process.env.MAIL_PORT,
      // ignoreTLS: false,
      secure: true,
      auth: {
        user: process.env.MAIL_USERNAME,
        pass: process.env.MAIL_PASSWORD,
      },
      //tls: { rejectUnauthorized: false },
    });
    return new Promise((resolve, reject) => {
      smtpTransport.sendMail(
        {
          from: process.env.MAIL_FROM,
          to: email,
          subject: 'You have abandoned your cart',
          html: emailContent,
        },
        function (error, info) {
          if (error || (info && info.rejected.length)) {
            reject({
              name: 'Exception',
              msg: 'Email Sending Failed',
              error: error,
            });
          } else {
            resolve(true);
          }
        }
      );
    });
  },

sendOrderTrackingEmail: async (customer_email, htmlContent) => {
    try {
      const smtpTransport = nodemailer.createTransport({
        host: process.env.MAIL_HOST,
        port: process.env.MAIL_PORT,
        secure: true,
        auth: {
          user: process.env.MAIL_USERNAME,
          pass: process.env.MAIL_PASSWORD,
        },
      });


      await smtpTransport.sendMail({
        from: process.env.MAIL_FROM,
        to: customer_email,
        subject: "Your Order Tracking Information",
        html: htmlContent,
        headers: {
          'X-Mailer': 'MyApp Mailer',
          'List-Unsubscribe': '<unsubscribe@example.com>',
          'Precedence': 'bulk',
          'X-Auto-Response-Suppress': 'All',
        }
      });


      return true;
    } catch (error) {
      console.error('Error sending order tracking email:', error);
      throw new Error('Error sending order tracking email');
    }
  },

};
