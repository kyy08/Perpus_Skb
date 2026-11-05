-- CreateTable
CREATE TABLE `users` (
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `role` ENUM('ADMIN', 'PETUGAS', 'ANGGOTA') NOT NULL,
    `name` VARCHAR(100) NOT NULL,
    `email` VARCHAR(150) NOT NULL,
    `password_hash` VARCHAR(255) NOT NULL,
    `phone` VARCHAR(20) NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `last_login_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `users_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `members` (
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER UNSIGNED NOT NULL,
    `member_code` VARCHAR(30) NOT NULL,
    `address` TEXT NULL,
    `birth_date` DATE NULL,
    `joined_at` DATE NOT NULL,
    `status` ENUM('ACTIVE', 'INACTIVE', 'BLOCKED') NOT NULL DEFAULT 'ACTIVE',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `members_user_id_key`(`user_id`),
    UNIQUE INDEX `members_member_code_key`(`member_code`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `categories` (
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(100) NOT NULL,
    `slug` VARCHAR(120) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `categories_slug_key`(`slug`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `authors` (
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(150) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `publishers` (
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(150) NOT NULL,
    `address` TEXT NULL,
    `phone` VARCHAR(20) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `books` (
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `isbn` VARCHAR(20) NULL,
    `title` VARCHAR(255) NOT NULL,
    `description` TEXT NULL,
    `publication_year` SMALLINT NULL,
    `language` VARCHAR(50) NOT NULL DEFAULT 'Indonesia',
    `publisher_id` INTEGER UNSIGNED NULL,
    `category_id` INTEGER UNSIGNED NULL,
    `cover_url` VARCHAR(500) NULL,
    `deleted_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `books_isbn_key`(`isbn`),
    INDEX `books_title_idx`(`title`),
    INDEX `books_category_id_idx`(`category_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `book_authors` (
    `book_id` INTEGER UNSIGNED NOT NULL,
    `author_id` INTEGER UNSIGNED NOT NULL,

    PRIMARY KEY (`book_id`, `author_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `book_copies` (
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `book_id` INTEGER UNSIGNED NOT NULL,
    `inventory_code` VARCHAR(50) NOT NULL,
    `acquisition_date` DATE NULL,
    `acquisition_price` DECIMAL(12, 2) NULL,
    `condition_status` ENUM('GOOD', 'DAMAGED', 'LOST') NOT NULL DEFAULT 'GOOD',
    `availability_status` ENUM('AVAILABLE', 'BORROWED', 'MAINTENANCE', 'LOST') NOT NULL DEFAULT 'AVAILABLE',
    `notes` TEXT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `book_copies_inventory_code_key`(`inventory_code`),
    INDEX `book_copies_book_id_availability_status_idx`(`book_id`, `availability_status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `loan_requests` (
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `member_id` INTEGER UNSIGNED NOT NULL,
    `requested_duration_days` SMALLINT UNSIGNED NOT NULL,
    `status` ENUM('PENDING', 'APPROVED', 'REJECTED', 'CANCELLED') NOT NULL DEFAULT 'PENDING',
    `notes` TEXT NULL,
    `reviewed_by` INTEGER UNSIGNED NULL,
    `reviewed_at` DATETIME(3) NULL,
    `rejection_reason` TEXT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `loan_requests_member_id_status_idx`(`member_id`, `status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `loan_request_items` (
    `loan_request_id` INTEGER UNSIGNED NOT NULL,
    `book_id` INTEGER UNSIGNED NOT NULL,
    `quantity` TINYINT UNSIGNED NOT NULL DEFAULT 1,

    PRIMARY KEY (`loan_request_id`, `book_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `loans` (
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `loan_code` VARCHAR(30) NOT NULL,
    `loan_request_id` INTEGER UNSIGNED NOT NULL,
    `member_id` INTEGER UNSIGNED NOT NULL,
    `approved_by` INTEGER UNSIGNED NOT NULL,
    `borrowed_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `due_at` DATETIME(3) NOT NULL,
    `status` ENUM('BORROWED', 'PARTIALLY_RETURNED', 'RETURNED', 'CANCELLED') NOT NULL DEFAULT 'BORROWED',
    `completed_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `loans_loan_code_key`(`loan_code`),
    UNIQUE INDEX `loans_loan_request_id_key`(`loan_request_id`),
    INDEX `loans_member_id_status_idx`(`member_id`, `status`),
    INDEX `loans_due_at_status_idx`(`due_at`, `status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `loan_items` (
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `loan_id` INTEGER UNSIGNED NOT NULL,
    `book_copy_id` INTEGER UNSIGNED NOT NULL,
    `returned_at` DATETIME(3) NULL,
    `return_condition` ENUM('GOOD', 'DAMAGED', 'LOST') NULL,
    `notes` TEXT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `loan_items_loan_id_book_copy_id_key`(`loan_id`, `book_copy_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `fines` (
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `loan_item_id` INTEGER UNSIGNED NOT NULL,
    `member_id` INTEGER UNSIGNED NOT NULL,
    `late_days` SMALLINT UNSIGNED NOT NULL,
    `amount` DECIMAL(12, 2) NOT NULL,
    `status` ENUM('UNPAID', 'PAID', 'WAIVED') NOT NULL DEFAULT 'UNPAID',
    `paid_at` DATETIME(3) NULL,
    `paid_by` INTEGER UNSIGNED NULL,
    `notes` TEXT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `fines_loan_item_id_key`(`loan_item_id`),
    INDEX `fines_member_id_status_idx`(`member_id`, `status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `system_settings` (
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `setting_key` VARCHAR(100) NOT NULL,
    `setting_value` VARCHAR(255) NOT NULL,
    `description` VARCHAR(255) NULL,
    `updated_by` INTEGER UNSIGNED NULL,
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `system_settings_setting_key_key`(`setting_key`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `members` ADD CONSTRAINT `members_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `books` ADD CONSTRAINT `books_publisher_id_fkey` FOREIGN KEY (`publisher_id`) REFERENCES `publishers`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `books` ADD CONSTRAINT `books_category_id_fkey` FOREIGN KEY (`category_id`) REFERENCES `categories`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `book_authors` ADD CONSTRAINT `book_authors_book_id_fkey` FOREIGN KEY (`book_id`) REFERENCES `books`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `book_authors` ADD CONSTRAINT `book_authors_author_id_fkey` FOREIGN KEY (`author_id`) REFERENCES `authors`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `book_copies` ADD CONSTRAINT `book_copies_book_id_fkey` FOREIGN KEY (`book_id`) REFERENCES `books`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `loan_requests` ADD CONSTRAINT `loan_requests_member_id_fkey` FOREIGN KEY (`member_id`) REFERENCES `members`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `loan_requests` ADD CONSTRAINT `loan_requests_reviewed_by_fkey` FOREIGN KEY (`reviewed_by`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `loan_request_items` ADD CONSTRAINT `loan_request_items_loan_request_id_fkey` FOREIGN KEY (`loan_request_id`) REFERENCES `loan_requests`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `loan_request_items` ADD CONSTRAINT `loan_request_items_book_id_fkey` FOREIGN KEY (`book_id`) REFERENCES `books`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `loans` ADD CONSTRAINT `loans_loan_request_id_fkey` FOREIGN KEY (`loan_request_id`) REFERENCES `loan_requests`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `loans` ADD CONSTRAINT `loans_member_id_fkey` FOREIGN KEY (`member_id`) REFERENCES `members`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `loans` ADD CONSTRAINT `loans_approved_by_fkey` FOREIGN KEY (`approved_by`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `loan_items` ADD CONSTRAINT `loan_items_loan_id_fkey` FOREIGN KEY (`loan_id`) REFERENCES `loans`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `loan_items` ADD CONSTRAINT `loan_items_book_copy_id_fkey` FOREIGN KEY (`book_copy_id`) REFERENCES `book_copies`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `fines` ADD CONSTRAINT `fines_loan_item_id_fkey` FOREIGN KEY (`loan_item_id`) REFERENCES `loan_items`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `fines` ADD CONSTRAINT `fines_member_id_fkey` FOREIGN KEY (`member_id`) REFERENCES `members`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `fines` ADD CONSTRAINT `fines_paid_by_fkey` FOREIGN KEY (`paid_by`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `system_settings` ADD CONSTRAINT `system_settings_updated_by_fkey` FOREIGN KEY (`updated_by`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
