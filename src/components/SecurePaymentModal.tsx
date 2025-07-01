
import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { createSecureCheckout, PaymentData } from "@/services/paymentService";
import { eventRegistrationSchema } from "@/lib/validation";
import { z } from "zod";

interface SecurePaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  eventId: number;
  eventTitle: string;
  price: string;
}

const SecurePaymentModal = ({ isOpen, onClose, onSuccess, eventId, eventTitle, price }: SecurePaymentModalProps) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [userDetails, setUserDetails] = useState({
    name: "",
    email: "",
    phone: "",
    address: ""
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { toast } = useToast();
  const { user } = useAuth();

  const validateForm = () => {
    try {
      eventRegistrationSchema.parse(userDetails);
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          if (err.path[0]) {
            newErrors[err.path[0] as string] = err.message;
          }
        });
        setErrors(newErrors);
      }
      return false;
    }
  };

  const handleSecurePayment = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to register for events.",
        variant: "destructive"
      });
      return;
    }

    if (!validateForm()) {
      toast({
        title: "Validation Error",
        description: "Please correct the errors in the form.",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);

    try {
      const paymentData: PaymentData = {
        eventId,
        eventTitle,
        price,
        userDetails: {
          name: userDetails.name,
          email: userDetails.email,
          phone: userDetails.phone,
          address: userDetails.address,
        }
      };

      const result = await createSecureCheckout(paymentData);

      if (result.success) {
        toast({
          title: "Registration Successful!",
          description: "You have been successfully registered for the event.",
        });
        onSuccess();
        onClose();
      } else {
        throw new Error(result.error || 'Payment failed');
      }
    } catch (error) {
      console.error('Payment error:', error);
      toast({
        title: "Payment Failed",
        description: error instanceof Error ? error.message : "An unexpected error occurred.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-white/95 backdrop-blur-sm border-purple-300/20 max-w-md">
        <DialogHeader>
          <DialogTitle className="text-purple-900">Secure Registration</DialogTitle>
          <DialogDescription className="text-purple-700">
            Complete your secure registration for {eventTitle}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="name" className="text-purple-900">Full Name *</Label>
            <Input
              id="name"
              value={userDetails.name}
              onChange={(e) => setUserDetails(prev => ({ ...prev, name: e.target.value }))}
              className={`border-purple-300 ${errors.name ? 'border-red-500' : ''}`}
              required
            />
            {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
          </div>
          
          <div>
            <Label htmlFor="email" className="text-purple-900">Email *</Label>
            <Input
              id="email"
              type="email"
              value={userDetails.email}
              onChange={(e) => setUserDetails(prev => ({ ...prev, email: e.target.value }))}
              className={`border-purple-300 ${errors.email ? 'border-red-500' : ''}`}
              required
            />
            {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
          </div>
          
          <div>
            <Label htmlFor="phone" className="text-purple-900">Phone Number *</Label>
            <Input
              id="phone"
              type="tel"
              value={userDetails.phone}
              onChange={(e) => setUserDetails(prev => ({ ...prev, phone: e.target.value }))}
              className={`border-purple-300 ${errors.phone ? 'border-red-500' : ''}`}
              required
            />
            {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
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
            <p className="text-purple-900 font-semibold">Registration Details:</p>
            <p className="text-purple-700">Event: {eventTitle}</p>
            <p className="text-purple-700">Amount: {price === "Free" ? "Free" : `₹${parseFloat(price.replace('$', '')) * 75}`}</p>
            <div className="mt-2 text-purple-700 text-sm">
              <p>🔒 Secure payment processing</p>
              <p>🛡️ Your data is encrypted and protected</p>
            </div>
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
              onClick={handleSecurePayment}
              disabled={isProcessing}
              className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
            >
              {isProcessing ? "Processing..." : 
               price === "Free" ? "Register Free" : 
               `Secure Pay ₹${parseFloat(price.replace('$', '')) * 75}`}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SecurePaymentModal;
