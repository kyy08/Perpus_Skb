UPDATE `users`
SET `role` = 'PETUGAS'
WHERE `role` = 'ADMIN';

ALTER TABLE `users`
MODIFY `role` ENUM('PETUGAS', 'ANGGOTA') NOT NULL;
