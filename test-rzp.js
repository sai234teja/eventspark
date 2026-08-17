const Razorpay = require('razorpay');
require('dotenv').config({ path: '.env.local' });

async function testRzp() {
  try {
    const razorpay = new Razorpay({
      key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    const rzpOrder = await razorpay.orders.create({
      amount: 199800,
      currency: 'INR',
      receipt: 'test-receipt',
    });
    console.log('Razorpay success:', rzpOrder.id);
  } catch (err) {
    console.error('Razorpay error:', err);
  }
}

testRzp();
