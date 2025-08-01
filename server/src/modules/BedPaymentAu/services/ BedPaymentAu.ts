// server/src/modules/payment/services/ BedPaymentAuService.ts
import paypal from "@paypal/checkout-server-sdk";
import { BedPaymentAu } from "../models/ BedPaymentAu";
import { Types } from "mongoose";
import DonationReceiptMailer from "../../../services/DonationReceiptMailer";
import { Supporter } from "../../supporter/models/Supporter";

// PayPal SDK Configuration
const environment =
  process.env.NODE_ENV === "production"
    ? new paypal.core.LiveEnvironment(
        process.env.PAYPAL_CLIENT_ID!,
        process.env.PAYPAL_CLIENT_SECRET!
      )
    : new paypal.core.SandboxEnvironment(
        process.env.PAYPAL_CLIENT_ID!,
        process.env.PAYPAL_CLIENT_SECRET!
      );

const client = new paypal.core.PayPalHttpClient(environment);

// Type Definitions

type ContributionPurpose =
  | "general_donation"
  | "medical_assistance"
  | "education_support"
  | "emergency_fund"
  | "other";

type Contribution = {
  purpose: ContributionPurpose;
  description?: string;
};

type PaymentSource =
  | "website"
  | "mobile_app"
  | "social_media"
  | "email_campaign"
  | "other";

type ManualPaymentMethod = "cash" | "cheque" | "bank_transfer" | "other";

type PaymentStatus =
  | "pending"
  | "completed"
  | "failed"
  | "cancelled"
  | "refunded";

interface CreatePaymentParams {
  supporter: any;
  source?: PaymentSource;
}

interface VerifyPaymentParams {
  paypal_order_id: string;
  paypal_payment_id?: string;
}

interface UpdatePaymentParams {
  id: string;
  updateData: Partial<{
    status: PaymentStatus;
    isApproved: boolean;
    remarks: string;
    notes: Record<string, any>;
  }>;
}

interface ManualPaymentParams extends Omit<CreatePaymentParams, "source"> {
  manualMethod: ManualPaymentMethod;
  transactionReference?: string;
  remarks?: string;
  recordedBy: Types.ObjectId;
}

interface RefundPaymentParams {
  amount?: number;
  reason?: string;
}

interface PaymentPaginationResult {
  payments: (typeof BedPaymentAu)[];
  pagination: {
    total: number;
    page: number;
    pages: number;
    limit: number;
  };
}

interface PaymentDetails {
  orderId: string;
  amount: number;
  currency: string;
  approvalUrl: string;
  paymentId: Types.ObjectId;
}

interface PaymentVerificationResult {
  payment: typeof BedPaymentAu;
  paypal_response: any;
}

