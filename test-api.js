const http = require('http');

const data = JSON.stringify({
  ticketTypeId: 'e2920fba-b5d3-4a1e-8e8e-67041a7c0d29', // Some valid ID from ticket_types, I will need a valid one
  quantity: 2,
  eventId: 'a7e40ac6-f1f4-4a0a-86fa-a54e928926d5', // Same event id from my earlier test
  userId: '53e09f9b-4a36-4a15-a519-68bf146b2d00',
  attendeeName: 'Test',
  attendeeEmail: 'test@example.com'
});

const req = http.request({
  hostname: 'localhost',
  port: 3000,
  path: '/api/orders/create',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(data),
    // Need a valid session cookie for getAuthenticatedUserId()
  }
}, (res) => {
  let body = '';
  res.on('data', d => body += d);
  res.on('end', () => console.log('Response:', res.statusCode, body));
});

req.on('error', e => console.error(e));
req.write(data);
req.end();
