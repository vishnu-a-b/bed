"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// server/src/modules/BedPaymentIn/services/BedPaymentInd.ts
const razorpay_1 = __importDefault(require("razorpay"));
const BedPaymentIn_1 = require("../models/BedPaymentIn");
const mongoose_1 = __importDefault(require("mongoose"));
const crypto_1 = __importDefault(require("crypto"));
const Supporter_1 = require("../../supporter/models/Supporter");
const DonationReceiptMailerIndia_1 = __importDefault(require("../../../services/DonationReceiptMailerIndia"));
const mailService_1 = __importDefault(require("../../../services/mailService"));
// Razorpay SDK Configuration
const razorpay = new razorpay_1.default({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});
class BedPaymentIndService {
    constructor() {
        // Create Razorpay order
        this.createOrder = (params) => __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c, _d, _e, _f, _g, _h;
            const { supporterId } = params;
            if (!supporterId) {
                throw new Error("Supporter ID is required");
            }
            try {
                const supporter = yield Supporter_1.Supporter.findById(supporterId)
                    .populate("user")
                    .populate({
                    path: "bed",
                    populate: {
                        path: "country",
                        select: "currency",
                    },
                })
                    .exec();
                if (!supporter) {
                    throw new Error("Supporter not found");
                }
                if (!supporter.isActive) {
                    throw new Error("Supporter is not active");
                }
                const userEmail = (_a = supporter.user) === null || _a === void 0 ? void 0 : _a.email;
                const bed = supporter.bed;
                const currency = ((_b = bed === null || bed === void 0 ? void 0 : bed.country) === null || _b === void 0 ? void 0 : _b.currency) || "INR";
                const amount = supporter.amount || (bed === null || bed === void 0 ? void 0 : bed.amount) || (bed === null || bed === void 0 ? void 0 : bed.fixedAmount);
                if (!userEmail) {
                    throw new Error("Supporter email not found");
                }
                if (!amount) {
                    throw new Error("Payment amount not found");
                }
                // Create Razorpay order
                const options = {
                    amount: Math.round(Number(amount) * 100), // Convert to paise for Razorpay
                    currency: currency,
                    receipt: `receipt_${Date.now()}`,
                    notes: {
                        supporterId: supporter._id.toString(),
                        bedId: supporter.bed._id.toString(),
                        bedNo: ((_d = (_c = supporter.bed) === null || _c === void 0 ? void 0 : _c.bedNo) === null || _d === void 0 ? void 0 : _d.toString()) || "",
                    },
                };
                const order = yield razorpay.orders.create(options);
                // Create payment record
                const searchFieldsData = {
                    supporterName: supporter.name,
                    supporterEmail: supporter.email,
                    supporterMobile: (_e = supporter.user) === null || _e === void 0 ? void 0 : _e.mobileNo,
                    bedNumber: ((_g = (_f = supporter.bed) === null || _f === void 0 ? void 0 : _f.bedNo) === null || _g === void 0 ? void 0 : _g.toString()) || "",
                };
                const payment = yield BedPaymentIn_1.BedPaymentInd.create({
                    razorpay_order_id: order.id,
                    supporter: supporter._id,
                    bed: supporter.bed._id,
                    amount: Number(amount), // Store in rupees
                    currency: order.currency,
                    status: "pending",
                    razorpay_status: order.status,
                    paymentMode: "online",
                    paymentDate: new Date(),
                    source: "website",
                    email: userEmail,
                    phNo: (_h = supporter.user) === null || _h === void 0 ? void 0 : _h.mobileNo,
                    name: supporter.name,
                    razorpay_created_at: Math.floor(Date.now() / 1000),
                    notes: options.notes,
                    searchFields: searchFieldsData,
                });
                return {
                    success: true,
                    data: {
                        orderId: order.id,
                        amount: order.amount,
                        currency: order.currency,
                        key: process.env.RAZORPAY_KEY_ID,
                        paymentId: payment._id,
                    },
                };
            }
            catch (error) {
                console.error("Error creating order:", error);
                throw new Error(`Failed to create order: ${error.message}`);
            }
        });
        // Create Razorpay order for Hosted Checkout (Embedded Checkout)
        // This creates an order and returns data for submitting to Razorpay's hosted payment page
        this.createOrderHosted = (params) => __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c, _d, _e, _f, _g, _h, _j;
            const { supporterId, callback_url, cancel_url } = params;
            if (!supporterId) {
                throw new Error("Supporter ID is required");
            }
            try {
                const supporter = yield Supporter_1.Supporter.findById(supporterId)
                    .populate("user")
                    .populate({
                    path: "bed",
                    populate: {
                        path: "country",
                        select: "currency",
                    },
                })
                    .exec();
                if (!supporter) {
                    throw new Error("Supporter not found");
                }
                if (!supporter.isActive) {
                    throw new Error("Supporter is not active");
                }
                const userEmail = (_a = supporter.user) === null || _a === void 0 ? void 0 : _a.email;
                const userName = supporter.name || ((_b = supporter.user) === null || _b === void 0 ? void 0 : _b.name);
                const userPhone = (_c = supporter.user) === null || _c === void 0 ? void 0 : _c.mobileNo;
                const bed = supporter.bed;
                const currency = ((_d = bed === null || bed === void 0 ? void 0 : bed.country) === null || _d === void 0 ? void 0 : _d.currency) || "INR";
                const amount = supporter.amount || (bed === null || bed === void 0 ? void 0 : bed.amount) || (bed === null || bed === void 0 ? void 0 : bed.fixedAmount);
                if (!userEmail) {
                    throw new Error("Supporter email not found");
                }
                if (!amount) {
                    throw new Error("Payment amount not found");
                }
                // Create Razorpay order with hosted checkout configuration
                const options = {
                    amount: Math.round(Number(amount) * 100), // Convert to paise for Razorpay
                    currency: currency,
                    receipt: `receipt_${Date.now()}`,
                    notes: {
                        supporterId: supporter._id.toString(),
                        bedId: supporter.bed._id.toString(),
                        bedNo: ((_f = (_e = supporter.bed) === null || _e === void 0 ? void 0 : _e.bedNo) === null || _f === void 0 ? void 0 : _f.toString()) || "",
                    },
                };
                const order = yield razorpay.orders.create(options);
                // Create payment record
                const searchFieldsData = {
                    supporterName: supporter.name,
                    supporterEmail: supporter.email,
                    supporterMobile: (_g = supporter.user) === null || _g === void 0 ? void 0 : _g.mobileNo,
                    bedNumber: ((_j = (_h = supporter.bed) === null || _h === void 0 ? void 0 : _h.bedNo) === null || _j === void 0 ? void 0 : _j.toString()) || "",
                };
                const payment = yield BedPaymentIn_1.BedPaymentInd.create({
                    razorpay_order_id: order.id,
                    supporter: supporter._id,
                    bed: supporter.bed._id,
                    amount: Number(amount), // Store in rupees
                    currency: order.currency,
                    status: "pending",
                    razorpay_status: order.status,
                    paymentMode: "online",
                    paymentDate: new Date(),
                    source: "website",
                    email: userEmail,
                    phNo: userPhone,
                    name: userName,
                    razorpay_created_at: Math.floor(Date.now() / 1000),
                    notes: options.notes,
                    searchFields: searchFieldsData,
                });
                // Return data for Hosted Checkout (redirect to Razorpay's hosted payment page)
                // Frontend will POST this data to https://api.razorpay.com/v1/checkout/embedded
                return {
                    success: true,
                    data: {
                        orderId: order.id,
                        amount: order.amount,
                        currency: order.currency,
                        key: process.env.RAZORPAY_KEY_ID,
                        paymentId: payment._id,
                        // Customer details for prefill
                        customerName: userName,
                        customerEmail: userEmail,
                        customerContact: userPhone,
                        // Callback URLs for hosted checkout
                        callbackUrl: callback_url,
                        cancelUrl: cancel_url,
                        // Hosted checkout specific data
                        hostedCheckoutUrl: "https://api.razorpay.com/v1/checkout/embedded",
                        description: "Bed Payment Contribution",
                        image: process.env.RAZORPAY_LOGO_URL || "",
                        name: "Generous Contributions",
                    },
                };
            }
            catch (error) {
                console.error("Error creating hosted checkout order:", error);
                throw new Error(`Failed to create hosted checkout order: ${error.message}`);
            }
        });
        // Verify Razorpay payment
        this.verifyPayment = (params) => __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c, _d, _e;
            const { razorpay_payment_id, razorpay_order_id, razorpay_signature } = params;
            try {
                // Find payment record
                const payment = yield BedPaymentIn_1.BedPaymentInd.findOne({ razorpay_order_id })
                    .populate("supporter")
                    .populate("bed");
                if (!payment) {
                    throw new Error("Payment record not found");
                }
                // Verify signature
                const generatedSignature = crypto_1.default
                    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
                    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
                    .digest("hex");
                if (generatedSignature !== razorpay_signature) {
                    throw new Error("Invalid payment signature");
                }
                // Fetch payment details from Razorpay
                const razorpayPayment = yield razorpay.payments.fetch(razorpay_payment_id);
                // Update payment record
                payment.razorpay_payment_id = razorpay_payment_id;
                payment.razorpay_signature = razorpay_signature;
                payment.status = "captured";
                payment.razorpay_status = razorpayPayment.status;
                payment.isVerified = true;
                payment.razorpay_payment_response = razorpayPayment;
                payment.razorpay_updated_at = Math.floor(Date.now() / 1000);
                // Calculate fees if available
                if (razorpayPayment.fee) {
                    payment.razorpay_fee = {
                        amount: razorpayPayment.fee,
                        currency: razorpayPayment.currency,
                    };
                    payment.net_amount = Number(razorpayPayment.amount) - Number(razorpayPayment.fee);
                }
                yield payment.save();
                // Send receipt email
                try {
                    const payerEmail = payment.email || ((_b = (_a = payment.supporter) === null || _a === void 0 ? void 0 : _a.user) === null || _b === void 0 ? void 0 : _b.email);
                    const payerName = payment.name || ((_c = payment.supporter) === null || _c === void 0 ? void 0 : _c.name);
                    const payerPhone = payment.phNo || ((_e = (_d = payment.supporter) === null || _d === void 0 ? void 0 : _d.user) === null || _e === void 0 ? void 0 : _e.mobileNo);
                    const payerAddress = payment.address || "";
                    if (payerEmail) {
                        yield DonationReceiptMailerIndia_1.default.sendDonationReceiptEmail({
                            email: payerEmail,
                            name: payerName || "Supporter",
                            phoneNo: payerPhone || "",
                            amount: payment.amount, // Already in rupees
                            address: payerAddress,
                            transactionNumber: payment.razorpay_payment_id || payment.razorpay_order_id,
                            receiptNumber: payment.receiptNumber || "",
                            date: new Date(payment.paymentDate).toLocaleDateString(),
                        });
                    }
                }
                catch (emailError) {
                    console.error("Failed to send receipt email:", emailError);
                }
                return {
                    success: true,
                    data: {
                        payment,
                        message: "Payment verified successfully",
                    },
                };
            }
            catch (error) {
                console.error("Error verifying payment:", error);
                throw new Error(`Payment verification failed: ${error.message}`);
            }
        });
        // Send payment reminder
        this.sendPaymentReminder = (options) => __awaiter(this, void 0, void 0, function* () {
            const { phoneNumber, email, name, amount, bedNo, supportLink, vcLink } = options;
            try {
                const results = {
                    whatsapp: null,
                    email: null,
                };
                // Send WhatsApp reminder
                if (phoneNumber) {
                    try {
                        // Note: Implement WhatsApp reminder if available
                        // const whatsappMessage = await whatsappHelper.sendPaymentReminderMessage(
                        //   phoneNumber,
                        //   name,
                        //   amount,
                        //   bedNo,
                        //   supportLink,
                        //   vcLink
                        // );
                        // results.whatsapp = whatsappMessage;
                        console.log("WhatsApp reminder not implemented yet");
                    }
                    catch (error) {
                        console.error("WhatsApp reminder failed:", error);
                    }
                }
                // Send email reminder
                if (email) {
                    try {
                        const emailResult = yield mailService_1.default.sendPaymentReminderEmail({
                            to: email,
                            name,
                            amount,
                            bedNo,
                            supportLink,
                            vcLink,
                        });
                        results.email = emailResult;
                    }
                    catch (error) {
                        console.error("Email reminder failed:", error);
                    }
                }
                return results;
            }
            catch (error) {
                throw new Error(`Failed to send payment reminder: ${error.message}`);
            }
        });
        // Get all payments
        this.getAllPayments = (...args_1) => __awaiter(this, [...args_1], void 0, function* (query = {}) {
            try {
                const payments = yield BedPaymentIn_1.BedPaymentInd.find(query)
                    .populate("supporter")
                    .populate("bed")
                    .populate("recordedBy", "name email")
                    .populate("approvedBy", "name email")
                    .sort({ createdAt: -1 });
                return {
                    success: true,
                    data: payments,
                    count: payments.length,
                };
            }
            catch (error) {
                throw new Error(`Failed to fetch payments: ${error.message}`);
            }
        });
        // Get payment by ID
        this.getPaymentById = (id) => __awaiter(this, void 0, void 0, function* () {
            try {
                const payment = yield BedPaymentIn_1.BedPaymentInd.findById(id)
                    .populate("supporter")
                    .populate("bed")
                    .populate("recordedBy", "name email")
                    .populate("approvedBy", "name email");
                if (!payment) {
                    throw new Error("Payment not found");
                }
                return {
                    success: true,
                    data: payment,
                };
            }
            catch (error) {
                throw new Error(`Failed to fetch payment: ${error.message}`);
            }
        });
        // Find payments with filters
        this.find = (_a, startDate_1, endDate_1) => __awaiter(this, [_a, startDate_1, endDate_1], void 0, function* ({ limit, skip, filterQuery, sort }, startDate, endDate) {
            limit = limit ? limit : 10;
            skip = skip ? skip : 0;
            const query = Object.assign({}, filterQuery);
            // Add date range filter
            if (startDate || endDate) {
                query.paymentDate = {};
                if (startDate) {
                    query.paymentDate.$gte = new Date(startDate);
                }
                if (endDate) {
                    const end = new Date(endDate);
                    end.setHours(23, 59, 59, 999);
                    query.paymentDate.$lte = end;
                }
            }
            const payments = yield BedPaymentIn_1.BedPaymentInd.find(query)
                .populate({
                path: "supporter",
                populate: {
                    path: "user bed",
                },
            })
                .populate("bed")
                .populate("recordedBy", "name email")
                .populate("approvedBy", "name email")
                .sort(sort || { paymentDate: -1 })
                .limit(limit)
                .skip(skip);
            const total = yield BedPaymentIn_1.BedPaymentInd.countDocuments(query);
            return {
                total,
                limit,
                skip,
                items: payments,
            };
        });
        // Find payments with search
        this.findPayments = (_a, startDate_1, endDate_1) => __awaiter(this, [_a, startDate_1, endDate_1], void 0, function* ({ limit, skip, filterQuery, sort, search }, startDate, endDate) {
            limit = limit ? limit : 10;
            skip = skip ? skip : 0;
            const query = Object.assign({}, filterQuery);
            // Add search functionality
            if (search) {
                query.$or = [
                    { "searchFields.supporterName": { $regex: search, $options: "i" } },
                    { "searchFields.supporterMobile": { $regex: search, $options: "i" } },
                    { "searchFields.bedNumber": { $regex: search, $options: "i" } },
                    { "searchFields.supporterEmail": { $regex: search, $options: "i" } },
                    { razorpay_payment_id: { $regex: search, $options: "i" } },
                    { razorpay_order_id: { $regex: search, $options: "i" } },
                    { receiptNumber: { $regex: search, $options: "i" } },
                    { transactionReference: { $regex: search, $options: "i" } },
                ];
            }
            // Add date range filter
            if (startDate || endDate) {
                query.paymentDate = {};
                if (startDate) {
                    query.paymentDate.$gte = new Date(startDate);
                }
                if (endDate) {
                    const end = new Date(endDate);
                    end.setHours(23, 59, 59, 999);
                    query.paymentDate.$lte = end;
                }
            }
            const payments = yield BedPaymentIn_1.BedPaymentInd.find(query)
                .populate({
                path: "supporter",
                populate: {
                    path: "user bed",
                },
            })
                .populate("bed")
                .populate("recordedBy", "name email")
                .populate("approvedBy", "name email")
                .sort(sort || { paymentDate: -1 })
                .limit(limit)
                .skip(skip);
            const total = yield BedPaymentIn_1.BedPaymentInd.countDocuments(query);
            return {
                total,
                limit,
                skip,
                items: payments,
            };
        });
        // Update payment
        this.updatePayment = (params) => __awaiter(this, void 0, void 0, function* () {
            const { id, updateData } = params;
            try {
                const payment = yield BedPaymentIn_1.BedPaymentInd.findByIdAndUpdate(id, updateData, {
                    new: true,
                    runValidators: true,
                });
                if (!payment) {
                    throw new Error("Payment not found");
                }
                return {
                    success: true,
                    data: payment,
                };
            }
            catch (error) {
                throw new Error(`Failed to update payment: ${error.message}`);
            }
        });
        // Delete payment
        this.deletePayment = (id) => __awaiter(this, void 0, void 0, function* () {
            try {
                const payment = yield BedPaymentIn_1.BedPaymentInd.findByIdAndDelete(id);
                if (!payment) {
                    throw new Error("Payment not found");
                }
                return {
                    success: true,
                    message: "Payment deleted successfully",
                };
            }
            catch (error) {
                throw new Error(`Failed to delete payment: ${error.message}`);
            }
        });
        // Get supporter details with payments
        this.findOneSupporterPayments = (supporterId) => __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c, _d;
            if (!supporterId || !mongoose_1.default.Types.ObjectId.isValid(supporterId)) {
                throw new Error("Invalid supporter ID");
            }
            const supporterData = yield Supporter_1.Supporter.aggregate([
                {
                    $match: {
                        _id: new mongoose_1.default.Types.ObjectId(supporterId),
                    },
                },
                {
                    $lookup: {
                        from: "beds",
                        localField: "bed",
                        foreignField: "_id",
                        as: "bed",
                    },
                },
                { $unwind: "$bed" },
                {
                    $lookup: {
                        from: "countries",
                        localField: "bed.country",
                        foreignField: "_id",
                        as: "country",
                    },
                },
                { $unwind: "$country" },
            ]);
            if (supporterData.length === 0) {
                throw new Error("Supporter not found");
            }
            const supporter = supporterData[0];
            const paymentsData = yield BedPaymentIn_1.BedPaymentInd.aggregate([
                {
                    $match: {
                        supporter: new mongoose_1.default.Types.ObjectId(supporterId),
                    },
                },
                {
                    $project: {
                        amount: 1,
                        status: 1,
                        paymentMode: 1,
                        manualMethod: 1,
                        createdAt: 1,
                        paymentDate: 1,
                        isVerified: 1,
                        isApproved: 1,
                        razorpay_payment_id: 1,
                        transactionReference: 1,
                    },
                },
                { $sort: { createdAt: -1 } },
            ]);
            const totals = yield BedPaymentIn_1.BedPaymentInd.aggregate([
                {
                    $match: {
                        supporter: new mongoose_1.default.Types.ObjectId(supporterId),
                        status: { $in: ["captured", "completed"] }, // Include both captured and completed payments
                    },
                },
                {
                    $group: {
                        _id: null,
                        totalPayments: { $sum: 1 },
                        totalAmount: { $sum: "$amount" },
                        totalOnlinePayments: {
                            $sum: {
                                $cond: [{ $eq: ["$paymentMode", "online"] }, 1, 0],
                            },
                        },
                        totalOfflinePayments: {
                            $sum: {
                                $cond: [{ $eq: ["$paymentMode", "offline"] }, 1, 0],
                            },
                        },
                    },
                },
            ]);
            return {
                supporterId: supporter._id,
                supporterName: supporter.nameVisible ? supporter.name : "Anonymous",
                bedNo: supporter.bed.bedNo,
                qrPhoto: supporter.bed.qrPhoto,
                fixedAmount: supporter.amount || supporter.bed.amount || supporter.bed.fixedAmount,
                bedId: supporter.bed._id,
                countryId: supporter.country._id,
                countryName: supporter.country.name,
                currency: supporter.country.currency,
                totalPayments: ((_a = totals[0]) === null || _a === void 0 ? void 0 : _a.totalPayments) || 0,
                totalAmount: ((_b = totals[0]) === null || _b === void 0 ? void 0 : _b.totalAmount) || 0,
                totalOnlinePayments: ((_c = totals[0]) === null || _c === void 0 ? void 0 : _c.totalOnlinePayments) || 0,
                totalOfflinePayments: ((_d = totals[0]) === null || _d === void 0 ? void 0 : _d.totalOfflinePayments) || 0,
                payments: paymentsData,
            };
        });
        // Create manual/offline payment
        this.createManualPayment = (params) => __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c;
            try {
                const { amount, currency, name, email, phNo, address, manualMethod, transactionReference, paymentDate, remarks, contribution, source, recordedBy, supporter, bed, } = params;
                // Get supporter data for search fields
                let searchFieldsData = {};
                if (supporter) {
                    const supporterData = yield Supporter_1.Supporter.findById(supporter)
                        .populate("user")
                        .populate("bed");
                    if (supporterData) {
                        searchFieldsData = {
                            supporterName: supporterData.name,
                            supporterEmail: supporterData.email,
                            supporterMobile: (_a = supporterData.user) === null || _a === void 0 ? void 0 : _a.mobileNo,
                            bedNumber: ((_c = (_b = supporterData.bed) === null || _b === void 0 ? void 0 : _b.bedNo) === null || _c === void 0 ? void 0 : _c.toString()) || "",
                        };
                    }
                }
                const payment = yield BedPaymentIn_1.BedPaymentInd.create({
                    amount: Number(amount), // Store in rupees
                    currency: currency || "INR",
                    name,
                    email,
                    phNo,
                    address,
                    status: "pending",
                    paymentMode: "offline",
                    manualMethod,
                    transactionReference,
                    paymentDate: paymentDate || new Date(),
                    remarks,
                    contribution,
                    source: source || "website",
                    recordedBy,
                    supporter,
                    bed,
                    isApproved: false,
                    isVerified: false,
                    searchFields: searchFieldsData,
                });
                return {
                    success: true,
                    data: payment,
                    message: "Manual payment created successfully. Pending approval.",
                };
            }
            catch (error) {
                throw new Error(`Failed to create manual payment: ${error.message}`);
            }
        });
        // Approve/reject manual payment
        this.approveManualPayment = (params) => __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c, _d, _e;
            try {
                const { id, approved, approvedBy, remarks } = params;
                const payment = yield BedPaymentIn_1.BedPaymentInd.findById(id)
                    .populate("supporter")
                    .populate("bed");
                if (!payment) {
                    throw new Error("Payment not found");
                }
                if (payment.paymentMode !== "offline") {
                    throw new Error("Only offline payments can be manually approved");
                }
                payment.isApproved = approved;
                payment.approvedBy = approvedBy;
                payment.approvedAt = new Date();
                payment.status = approved ? "completed" : "cancelled";
                if (remarks) {
                    payment.remarks = remarks;
                }
                yield payment.save();
                // Send receipt if approved
                if (approved) {
                    try {
                        const payerEmail = payment.email || ((_b = (_a = payment.supporter) === null || _a === void 0 ? void 0 : _a.user) === null || _b === void 0 ? void 0 : _b.email);
                        const payerName = payment.name || ((_c = payment.supporter) === null || _c === void 0 ? void 0 : _c.name);
                        const payerPhone = payment.phNo || ((_e = (_d = payment.supporter) === null || _d === void 0 ? void 0 : _d.user) === null || _e === void 0 ? void 0 : _e.mobileNo);
                        const payerAddress = payment.address || "";
                        if (payerEmail) {
                            yield DonationReceiptMailerIndia_1.default.sendDonationReceiptEmail({
                                email: payerEmail,
                                name: payerName || "Supporter",
                                phoneNo: payerPhone || "",
                                amount: payment.amount, // Already in rupees
                                address: payerAddress,
                                transactionNumber: payment.transactionReference || payment.receiptNumber,
                                receiptNumber: payment.receiptNumber || "",
                                date: new Date(payment.paymentDate).toLocaleDateString(),
                            });
                        }
                    }
                    catch (emailError) {
                        console.error("Failed to send approval receipt:", emailError);
                    }
                }
                return {
                    success: true,
                    data: payment,
                    message: `Payment ${approved ? "approved" : "rejected"} successfully`,
                };
            }
            catch (error) {
                throw new Error(`Failed to approve payment: ${error.message}`);
            }
        });
        // Refund payment
        this.refundPayment = (id, params) => __awaiter(this, void 0, void 0, function* () {
            try {
                const { amount, reason } = params;
                const payment = yield BedPaymentIn_1.BedPaymentInd.findById(id);
                if (!payment) {
                    throw new Error("Payment not found");
                }
                if (payment.status !== "captured" && payment.status !== "completed") {
                    throw new Error("Only captured/completed payments can be refunded");
                }
                if (!payment.razorpay_payment_id) {
                    throw new Error("Cannot refund: Missing Razorpay payment ID");
                }
                // Create refund in Razorpay
                const refundOptions = {
                    payment_id: payment.razorpay_payment_id,
                };
                if (amount) {
                    refundOptions.amount = Math.round(amount * 100); // Convert to paise for Razorpay
                }
                if (reason) {
                    refundOptions.notes = { reason };
                }
                const refund = yield razorpay.payments.refund(payment.razorpay_payment_id, refundOptions);
                // Update payment record
                payment.status = refund.amount === payment.amount ? "refunded" : "partially_refunded";
                payment.razorpay_refund_response = refund;
                yield payment.save();
                return {
                    success: true,
                    data: {
                        payment,
                        refund,
                    },
                    message: "Payment refunded successfully",
                };
            }
            catch (error) {
                throw new Error(`Failed to refund payment: ${error.message}`);
            }
        });
        // Get payment statistics
        this.getPaymentStatistics = () => __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c, _d, _e, _f, _g, _h, _j;
            try {
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                const weekAgo = new Date(today);
                weekAgo.setDate(weekAgo.getDate() - 7);
                const monthAgo = new Date(today);
                monthAgo.setMonth(monthAgo.getMonth() - 1);
                const stats = yield BedPaymentIn_1.BedPaymentInd.aggregate([
                    {
                        $facet: {
                            total: [
                                {
                                    $match: {
                                        status: { $in: ["captured", "completed"] },
                                    },
                                },
                                {
                                    $group: {
                                        _id: null,
                                        amount: { $sum: "$amount" },
                                        count: { $sum: 1 },
                                    },
                                },
                            ],
                            today: [
                                {
                                    $match: {
                                        status: { $in: ["captured", "completed"] },
                                        paymentDate: { $gte: today },
                                    },
                                },
                                {
                                    $group: {
                                        _id: null,
                                        amount: { $sum: "$amount" },
                                        count: { $sum: 1 },
                                    },
                                },
                            ],
                            week: [
                                {
                                    $match: {
                                        status: { $in: ["captured", "completed"] },
                                        paymentDate: { $gte: weekAgo },
                                    },
                                },
                                {
                                    $group: {
                                        _id: null,
                                        amount: { $sum: "$amount" },
                                        count: { $sum: 1 },
                                    },
                                },
                            ],
                            month: [
                                {
                                    $match: {
                                        status: { $in: ["captured", "completed"] },
                                        paymentDate: { $gte: monthAgo },
                                    },
                                },
                                {
                                    $group: {
                                        _id: null,
                                        amount: { $sum: "$amount" },
                                        count: { $sum: 1 },
                                    },
                                },
                            ],
                        },
                    },
                ]);
                const result = stats[0];
                return {
                    total: {
                        amount: ((_a = result.total[0]) === null || _a === void 0 ? void 0 : _a.amount) || 0, // Already in rupees
                        count: ((_b = result.total[0]) === null || _b === void 0 ? void 0 : _b.count) || 0,
                        avgAmount: ((_c = result.total[0]) === null || _c === void 0 ? void 0 : _c.count) > 0
                            ? result.total[0].amount / result.total[0].count
                            : 0,
                    },
                    today: {
                        amount: ((_d = result.today[0]) === null || _d === void 0 ? void 0 : _d.amount) || 0,
                        count: ((_e = result.today[0]) === null || _e === void 0 ? void 0 : _e.count) || 0,
                    },
                    week: {
                        amount: ((_f = result.week[0]) === null || _f === void 0 ? void 0 : _f.amount) || 0,
                        count: ((_g = result.week[0]) === null || _g === void 0 ? void 0 : _g.count) || 0,
                    },
                    month: {
                        amount: ((_h = result.month[0]) === null || _h === void 0 ? void 0 : _h.amount) || 0,
                        count: ((_j = result.month[0]) === null || _j === void 0 ? void 0 : _j.count) || 0,
                    },
                    dateRanges: {
                        today: { start: today.toISOString(), end: new Date().toISOString() },
                        week: { start: weekAgo.toISOString(), end: new Date().toISOString() },
                        month: { start: monthAgo.toISOString(), end: new Date().toISOString() },
                    },
                };
            }
            catch (error) {
                throw new Error(`Failed to fetch payment statistics: ${error.message}`);
            }
        });
    }
}
exports.default = BedPaymentIndService;