export default class BedPaymentAuService {
  createPayment = async (
    params: CreatePaymentParams
  ): Promise<{ success: boolean; data: PaymentDetails }> => {
    const { supporter, source = "website" } = params;

    if (!supporter) {
      throw new Error("Supporter ID is required");
    }

    const frontendUrl = process.env.FRONTEND_URL_BED;
    if (!frontendUrl) {
      throw new Error("FRONTEND_URL is not defined in environment variables");
    }

    try {
      // Find supporter and populate user data and bed data to get email, phone, and currency
      const contributorData: any = await Supporter.findById(supporter)
        .populate("user", "email phone address") // Populate user field with email, phone, and address
        .populate("bed", "bedNo") // Populate bed info including amount and organization
        .populate({
          path: "bed",
          populate: {
            path: "country",
            select: "currency", // Assuming country model has currency field
          },
        })
        .exec();

      if (!contributorData) {
        throw new Error("Supporter not found");
      }

      if (!contributorData.isActive) {
        throw new Error("Supporter is not active");
      }

      // Extract user data
      const userEmail = contributorData.user?.email;
      const userPhone = contributorData.user?.phone;
      const userAddress = contributorData.user?.address;

      // Extract bed and payment data
      const bed = contributorData.bed;
      const currency = bed?.country?.currency || "USD"; // Default to USD if currency not found
      const amount = contributorData.amount || bed?.amount || bed?.fixedAmount; // Use supporter amount, or fallback to bed amount/fixedAmount

      if (!userEmail) {
        throw new Error("Supporter email not found");
      }

      if (!amount) {
        throw new Error("Payment amount not found");
      }

      if (!currency) {
        throw new Error("Currency not found");
      }

      const request: any = new paypal.orders.OrdersCreateRequest();
      request.prefer("return=representation");
      request.requestBody({
        intent: "CAPTURE",
        purchase_units: [
          {
            amount: {
              currency_code: currency,
              value: amount.toString(),
              breakdown: {
                item_total: {
                  currency_code: currency,
                  value: amount.toString(),
                },
              },
            },
            items: [
              {
                name: "Donation",
                quantity: "1",
                unit_amount: {
                  currency_code: currency,
                  value: amount.toString(),
                },
              },
            ],
            custom_id: `contrib_${Date.now()}`,
            description: "Generous contribution payment",
            soft_descriptor: "GENEROUS CONTRIB",
          },
        ],
        payer: {
          name: {
            given_name: contributorData.name.split(" ")[0],
            surname: contributorData.name.split(" ").slice(1).join(" ") || "",
          },
          email_address: userEmail,
        },
        application_context: {
          brand_name: "Generous Contributions",
          landing_page: "BILLING",
          user_action: "PAY_NOW",
          return_url: `${frontendUrl}/success`,
          cancel_url: `${frontendUrl}`,
        },
      });

      const order = await client.execute(request);

      // Create payment record with supporter data
      const payment = await BedPaymentAu.create({
        paypal_order_id: order.result.id,
        supporter: contributorData._id, // Add supporter reference
        bed: contributorData.bed._id,
        amount,
        currency,
        status: "pending",
        paymentMode: "online",
        paymentDate: new Date(),
        source,
        isApproved: true,
        notes: {
          paypal_order: order.result,
          bed: contributorData.bed?._id,
          bedNo: contributorData.bed?.bedNo,
          currency: currency,
        },
      });

      const approvalUrl = order.result.links?.find(
        (link: any) => link.rel === "approve"
      )?.href;

      return {
        success: true,
        data: {
          orderId: order.result.id,
          amount,
          currency,
          approvalUrl: approvalUrl || "",
          paymentId: payment._id
        },
      };
    } catch (error: any) {
      console.error("Error creating payment:", error);
      throw new Error(`Failed to create payment: ${error.message}`);
    }
  };
  verifyPayment = async (
    params: VerifyPaymentParams
  ): Promise<{ success: boolean; data: PaymentVerificationResult }> => {
    const { paypal_order_id, paypal_payment_id } = params;

    const payment: any = await BedPaymentAu.findOne({
      paypal_order_id,
    });
    console.warn(payment);
    if (!payment) {
      throw new Error("Payment record not found");
    }

    try {
      const request: any = new paypal.orders.OrdersCaptureRequest(
        paypal_order_id
      );
      request.requestBody({});

      const capture = await client.execute(request);

      if (capture.result.status === "COMPLETED") {
        // Update payment record
        payment.paypal_payment_id = paypal_payment_id || capture.result.id;
        payment.paypal_payer_id = capture.result.payer?.payer_id;
        payment.paypal_capture_id =
          capture.result.purchase_units?.[0]?.payments?.captures?.[0]?.id;
        payment.status = "completed";
        payment.isApproved = true;
        payment.paypal_capture_response = capture.result; // Store complete capture response
        payment.notes = { ...payment.notes, paypal_capture: capture.result };

        // Extract payer information from PayPal response
        if (capture.result.payer) {
          payment.payer = {
            email_address: capture.result.payer.email_address,
            payer_id: capture.result.payer.payer_id,
            name: capture.result.payer.name,
            phone: capture.result.payer.phone,
            address: capture.result.payer.address,
          };

          // Also set the top-level fields for easier access

          // payment.email = capture.result.payer.email_address;
          // if (capture.result.payer.name) {
          //   payment.name = `${capture.result.payer.name.given_name || ''} ${capture.result.payer.name.surname || ''}`.trim();
          // }
          // if (capture.result.payer.phone?.phone_number?.national_number) {
          //   payment.phNo = capture.result.payer.phone.phone_number.national_number;
          // }
        }

        await payment.save();

        // Send receipt email after successful payment verification
        try {
          const payerEmail = payment.email;
          const payerName = payment.name;
          const address = payment.address || "";

          if (payerEmail) {
            await DonationReceiptMailer.sendDonationReceiptEmail({
              email: payerEmail,
              name: payerName,
              phoneNo: payment.phNo,
              amount: payment.amount,
              address: address,
              transactionNumber:
                payment.paypal_capture_id ||
                payment.paypal_payment_id ||
                payment.paypal_order_id,
              receiptNumber: payment.receiptNumber,
              date: new Date(payment.paymentDate).toLocaleDateString("en-AU", {
                year: "numeric",
                month: "long",
                day: "numeric",
              }),
              programName:
                payment.contribution?.description ||
                "Generous Contribution Program",
            });

            console.log(
              `Donation receipt email sent successfully to ${payerEmail}`
            );
          } else {
            console.warn(
              `No email address found for payment ${payment.receiptNumber}`
            );
          }
        } catch (emailError: any) {
          // Log email error but don't fail the payment verification
          console.error("Failed to send donation receipt email:", emailError);

          // Optionally, you could add a flag to retry email sending later
          payment.notes = {
            ...payment.notes,
            email_failed: true,
            email_error: emailError.message,
            email_retry_needed: true,
          };
          await payment.save();
        }

        return {
          success: true,
          data: {
            payment,
            paypal_response: capture.result,
          },
        };
      }

      throw new Error(
        `Payment capture failed with status: ${capture.result.status}`
      );
    } catch (error: any) {
      console.error("Error verifying payment:", error);
      payment.status = "failed";
      payment.error_details = {
        error_code: error.code || "VERIFICATION_FAILED",
        error_message: error.message,
        debug_id: error.debug_id || null,
      };
      await payment.save();
      throw error;
    }
  };

