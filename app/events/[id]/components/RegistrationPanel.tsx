'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Loader2 } from 'lucide-react';

export interface TicketTier {
  id: string;
  name: string;
  price: number;
  capacity: number;
  sold_count: number;
  description: string;
  is_active: boolean;
}

interface RegistrationPanelProps {
  tiers: TicketTier[];
  eventId: number;
  onCheckout: (tierId: string, quantity: number, couponCode?: string) => void;
  isLoading: boolean;
}

export function RegistrationPanel({ tiers, eventId, onCheckout, isLoading }: RegistrationPanelProps) {
  const [selectedTier, setSelectedTier] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [couponCode, setCouponCode] = useState('');

  const activeTier = tiers.find(t => t.id === selectedTier);

  return (
    <Card className="sticky top-24 border bg-background shadow-lg">
      <CardHeader>
        <CardTitle>Tickets</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          {tiers.length === 0 ? (
            <div className="text-muted-foreground text-center py-4">No tickets available</div>
          ) : (
            tiers.map(tier => {
              const remaining = tier.capacity - tier.sold_count;
              const isSoldOut = remaining <= 0;
              const isSelected = selectedTier === tier.id;

              return (
                <div 
                  key={tier.id}
                  onClick={() => !isSoldOut && setSelectedTier(tier.id)}
                  className={`
                    border rounded-lg p-4 cursor-pointer transition-colors
                    ${isSelected ? 'border-primary bg-primary/5' : 'hover:border-primary/50'}
                    ${isSoldOut ? 'opacity-50 cursor-not-allowed' : ''}
                  `}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="font-semibold">{tier.name}</h4>
                      <p className="text-sm text-muted-foreground">{tier.description}</p>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-lg">₹{tier.price}</div>
                      {isSoldOut ? (
                        <Badge variant="destructive">Sold Out</Badge>
                      ) : (
                        <span className="text-xs text-muted-foreground">{remaining} left</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {selectedTier && activeTier && (
          <div className="space-y-4 pt-4 border-t">
            <div className="flex justify-between items-center">
              <label className="text-sm font-medium">Quantity</label>
              <select 
                className="border rounded p-1 text-sm bg-background"
                value={quantity} 
                onChange={e => setQuantity(Number(e.target.value))}
              >
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => (
                  <option key={n} value={n} disabled={n > (activeTier.capacity - activeTier.sold_count)}>
                    {n}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Coupon Code (Optional)</label>
              <div className="flex gap-2">
                <Input 
                  value={couponCode} 
                  onChange={e => setCouponCode(e.target.value)} 
                  placeholder="Enter code" 
                  className="uppercase"
                />
              </div>
            </div>

            <div className="pt-2">
              <div className="flex justify-between font-bold mb-4">
                <span>Total Amount</span>
                <span>₹{activeTier.price * quantity}</span>
              </div>
              <Button 
                className="w-full" 
                size="lg" 
                onClick={() => onCheckout(selectedTier, quantity, couponCode)}
                disabled={isLoading}
              >
                {isLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : 'Checkout with Razorpay'}
              </Button>
              <p className="text-xs text-muted-foreground text-center mt-2">
                +18% GST will be calculated at checkout
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
