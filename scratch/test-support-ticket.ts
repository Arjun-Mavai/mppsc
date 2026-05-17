import { submitSupportTicket } from './src/actions/support-actions';

async function testSupportTicket() {
  console.log('Testing support ticket submission with exam context detection...\n');
  
  const result = await submitSupportTicket({
    name: 'Test Student',
    email: 'test@example.com',
    phone: '+91-9876543210',
    category: 'mains_content',
    message: 'The Mains vault is not loading properly on Chrome',
    userId: 'test-user-123'
  });
  
  console.log('Support ticket submission result:', result);
}

testSupportTicket().catch(console.error);
