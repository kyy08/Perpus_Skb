import jwt from 'jsonwebtoken';

export class TokenService {
  constructor(secret, expiresIn) {
    this.secret = secret;
    this.expiresIn = expiresIn;
  }

  sign(user) {
    return jwt.sign(
      {
        userId: user.id,
        role: user.role,
        memberId: user.member?.id || null
      },
      this.secret,
      { expiresIn: this.expiresIn }
    );
  }

  verify(token) {
    return jwt.verify(token, this.secret);
  }
}
