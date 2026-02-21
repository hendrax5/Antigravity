-- DropIndex
DROP INDEX `idx_idbarang` ON `m_gudang_barang`;

-- DropIndex
DROP INDEX `idx_id_barang_keluar` ON `t_gudang_serial_number`;

-- DropIndex
DROP INDEX `idx_kode_serial_t` ON `t_gudang_serial_number`;

-- AlterTable
ALTER TABLE `m_gudang_area` MODIFY `tgl_input` DATE NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    MODIFY `tgl_update` DATE NULL;

-- AlterTable
ALTER TABLE `m_gudang_cabang` DROP COLUMN `rec_date_upd`,
    DROP COLUMN `rec_user_upd`,
    DROP COLUMN `tipe`,
    MODIFY `nama_cabang` VARCHAR(255) NOT NULL,
    MODIFY `rec_user` VARCHAR(50) NOT NULL,
    MODIFY `rec_date` DATE NOT NULL DEFAULT CURRENT_TIMESTAMP(3);

-- AlterTable
ALTER TABLE `m_gudang_kategori` DROP COLUMN `id_perusahaan`,
    DROP COLUMN `rec_date`,
    DROP COLUMN `rec_user`,
    MODIFY `nama_kategori` VARCHAR(255) NOT NULL,
    MODIFY `singkatan` VARCHAR(50) NULL;

-- AlterTable
ALTER TABLE `m_gudang_perusahaan` DROP COLUMN `alamat_perusahaan`,
    DROP COLUMN `brands`,
    DROP COLUMN `nama_perusahaan`,
    DROP COLUMN `tanggal_input`,
    DROP COLUMN `user`,
    ADD COLUMN `kode` VARCHAR(50) NULL,
    ADD COLUMN `perusahaan` VARCHAR(255) NOT NULL;

-- AlterTable
ALTER TABLE `t_gudang_barang_keluar` DROP COLUMN `deleted_at`,
    DROP COLUMN `id_distributor`,
    DROP COLUMN `id_kategori`,
    DROP COLUMN `id_laporan`,
    DROP COLUMN `id_perusahaan`,
    DROP COLUMN `id_rusak`,
    DROP COLUMN `id_status_input`,
    DROP COLUMN `id_tipe`,
    DROP COLUMN `jenis_keluar`,
    DROP COLUMN `kode_ewo`,
    DROP COLUMN `lokasi`,
    DROP COLUMN `nama_client`,
    DROP COLUMN `nama_ts1`,
    DROP COLUMN `nama_ts2`,
    DROP COLUMN `penanggung_jawab`,
    DROP COLUMN `tgl_edit`,
    MODIFY `id_order` VARCHAR(100) NULL,
    MODIFY `id_barang` INTEGER NOT NULL,
    MODIFY `qty` DOUBLE NOT NULL,
    MODIFY `deskripsi_barang` TEXT NULL,
    MODIFY `tgl_keluar` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3);

-- AlterTable
ALTER TABLE `t_gudang_barang_masuk` DROP COLUMN `harga_total`,
    DROP COLUMN `id_admin_edit`,
    DROP COLUMN `id_distributor`,
    DROP COLUMN `id_kategori`,
    DROP COLUMN `id_laporan`,
    DROP COLUMN `id_perusahaan`,
    DROP COLUMN `id_status_input`,
    DROP COLUMN `id_tipe`,
    DROP COLUMN `nama_client`,
    DROP COLUMN `nama_ts1`,
    DROP COLUMN `nama_ts2`,
    DROP COLUMN `price_only`,
    DROP COLUMN `qty_adj`,
    DROP COLUMN `requested_by`,
    DROP COLUMN `tgl_edit`,
    DROP COLUMN `tgl_masuk_gudang`,
    DROP COLUMN `updated_at`,
    MODIFY `id_order` VARCHAR(100) NULL,
    MODIFY `id_barang` INTEGER NOT NULL,
    MODIFY `qty` DOUBLE NOT NULL,
    MODIFY `tgl_masuk` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3);

