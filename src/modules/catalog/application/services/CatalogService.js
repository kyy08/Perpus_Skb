import { AppError } from '../../../../shared/errors/AppError.js';
import { removeUploadedFile } from '../../../../config/uploads.js';

export class CatalogService {
  constructor({ catalogRepository }) {
    this.catalogRepository = catalogRepository;
  }

  listBooks(input) {
    return this.catalogRepository.listBooks(input);
  }

  async getBook(id) {
    const book = await this.catalogRepository.findBook(id);

    if (!book) {
      throw new AppError('Buku tidak ditemukan', 404, null, 'BOOK_NOT_FOUND');
    }

    return book;
  }

  createBook(input) {
    return this.catalogRepository.createBook(input);
  }

  async updateBook(id, input) {
    const existingBook = await this.getBook(id);
    const updatedBook = await this.catalogRepository.updateBook(id, input);
    if (input.coverUrl !== undefined && input.coverUrl !== existingBook.coverUrl) {
      await removeUploadedFile(existingBook.coverUrl);
    }
    return updatedBook;
  }

  async deleteBook(id) {
    const existingBook = await this.getBook(id);
    await this.catalogRepository.deleteBook(id);
    await removeUploadedFile(existingBook.coverUrl);
  }

  async listCopies(bookId) {
    await this.getBook(bookId);
    return this.catalogRepository.listCopies(bookId);
  }

  async createCopy(bookId, input) {
    await this.getBook(bookId);
    return this.catalogRepository.createCopy(bookId, input);
  }

  updateCopy(id, input) {
    return this.catalogRepository.updateCopy(id, input);
  }

  listCategories() {
    return this.catalogRepository.listCategories();
  }

  createCategory(input) {
    return this.catalogRepository.createCategory({
      ...input,
      slug: input.slug || this.createSlug(input.name)
    });
  }

  updateCategory(id, input) {
    return this.catalogRepository.updateCategory(id, {
      ...input,
      ...(input.name && !input.slug ? { slug: this.createSlug(input.name) } : {})
    });
  }

  deleteCategory(id) {
    return this.catalogRepository.deleteCategory(id);
  }

  listAuthors() {
    return this.catalogRepository.listAuthors();
  }

  createAuthor(input) {
    return this.catalogRepository.createAuthor(input);
  }

  updateAuthor(id, input) {
    return this.catalogRepository.updateAuthor(id, input);
  }

  deleteAuthor(id) {
    return this.catalogRepository.deleteAuthor(id);
  }

  listPublishers() {
    return this.catalogRepository.listPublishers();
  }

  createPublisher(input) {
    return this.catalogRepository.createPublisher(input);
  }

  updatePublisher(id, input) {
    return this.catalogRepository.updatePublisher(id, input);
  }

  deletePublisher(id) {
    return this.catalogRepository.deletePublisher(id);
  }

  createSlug(value) {
    return value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }
}
