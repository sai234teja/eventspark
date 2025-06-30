
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

    // Initialize Razorpay payment
    const options = {
      key: "rzp_test_your_key_here", // Replace with your Razorpay key
      amount: parseFloat(price.replace('$', '').replace('Free', '0')) * 100, // Amount in paise
      currency: "INR",
      name: "EventSpark",
      description: `Registration for ${eventTitle}`,
      handler: function (response: any) {
        console.log("Payment successful:", response);
        toast({
          title: "Payment Successful!",
          description: "You have been registered for the event.",
        });
        onSuccess();
        onClose();
        setIsProcessing(false);
      },
      prefill: {
        name: userDetails.name,
        email: userDetails.email,
        contact: userDetails.phone,
      },
      theme: {
        color: "#8B5CF6",
      },
      method: {
        upi: {
          vpa: "9398148549@paytm" // Your UPI ID
        }
      }
    };

    // Simulate payment for demo (replace with actual Razorpay integration)
    setTimeout(() => {
      toast({
        title: "Payment Successful!",
        description: "You have been registered for the event.",
      });
      onSuccess();
      onClose();
      setIsProcessing(false);
    }, 2000);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-white/95 backdrop-blur-sm border-purple-300/20">
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
            />
          </div>
          
          <div>
            <Label htmlFor="address" className="text-purple-900">Address</Label>
            <Input
              id="address"
              value={userDetails.address}
              onChange={(e) => setUserDetails(prev => ({ ...prev, address: e.target.value }))}
              className="border-purple-300"
            />
          </div>

          <div className="bg-purple-50 p-4 rounded-lg">
            <p className="text-purple-900 font-semibold">Payment Details:</p>
            <p className="text-purple-700">Event: {eventTitle}</p>
            <p className="text-purple-700">Amount: {price === "Free" ? "₹0" : `₹${parseFloat(price.replace('$', '')) * 75}`}</p>
            <p className="text-purple-700 text-sm">UPI: 9398148549@paytm</p>
          </div>

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={onClose}
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
              {isProcessing ? "Processing..." : `Pay ${price === "Free" ? "₹0" : `₹${parseFloat(price.replace('$', '')) * 75}`}`}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PaymentModal;