-- AlterTable
ALTER TABLE `t_gudang_po` DROP COLUMN `catatan`,
    DROP COLUMN `cicilan`,
    DROP COLUMN `delivery`,
    DROP COLUMN `diskon`,
    DROP COLUMN `dp`,
    DROP COLUMN `id_distributor`,
    DROP COLUMN `id_induk`,
    DROP COLUMN `kode_po`,
    DROP COLUMN `penerima`,
    DROP COLUMN `ppn`,
    DROP COLUMN `repayment`,
    DROP COLUMN `term_of_payment`,
    ADD COLUMN `id_admin` INTEGER NULL,
    ADD COLUMN `id_cabang` INTEGER NULL,
    ADD COLUMN `keterangan` TEXT NULL,
    ADD COLUMN `no_po` VARCHAR(100) NOT NULL,
    ADD COLUMN `status` VARCHAR(50) NOT NULL DEFAULT 'pending',
    ADD COLUMN `total_item` INTEGER NULL DEFAULT 0,
    MODIFY `tgl_po` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3);

-- AlterTable
ALTER TABLE `t_gudang_po_barang` DROP COLUMN `kurs`,
    DROP COLUMN `qty`,
    DROP COLUMN `total`,
    ADD COLUMN `jumlah` DOUBLE NOT NULL,
    ADD COLUMN `jumlah_terima` DOUBLE NULL DEFAULT 0,
    ADD COLUMN `keterangan` TEXT NULL,
    MODIFY `harga` DOUBLE NULL DEFAULT 0;

-- AlterTable
ALTER TABLE `t_gudang_request` DROP COLUMN `customer`,
    DROP COLUMN `ewo`,
    DROP COLUMN `file_ewo`,
    DROP COLUMN `id_perusahaan`,
    DROP COLUMN `noted`,
    DROP COLUMN `pic_pengajuan`,
    DROP COLUMN `pic_ts`,
    DROP COLUMN `pic_warehouse`,
    DROP COLUMN `rec_date`,
    DROP COLUMN `rec_date_upd`,
    DROP COLUMN `rec_user`,
    DROP COLUMN `rec_user_upd`,
    DROP COLUMN `tgl_approve`,
    DROP COLUMN `tipe`,
    ADD COLUMN `id_admin` INTEGER NULL,
    ADD COLUMN `id_cabang` INTEGER NULL,
    ADD COLUMN `keterangan` TEXT NULL,
    ADD COLUMN `no_request` VARCHAR(100) NOT NULL,
    ADD COLUMN `tgl_update` DATETIME(3) NULL,
    MODIFY `tgl_request` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    MODIFY `status` VARCHAR(50) NOT NULL DEFAULT 'draft';

-- AlterTable
ALTER TABLE `t_gudang_request_detail` DROP PRIMARY KEY,
    DROP COLUMN `barang`,
    DROP COLUMN `bw`,
    DROP COLUMN `id_request_det`,
    DROP COLUMN `rab_id`,
    DROP COLUMN `rec_date`,
    DROP COLUMN `rec_date_upd`,
    DROP COLUMN `rec_user`,
    DROP COLUMN `rec_user_upd`,
    DROP COLUMN `satuan`,
    DROP COLUMN `team`,
    DROP COLUMN `unit`,
    ADD COLUMN `id_detail` INTEGER NOT NULL AUTO_INCREMENT,
    ADD COLUMN `jumlah` DOUBLE NOT NULL,
    MODIFY `id_barang` INTEGER NOT NULL,
    ADD PRIMARY KEY (`id_detail`);

-- AlterTable
ALTER TABLE `t_gudang_rusak` DROP COLUMN `deskripsi_rusak`,
    DROP COLUMN `id_perusahaan`,
    DROP COLUMN `id_status`,
    DROP COLUMN `id_status_input`,
    DROP COLUMN `id_tipe`,
    DROP COLUMN `qty`,
    ADD COLUMN `id_admin` INTEGER NULL,
    ADD COLUMN `jumlah` DOUBLE NULL,
    ADD COLUMN `keterangan` TEXT NULL,
    MODIFY `id_cabang` INTEGER NULL,
    MODIFY `id_barang` INTEGER NULL,
    MODIFY `tgl_rusak` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3);

-- AlterTable
ALTER TABLE `t_gudang_serial_number` ADD COLUMN `id_barang_masuk` INTEGER NULL,
    MODIFY `id_barang_keluar` INTEGER NULL;

