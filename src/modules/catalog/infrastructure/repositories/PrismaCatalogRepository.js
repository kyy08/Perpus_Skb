import { CatalogRepository } from '../../domain/repositories/CatalogRepository.js';

const bookInclude = {
  category: true,
  publisher: true,
  authors: { include: { author: true } },
  copies: {
    select: {
      id: true,
      inventoryCode: true,
      conditionStatus: true,
      availabilityStatus: true,
      acquisitionDate: true,
      notes: true
    },
    orderBy: { inventoryCode: 'asc' }
  }
};

function toAvailability(copies) {
  return copies.reduce(
    (result, copy) => {
      result.total += 1;
      result[copy.availabilityStatus.toLowerCase()] += 1;
      return result;
    },
    { total: 0, available: 0, borrowed: 0, maintenance: 0, lost: 0 }
  );
}

function mapBook(book, includeCopies = false) {
  const { authors, copies, ...data } = book;
  const result = {
    ...data,
    authors: authors.map((item) => item.author),
    availability: toAvailability(copies)
  };

  if (includeCopies) {
    result.copies = copies;
  }

  return result;
}

export class PrismaCatalogRepository extends CatalogRepository {
  constructor(prisma) {
    super();
    this.prisma = prisma;
  }

  async listBooks({ search, categoryId, availableOnly, skip, limit }) {
    const where = {
      deletedAt: null,
      ...(categoryId ? { categoryId } : {}),
      ...(search
        ? {
            OR: [
              { title: { contains: search } },
              { authors: { some: { author: { name: { contains: search } } } } }
            ]
          }
        : {}),
      ...(availableOnly ? { copies: { some: { availabilityStatus: 'AVAILABLE' } } } : {})
    };

    const [books, total] = await this.prisma.$transaction([
      this.prisma.book.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: bookInclude
      }),
      this.prisma.book.count({ where })
    ]);

    return { items: books.map((book) => mapBook(book)), total };
  }

  async findBook(id) {
    const book = await this.prisma.book.findFirst({
      where: { id, deletedAt: null },
      include: bookInclude
    });

    return book ? mapBook(book, true) : null;
  }

  async createBook(input) {
    const { authorIds = [], copyCount = 1, ...bookData } = input;

    const book = await this.prisma.$transaction(async (transaction) => {
      const createdBook = await transaction.book.create({
        data: {
          ...bookData,
          authors: {
            create: authorIds.map((authorId) => ({ author: { connect: { id: authorId } } }))
          }
        }
      });

      await transaction.bookCopy.createMany({
        data: Array.from({ length: copyCount }, (_, index) => ({
          bookId: createdBook.id,
          inventoryCode: `INV-${createdBook.id}-${String(index + 1).padStart(3, '0')}`
        }))
      });

      return transaction.book.findUnique({
        where: { id: createdBook.id },
        include: bookInclude
      });
    });

    return mapBook(book, true);
  }

  async updateBook(id, input) {
    const { authorIds, ...bookData } = input;

    const book = await this.prisma.$transaction(async (transaction) => {
      if (authorIds) {
        await transaction.bookAuthor.deleteMany({ where: { bookId: id } });
      }

      return transaction.book.update({
        where: { id },
        data: {
          ...bookData,
          ...(authorIds
            ? {
                authors: {
                  create: authorIds.map((authorId) => ({ author: { connect: { id: authorId } } }))
                }
              }
            : {})
        },
        include: bookInclude
      });
    });

    return mapBook(book, true);
  }

  deleteBook(id) {
    return this.prisma.book.update({
      where: { id },
      data: { deletedAt: new Date() }
    });
  }

  listCopies(bookId) {
    return this.prisma.bookCopy.findMany({
      where: { bookId },
      orderBy: { inventoryCode: 'asc' }
    });
  }

  createCopy(bookId, input) {
    return this.prisma.bookCopy.create({
      data: { ...input, bookId }
    });
  }

  updateCopy(id, input) {
    return this.prisma.bookCopy.update({
      where: { id },
      data: input
    });
  }

  listCategories() {
    return this.prisma.category.findMany({ orderBy: { name: 'asc' } });
  }

  createCategory(data) {
    return this.prisma.category.create({ data });
  }

  updateCategory(id, data) {
    return this.prisma.category.update({ where: { id }, data });
  }

  deleteCategory(id) {
    return this.prisma.category.delete({ where: { id } });
  }

  listAuthors() {
    return this.prisma.author.findMany({ orderBy: { name: 'asc' } });
  }

  createAuthor(data) {
    return this.prisma.author.create({ data });
  }

  updateAuthor(id, data) {
    return this.prisma.author.update({ where: { id }, data });
  }

  deleteAuthor(id) {
    return this.prisma.author.delete({ where: { id } });
  }

  listPublishers() {
    return this.prisma.publisher.findMany({ orderBy: { name: 'asc' } });
  }

  createPublisher(data) {
    return this.prisma.publisher.create({ data });
  }

  updatePublisher(id, data) {
    return this.prisma.publisher.update({ where: { id }, data });
  }

  deletePublisher(id) {
    return this.prisma.publisher.delete({ where: { id } });
  }
}
