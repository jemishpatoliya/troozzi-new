import axios from 'axios';

// Support Tickets API
export const supportAPI = {
  // Create a new support ticket
  createTicket: async (ticketData: any) => {
    try {
      const response = await axios.post('/api/support/ticket', ticketData);
      return response.data;
    } catch (error) {
      console.error('Error creating support ticket:', error);
      throw error;
    }
  },

  // Get all tickets for a user
  getUserTickets: async (userId: string) => {
    try {
      const response = await axios.get(`/api/support/user/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching user tickets:', error);
      throw error;
    }
  },

  // Get all tickets (admin only)
  getAllTickets: async (filters: any = {}) => {
    try {
      const params = new URLSearchParams();
      if (filters.status) params.append('status', filters.status);
      if (filters.userId) params.append('userId', filters.userId);
      if (filters.dateFrom) params.append('dateFrom', filters.dateFrom);
      if (filters.dateTo) params.append('dateTo', filters.dateTo);
      if (filters.page) params.append('page', filters.page);
      if (filters.limit) params.append('limit', filters.limit);

      const response = await axios.get(`/api/support/all?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching all tickets:', error);
      throw error;
    }
  },

  // Get single ticket details
  getTicket: async (ticketId: string) => {
    try {
      const response = await axios.get(`/api/support/ticket/${ticketId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching ticket:', error);
      throw error;
    }
  },

  // Reply to a ticket (admin only)
  replyToTicket: async (ticketId: string, replyData: any) => {
    try {
      const response = await axios.put(`/api/support/${ticketId}/reply`, replyData);
      return response.data;
    } catch (error) {
      console.error('Error replying to ticket:', error);
      throw error;
    }
  },

  // Update ticket status (admin only)
  updateTicketStatus: async (ticketId: string, status: string) => {
    try {
      const response = await axios.put(`/api/support/${ticketId}/status`, { status });
      return response.data;
    } catch (error) {
      console.error('Error updating ticket status:', error);
      throw error;
    }
  },

  // Close ticket (admin only)
  closeTicket: async (ticketId: string) => {
    try {
      const response = await axios.put(`/api/support/${ticketId}/close`);
      return response.data;
    } catch (error) {
      console.error('Error closing ticket:', error);
      throw error;
    }
  },

  // Delete ticket (admin only)
  deleteTicket: async (ticketId: string) => {
    try {
      const response = await axios.delete(`/api/support/${ticketId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting ticket:', error);
      throw error;
    }
  }
};

// Orders API
export const ordersAPI = {
  // Create a new order
  createOrder: async (orderData: any) => {
    try {
      const response = await axios.post('/api/orders', orderData);
      return response.data;
    } catch (error) {
      console.error('Error creating order:', error);
      throw error;
    }
  },

  // Get all orders for a user
  getUserOrders: async (userId: string) => {
    try {
      const response = await axios.get(`/api/orders/user/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching user orders:', error);
      throw error;
    }
  },

  // Get single order details
  getOrder: async (orderId: string) => {
    try {
      const response = await axios.get(`/api/orders/${orderId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching order:', error);
      throw error;
    }
  },

  // Get all orders (admin only)
  getAllOrders: async (filters: any = {}) => {
    try {
      const params = new URLSearchParams();
      if (filters.status) params.append('status', filters.status);
      if (filters.userId) params.append('userId', filters.userId);
      if (filters.dateFrom) params.append('dateFrom', filters.dateFrom);
      if (filters.dateTo) params.append('dateTo', filters.dateTo);
      if (filters.search) params.append('search', filters.search);
      if (filters.page) params.append('page', filters.page);
      if (filters.limit) params.append('limit', filters.limit);

      const response = await axios.get(`/api/orders?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching all orders:', error);
      throw error;
    }
  },

  // Update order status (admin only)
  updateOrderStatus: async (orderId: string, statusData: any) => {
    try {
      const response = await axios.put(`/api/orders/${orderId}/status`, statusData);
      return response.data;
    } catch (error) {
      console.error('Error updating order status:', error);
      throw error;
    }
  },

  // Cancel order
  cancelOrder: async (orderId: string, reason: string) => {
    try {
      const response = await axios.put(`/api/orders/${orderId}/cancel`, { reason });
      return response.data;
    } catch (error) {
      console.error('Error cancelling order:', error);
      throw error;
    }
  },

  // Return order
  returnOrder: async (orderId: string, returnData: any) => {
    try {
      const response = await axios.put(`/api/orders/${orderId}/return`, returnData);
      return response.data;
    } catch (error) {
      console.error('Error returning order:', error);
      throw error;
    }
  },

  // Add tracking information (admin only)
  addTracking: async (orderId: string, trackingData: any) => {
    try {
      const response = await axios.put(`/api/orders/${orderId}/tracking`, trackingData);
      return response.data;
    } catch (error) {
      console.error('Error adding tracking:', error);
      throw error;
    }
  },

  // Get order tracking information
  getOrderTracking: async (orderId: string) => {
    try {
      const response = await axios.get(`/api/orders/${orderId}/tracking`);
      return response.data;
    } catch (error) {
      console.error('Error fetching order tracking:', error);
      throw error;
    }
  }
};
