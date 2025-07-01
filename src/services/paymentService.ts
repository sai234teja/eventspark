
import { supabase } from '@/contexts/AuthContext';

export interface PaymentData {
  eventId: number;
  eventTitle: string;
  price: string;
  userDetails: {
    name: string;
    email: string;
    phone: string;
    address?: string;
  };
}

export const createSecureCheckout = async (paymentData: PaymentData) => {
  try {
    const { data, error } = await supabase.functions.invoke('create-checkout', {
      body: {
        eventId: paymentData.eventId,
        eventTitle: paymentData.eventTitle,
        price: paymentData.price,
        userDetails: paymentData.userDetails,
      },
    });

    if (error) {
      console.error('Payment error:', error);
      throw new Error(error.message || 'Payment initialization failed');
    }

    return data;
  } catch (error) {
    console.error('Secure checkout error:', error);
    throw error;
  }
};

export const verifyPayment = async (paymentId: string, eventId: number) => {
  try {
    const { data, error } = await supabase.functions.invoke('verify-payment', {
      body: {
        paymentId,
        eventId,
      },
    });

    if (error) {
      console.error('Payment verification error:', error);
      throw new Error(error.message || 'Payment verification failed');
    }

    return data;
  } catch (error) {
    console.error('Payment verification error:', error);
    throw error;
  }
};
