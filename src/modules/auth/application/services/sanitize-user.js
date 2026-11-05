export function sanitizeUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: user.role,
    isActive: user.isActive,
    member: user.member
      ? {
          id: user.member.id,
          memberCode: user.member.memberCode,
          address: user.member.address,
          birthDate: user.member.birthDate,
          joinedAt: user.member.joinedAt,
          status: user.member.status
        }
      : null
  };
}