-- AlterTable
ALTER TABLE `t_usercabang` DROP PRIMARY KEY,
    DROP COLUMN `id_usercabang`,
    DROP COLUMN `rec_date`,
    DROP COLUMN `rec_date_upd`,
    DROP COLUMN `rec_user`,
    DROP COLUMN `rec_user_upd`,
    ADD COLUMN `id` INTEGER NOT NULL AUTO_INCREMENT,
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `user` MODIFY `id_kontak` VARCHAR(20) NULL,
    MODIFY `Username` VARCHAR(225) NOT NULL,
    MODIFY `Password` VARCHAR(225) NOT NULL,
    MODIFY `Nama` VARCHAR(225) NOT NULL,
    MODIFY `Telepon` VARCHAR(225) NOT NULL,
    MODIFY `level` VARCHAR(50) NOT NULL DEFAULT 'Staff',
    MODIFY `jabatan` VARCHAR(100) NULL,
    MODIFY `status_aktif` INTEGER NOT NULL DEFAULT 1;

-- DropTable
DROP TABLE `m_gudang_barang_detail`;

-- DropTable
DROP TABLE `m_gudang_barang_return`;

-- DropTable
DROP TABLE `m_gudang_barang_tipe`;

-- DropTable
DROP TABLE `m_gudang_cabang_barang`;

-- DropTable
DROP TABLE `m_gudang_cabang_barang_detail`;

-- DropTable
DROP TABLE `m_gudang_distributor`;

-- DropTable
DROP TABLE `m_gudang_induk_perusahaan`;

-- DropTable
DROP TABLE `m_gudang_status`;

-- DropTable
DROP TABLE `m_gudang_status_input`;

-- DropTable
DROP TABLE `t_gudang_inventaris`;

-- DropTable
DROP TABLE `t_gudang_laporan_barang`;

-- DropTable
DROP TABLE `t_gudang_order`;

-- DropTable
DROP TABLE `t_gudang_order_detail`;

-- DropTable
DROP TABLE `t_gudang_rusak_detail`;

-- DropTable
DROP TABLE `t_gudang_serialnumber_keluar`;

-- DropTable
DROP TABLE `t_gudang_serialnumber_masuk`;

-- DropTable
DROP TABLE `t_gudang_serialnumber_return`;

-- DropTable
DROP TABLE `t_gudang_serialnumber_rusak`;

-- DropTable
DROP TABLE `t_stokaudit`;

-- AddForeignKey
ALTER TABLE `m_gudang_barang` ADD CONSTRAINT `m_gudang_barang_id_kategori_fkey` FOREIGN KEY (`id_kategori`) REFERENCES `m_gudang_kategori`(`id_kategori`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `t_gudang_barang_masuk` ADD CONSTRAINT `t_gudang_barang_masuk_id_barang_fkey` FOREIGN KEY (`id_barang`) REFERENCES `m_gudang_barang`(`id_barang`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `t_gudang_barang_keluar` ADD CONSTRAINT `t_gudang_barang_keluar_id_barang_fkey` FOREIGN KEY (`id_barang`) REFERENCES `m_gudang_barang`(`id_barang`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `t_gudang_request_detail` ADD CONSTRAINT `t_gudang_request_detail_id_request_fkey` FOREIGN KEY (`id_request`) REFERENCES `t_gudang_request`(`id_request`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `t_gudang_request_detail` ADD CONSTRAINT `t_gudang_request_detail_id_barang_fkey` FOREIGN KEY (`id_barang`) REFERENCES `m_gudang_barang`(`id_barang`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `t_gudang_po_barang` ADD CONSTRAINT `t_gudang_po_barang_id_po_fkey` FOREIGN KEY (`id_po`) REFERENCES `t_gudang_po`(`id_po`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `t_gudang_serial_number` ADD CONSTRAINT `t_gudang_serial_number_id_barang_keluar_fkey` FOREIGN KEY (`id_barang_keluar`) REFERENCES `t_gudang_barang_keluar`(`id_barang_keluar`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `t_gudang_serial_number` ADD CONSTRAINT `t_gudang_serial_number_id_barang_masuk_fkey` FOREIGN KEY (`id_barang_masuk`) REFERENCES `t_gudang_barang_masuk`(`id_barang_masuk`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `t_usercabang` ADD CONSTRAINT `t_usercabang_id_user_fkey` FOREIGN KEY (`id_user`) REFERENCES `user`(`Id_User`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `t_usercabang` ADD CONSTRAINT `t_usercabang_id_cabang_fkey` FOREIGN KEY (`id_cabang`) REFERENCES `m_gudang_cabang`(`id_cabang`) ON DELETE RESTRICT ON UPDATE CASCADE;

