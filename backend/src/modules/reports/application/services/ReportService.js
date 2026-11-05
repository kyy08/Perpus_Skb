import ExcelJS from 'exceljs';

export class ReportService {
  constructor({ reportRepository }) {
    this.reportRepository = reportRepository;
  }

  listLoans(input) {
    return this.reportRepository.listLoans(input);
  }

  listFines(input) {
    return this.reportRepository.listFines(input);
  }

  async exportLoans(input) {
    const loans = await this.listLoans(input);
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Peminjaman');
    sheet.columns = [
      { header: 'Kode Peminjaman', key: 'loanCode', width: 22 },
      { header: 'Anggota', key: 'member', width: 28 },
      { header: 'Email', key: 'email', width: 30 },
      { header: 'Buku', key: 'books', width: 45 },
      { header: 'Tanggal Pinjam', key: 'borrowedAt', width: 20 },
      { header: 'Jatuh Tempo', key: 'dueAt', width: 20 },
      { header: 'Status', key: 'status', width: 22 },
      { header: 'Total Denda', key: 'fine', width: 16 }
    ];

    loans.forEach((loan) => {
      sheet.addRow({
        loanCode: loan.loanCode,
        member: loan.member.user.name,
        email: loan.member.user.email,
        books: loan.items.map((item) => item.bookCopy.book.title).join(', '),
        borrowedAt: loan.borrowedAt,
        dueAt: loan.dueAt,
        status: loan.status,
        fine: loan.items.reduce((total, item) => total + Number(item.fine?.amount || 0), 0)
      });
    });

    return workbook.xlsx.writeBuffer();
  }

  async exportFines(input) {
    const fines = await this.listFines(input);
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Denda');
    sheet.columns = [
      { header: 'Anggota', key: 'member', width: 28 },
      { header: 'Email', key: 'email', width: 30 },
      { header: 'Kode Peminjaman', key: 'loanCode', width: 22 },
      { header: 'Buku', key: 'book', width: 45 },
      { header: 'Hari Terlambat', key: 'lateDays', width: 16 },
      { header: 'Nominal', key: 'amount', width: 16 },
      { header: 'Status', key: 'status', width: 16 },
      { header: 'Tanggal', key: 'createdAt', width: 20 }
    ];

    fines.forEach((fine) => {
      sheet.addRow({
        member: fine.member.user.name,
        email: fine.member.user.email,
        loanCode: fine.loanItem.loan.loanCode,
        book: fine.loanItem.bookCopy.book.title,
        lateDays: fine.lateDays,
        amount: Number(fine.amount),
        status: fine.status,
        createdAt: fine.createdAt
      });
    });

    return workbook.xlsx.writeBuffer();
  }
}