  getAllPayments = async (
    query: Record<string, any> = {},
    options: {
      page?: number;
      limit?: number;
      sort?: string;
      populate?: boolean;
    } = {}
  ): Promise<{ success: boolean; data: PaymentPaginationResult }> => {
    const {
      page = 1,
      limit = 10,
      sort = "-createdAt",
      populate = false,
      ...filters
    } = options;

    const skip = (page - 1) * limit;
    let queryBuilder = BedPaymentAu.find({
      ...query,
      ...filters,
    })
      .sort(sort)
      .skip(skip)
      .limit(limit);

    if (populate) {
      queryBuilder = queryBuilder
        .populate("recordedBy", "name email")
        .populate("approvedBy", "name email");
    }

    const payments: any = await queryBuilder.exec();
    const total = await BedPaymentAu.countDocuments({
      ...query,
      ...filters,
    });

    return {
      success: true,
      data: {
        payments,
        pagination: {
          total,
          page,
          pages: Math.ceil(total / limit),
          limit,
        },
      },
    };
  };

  getPaymentById = async (
    id: string
  ): Promise<{
    success: boolean;
    data: { payment: typeof BedPaymentAu };
  }> => {
    const payment: any = await BedPaymentAu.findById(id)
      .populate("recordedBy", "name email")
      .populate("approvedBy", "name email");

    if (!payment) {
      throw new Error("Payment not found");
    }

    return {
      success: true,
      data: { payment },
    };
  };

  updatePayment = async (
    params: UpdatePaymentParams
  ): Promise<{
    success: boolean;
    data: { payment: typeof BedPaymentAu };
  }> => {
    const { id, updateData } = params;

    const payment: any = await BedPaymentAu.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!payment) {
      throw new Error("Payment not found");
    }

    return {
      success: true,
      data: { payment },
    };
  };

  deletePayment = async (
    id: string
  ): Promise<{ success: boolean; message: string }> => {
    const payment = await BedPaymentAu.findByIdAndDelete(id);

    if (!payment) {
      throw new Error("Payment not found");
    }

    return {
      success: true,
      message: "Payment deleted successfully",
    };
  };

  // createManualPayment = async (
  //   params: ManualPaymentParams
  // ): Promise<{
  //   success: boolean;
  //   data: { payment: typeof BedPaymentAu };
  // }> => {
  //   const {
  //     amount,
  //     currency = "USD",
  //     contributor,
  //     manualMethod,
  //     transactionReference,
  //     remarks,
  //     recordedBy,
  //   } = params;

  //   if (!amount || amount <= 0) {
  //     throw new Error("Amount must be greater than 0");
  //   }

  //   // if (!contributor.name || !contributor.email) {
  //   //   throw new Error("Contributor name and email are required");
  //   // }

  //   // if (!contribution.purpose) {
  //   //   throw new Error("Contribution purpose is required");
  //   // }

  //   const payment: any = await BedPaymentAu.create({
  //     amount,
  //     currency,
  //     status: "pending",
  //     paymentMode: "offline",
  //     manualMethod,
  //     transactionReference,
  //     remarks,
  //     contributor,
  //     paymentDate: new Date(),
  //     recordedBy,
  //     isApproved: false,
  //   });

  //   return {
  //     success: true,
  //     data: { payment },
  //   };
  // };

  approvePayment = async (
    id: string,
    approvedBy: Types.ObjectId
  ): Promise<{
    success: boolean;
    data: { payment: typeof BedPaymentAu };
  }> => {
    const payment: any = await BedPaymentAu.findById(id);
    if (!payment) {
      throw new Error("Payment not found");
    }

    if (payment.paymentMode !== "offline") {
      throw new Error("Only offline payments need approval");
    }

    if (payment.isApproved) {
      throw new Error("Payment is already approved");
    }

    payment.isApproved = true;
    payment.approvedBy = approvedBy;
    payment.approvedAt = new Date();
    payment.status = "completed";

    await payment.save();

    return {
      success: true,
      data: { payment },
    };
  };

  refundPayment = async (
    id: string,
    refundData: RefundPaymentParams
  ): Promise<{
    success: boolean;
    data: { payment: typeof BedPaymentAu };
  }> => {
    const payment: any = await BedPaymentAu.findById(id);
    if (!payment) {
      throw new Error("Payment not found");
    }

    if (payment.status !== "completed") {
      throw new Error("Only completed payments can be refunded");
    }

    try {
      if (payment.paypal_capture_id) {
        const request: any = new paypal.payments.CapturesRefundRequest(
          payment.paypal_capture_id
        );
        request.requestBody({
          amount: {
            currency_code: payment.currency,
            value: refundData.amount?.toString() || payment.amount.toString(),
          },
          note_to_payer: refundData.reason || "Refund processed",
        });

        const refund = await client.execute(request);

        if (refund.result.status === "COMPLETED") {
          payment.status = "refunded";
          await payment.save();
        }
      }

      return {
        success: true,
        data: { payment },
      };
    } catch (error) {
      console.error("Error refunding payment:", error);
      throw error;
    }
  };
}
