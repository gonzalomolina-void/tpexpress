import 'dotenv/config';
import bcrypt from 'bcryptjs';
import * as userService from './src/services/user.service.js';

async function check() {
  const email = "admin@example.com";
  const password = "password123";
  const user = await userService.getUserByEmail(email);
  if (!user) {
    console.log("USER NOT FOUND");
    return;
  }
  const isPasswordValid = await bcrypt.compare(password, user.password);
  console.log("USER FOUND:", user.email);
  console.log("IS PASSWORD VALID:", isPasswordValid);
}
check();
