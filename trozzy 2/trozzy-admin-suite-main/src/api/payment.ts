import axios from 'axios';

export interface PaymentMethod {
  id: string;
  type: 'phonepe' | 'paytm' | 'googlepay' | 'upi' | 'card' | 'netbanking';
  name: string;
  icon: string;
  enabled: boolean;
}

export interface PaymentTransaction {
  id: string;
  orderId: string;
  userId: string;
  amount: number;
  currency: string;
  paymentMethod: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'refunded' | 'cancelled';
  transactionId?: string;
  upiId?: string;
  merchantTransactionId?: string;
  gatewayResponse?: any;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  refundedAt?: string;
  failureReason?: string;
}

export interface CreatePaymentRequest {
  orderId: string;
  userId: string;
  amount: number;
  currency?: string;
  paymentMethod: string;
  customerInfo: {
    name: string;
    email: string;
    phone: string;
  };
  returnUrl?: string;
  cancelUrl?: string;
}

export interface RefundRequest {
  transactionId: string;
  amount?: number;
  reason: string;
  notifyCustomer?: boolean;
}

export const paymentAPI = {
  // Get all available payment methods
  getPaymentMethods: async () => {
    try {
      const response = await axios.get('/api/payments/methods');
      return response.data;
    } catch (error) {
      console.error('Error fetching payment methods:', error);
      throw error;
    }
  },

  // Create a new payment
  createPayment: async (paymentData: CreatePaymentRequest) => {
    try {
      const response = await axios.post('/api/payments/create', paymentData);
      return response.data;
    } catch (error) {
      console.error('Error creating payment:', error);
      throw error;
    }
  },

  // Process PhonePe payment
  processPhonePePayment: async (paymentData: CreatePaymentRequest) => {
    try {
      const response = await axios.post('/api/payments/phonepe', paymentData);
      return response.data;
    } catch (error) {
      console.error('Error processing PhonePe payment:', error);
      throw error;
    }
  },

  // Process Paytm payment
  processPaytmPayment: async (paymentData: CreatePaymentRequest) => {
    try {
      const response = await axios.post('/api/payments/paytm', paymentData);
      return response.data;
    } catch (error) {
      console.error('Error processing Paytm payment:', error);
      throw error;
    }
  },

  // Process Google Pay payment
  processGooglePayPayment: async (paymentData: CreatePaymentRequest) => {
    try {
      const response = await axios.post('/api/payments/googlepay', paymentData);
      return response.data;
    } catch (error) {
      console.error('Error processing Google Pay payment:', error);
      throw error;
    }
  },

  // Process UPI payment
  processUPIPayment: async (paymentData: CreatePaymentRequest) => {
    try {
      const response = await axios.post('/api/payments/upi', paymentData);
      return response.data;
    } catch (error) {
      console.error('Error processing UPI payment:', error);
      throw error;
    }
  },

  // Get payment status
  getPaymentStatus: async (transactionId: string) => {
    try {
      const response = await axios.get(`/api/payments/status/${transactionId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching payment status:', error);
      throw error;
    }
  },

  // Get all transactions (admin)
  getAllTransactions: async (filters: {
    status?: string;
    paymentMethod?: string;
    dateFrom?: string;
    dateTo?: string;
    search?: string;
    page?: number;
    limit?: number;
  } = {}) => {
    try {
      const params = new URLSearchParams();
      if (filters.status) params.append('status', filters.status);
      if (filters.paymentMethod) params.append('paymentMethod', filters.paymentMethod);
      if (filters.dateFrom) params.append('dateFrom', filters.dateFrom);
      if (filters.dateTo) params.append('dateTo', filters.dateTo);
      if (filters.search) params.append('search', filters.search);
      if (filters.page) params.append('page', filters.page.toString());
      if (filters.limit) params.append('limit', filters.limit.toString());

      const response = await axios.get(`/api/payments/transactions?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching transactions:', error);
      throw error;
    }
  },

  // Get user transactions
  getUserTransactions: async (userId: string, filters: {
    status?: string;
    paymentMethod?: string;
    dateFrom?: string;
    dateTo?: string;
    page?: number;
    limit?: number;
  } = {}) => {
    try {
      const params = new URLSearchParams();
      if (filters.status) params.append('status', filters.status);
      if (filters.paymentMethod) params.append('paymentMethod', filters.paymentMethod);
      if (filters.dateFrom) params.append('dateFrom', filters.dateFrom);
      if (filters.dateTo) params.append('dateTo', filters.dateTo);
      if (filters.page) params.append('page', filters.page.toString());
      if (filters.limit) params.append('limit', filters.limit.toString());

      const response = await axios.get(`/api/payments/user/${userId}?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching user transactions:', error);
      throw error;
    }
  },

  // Refund payment
  refundPayment: async (refundData: RefundRequest) => {
    try {
      const response = await axios.post('/api/payments/refund', refundData);
      return response.data;
    } catch (error) {
      console.error('Error processing refund:', error);
      throw error;
    }
  },

  // Cancel payment
  cancelPayment: async (transactionId: string, reason: string) => {
    try {
      const response = await axios.post(`/api/payments/cancel/${transactionId}`, { reason });
      return response.data;
    } catch (error) {
      console.error('Error cancelling payment:', error);
      throw error;
    }
  },

  // Verify payment webhook
  verifyWebhook: async (webhookData: any, signature: string) => {
    try {
      const response = await axios.post('/api/payments/webhook/verify', {
        data: webhookData,
        signature
      });
      return response.data;
    } catch (error) {
      console.error('Error verifying webhook:', error);
      throw error;
    }
  }
};
