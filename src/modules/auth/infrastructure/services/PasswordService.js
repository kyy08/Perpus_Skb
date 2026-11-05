import bcrypt from 'bcryptjs';

export class PasswordService {
  constructor(saltRounds) {
    this.saltRounds = saltRounds;
  }

  hash(password) {
    return bcrypt.hash(password, this.saltRounds);
  }

  compare(password, passwordHash) {
    return bcrypt.compare(password, passwordHash);
  }
}
