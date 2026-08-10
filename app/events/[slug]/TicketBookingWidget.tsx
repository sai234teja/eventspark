'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Ticket, Minus, Plus, Check } from 'lucide-react';
import ElectricBorder from '@/components/ui/ElectricBorder';

type TicketType = {
  id: string;
  name: string;
  price: number;
  quantity_total: number;
  quantity_sold: number;
  description: string | null;
};

type Props = {
  event: { id: string; title: string; slug: string };
  ticketTypes: TicketType[];
  isLoggedIn: boolean;
};

export function TicketBookingWidget({ event, ticketTypes, isLoggedIn }: Props) {
  const router = useRouter();
  const [selectedTypeId, setSelectedTypeId] = useState<string>(ticketTypes[0]?.id || '');
  const [quantity, setQuantity] = useState(1);

  const selectedType = ticketTypes.find(t => t.id === selectedTypeId);
  const available = selectedType
    ? selectedType.quantity_total - (selectedType.quantity_sold || 0)
    : 0;
  const maxQty = Math.min(10, available);
  const totalAmount = selectedType ? selectedType.price * quantity : 0;

  const handleBookNow = () => {
    if (!isLoggedIn) {
      router.push(`/auth/login?redirect=/events/${event.slug}`);
      return;
    }
    const params = new URLSearchParams({
      ticketTypeId: selectedTypeId,
      quantity: String(quantity),
    });
    router.push(`/booking/${event.id}?${params.toString()}`);
  };

  if (ticketTypes.length === 0) {
    return (
      <div className="bg-white dark:bg-[#111118] rounded-[12px] border border-slate-200 dark:border-slate-800 p-8 shadow-sm text-center">
        <Ticket className="w-8 h-8 text-slate-400 mx-auto mb-3" />
        <p className="text-slate-650 dark:text-slate-405 text-sm font-medium">No tickets available yet.</p>
      </div>
    );
  }

  return (
    <ElectricBorder color="#6C47FF" speed={0.5} chaos={0.1} borderRadius={12}>
      <div className="bg-white dark:bg-[#111118] rounded-[12px] border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-5">
        <h3 className="font-bold text-slate-905 dark:text-white text-base">Select Tickets</h3>

        {/* Ticket type list */}
        <div className="space-y-3.5">
          {ticketTypes.map(tt => {
            const avail = tt.quantity_total - (tt.quantity_sold || 0);
            const isSoldOut = avail <= 0;
            const isSelected = selectedTypeId === tt.id;
            
            return (
              <button
                key={tt.id}
                onClick={() => { if (!isSoldOut) { setSelectedTypeId(tt.id); setQuantity(1); } }}
                className={`w-full text-left p-4 rounded-[12px] border-2 transition-all relative ${
                  isSelected
                    ? 'border-[#6C47FF] bg-indigo-50/30 dark:bg-indigo-950/15'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                } ${isSoldOut ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                disabled={isSoldOut}
              >
                {isSelected && (
                  <div className="absolute top-2.5 right-2.5 w-5 h-5 rounded-full bg-[#6C47FF] flex items-center justify-center text-white">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                )}
                <div className="flex justify-between items-start pr-6">
                  <div>
                    <p className="font-bold text-slate-900 dark:text-white text-sm">{tt.name}</p>
                    {tt.description && (
                      <p className="text-xs text-slate-500 mt-1 max-w-[180px] leading-relaxed">{tt.description}</p>
                    )}
                  </div>
                  <div className="text-right shrink-0 ml-3">
                    <p className="font-extrabold text-slate-900 dark:text-white text-sm">
                      {tt.price === 0 ? 'Free' : `₹${tt.price.toLocaleString('en-IN')}`}
                    </p>
                    <p className="text-[10px] text-slate-500 font-semibold mt-0.5">
                      {isSoldOut ? 'Sold out' : `${avail} left`}
                    </p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Quantity selector */}
        {selectedType && available > 0 && (
          <div className="flex items-center justify-between py-2 border-t border-slate-100 dark:border-slate-800/60 pt-4">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Quantity</label>
            <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-900 px-3 py-1.5 rounded-[8px] border border-slate-200/60 dark:border-slate-800">
              <button
                onClick={() => setQuantity(q => Math.max(1, q - 1))}
                disabled={quantity <= 1}
                className="w-7 h-7 rounded-md flex items-center justify-center text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 disabled:opacity-30 transition-colors"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="text-sm font-bold text-slate-900 dark:text-white w-6 text-center">
                {quantity}
              </span>
              <button
                onClick={() => setQuantity(q => Math.min(maxQty, q + 1))}
                disabled={quantity >= maxQty}
                className="w-7 h-7 rounded-md flex items-center justify-center text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 disabled:opacity-30 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* Total & CTA */}
        {selectedType && available > 0 && (
          <div className="border-t border-slate-100 dark:border-slate-800/65 pt-4 space-y-4">
            {totalAmount > 0 && (
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500 font-bold uppercase tracking-wider">Total Amount</span>
                <span className="font-extrabold text-slate-900 dark:text-white text-base">
                  ₹{totalAmount.toLocaleString('en-IN')}
                </span>
              </div>
            )}
            
            {/* Coral accent button styling */}
            <button
              onClick={handleBookNow}
              className="w-full py-3.5 rounded-[8px] bg-[#FF6B6B] hover:bg-[#FF6B6B]/90 text-white font-bold text-sm shadow-md shadow-[#FF6B6B]/10 hover:shadow-lg transition-all"
            >
              {!isLoggedIn
                ? 'Log in to Book'
                : totalAmount === 0
                ? 'Register Free'
                : 'Book Now'}
            </button>
          </div>
        )}
      </div>
    </ElectricBorder>
  );
}
