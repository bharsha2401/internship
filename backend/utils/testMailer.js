import 'dotenv/config';
import { sendWelcomeEmail } from './mailer.js';

sendWelcomeEmail('YOUR_EMAIL@gmail.com', 'Test User')
  .then(() => console.log('Test welcome email sent!'))
  .catch(console.error);