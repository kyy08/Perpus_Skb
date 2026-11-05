const statusLabels: Record<string, string> = {
  ACTIVE: "Aktif",
  INACTIVE: "Tidak Aktif",
  BLOCKED: "Diblokir",
  PENDING: "Menunggu",
  APPROVED: "Disetujui",
  REJECTED: "Ditolak",
  CANCELLED: "Dibatalkan",
  BORROWED: "Sedang Dipinjam",
  PARTIALLY_RETURNED: "Sebagian Dikembalikan",
  RETURNED: "Sudah Dikembalikan",
  UNPAID: "Belum Lunas",
  PAID: "Lunas",
  WAIVED: "Dibebaskan",
  GOOD: "Baik",
  DAMAGED: "Rusak",
  LOST: "Hilang",
  AVAILABLE: "Tersedia",
  MAINTENANCE: "Pemeliharaan"
};

export function formatStatus(status: string) {
  return statusLabels[status] || status;
}
