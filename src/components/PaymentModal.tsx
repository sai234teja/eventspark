
import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  eventTitle: string;
  price: string;
}

declare global {
  interface Window {
    Razorpay: new (options: Record<string, unknown>) => { 
      on: (event: string, callback: (response: { error: { description: string } }) => void) => void;
      open: () => void;
    };
  }
}

const PaymentModal = ({ isOpen, onClose, onSuccess, eventTitle, price }: PaymentModalProps) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [userDetails, setUserDetails] = useState({
    name: "",
    email: "",
    phone: "",
    address: ""
  });
  const { toast } = useToast();

  const handlePayment = async () => {
    if (!userDetails.name || !userDetails.email || !userDetails.phone) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);

    const amount = price === "Free" ? 0 : parseFloat(price.replace('$', '')) * 75;

    if (amount === 0) {
      // Free event - no payment needed
      setTimeout(() => {
        toast({
          title: "Registration Successful!",
          description: "You have been registered for the free event.",
        });
        onSuccess();
        onClose();
        setIsProcessing(false);
      }, 1000);
      return;
    }

    // Check if Razorpay script is already loaded
    if (window.Razorpay) {
      initializeRazorpay();
    } else {
      // Load Razorpay script
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      script.onload = () => {
        initializeRazorpay();
      };
      
      script.onerror = () => {
        setIsProcessing(false);
        toast({
          title: "Payment Error",
          description: "Failed to load payment gateway. Please try again.",
          variant: "destructive"
        });
      };
      
      document.head.appendChild(script);
    }
  };

  const initializeRazorpay = () => {
    const amount = parseFloat(price.replace('$', '')) * 75;
    
    const options = {
      key: "rzp_test_9WzaAMmzjGhPDT", // Test key - replace with your actual key
      amount: amount * 100, // Amount in paise
      currency: "INR",
      name: "EventSpark",
      description: `Registration for ${eventTitle}`,
      image: "/favicon.ico",
      handler: function (response: { razorpay_payment_id: string }) {
        setIsProcessing(false);
        toast({
          title: "Payment Successful!",
          description: `Payment ID: ${response.razorpay_payment_id}`,
        });
        onSuccess();
        onClose();
      },
      prefill: {
        name: userDetails.name,
        email: userDetails.email,
        contact: userDetails.phone,
      },
      notes: {
        address: userDetails.address,
        event: eventTitle
      },
      theme: {
        color: "#8B5CF6",
      },
      method: {
        upi: true,
        card: true,
        netbanking: true,
        wallet: true
      },
      modal: {
        ondismiss: function() {
          setIsProcessing(false);
        },
        escape: true,
        backdropclose: false
      }
    };

    try {
      const rzp = new window.Razorpay(options);
      
      rzp.on('payment.failed', function (response: { error: { description: string } }) {
        console.error('Payment failed:', response.error);
        setIsProcessing(false);
        toast({
          title: "Payment Failed",
          description: `Error: ${response.error.description || 'Payment could not be processed'}`,
          variant: "destructive"
        });
      });

      rzp.open();
    } catch (error) {
      console.error('Razorpay initialization error:', error);
      setIsProcessing(false);
      toast({
        title: "Payment Error",
        description: "Failed to initialize payment. Please try again.",
        variant: "destructive"
      });
    }
  };

  const resetForm = () => {
    setUserDetails({
      name: "",
      email: "",
      phone: "",
      address: ""
    });
    setIsProcessing(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="bg-white/95 backdrop-blur-sm border-purple-300/20 max-w-md">
        <DialogHeader>
          <DialogTitle className="text-purple-900">Complete Registration</DialogTitle>
          <DialogDescription className="text-purple-700">
            Fill in your details and proceed with payment for {eventTitle}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="name" className="text-purple-900">Full Name *</Label>
            <Input
              id="name"
              value={userDetails.name}
              onChange={(e) => setUserDetails(prev => ({ ...prev, name: e.target.value }))}
              className="border-purple-300"
              required
              disabled={isProcessing}
            />
          </div>
          
          <div>
            <Label htmlFor="email" className="text-purple-900">Email *</Label>
            <Input
              id="email"
              type="email"
              value={userDetails.email}
              onChange={(e) => setUserDetails(prev => ({ ...prev, email: e.target.value }))}
              className="border-purple-300"
              required
              disabled={isProcessing}
            />
          </div>
          
          <div>
            <Label htmlFor="phone" className="text-purple-900">Phone Number *</Label>
            <Input
              id="phone"
              type="tel"
              value={userDetails.phone}
              onChange={(e) => setUserDetails(prev => ({ ...prev, phone: e.target.value }))}
              className="border-purple-300"
              required
              disabled={isProcessing}
            />
          </div>
          
          <div>
            <Label htmlFor="address" className="text-purple-900">Address</Label>
            <Input
              id="address"
              value={userDetails.address}
              onChange={(e) => setUserDetails(prev => ({ ...prev, address: e.target.value }))}
              className="border-purple-300"
              disabled={isProcessing}
            />
          </div>

          <div className="bg-purple-50 p-4 rounded-lg">
            <p className="text-purple-900 font-semibold">Payment Details:</p>
            <p className="text-purple-700">Event: {eventTitle}</p>
            <p className="text-purple-700">Amount: {price === "Free" ? "₹0" : `₹${parseFloat(price.replace('$', '')) * 75}`}</p>
            {price !== "Free" && (
              <div className="mt-2 text-purple-700 text-sm">
                <p>UPI ID: 9398148549@paytm</p>
                <p>Supports: UPI, Cards, Net Banking, Wallets</p>
              </div>
            )}
          </div>

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={handleClose}
              className="flex-1"
              disabled={isProcessing}
            >
              Cancel
            </Button>
            <Button
              onClick={handlePayment}
              disabled={isProcessing}
              className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
            >
              {isProcessing ? "Processing..." : 
               price === "Free" ? "Register Free" : 
               `Pay ₹${parseFloat(price.replace('$', '')) * 75}`}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PaymentModal;
