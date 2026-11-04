/* FINOVA bilingual presentation layer. Does not modify transaction data or existing CSS. */
(()=>{'use strict';
const dictionary={"Dashboard":"Dasbor","Audit Log":"Log Audit","User Management":"Manajemen Pengguna","Business Partner":"Mitra Bisnis","Chart Of Accounts":"Bagan Akun","Chart of Accounts":"Bagan Akun","Tax Master":"Master Pajak","Accounting Period":"Periode Akuntansi","Account Payable":"Invoice AP","Account Receivable":"Invoice AR","Aging Payable":"Umur Utang AP","Aging Receivable":"Umur Piutang AR","GL Journal":"Jurnal GL","Fixed Asset":"Aset Tetap","General Ledger":"Buku Besar","Trial Balance":"Neraca Saldo","Profit & Loss":"Laba Rugi","Profit and Loss":"Laba Rugi","Balance Sheet":"Neraca","Cash Flow":"Arus Kas","Cash Flow Forecast":"Proyeksi Arus Kas","Financial Reports":"Laporan Keuangan","Reports":"Laporan","Master Data":"Data Master","Settings":"Pengaturan","Company Settings":"Pengaturan Perusahaan","Company Context":"Konteks Perusahaan","Company":"Perusahaan","Profile":"Profil","My Profile":"Profil Saya","Logout":"Keluar","Log Out":"Keluar","Sign Out":"Keluar","Login":"Masuk","Sign In":"Masuk","Forgot Password?":"Lupa Kata Sandi?","Forgot Password":"Lupa Kata Sandi","Reset Password":"Atur Ulang Kata Sandi","Change Password":"Ubah Kata Sandi","Current Password":"Kata Sandi Saat Ini","New Password":"Kata Sandi Baru","Confirm Password":"Konfirmasi Kata Sandi","Password":"Kata Sandi","Email Address":"Alamat Email","Email":"Email","Username":"Nama Pengguna","Full Name":"Nama Lengkap","Name":"Nama","Role":"Peran","Status":"Status","Active":"Aktif","Inactive":"Tidak Aktif","Actions":"Tindakan","Action":"Tindakan","Search":"Cari","Search...":"Cari...","Filter":"Filter","Apply Filter":"Terapkan Filter","Clear Filter":"Hapus Filter","Reset Filter":"Atur Ulang Filter","Refresh":"Muat Ulang","Export":"Ekspor","Export Excel":"Ekspor Excel","Export PDF":"Ekspor PDF","Print":"Cetak","Download":"Unduh","Upload":"Unggah","Add":"Tambah","Add New":"Tambah Baru","Create":"Buat","Edit":"Ubah","Delete":"Hapus","Remove":"Hapus","Save":"Simpan","Save Changes":"Simpan Perubahan","Cancel":"Batal","Close":"Tutup","Submit":"Kirim","Confirm":"Konfirmasi","Yes":"Ya","No":"Tidak","OK":"OK","Back":"Kembali","Next":"Berikutnya","Previous":"Sebelumnya","View":"Lihat","View Detail":"Lihat Detail","Details":"Rincian","Description":"Deskripsi","Date":"Tanggal","Start Date":"Tanggal Mulai","End Date":"Tanggal Akhir","Due Date":"Tanggal Jatuh Tempo","Invoice Date":"Tanggal Invoice","Posting Date":"Tanggal Posting","Created At":"Dibuat Pada","Updated At":"Diperbarui Pada","Created By":"Dibuat Oleh","Updated By":"Diperbarui Oleh","Amount":"Jumlah","Total Amount":"Jumlah Total","Subtotal":"Subtotal","Total":"Total","Balance":"Saldo","Opening Balance":"Saldo Awal","Closing Balance":"Saldo Akhir","Debit":"Debit","Credit":"Kredit","Account":"Akun","Account Code":"Kode Akun","Account Name":"Nama Akun","Account Type":"Jenis Akun","Account Number":"Nomor Akun","Currency":"Mata Uang","Exchange Rate":"Kurs","Payment":"Pembayaran","Payment Date":"Tanggal Pembayaran","Payment Amount":"Jumlah Pembayaran","Payment Method":"Metode Pembayaran","Payment Status":"Status Pembayaran","Paid":"Lunas","Unpaid":"Belum Lunas","Partial Paid":"Dibayar Sebagian","Partial Payment":"Pembayaran Sebagian","Outstanding":"Belum Dibayar","Invoice Number":"Nomor Invoice","Invoice No":"No. Invoice","Invoice Detail":"Rincian Invoice","Invoice Details":"Rincian Invoice","Vendor":"Pemasok","Customer":"Pelanggan","Supplier":"Pemasok","Bank":"Bank","Bank Name":"Nama Bank","Bank Account":"Rekening Bank","Tax":"Pajak","Tax Name":"Nama Pajak","Tax Rate":"Tarif Pajak","Tax Amount":"Jumlah Pajak","Journal":"Jurnal","Journal Date":"Tanggal Jurnal","Journal Number":"Nomor Jurnal","Journal No":"No. Jurnal","Journal Summary":"Ringkasan Jurnal","Post":"Posting","Posted":"Sudah Diposting","Draft":"Draf","Void":"Batalkan","Voided":"Dibatalkan","Unpost":"Batalkan Posting","Period":"Periode","Open Period":"Buka Periode","Close Period":"Tutup Periode","Reopen Period":"Buka Kembali Periode","Open":"Terbuka","Closed":"Ditutup","Summary":"Ringkasan","Overview":"Ikhtisar","Transaction":"Transaksi","Transactions":"Transaksi","No data available":"Tidak ada data","No data found":"Data tidak ditemukan","No detail added.":"Belum ada rincian ditambahkan.","No detail added":"Belum ada rincian ditambahkan","Loading...":"Memuat...","Loading":"Memuat","Please wait...":"Mohon tunggu...","Signing In...":"Sedang masuk...","Unable to sign in.":"Tidak dapat masuk.","Fullscreen":"Layar Penuh","Open Navigation Menu":"Buka Menu Navigasi","Menu":"Menu","Home":"Beranda","Welcome":"Selamat Datang","All":"Semua","Select":"Pilih","Select Company":"Pilih Perusahaan","Select Status":"Pilih Status","Select Date":"Pilih Tanggal","Required":"Wajib","Optional":"Opsional","Notes":"Catatan","Remarks":"Keterangan","Code":"Kode","Type":"Jenis","Category":"Kategori","Quantity":"Kuantitas","Price":"Harga","Unit Price":"Harga Satuan","Reference":"Referensi","Document Number":"Nomor Dokumen","From":"Dari","To":"Sampai","Page":"Halaman","Rows per page":"Baris per halaman","Showing":"Menampilkan","of":"dari","Results":"Hasil","Success":"Berhasil","Error":"Kesalahan","Warning":"Peringatan","Information":"Informasi","Are you sure?":"Apakah Anda yakin?","Confirm Delete":"Konfirmasi Hapus","Save Password":"Simpan Kata Sandi","User":"Pengguna","Users":"Pengguna","Manager":"Manajer","Staff":"Staf","Super Admin":"Super Admin","Asset Management":"Manajemen Aset","Asset":"Aset","Assets":"Aset","Asset Code":"Kode Aset","Asset Name":"Nama Aset","Depreciation":"Penyusutan","Useful Life":"Masa Manfaat","Purchase Date":"Tanggal Pembelian","Purchase Price":"Harga Pembelian","Net Book Value":"Nilai Buku Bersih","Cash Inflow":"Arus Kas Masuk","Cash Outflow":"Arus Kas Keluar","Net Cash Flow":"Arus Kas Bersih","Income":"Pendapatan","Expense":"Beban","Revenue":"Pendapatan","Net Profit":"Laba Bersih","Gross Profit":"Laba Kotor","Liabilities":"Liabilitas","Equity":"Ekuitas","Total Assets":"Total Aset","Total Liabilities":"Total Liabilitas","Total Equity":"Total Ekuitas"};
const dashboardDictionary={"FINANCIAL OVERVIEW":"RINGKASAN KEUANGAN","Executive Financial Dashboard":"Dasbor Keuangan Eksekutif","Monitor financial position, performance, outstanding balances, and recent accounting activity from one dashboard.":"Pantau posisi keuangan, kinerja, saldo terutang, dan aktivitas akuntansi terbaru dalam satu dasbor.","Period":"Periode","Current Period":"Periode Berjalan","Total Asset":"Total Aset","Financial Position":"Posisi Keuangan","Total Liability":"Total Liabilitas","Net Profit (YTD)":"Laba Bersih (YTD)","Performance":"Kinerja","No movement":"Tidak ada perubahan","Net Margin":"Margin Bersih","Profitability":"Profitabilitas","Revenue based":"Berdasarkan pendapatan","Financial Performance Trend":"Tren Kinerja Keuangan","Revenue, expense, and profit movement by month":"Pergerakan pendapatan, beban, dan laba per bulan","Balance Sheet composition":"Komposisi neraca","Liability":"Liabilitas","Financial position overview":"Ringkasan posisi keuangan","Review the composition of assets, liabilities, and equity.":"Tinjau komposisi aset, liabilitas, dan ekuitas.","Balance Sheet Summary":"Ringkasan Neraca","Current financial position":"Posisi keuangan saat ini","Current":"Saat Ini","Resources owned":"Sumber daya yang dimiliki","Current obligations":"Kewajiban saat ini","Owner's interest":"Hak pemilik","Balance Difference":"Selisih Neraca","Asset vs liability and equity":"Aset dibanding liabilitas dan ekuitas","Profit & Loss Summary":"Ringkasan Laba Rugi","Year-to-date performance":"Kinerja tahun berjalan","Income generated":"Pendapatan yang dihasilkan","Operating cost":"Biaya operasional","Revenue minus expense":"Pendapatan dikurangi beban","Profitability ratio":"Rasio profitabilitas","Quick Insights":"Informasi Penting","Items requiring attention":"Hal yang memerlukan perhatian","Dashboard ready":"Dasbor siap digunakan","Financial insights will appear when accounting data is loaded.":"Informasi keuangan akan muncul setelah data akuntansi dimuat.","OPERATIONAL OVERVIEW":"RINGKASAN OPERASIONAL","Operational Snapshot":"Ringkasan Operasional","Current receivable, payable, journal, and business partner activity.":"Aktivitas piutang, utang, jurnal, dan mitra bisnis saat ini.","Draft Journal":"Jurnal Draft","Waiting for posting":"Menunggu posting","Active Business Partner":"Mitra Bisnis Aktif","Customer, Vendor, Employee":"Pelanggan, Pemasok, Karyawan","Recent Financial Activity":"Aktivitas Keuangan Terbaru","Latest transactions across accounting modules":"Transaksi terbaru dari seluruh modul akuntansi","Live":"Langsung","Document":"Dokumen","No financial activity":"Belum ada aktivitas keuangan","Recent transactions will appear here automatically.":"Transaksi terbaru akan muncul di sini secara otomatis.","System Information":"Informasi Sistem","Current accounting environment":"Lingkungan akuntansi saat ini","Current Time":"Waktu Saat Ini","Financial Period":"Periode Keuangan","Branch":"Cabang","Default Currency":"Mata Uang Utama","Year 2026":"Tahun 2026","0 overdue":"0 lewat jatuh tempo","Positive performance":"Kinerja positif","Negative performance":"Kinerja negatif","Draft journal pending":"Jurnal draft belum diposting"};
Object.assign(dictionary,dashboardDictionary);
const userManagementDictionary={"Master Data / User Management":"Data Master / Manajemen Pengguna","Add User":"Tambah Pengguna","Edit User":"Ubah Pengguna","View User":"Lihat Pengguna","User Information":"Informasi Pengguna","All Role":"Semua Peran","All Status":"Semua Status","Last Updated":"Terakhir Diperbarui","Search Full Name or Email...":"Cari nama lengkap atau email...","Logged in as":"Masuk sebagai","You have full User Management access.":"Anda memiliki akses penuh ke Manajemen Pengguna.","User Management is view only.":"Manajemen Pengguna hanya dapat dilihat.","Loading User Management...":"Memuat Manajemen Pengguna...","Displaying Record 0 - 0 of 0":"Menampilkan data 0 - 0 dari 0","Confirm Delete User":"Konfirmasi Hapus Pengguna","Are you sure you want to delete this user?":"Apakah Anda yakin ingin menghapus pengguna ini?","This will remove both the FINOVA profile and Supabase Auth account.":"Tindakan ini akan menghapus profil FINOVA dan akun Supabase Auth.","Minimum 8 characters. Used only when creating a new user.":"Minimal 8 karakter. Hanya digunakan saat membuat pengguna baru.","Temporary Password":"Kata Sandi Sementara","Reset Password":"Atur Ulang Kata Sandi","Show Password":"Tampilkan Kata Sandi","Hide Password":"Sembunyikan Kata Sandi","Re-enter new password":"Masukkan kembali kata sandi baru","New Password is required.":"Kata sandi baru wajib diisi.","Confirm Password is required.":"Konfirmasi kata sandi wajib diisi.","New Password and Confirm Password do not match.":"Kata sandi baru dan konfirmasi tidak cocok.","New Password must contain at least 8 characters.":"Kata sandi baru minimal 8 karakter.","Full Name is required.":"Nama lengkap wajib diisi.","Email is required.":"Email wajib diisi.","Role must be Manager or Staff.":"Peran harus Manager atau Staff.","User created successfully.":"Pengguna berhasil ditambahkan.","User updated successfully.":"Pengguna berhasil diperbarui.","User deleted successfully.":"Pengguna berhasil dihapus.","User password reset successfully.":"Kata sandi pengguna berhasil diatur ulang.","Failed to load users.":"Gagal memuat pengguna.","Failed to save user.":"Gagal menyimpan pengguna.","Failed to delete user.":"Gagal menghapus pengguna.","Failed to reset user password.":"Gagal mengatur ulang kata sandi pengguna.","Failed to initialize User Management.":"Gagal memulai Manajemen Pengguna.","User not found.":"Pengguna tidak ditemukan.","User UID was not found.":"ID pengguna tidak ditemukan.","Authentication session was not found.":"Sesi autentikasi tidak ditemukan.","FINOVA user profile was not found.":"Profil pengguna FINOVA tidak ditemukan.","An unexpected error occurred.":"Terjadi kesalahan yang tidak terduga.","Operation completed successfully.":"Proses berhasil diselesaikan.","You cannot delete your own login account.":"Anda tidak dapat menghapus akun login sendiri.","You cannot deactivate your own FINOVA account.":"Anda tidak dapat menonaktifkan akun FINOVA sendiri.","Only Manager can modify User Management.":"Hanya Manager yang dapat mengubah Manajemen Pengguna.","Only Manager can edit users with a valid Manager or Staff role.":"Hanya Manager yang dapat mengubah pengguna dengan peran Manager atau Staff yang valid.","Only Manager can delete users with a valid Manager or Staff role.":"Hanya Manager yang dapat menghapus pengguna dengan peran Manager atau Staff yang valid.","Only Manager can reset passwords for users with a valid Manager or Staff role.":"Hanya Manager yang dapat mengatur ulang kata sandi pengguna dengan peran Manager atau Staff yang valid.","Action":"Tindakan","Name:":"Nama:","Email:":"Email:","Displaying Record":"Menampilkan data","of":"dari"};
Object.assign(dictionary,userManagementDictionary);
const allModulesDictionary={"No.":"No.","No. Journal":"Nomor Jurnal","No. Invoice":"Nomor Invoice","PO No":"Nomor PO","Payment No":"Nomor Pembayaran","Reference No":"Nomor Referensi","Document No":"Nomor Dokumen","Journal No.":"Nomor Jurnal","Invoice No.":"Nomor Invoice","Find":"Cari","Find By":"Cari Berdasarkan","Keyword":"Kata Kunci","Download Excel":"Unduh Excel","Preview HTML":"Pratinjau HTML","Journal Preview":"Pratinjau Jurnal","Accounting Preview":"Pratinjau Akuntansi","Tax Account":"Akun Pajak","Tax Base":"Dasar Pengenaan Pajak","Tax (+)":"Pajak (+)","Tax (-)":"Pajak (-)","No Tax":"Tanpa Pajak","No Tax (+) found from Invoice Details.":"Tidak ditemukan Pajak (+) dari Rincian Invoice.","No Tax (-) found from Invoice Details.":"Tidak ditemukan Pajak (-) dari Rincian Invoice.","No accounting preview available.":"Pratinjau akuntansi belum tersedia.","No forecast generated.":"Belum ada proyeksi yang dibuat.","No detail added.":"Belum ada rincian ditambahkan.","No data":"Tidak ada data","No records found":"Data tidak ditemukan","No records available":"Belum ada data","No transactions found":"Transaksi tidak ditemukan","No account found":"Akun tidak ditemukan","No journal found":"Jurnal tidak ditemukan","Record ID":"ID Data","Copy ID":"Salin ID","All Status":"Semua Status","All Role":"Semua Peran","All Roles":"Semua Peran","All Type":"Semua Jenis","All Types":"Semua Jenis","All Category":"Semua Kategori","All Period":"Semua Periode","All Data":"Semua Data","Show All Data":"Tampilkan Semua Data","Show All Outstanding":"Tampilkan Semua Tagihan Belum Lunas","Show":"Tampilkan","Select All":"Pilih Semua","Select Vendor":"Pilih Pemasok","Select Customer":"Pilih Pelanggan","Select Bank Account":"Pilih Rekening Bank","Select Account":"Pilih Akun","Select Period":"Pilih Periode","Select Role":"Pilih Peran","Select Type":"Pilih Jenis","Select Category":"Pilih Kategori","Select Invoice":"Pilih Invoice","Select Payment":"Pilih Pembayaran","Add User":"Tambah Pengguna","Edit User":"Ubah Pengguna","Delete User":"Hapus Pengguna","Add Business Partner":"Tambah Mitra Bisnis","Add Accounting Period":"Tambah Periode Akuntansi","Add Invoice Detail":"Tambah Rincian Invoice","Add Detail":"Tambah Rincian","Save Detail":"Simpan Rincian","Save Draft":"Simpan Draf","Save Payment":"Simpan Pembayaran","Add Tax":"Tambah Pajak","Add Invoice":"Tambah Invoice","Add Account":"Tambah Akun","Add Journal":"Tambah Jurnal","Add Asset":"Tambah Aset","Add Bank":"Tambah Bank","Header Info":"Informasi Header","Date Information":"Informasi Tanggal","Payment Information":"Informasi Pembayaran","Payment Summary":"Ringkasan Pembayaran","Outstanding Invoices":"Invoice Belum Lunas","Selected Invoices":"Invoice Terpilih","Selected Outstanding":"Tagihan Terpilih","Total Payment":"Total Pembayaran","Bank transaction information for this payment batch":"Informasi transaksi bank untuk kelompok pembayaran ini","Select one or more invoices to allocate this payment":"Pilih satu atau beberapa invoice untuk alokasi pembayaran ini","Summary of selected invoice allocations":"Ringkasan alokasi invoice yang dipilih","One GL Journal will be generated for this payment batch.":"Satu Jurnal GL akan dibuat untuk kelompok pembayaran ini.","One bank transaction can settle multiple invoices.":"Satu transaksi bank dapat melunasi beberapa invoice.","Loading outstanding invoices...":"Memuat invoice yang belum lunas...","Automatically generated from Invoice Details":"Dibuat otomatis dari Rincian Invoice","Preview journal entries based on Invoice Details, Tax (+), and Tax (-)":"Pratinjau jurnal berdasarkan Rincian Invoice, Pajak (+), dan Pajak (-)","Waiting for Transaction":"Menunggu Transaksi","Add Invoice Detail to generate the accounting preview.":"Tambahkan Rincian Invoice untuk membuat pratinjau akuntansi.","Remove Invoice Detail":"Hapus Rincian Invoice","Remove this invoice detail?":"Hapus rincian invoice ini?","You are about to remove:":"Anda akan menghapus:","This action cannot be undone.":"Tindakan ini tidak dapat dibatalkan.","Confirm Delete Chart Of Account":"Konfirmasi Hapus Bagan Akun","View Audit Trail":"Lihat Riwayat Audit","Total Debit":"Total Debit","Total Credit":"Total Kredit","Debit Account":"Akun Debit","Credit Account":"Akun Kredit","Debit:":"Debit:","Credit:":"Kredit:","Account Holder":"Pemilik Rekening","Parent Account":"Akun Induk","Line Amount":"Jumlah Baris","Qty":"Kuantitas","Rate":"Tarif","Difference":"Selisih","Complete":"Selesai","Current":"Saat Ini","Fiscal Year":"Tahun Fiskal","Year":"Tahun","Branch":"Cabang","Click":"Klik","Page":"Halaman","of":"dari","Displaying Record":"Menampilkan Data","Last Closed":"Terakhir Ditutup","Last Reopened":"Terakhir Dibuka Kembali","Invoice Date From":"Tanggal Invoice Dari","Invoice Date To":"Tanggal Invoice Sampai","Amount / Status":"Jumlah / Status","Bank Account No":"Nomor Rekening Bank","Bank Account Number":"Nomor Rekening Bank","Tax Code":"Kode Pajak","Tax Type":"Jenis Pajak","Tax Description":"Deskripsi Pajak","Journal Detail":"Rincian Jurnal","Journal Details":"Rincian Jurnal","Journal Entry":"Entri Jurnal","Journal Entries":"Entri Jurnal","Transaction Date":"Tanggal Transaksi","Transaction No":"Nomor Transaksi","Transaction Type":"Jenis Transaksi","Transaction Detail":"Rincian Transaksi","Transaction Details":"Rincian Transaksi","Document":"Dokumen","Document Date":"Tanggal Dokumen","Document Type":"Jenis Dokumen","Reference Date":"Tanggal Referensi","Bank Details":"Rincian Bank","Bank Information":"Informasi Bank","Bank Account Name":"Nama Rekening Bank","Payment Details":"Rincian Pembayaran","Payment History":"Riwayat Pembayaran","Payment Reference":"Referensi Pembayaran","Payment Allocation":"Alokasi Pembayaran","Allocated Amount":"Jumlah Dialokasikan","Remaining Amount":"Sisa Jumlah","Remaining Balance":"Sisa Saldo","Outstanding Balance":"Saldo Belum Lunas","Total Outstanding":"Total Belum Lunas","Invoice Amount":"Jumlah Invoice","Invoice Status":"Status Invoice","Invoice Type":"Jenis Invoice","Invoice Description":"Deskripsi Invoice","Invoice Information":"Informasi Invoice","Invoice Summary":"Ringkasan Invoice","Invoice List":"Daftar Invoice","Invoice Number":"Nomor Invoice","Vendor Name":"Nama Pemasok","Customer Name":"Nama Pelanggan","Business Partner Name":"Nama Mitra Bisnis","Business Partner Type":"Jenis Mitra Bisnis","Business Partner Code":"Kode Mitra Bisnis","Business Partner Details":"Rincian Mitra Bisnis","Contact Person":"Narahubung","Phone Number":"Nomor Telepon","Phone":"Telepon","Address":"Alamat","City":"Kota","Province":"Provinsi","Country":"Negara","Postal Code":"Kode Pos","Website":"Situs Web","Tax ID":"ID Pajak","NPWP Number":"Nomor NPWP","Default Bank":"Bank Utama","Default Account":"Akun Utama","Account Details":"Rincian Akun","Account Group":"Kelompok Akun","Account Class":"Kelas Akun","Account Category":"Kategori Akun","Account Balance":"Saldo Akun","Opening Date":"Tanggal Pembukaan","Closing Date":"Tanggal Penutupan","Period Status":"Status Periode","Period Name":"Nama Periode","Fiscal Period":"Periode Fiskal","Accounting Year":"Tahun Akuntansi","Start Period":"Periode Awal","End Period":"Periode Akhir","Journal Status":"Status Jurnal","Journal Type":"Jenis Jurnal","Journal Description":"Deskripsi Jurnal","Journal Reference":"Referensi Jurnal","Journal Lines":"Baris Jurnal","Posting Period":"Periode Posting","Posting Status":"Status Posting","Posting Date":"Tanggal Posting","Posting Reference":"Referensi Posting","Posted By":"Diposting Oleh","Void Reason":"Alasan Pembatalan","Reason":"Alasan","Remarks":"Keterangan","Memo":"Memo","Attachments":"Lampiran","Attachment":"Lampiran","Choose File":"Pilih Berkas","Upload File":"Unggah Berkas","View File":"Lihat Berkas","Delete File":"Hapus Berkas","Total Records":"Total Data","Total Transactions":"Total Transaksi","Total Invoices":"Total Invoice","Total Payments":"Total Pembayaran","Total Revenue":"Total Pendapatan","Total Expense":"Total Beban","Total Expenses":"Total Beban","Total Profit":"Total Laba","Net Income":"Laba Bersih","Gross Margin":"Margin Kotor","Net Margin":"Margin Bersih","Profit Margin":"Margin Laba","Financial Position":"Posisi Keuangan","Financial Performance":"Kinerja Keuangan","Financial Summary":"Ringkasan Keuangan","Financial Overview":"Ikhtisar Keuangan","Financial Statements":"Laporan Keuangan","Income Statement":"Laporan Laba Rugi","Statement of Financial Position":"Laporan Posisi Keuangan","Cash Flow Statement":"Laporan Arus Kas","Cash Flow Forecast":"Proyeksi Arus Kas","Trial Balance Report":"Laporan Neraca Saldo","General Ledger Report":"Laporan Buku Besar","Balance Sheet Report":"Laporan Neraca","Profit Loss Report":"Laporan Laba Rugi","Report Period":"Periode Laporan","Report Date":"Tanggal Laporan","As of Date":"Per Tanggal","From Date":"Dari Tanggal","To Date":"Sampai Tanggal","Date Range":"Rentang Tanggal","Apply":"Terapkan","Clear":"Bersihkan","Reset":"Atur Ulang","Generate":"Buat","Generate Report":"Buat Laporan","Run Report":"Jalankan Laporan","Preview":"Pratinjau","Print Preview":"Pratinjau Cetak","Export to Excel":"Ekspor ke Excel","Export to PDF":"Ekspor ke PDF","Download PDF":"Unduh PDF","Download CSV":"Unduh CSV","Download Report":"Unduh Laporan","Print Report":"Cetak Laporan","Refresh Data":"Muat Ulang Data","Reload":"Muat Ulang","Loading data...":"Memuat data...","Please select":"Silakan pilih","Please select an option":"Silakan pilih opsi","Required field":"Kolom wajib diisi","This field is required":"Kolom ini wajib diisi","Invalid date":"Tanggal tidak valid","Invalid amount":"Jumlah tidak valid","Invalid email":"Email tidak valid","Saved successfully":"Berhasil disimpan","Deleted successfully":"Berhasil dihapus","Updated successfully":"Berhasil diperbarui","Created successfully":"Berhasil dibuat","Failed to load data":"Gagal memuat data","Failed to save":"Gagal menyimpan","Failed to delete":"Gagal menghapus","Are you sure you want to delete?":"Apakah Anda yakin ingin menghapus?","Are you sure you want to continue?":"Apakah Anda yakin ingin melanjutkan?","Confirm Action":"Konfirmasi Tindakan","Confirm Delete":"Konfirmasi Penghapusan","Confirm Save":"Konfirmasi Penyimpanan","Confirm Posting":"Konfirmasi Posting","Confirm Void":"Konfirmasi Pembatalan","Yes, Delete":"Ya, Hapus","Yes, Continue":"Ya, Lanjutkan","Yes, Save":"Ya, Simpan","Yes, Post":"Ya, Posting","Yes, Void":"Ya, Batalkan","January":"Januari","February":"Februari","March":"Maret","April":"April","May":"Mei","June":"Juni","July":"Juli","August":"Agustus","September":"September","October":"Oktober","November":"November","December":"Desember","Monday":"Senin","Tuesday":"Selasa","Wednesday":"Rabu","Thursday":"Kamis","Friday":"Jumat","Saturday":"Sabtu","Sunday":"Minggu","Jan":"Jan","Feb":"Feb","Mar":"Mar","Apr":"Apr","Jun":"Jun","Jul":"Jul","Aug":"Agu","Sep":"Sep","Oct":"Okt","Nov":"Nov","Dec":"Des","User Name":"Nama Pengguna","User Role":"Peran Pengguna","User Status":"Status Pengguna","User Details":"Rincian Pengguna","User Information":"Informasi Pengguna","User List":"Daftar Pengguna","User Access":"Akses Pengguna","Access Level":"Tingkat Akses","Access Rights":"Hak Akses","Permission":"Izin Akses","Permissions":"Hak Akses","Last Login":"Login Terakhir","Last Updated":"Terakhir Diperbarui","Last Modified":"Terakhir Diubah","Created Date":"Tanggal Dibuat","Updated Date":"Tanggal Diperbarui","Search User":"Cari Pengguna","Search Users":"Cari Pengguna","Search by Name":"Cari Berdasarkan Nama","Search Full Name or Email...":"Cari nama lengkap atau email...","Logged in as":"Masuk sebagai","You have full User Management access.":"Anda memiliki akses penuh ke Manajemen Pengguna.","Master Data / User Management":"Data Master / Manajemen Pengguna","Asset Details":"Rincian Aset","Asset Information":"Informasi Aset","Asset Category":"Kategori Aset","Asset Type":"Jenis Aset","Asset Status":"Status Aset","Asset Location":"Lokasi Aset","Acquisition Date":"Tanggal Perolehan","Acquisition Cost":"Biaya Perolehan","Depreciation Method":"Metode Penyusutan","Accumulated Depreciation":"Akumulasi Penyusutan","Depreciation Expense":"Beban Penyusutan","Residual Value":"Nilai Residu","Salvage Value":"Nilai Sisa","Disposal Date":"Tanggal Pelepasan","Disposal Value":"Nilai Pelepasan","Book Value":"Nilai Buku","Asset Register":"Daftar Aset","Asset List":"Daftar Aset","Audit Trail":"Riwayat Audit","Audit Log Details":"Rincian Log Audit","Activity Log":"Log Aktivitas","Activity Date":"Tanggal Aktivitas","Performed By":"Dilakukan Oleh","Old Value":"Nilai Lama","New Value":"Nilai Baru","Changes":"Perubahan","Before":"Sebelum","After":"Sesudah","Filter By":"Filter Berdasarkan","Sort By":"Urutkan Berdasarkan","Ascending":"Menaik","Descending":"Menurun","All":"Semua","None":"Tidak Ada","Other":"Lainnya","Others":"Lainnya","Default":"Bawaan","Enabled":"Diaktifkan","Disabled":"Dinonaktifkan","Pending":"Menunggu","Approved":"Disetujui","Rejected":"Ditolak","Completed":"Selesai","Cancelled":"Dibatalkan","Processing":"Diproses","Available":"Tersedia","Unavailable":"Tidak Tersedia","Yes":"Ya"};
Object.assign(dictionary,allModulesDictionary);
// Additional visible Business Partner labels; stored values remain untouched.
const businessPartnerDictionary={
 'New Business Partner':'Tambah Mitra Bisnis',
 'New Mitra Bisnis':'Tambah Mitra Bisnis',
 'Search Business Partner Name':'Cari Nama Mitra Bisnis',
 'Search Business Partner Name...':'Cari Nama Mitra Bisnis...',
 'Master Data / Business Partner':'Data Master / Mitra Bisnis',
 'Master Data / Mitra Bisnis':'Data Master / Mitra Bisnis',
 'CUSTOMER':'PELANGGAN',
 'VENDOR':'PEMASOK',
 'Customer':'Pelanggan',
 'Vendor':'Pemasok'
};
// Dashboard: visible labels and dynamic insight messages only (no accounting changes).
const dashboardInsightDictionary={
 'Main Branch':'Cabang Utama',
 'Positive YTD result':'Hasil Positif Tahun Berjalan',
 'Receivable overdue':'Piutang Lewat Jatuh Tempo',
 'Payable overdue':'Utang Lewat Jatuh Tempo',
 'No financial alert':'Tidak Ada Peringatan Keuangan',
 'Financial insights will appear automatically when dashboard data is loaded.':'Informasi keuangan akan muncul otomatis setelah data dasbor dimuat.'
};
Object.assign(dictionary,dashboardInsightDictionary);
Object.assign(dictionary,businessPartnerDictionary);
// Business Partner and Bank Account modal labels (presentation only).
const bankModalDictionary={
 'Add Bank Account':'Tambah Rekening Bank',
 'Add Rekening Bank':'Tambah Rekening Bank',
 'Edit Bank Account':'Ubah Rekening Bank',
 'Select Bank':'Pilih Bank',
 'Name as registered with the bank':'Nama sesuai yang terdaftar di bank',
 'Enter account number':'Masukkan nomor rekening',
 'Bank branch':'Cabang bank',
 'Account Purpose':'Tujuan Rekening',
 'Payment and Receipt (Both)':'Pembayaran dan Penerimaan (Keduanya)',
 'Payment Only':'Hanya Pembayaran',
 'Receipt Only':'Hanya Penerimaan',
 'Set as default account':'Jadikan rekening utama',
 'Save Account':'Simpan Rekening',
 'Bank Accounts':'Rekening Bank',
 'Bank Account(s)':'Rekening Bank',
 'Bank Accounts *':'Rekening Bank *',
 'Purpose':'Tujuan',
 'Default':'Bawaan',
 'Term Of Payment (TOP)':'Termin Pembayaran (TOP)',
 'Term of Payment (TOP)':'Termin Pembayaran (TOP)',
 'Select TOP':'Pilih TOP',
 '-- Select TOP --':'-- Pilih TOP --',
 '16 DIGIT NPWP / NIK':'16 DIGIT NPWP / NIK',
 'Account Holder Name':'Nama Pemilik Rekening',
 'Bank Account Owner':'Pemilik Rekening',
 'Add Business Partner':'Tambah Mitra Bisnis'
};
Object.assign(dictionary,bankModalDictionary);
// Native select options: translate visible labels, preserve option.value.
Object.assign(dictionary,{'EMPLOYEE':'KARYAWAN','Employee':'Karyawan','PAYMENT':'PEMBAYARAN','Payment':'Pembayaran','RECEIPT':'PENERIMAAN','Receipt':'Penerimaan'});



// Chart of Accounts bilingual presentation labels. Original option values remain unchanged.
Object.assign(dictionary,{"Add Chart Of Account":"Tambah Akun","Add Chart of Account":"Tambah Akun","Edit Chart Of Account":"Ubah Akun","Create or update Chart Of Account.":"Buat atau perbarui akun dalam bagan akun.","Create or update Chart of Account.":"Buat atau perbarui akun dalam bagan akun.","Search Account Code or Account Name":"Cari Kode Akun atau Nama Akun","Master Data / Chart Of Accounts":"Data Master / Bagan Akun","Master Data / Chart of Accounts":"Data Master / Bagan Akun","-- None --":"-- Tidak Ada --","Parent":"Induk","Level":"Tingkat","Total Child":"Jumlah Anak Akun","-- Select Account Class --":"-- Pilih Kelas Akun --","-- Pilih Akun Class --":"-- Pilih Kelas Akun --","Auto generated":"Dibuat otomatis","Automatically determined from Kelas Akun.":"Ditentukan otomatis berdasarkan Kelas Akun.","Automatically determined from Account Class.":"Ditentukan otomatis berdasarkan Kelas Akun.","Normal Balance":"Saldo Normal","Posting Type":"Jenis Posting","Manual & Auto":"Manual & Otomatis","Manual & Automatic":"Manual & Otomatis","Account Settings":"Pengaturan Akun","Header Account":"Akun Induk","Parent account only.":"Hanya untuk akun induk.","Allow Transaction":"Izinkan Transaksi","Allow this account to be used in transactions.":"Izinkan akun ini digunakan dalam transaksi.","Account status.":"Status akun.","Additional information about this account...":"Informasi tambahan mengenai akun ini...","Save Chart Of Account":"Simpan Akun","Save Chart of Account":"Simpan Akun","Normal Balance:":"Saldo Normal:","Posting Type:":"Jenis Posting:","Header":"Induk","DEBIT":"DEBIT","CREDIT":"KREDIT","Debit":"Debit","Credit":"Kredit","IDR - Indonesian Rupiah":"IDR - Rupiah Indonesia","Account Class":"Kelas Akun","Account Type":"Jenis Akun"});
// COA confirmation dialogs: UI-only translations; never change account identifiers.
Object.assign(dictionary,{
 'Deactivate Account':'Nonaktifkan Akun',
 'Activate Account':'Aktifkan Akun',
 'Deactivate':'Nonaktifkan',
 'Activate':'Aktifkan',
 'Are you sure you want to set this account as Inactive?':'Apakah Anda yakin ingin menonaktifkan akun ini?',
 'Are you sure you want to set this account as Active?':'Apakah Anda yakin ingin mengaktifkan akun ini?',
 'Chart Of Account':'Bagan Akun',
 'Chart of Account':'Bagan Akun',
 'Chart Of Account yang dihapus tidak dapat dikembalikan.':'Akun yang dihapus tidak dapat dikembalikan.',
 'Chart of Account yang dihapus tidak dapat dikembalikan.':'Akun yang dihapus tidak dapat dikembalikan.',
 'Apakah Anda yakin ingin menghapus Chart Of Account ini?':'Apakah Anda yakin ingin menghapus akun ini?',
 'Apakah Anda yakin ingin menghapus Chart of Account ini?':'Apakah Anda yakin ingin menghapus akun ini?',
 'Are you sure you want to delete this Chart Of Account?':'Apakah Anda yakin ingin menghapus akun ini?',
 'Are you sure you want to delete this Chart of Account?':'Apakah Anda yakin ingin menghapus akun ini?'
});
// User Management password reset modal: presentation text only.
Object.assign(dictionary,{
 'Minimum 8 characters':'Minimal 8 karakter',
 'Password must contain at least 8 characters.':'Kata sandi harus terdiri dari minimal 8 karakter.',
 'Password must contain at least 8 characters':'Kata sandi harus terdiri dari minimal 8 karakter',
 'Minimum 8 Characters':'Minimal 8 karakter'
});
// Business Partner status confirmation: visible text only.
Object.assign(dictionary,{
 'Set Mitra Bisnis Inactive':'Nonaktifkan Mitra Bisnis',
 'Set this Mitra Bisnis to Inactive?':'Apakah Anda yakin ingin menonaktifkan mitra bisnis ini?',
 'Set Inactive':'Nonaktifkan',
 'Set Mitra Bisnis Active':'Aktifkan Mitra Bisnis',
 'Set this Mitra Bisnis to Active?':'Apakah Anda yakin ingin mengaktifkan mitra bisnis ini?',
 'Set Active':'Aktifkan'
});
// Business Partner confirmation variants generated by the module.
// Only visible text is translated; action values and database status are unchanged.
Object.assign(dictionary, {
 'Set Business Partner Inactive':'Nonaktifkan Mitra Bisnis',
 'Set Business Partner Active':'Aktifkan Mitra Bisnis',
 'Set this Business Partner to Inactive?':'Apakah Anda yakin ingin menonaktifkan mitra bisnis ini?',
 'Set this Business Partner to Active?':'Apakah Anda yakin ingin mengaktifkan mitra bisnis ini?',
 'Set this Mitra Bisnis to inactive?':'Apakah Anda yakin ingin menonaktifkan mitra bisnis ini?',
 'Set this Mitra Bisnis to active?':'Apakah Anda yakin ingin mengaktifkan mitra bisnis ini?'
});
// Master Pajak: translations of visible labels, dialogs, and form placeholders only.
const taxModuleDictionary = {
  'Master Data / Tax Master':'Data Master / Master Pajak',
  'Search Tax Code, Tax Name or Description':'Cari kode pajak, nama pajak, atau deskripsi',
  'Search Tax Code, Tax Name or Description...':'Cari kode pajak, nama pajak, atau deskripsi...',
  'Offset Account':'Akun Lawan',
  'Offset Account (Optional)':'Akun Lawan (Opsional)',
  'Set Tax Inactive':'Nonaktifkan Pajak',
  'Set Tax Active':'Aktifkan Pajak',
  'Set this Tax to Inactive?':'Apakah Anda yakin ingin menonaktifkan pajak ini?',
  'Set this Tax to Active?':'Apakah Anda yakin ingin mengaktifkan pajak ini?',
  'Delete Tax':'Hapus Pajak',
  'Delete this Tax?':'Apakah Anda yakin ingin menghapus pajak ini?',
  'Tax Rate (%)':'Tarif Pajak (%)',
  'Select Tax Type':'Pilih Jenis Pajak',
  'Type account code or name...':'Ketik kode atau nama akun...',
  'Tax description...':'Masukkan deskripsi pajak...',
  'Edit Tax':'Ubah Pajak',
  'Add Tax':'Tambah Pajak',
  'Save Tax':'Simpan Pajak',
  'Set Tax to Inactive?':'Apakah Anda yakin ingin menonaktifkan pajak ini?',
  'Set Tax to Active?':'Apakah Anda yakin ingin mengaktifkan pajak ini?',
  'Search Tax Code, Tax Name or Description ':'Cari kode pajak, nama pajak, atau deskripsi '
};
Object.assign(dictionary,taxModuleDictionary);
// Label jenis pajak pada tabel; nilai asli PLUS/MINUS tidak diubah.
Object.assign(dictionary, {'MINUS':'PENGURANG', 'PLUS':'PENAMBAH'});

// Accounting Period module: presentation translations only; select values remain unchanged.
const accountingPeriodDictionary = {
  'Master Data / Accounting Period':'Data Master / Periode Akuntansi',
  'Master Data / Periode Akuntansi':'Data Master / Periode Akuntansi',
  'Open period allows accounting transactions. Closed period blocks accounting transactions until the period is opened or reopened.':'Periode terbuka mengizinkan transaksi akuntansi. Periode tertutup memblokir transaksi akuntansi hingga periode dibuka atau dibuka kembali.',
  'All Year':'Semua Tahun',
  'All Years':'Semua Tahun',
  'Search Period':'Cari Periode',
  'Search Period...':'Cari Periode...',
  'Month':'Bulan',
  'Initial Status':'Status Awal',
  'Period Code otomatis: YYYY-MM.':'Kode periode otomatis: YYYY-MM.',
  'Period Code otomatis: YYYY-MM':'Kode periode otomatis: YYYY-MM',
  'Period Code automatic: YYYY-MM.':'Kode periode otomatis: YYYY-MM.',
  'Period Code automatically: YYYY-MM.':'Kode periode otomatis: YYYY-MM.',
  'Period Code: YYYY-MM.':'Kode periode: YYYY-MM.',
  'Reopen':'Buka Kembali',
  'Reopen Period':'Buka Kembali Periode',
  'Close Period':'Tutup Periode',
  'Open Period':'Buka Periode',
  'Add Accounting Period':'Tambah Periode Akuntansi',
  'Accounting Period':'Periode Akuntansi',
  'Select Month':'Pilih Bulan',
  'Select Year':'Pilih Tahun'
};
Object.assign(dictionary,accountingPeriodDictionary);

// Invoice AP: presentation-only strings. No transaction or database values are modified.
const invoiceAPDictionary = {
  "Add AP": "Tambah Invoice AP",
  "Add Invoice AP": "Tambah Invoice AP",
  "Create new Invoice AP": "Buat Invoice AP baru",
  "View Invoice AP": "Lihat Invoice AP",
  "Edit Invoice AP": "Ubah Invoice AP",
  "Vendor Payment Trace": "Lacak Pembayaran Pemasok",
  "Vendor → AP Invoice → Payment → GL Journal": "Pemasok → Invoice AP → Pembayaran → Jurnal GL",
  "Trace Payment": "Lacak Pembayaran",
  "Vendor / Description": "Pemasok / Deskripsi",
  "Vendor / Deskripsi": "Pemasok / Deskripsi",
  "Inv Date": "Tanggal Invoice",
  "Received": "Tanggal Diterima",
  "Date Received": "Tanggal Diterima",
  "Received Date": "Tanggal Diterima",
  "Tanggal Jatuh Tempo": "Tanggal Jatuh Tempo",
  "Total Payable": "Total Utang AP",
  "PAYABLE": "UTANG AP",
  "INV": "INV",
  "Inv No": "No. Invoice",
  "Invoice No": "No. Invoice",
  "Journal NOT POSTED": "Jurnal BELUM DIPOSTING",
  "NOT POSTED": "BELUM DIPOSTING",
  "Paid Amount": "Jumlah Dibayar",
  "GL Status": "Status Jurnal GL",
  "GL Journal": "Jurnal GL",
  "Payment Date From": "Tanggal Pembayaran Dari",
  "Payment Date To": "Tanggal Pembayaran Sampai",
  "Tanggal Pembayaran From": "Tanggal Pembayaran Dari",
  "Tanggal Pembayaran To": "Tanggal Pembayaran Sampai",
  "Payment Date": "Tanggal Pembayaran",
  "Search Invoice No or Vendor...": "Cari nomor invoice atau pemasok...",
  "Search Invoice No or Vendor": "Cari nomor invoice atau pemasok",
  "Search Invoice No or Vendor... ": "Cari nomor invoice atau pemasok... ",
  "Select or type Vendor": "Pilih atau ketik pemasok",
  "Enter PO number": "Masukkan nomor PO",
  "Enter invoice number": "Masukkan nomor invoice",
  "Auto Generated": "Dibuat otomatis",
  "Enter description": "Masukkan deskripsi",
  "Add account payable detail": "Tambahkan rincian Invoice AP",
  "No details added.": "Belum ada rincian ditambahkan.",
  "No details added": "Belum ada rincian ditambahkan",
  "Add Detail": "Tambah Rincian",
  "Unit Price": "Harga Satuan",
  "Quantity": "Kuantitas",
  "Amount": "Jumlah",
  "Account": "Akun",
  "Description": "Deskripsi",
  "Accounting / Invoice AP": "Akuntansi / Invoice AP",
  "Accounting": "Akuntansi",
  "Invoice Detail": "Rincian Invoice",
  "Invoice Details": "Rincian Invoice",
  "Header Information": "Informasi Header",
  "Tax (+)": "Pajak (+)",
  "Tax (-)": "Pajak (-)",
  "Accounting Preview": "Pratinjau Akuntansi",
  "No Tax (+) found from Invoice Details.": "Tidak ditemukan Pajak (+) dari Rincian Invoice.",
  "No Tax (-) found from Invoice Details.": "Tidak ditemukan Pajak (-) dari Rincian Invoice.",
  "Automatically generated from Invoice Details": "Dibuat otomatis dari Rincian Invoice",
  "Automatically generated from Invoice Detail": "Dibuat otomatis dari Rincian Invoice",
  "Preview Journal": "Pratinjau Jurnal",
  "Debit:": "Debit:",
  "Credit:": "Kredit:",
  "Total Credit": "Total Kredit",
  "Total Debit": "Total Debit",
  "Difference": "Selisih",
  "Waiting for Transaction": "Menunggu Transaksi",
  "Add Invoice Detail to generate the accounting preview.": "Tambahkan Rincian Invoice untuk membuat pratinjau akuntansi.",
  "Save Draft": "Simpan Draf",
  "Unpaid": "Belum Lunas",
  "Paid": "Lunas",
  "Partial Paid": "Dibayar Sebagian",
  "Outstanding": "Belum Dibayar",
  "Total Outstanding": "Total Belum Lunas",
  "Invoice Date From": "Tanggal Invoice Dari",
  "Invoice Date To": "Tanggal Invoice Sampai",
  "Search By": "Cari Berdasarkan",
  "Keyword": "Kata Kunci",
  "Find By": "Cari Berdasarkan",
  "Find": "Cari",
  "Show All Data": "Tampilkan Semua Data",
  "Amount / Status": "Jumlah / Status",
  "No. Invoice": "No. Invoice",
  "Invoice Date": "Tanggal Invoice",
  "Due Date": "Tanggal Jatuh Tempo",
  "Journal": "Jurnal",
  "Vendor": "Pemasok",
  "No.": "No.",
  "Close": "Tutup",
  "View": "Lihat",
  "Print": "Cetak",
  "No Invoice": "No. Invoice",
  "Invoice No.": "No. Invoice",
  "Payment Amount": "Jumlah Pembayaran",
  "Tax Base": "Dasar Pengenaan Pajak",
  "Tax Amount": "Jumlah Pajak",
  "Tax Account": "Akun Pajak",
  "Rate": "Tarif",
  "Account Name": "Nama Akun",
  "Account Code": "Kode Akun",
  "Journal No": "No. Jurnal",
  "No. Journal": "No. Jurnal",
  "Journal Number": "Nomor Jurnal",
  "PO Number": "Nomor PO",
  "PO No": "Nomor PO",
  "Invoice Number": "Nomor Invoice",
  "Payment Status": "Status Pembayaran",
  "Total Amount": "Jumlah Total",
  "Total": "Total",
  "Status": "Status",
  "Document": "Dokumen",
  "Action": "Tindakan",
  "Actions": "Tindakan",
  "No accounting preview available.": "Pratinjau akuntansi belum tersedia.",
  "No payment records found.": "Data pembayaran tidak ditemukan.",
  "No payments found.": "Pembayaran tidak ditemukan.",
  "Select Vendor": "Pilih Pemasok",
  "Select or type vendor": "Pilih atau ketik pemasok",
  "Add Invoice AP Detail": "Tambah Rincian Invoice AP",
  "View Invoice AP Detail": "Lihat Rincian Invoice AP",
  "Edit Invoice AP Detail": "Ubah Rincian Invoice AP",
  "Create New Invoice AP": "Buat Invoice AP Baru",
  "Invoice AP Details": "Rincian Invoice AP",
  "Invoice AP Detail": "Rincian Invoice AP",
  "Vendor Payment": "Pembayaran Pemasok",
  "Payment Trace": "Pelacakan Pembayaran",
  "Payment History": "Riwayat Pembayaran",
  "Payment": "Pembayaran",
  "Tax": "Pajak",
  "Preview HTML": "Pratinjau HTML",
  "Download Excel": "Unduh Excel",
  "Refresh": "Muat Ulang",
  "Search": "Cari",
  "Save": "Simpan",
  "Cancel": "Batal",
};
Object.assign(dictionary, invoiceAPDictionary);
// Invoice AP subtitle: preserve original transaction logic and translate UI text only.
Object.assign(dictionary, {
  'Create new Invoice AP':'Buat Invoice AP baru',
  'Create New Invoice AP':'Buat Invoice AP baru',
  'Create new invoice AP':'Buat Invoice AP baru'
});
const englishLabels={'Invoice AP':'Account Payable','Invoice AR':'Account Receivable','Tambah Mitra Bisnis':'New Business Partner','Cari Nama Mitra Bisnis':'Search Business Partner Name','Cari Nama Mitra Bisnis...':'Search Business Partner Name...','Data Master / Mitra Bisnis':'Master Data / Business Partner','PELANGGAN':'CUSTOMER','PEMASOK':'VENDOR'};
const reverse=Object.fromEntries(Object.entries(dictionary).map(([en,id])=>[id,en]));
Object.assign(reverse, {'PENGURANG':'MINUS', 'PENAMBAH':'PLUS'});
Object.assign(reverse,{
 'Tambah Rekening Bank':'Add Bank Account',
 'Ubah Rekening Bank':'Edit Bank Account',
 'Pilih Bank':'Select Bank',
 'Nama sesuai yang terdaftar di bank':'Name as registered with the bank',
 'Masukkan nomor rekening':'Enter account number',
 'Cabang bank':'Bank branch',
 'Tujuan Rekening':'Account Purpose',
 'Pembayaran dan Penerimaan (Keduanya)':'Payment and Receipt (Both)',
 'Hanya Pembayaran':'Payment Only',
 'Hanya Penerimaan':'Receipt Only',
 'Jadikan rekening utama':'Set as default account',
 'Simpan Rekening':'Save Account',
 'Rekening Bank':'Bank Accounts',
 'Termin Pembayaran (TOP)':'Term Of Payment (TOP)',
 '-- Pilih TOP --':'-- Select TOP --',
 'Tujuan':'Purpose',
 'Pemilik Rekening':'Account Holder',
 'Tambah Mitra Bisnis':'New Business Partner'
});

Object.assign(reverse,{"Tambah Akun":"Add Account","Ubah Akun":"Edit Chart Of Account","Buat atau perbarui akun dalam bagan akun.":"Create or update Chart of Account.","Cari Kode Akun atau Nama Akun":"Search Account Code or Account Name","Data Master / Bagan Akun":"Master Data / Chart of Accounts","-- Tidak Ada --":"-- None --","Induk":"Header","Tingkat":"Level","Jumlah Anak Akun":"Total Child","-- Pilih Kelas Akun --":"-- Pilih Akun Class --","Dibuat otomatis":"Auto generated","Ditentukan otomatis berdasarkan Kelas Akun.":"Automatically determined from Account Class.","Saldo Normal":"Normal Balance","Jenis Posting":"Posting Type","Manual & Otomatis":"Manual & Automatic","Pengaturan Akun":"Account Settings","Akun Induk":"Header Account","Hanya untuk akun induk.":"Parent account only.","Izinkan Transaksi":"Allow Transaction","Izinkan akun ini digunakan dalam transaksi.":"Allow this account to be used in transactions.","Status akun.":"Account status.","Informasi tambahan mengenai akun ini...":"Additional information about this account...","Simpan Akun":"Save Chart of Account","Saldo Normal:":"Normal Balance:","Jenis Posting:":"Posting Type:","KREDIT":"CREDIT","Kredit":"Credit","IDR - Rupiah Indonesia":"IDR - Indonesian Rupiah","Kelas Akun":"Account Class","Jenis Akun":"Account Type"});
// Resolve reverse collisions for the Business Partner confirmation modal.
Object.assign(reverse, {
 'Nonaktifkan Mitra Bisnis':'Set Business Partner Inactive',
 'Aktifkan Mitra Bisnis':'Set Business Partner Active',
 'Apakah Anda yakin ingin menonaktifkan mitra bisnis ini?':'Set this Business Partner to Inactive?',
 'Apakah Anda yakin ingin mengaktifkan mitra bisnis ini?':'Set this Business Partner to Active?',
 'Nonaktifkan':'Set Inactive',
 'Aktifkan':'Set Active'
});
// Preserve intended English labels when switching language back.
Object.assign(reverse, {
  'Data Master / Master Pajak':'Master Data / Tax Master',
  'Cari kode pajak, nama pajak, atau deskripsi':'Search Tax Code, Tax Name or Description',
  'Akun Lawan':'Offset Account',
  'Akun Lawan (Opsional)':'Offset Account (Optional)',
  'Nonaktifkan Pajak':'Set Tax Inactive',
  'Aktifkan Pajak':'Set Tax Active',
  'Apakah Anda yakin ingin menonaktifkan pajak ini?':'Set this Tax to Inactive?',
  'Apakah Anda yakin ingin mengaktifkan pajak ini?':'Set this Tax to Active?',
  'Hapus Pajak':'Delete Tax',
  'Apakah Anda yakin ingin menghapus pajak ini?':'Delete this Tax?',
  'Tarif Pajak (%)':'Tax Rate (%)',
  'Pilih Jenis Pajak':'Select Tax Type',
  'Ketik kode atau nama akun...':'Type account code or name...',
  'Masukkan deskripsi pajak...':'Tax description...',
  'Ubah Pajak':'Edit Tax'
});

// Prefer canonical English strings when switching back from Indonesian.
Object.assign(reverse, {
  'Data Master / Periode Akuntansi':'Master Data / Accounting Period',
  'Periode terbuka mengizinkan transaksi akuntansi. Periode tertutup memblokir transaksi akuntansi hingga periode dibuka atau dibuka kembali.':'Open period allows accounting transactions. Closed period blocks accounting transactions until the period is opened or reopened.',
  'Semua Tahun':'All Year',
  'Cari Periode':'Search Period',
  'Cari Periode...':'Search Period...',
  'Bulan':'Month',
  'Status Awal':'Initial Status',
  'Kode periode otomatis: YYYY-MM.':'Period Code automatic: YYYY-MM.',
  'Buka Kembali':'Reopen',
  'Pilih Bulan':'Select Month',
  'Pilih Tahun':'Select Year'
});

// Canonical English display when the language switcher is set to EN.
Object.assign(reverse, {
  "Tambah Invoice AP": "Add Invoice AP",
  "Buat Invoice AP baru": "Create new Invoice AP",
  "Lihat Invoice AP": "View Invoice AP",
  "Ubah Invoice AP": "Edit Invoice AP",
  "Lacak Pembayaran Pemasok": "Vendor Payment Trace",
  "Pemasok → Invoice AP → Pembayaran → Jurnal GL": "Vendor → AP Invoice → Payment → GL Journal",
  "Lacak Pembayaran": "Trace Payment",
  "Pemasok / Deskripsi": "Vendor / Description",
  "Tanggal Invoice": "Invoice Date",
  "Tanggal Diterima": "Date Received",
  "Total Utang AP": "Total Payable",
  "UTANG AP": "PAYABLE",
  "No. Invoice": "Invoice No.",
  "Jurnal BELUM DIPOSTING": "Journal NOT POSTED",
  "BELUM DIPOSTING": "NOT POSTED",
  "Jumlah Dibayar": "Paid Amount",
  "Status Jurnal GL": "GL Status",
  "Jurnal GL": "GL Journal",
  "Tanggal Pembayaran Dari": "Payment Date From",
  "Tanggal Pembayaran Sampai": "Payment Date To",
  "Tanggal Pembayaran": "Payment Date",
  "Cari nomor invoice atau pemasok...": "Search Invoice No or Vendor...",
  "Cari nomor invoice atau pemasok": "Search Invoice No or Vendor",
  "Cari nomor invoice atau pemasok... ": "Search Invoice No or Vendor... ",
  "Pilih atau ketik pemasok": "Select or type vendor",
  "Masukkan nomor PO": "Enter PO number",
  "Masukkan nomor invoice": "Enter invoice number",
  "Dibuat otomatis": "Auto Generated",
  "Masukkan deskripsi": "Enter description",
  "Tambahkan rincian Invoice AP": "Add account payable detail",
  "Belum ada rincian ditambahkan.": "No details added.",
  "Belum ada rincian ditambahkan": "No details added",
  "Tambah Rincian": "Add Detail",
  "Harga Satuan": "Unit Price",
  "Kuantitas": "Quantity",
  "Jumlah": "Amount",
  "Akun": "Account",
  "Deskripsi": "Description",
  "Akuntansi / Invoice AP": "Accounting / Invoice AP",
  "Akuntansi": "Accounting",
  "Rincian Invoice": "Invoice Details",
  "Informasi Header": "Header Information",
  "Pajak (+)": "Tax (+)",
  "Pajak (-)": "Tax (-)",
  "Pratinjau Akuntansi": "Accounting Preview",
  "Tidak ditemukan Pajak (+) dari Rincian Invoice.": "No Tax (+) found from Invoice Details.",
  "Tidak ditemukan Pajak (-) dari Rincian Invoice.": "No Tax (-) found from Invoice Details.",
  "Dibuat otomatis dari Rincian Invoice": "Automatically generated from Invoice Detail",
  "Pratinjau Jurnal": "Preview Journal",
  "Kredit:": "Credit:",
  "Total Kredit": "Total Credit",
  "Selisih": "Difference",
  "Menunggu Transaksi": "Waiting for Transaction",
  "Tambahkan Rincian Invoice untuk membuat pratinjau akuntansi.": "Add Invoice Detail to generate the accounting preview.",
  "Simpan Draf": "Save Draft",
  "Belum Lunas": "Unpaid",
  "Lunas": "Paid",
  "Dibayar Sebagian": "Partial Paid",
  "Belum Dibayar": "Outstanding",
  "Total Belum Lunas": "Total Outstanding",
  "Tanggal Invoice Dari": "Invoice Date From",
  "Tanggal Invoice Sampai": "Invoice Date To",
  "Cari Berdasarkan": "Find By",
  "Kata Kunci": "Keyword",
  "Cari": "Search",
  "Tampilkan Semua Data": "Show All Data",
  "Jumlah / Status": "Amount / Status",
  "Tanggal Jatuh Tempo": "Due Date",
  "Jurnal": "Journal",
  "Pemasok": "Vendor",
  "Tutup": "Close",
  "Lihat": "View",
  "Cetak": "Print",
  "Jumlah Pembayaran": "Payment Amount",
  "Dasar Pengenaan Pajak": "Tax Base",
  "Jumlah Pajak": "Tax Amount",
  "Akun Pajak": "Tax Account",
  "Tarif": "Rate",
  "Nama Akun": "Account Name",
  "Kode Akun": "Account Code",
  "No. Jurnal": "No. Journal",
  "Nomor Jurnal": "Journal Number",
  "Nomor PO": "PO No",
  "Nomor Invoice": "Invoice Number",
  "Status Pembayaran": "Payment Status",
  "Jumlah Total": "Total Amount",
  "Dokumen": "Document",
  "Tindakan": "Actions",
  "Pratinjau akuntansi belum tersedia.": "No accounting preview available.",
  "Data pembayaran tidak ditemukan.": "No payment records found.",
  "Pembayaran tidak ditemukan.": "No payments found.",
  "Pilih Pemasok": "Select Vendor",
  "Tambah Rincian Invoice AP": "Add Invoice AP Detail",
  "Lihat Rincian Invoice AP": "View Invoice AP Detail",
  "Ubah Rincian Invoice AP": "Edit Invoice AP Detail",
  "Buat Invoice AP Baru": "Create New Invoice AP",
  "Rincian Invoice AP": "Invoice AP Detail",
  "Pembayaran Pemasok": "Vendor Payment",
  "Pelacakan Pembayaran": "Payment Trace",
  "Riwayat Pembayaran": "Payment History",
  "Pembayaran": "Payment",
  "Pajak": "Tax",
  "Pratinjau HTML": "Preview HTML",
  "Unduh Excel": "Download Excel",
  "Muat Ulang": "Refresh",
  "Simpan": "Save",
  "Batal": "Cancel",
});
// Account Payable modal subtitles are written dynamically by account-payable.js.
// Translate their exact source strings without changing transaction behavior.
Object.assign(dictionary, {
  'Create new Account Payable': 'Buat Invoice AP baru',
  'View Account Payable': 'Lihat Invoice AP',
  'Edit existing Account Payable': 'Ubah Invoice AP yang sudah ada',
  'Create new Invoice AP': 'Buat Invoice AP baru',
  'View Invoice AP': 'Lihat Invoice AP',
  'Edit existing Invoice AP': 'Ubah Invoice AP yang sudah ada'
});
// Invoice AR: visible labels, dynamic modal subtitles, and placeholders only.
// Account identifiers, values, financial calculations and transaction logic are unchanged.
const invoiceARDictionary = {
  'Add AR':'Tambah Invoice AR',
  'Add Invoice AR':'Tambah Invoice AR',
  'View Invoice AR':'Lihat Invoice AR',
  'Edit Invoice AR':'Ubah Invoice AR',
  'Create new Invoice AR':'Buat Invoice AR baru',
  'Create New Invoice AR':'Buat Invoice AR baru',
  'Create new Account Receivable':'Buat Invoice AR baru',
  'View Account Receivable':'Lihat Invoice AR',
  'Edit existing Account Receivable':'Ubah Invoice AR yang sudah ada',
  'Edit existing Invoice AR':'Ubah Invoice AR yang sudah ada',
  'Customer Payment Trace':'Lacak Pembayaran Pelanggan',
  'Customer Pelacakan Pembayaran':'Lacak Pembayaran Pelanggan',
  'Customer → AR Invoice → Payment → GL Journal':'Pelanggan → Invoice AR → Pembayaran → Jurnal GL',
  'Customer / Description':'Pelanggan / Deskripsi',
  'Customer / Deskripsi':'Pelanggan / Deskripsi',
  'Search Account Receivable':'Cari nomor invoice atau pelanggan',
  'Search Account Receivable...':'Cari nomor invoice atau pelanggan...',
  'Select or type Customer':'Pilih atau ketik pelanggan',
  'Select or type customer':'Pilih atau ketik pelanggan',
  'Select Credit Account':'Pilih Akun Kredit',
  'Select Debit Account':'Pilih Akun Debit',
  'Add account receivable invoice detail':'Tambahkan rincian Invoice AR',
  'Add account receivable detail':'Tambahkan rincian Invoice AR',
  'Add account receivable invoice details':'Tambahkan rincian Invoice AR',
  'Total Receivable':'Total Piutang AR',
  'RECEIVABLE':'PIUTANG AR',
  'Journal POSTED':'Jurnal SUDAH DIPOSTING',
  'Journal NOT POSTED':'Jurnal BELUM DIPOSTING',
  'POSTED':'SUDAH DIPOSTING',
  'Accounting / Invoice AR':'Akuntansi / Invoice AR',
  'Create new invoice AR':'Buat Invoice AR baru',
  'Add Invoice AR Detail':'Tambah Rincian Invoice AR',
  'View Invoice AR Detail':'Lihat Rincian Invoice AR',
  'Edit Invoice AR Detail':'Ubah Rincian Invoice AR',
  'No. Invoice':'No. Invoice',
  'Search Invoice No or Customer...':'Cari nomor invoice atau pelanggan...',
  'Search Invoice No or Customer':'Cari nomor invoice atau pelanggan',
  'Customer Payment':'Pembayaran Pelanggan',
  'Trace Customer Payment':'Lacak Pembayaran Pelanggan',
  'Paid Amount':'Jumlah Dibayar',
  'GL Status':'Status Jurnal GL',
  'Credit Account':'Akun Kredit',
  'Debit Account':'Akun Debit'
};
Object.assign(dictionary,invoiceARDictionary);
// Explicit reverse entries avoid collisions with Invoice AP or generic labels.
Object.assign(reverse, {
  'Tambah Invoice AR':'Add Invoice AR',
  'Lihat Invoice AR':'View Invoice AR',
  'Ubah Invoice AR':'Edit Invoice AR',
  'Buat Invoice AR baru':'Create new Invoice AR',
  'Ubah Invoice AR yang sudah ada':'Edit existing Invoice AR',
  'Lacak Pembayaran Pelanggan':'Customer Payment Trace',
  'Pelanggan → Invoice AR → Pembayaran → Jurnal GL':'Customer → AR Invoice → Payment → GL Journal',
  'Pelanggan / Deskripsi':'Customer / Description',
  'Cari nomor invoice atau pelanggan':'Search Account Receivable',
  'Cari nomor invoice atau pelanggan...':'Search Account Receivable...',
  'Pilih atau ketik pelanggan':'Select or type Customer',
  'Pilih Akun Kredit':'Select Credit Account',
  'Pilih Akun Debit':'Select Debit Account',
  'Tambahkan rincian Invoice AR':'Add account receivable invoice detail',
  'Total Piutang AR':'Total Receivable',
  'PIUTANG AR':'RECEIVABLE',
  'Jurnal SUDAH DIPOSTING':'Journal POSTED',
  'SUDAH DIPOSTING':'POSTED',
  'Akuntansi / Invoice AR':'Accounting / Invoice AR',
  'Tambah Rincian Invoice AR':'Add Invoice AR Detail',
  'Lihat Rincian Invoice AR':'View Invoice AR Detail',
  'Ubah Rincian Invoice AR':'Edit Invoice AR Detail',
  'Pembayaran Pelanggan':'Customer Payment',
  'Akun Kredit':'Credit Account',
  'Akun Debit':'Debit Account'
});

// Invoice AR: terjemahan tambahan untuk label dinamis.
Object.assign(dictionary,{"Inv Date": "Tanggal Invoice", "Due Date": "Tanggal Jatuh Tempo", "AR Payment": "Pembayaran Invoice AR", "Create one payment for multiple outstanding Account Receivable invoices": "Buat satu penerimaan untuk beberapa Invoice AR yang belum lunas", "Type account code or bank account name": "Ketik kode akun atau nama rekening bank", "Transfer / bank reference": "Referensi transfer / bank", "Payment description": "Deskripsi penerimaan", "Detailed DPP / Tax (+) / Tax (-) journal allocation will continue to follow FINOVA AP Payment accounting logic.": "Alokasi jurnal DPP / Pajak (+) / Pajak (-) tetap mengikuti logika akuntansi pembayaran FINOVA yang berlaku.", "Journal POSTED": "Jurnal SUDAH DIPOSTING", "RECEIVABLE": "PIUTANG AR", "Total Receivable": "Total Piutang AR"});
const storageKey='finova-ui-language';
let lang='id';try{lang=localStorage.getItem(storageKey)==='en'?'en':'id'}catch(_){ }
const originals=new WeakMap();const originalAttrs=new WeakMap();
const ignored='script,style,textarea,code,pre,[contenteditable="true"],[data-finova-i18n-ignore]';
function translate(value){if(!value||!value.trim())return value;
const whitespace=value.match(/^(\s*)([\s\S]*?)(\s*)$/);if(!whitespace)return value;
const key=whitespace[2];const table=lang==='id'?dictionary:reverse;
return Object.prototype.hasOwnProperty.call(table,key)?whitespace[1]+table[key]+whitespace[3]:value;}
const lastRendered=new WeakMap();
function normalized(value){return value.replace(/\s+/g,' ').trim()}
// Translate complete labels first, then safely translate sentence fragments in mixed HTML text nodes.
// Never replace short tokens inside arbitrary words or business data.
const phrasePairs=Object.entries(dictionary).filter(([en,id])=>en.length>=12 && /[a-z]/i.test(en) && en!==id).sort((a,b)=>b[0].length-a[0].length);
const englishPhrases=phrasePairs.map(([en,id])=>[id,en]).sort((a,b)=>b[0].length-a[0].length);
function escapeRegex(value){return value.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')}
// Dynamic Dashboard insight sentences: preserve quantities and currency values.
function translateDashboardDynamic(original){
 const trimmed=original.trim();
 const leading=original.match(/^\s*/)[0], trailing=original.match(/\s*$/)[0];
 let m;
 if(lang==='id'){
  m=trimmed.match(/^(\d+)\s+journal\(s\)\s+are still waiting for posting\.$/i);
  if(m)return leading+`${m[1]} jurnal masih menunggu untuk diposting.`+trailing;
  m=trimmed.match(/^Net profit is (.+)\.$/i);
  if(m)return leading+`Laba bersih sebesar ${m[1]}.`+trailing;
 }else{
  m=trimmed.match(/^(\d+) jurnal masih menunggu untuk diposting\.$/i);
  if(m)return leading+`${m[1]} journal(s) are still waiting for posting.`+trailing;
  m=trimmed.match(/^Laba bersih sebesar (.+)\.$/i);
  if(m)return leading+`Net profit is ${m[1]}.`+trailing;
 }
 return null;
}
function translateOriginal(original){
 const dynamic=translateDashboardDynamic(original);if(dynamic!==null)return dynamic;
 const key=normalized(original);
 const exact=lang==='id'?dictionary[key]:(englishLabels[key]||reverse[key]);
 if(exact!==undefined){const leading=original.match(/^\s*/)[0],trailing=original.match(/\s*$/)[0];return leading+exact+trailing}
 if(lang==='id'){
  const pagination=key.match(/^Displaying Record (\d+) - (\d+) of (\d+)$/);
  if(pagination)return original.replace(key,`Menampilkan data ${pagination[1]} - ${pagination[2]} dari ${pagination[3]}`);
 }
 // A sentence may be split around <strong> or other inline elements.
 // Replace only whole phrases; exclude short ambiguous words (e.g. No, of, May).
 let output=original;
 const pairs=lang==='id'?phrasePairs:englishPhrases;
 for(const [source,target] of pairs){
  if(!output.includes(source))continue;
  const re=new RegExp('(?<![\\p{L}\\p{N}])'+escapeRegex(source)+'(?![\\p{L}\\p{N}])','gu');
  output=output.replace(re,target);
 }
 return output;
}
function isNumberHeading(node){
 const p=node.parentElement;if(!p)return false;
 const el=p.closest('th,td,[role="columnheader"],label');
 return !!(el && (el.matches('th,[role="columnheader"]') || /(?:^|\s)(?:invoice|journal|payment|po|reference|document)(?:\s|$)/i.test(el.textContent||'')));
}
function visitText(node){
 const parent=node.parentElement;if(!parent||parent.closest(ignored)||parent.closest('#finova-language-switcher'))return;
 let original=originals.get(node);
 const current=node.nodeValue;
 if(original===undefined || (current!==original&&current!==lastRendered.get(node))){original=current;originals.set(node,original)}
 let result=translateOriginal(original);
 // Standalone numbering column headers always use No. in both languages.
 // Do not alter No in confirmations or Nomor inside longer labels.
 if(isNumberHeading(node) && /^(?:No\.?|Nomor)$/i.test(normalized(original))){
  const leading=original.match(/^\s*/)[0], trailing=original.match(/\s*$/)[0];
  result=leading+'No.'+trailing;
 } else if(normalized(original)==='No.') result=original;
 lastRendered.set(node,result);
 if(current!==result)node.nodeValue=result;
}
function visitAttrs(el){if(el.matches('script,style,code,pre,[contenteditable="true"],[data-finova-i18n-ignore]')||el.closest('script,style,code,pre,[contenteditable="true"],[data-finova-i18n-ignore],#finova-language-switcher'))return;
for(const attr of ['placeholder','title','aria-label']){if(!el.hasAttribute(attr))continue;
let cache=originalAttrs.get(el);if(!cache){cache={};originalAttrs.set(el,cache)}
let original=cache[attr];const current=el.getAttribute(attr);
if(original===undefined||current!==original&&current!==dictionary[original]&&current!==englishLabels[original]){original=current;cache[attr]=original}
const translated=lang==='id'?(dictionary[original]||original):(englishLabels[original]||reverse[original]||original);
if(current!==translated)el.setAttribute(attr,translated);
}}
function translateTree(root){if(root.nodeType===3){visitText(root);return}if(root.nodeType!==1&&root.nodeType!==9)return;
if(root.nodeType===1){if(root.matches(ignored))return;visitAttrs(root)}
const walker=document.createTreeWalker(root,NodeFilter.SHOW_ELEMENT|NodeFilter.SHOW_TEXT);
let n;while((n=walker.nextNode())){if(n.nodeType===3)visitText(n);else visitAttrs(n)}
}
function attachSwitcher(){if(document.getElementById('finova-language-switcher'))return;
const host=document.querySelector('.finova-topbar-right')||document.querySelector('.login-header')||document.querySelector('header')||document.querySelector('.finova-sidebar');if(!host)return;
const wrap=document.createElement('div');wrap.id='finova-language-switcher';wrap.setAttribute('data-finova-i18n-ignore','');
const style=document.createElement('style');style.textContent=`
#finova-language-switcher{position:relative;display:inline-flex;align-items:center;flex-shrink:0;font-family:inherit;z-index:1100}
#finova-language-switcher *{box-sizing:border-box}
#finova-language-switcher .fl-trigger{display:flex;align-items:center;gap:9px;min-height:37px;padding:5px 10px;border:1px solid #dce5f0;border-radius:11px;background:#fff;color:#183153;box-shadow:0 2px 9px rgba(28,65,117,.055);font:600 12px/1.3 inherit;cursor:pointer;white-space:nowrap;transition:background .16s,border-color .16s,box-shadow .16s}
#finova-language-switcher .fl-trigger:hover{background:#f5f9ff;border-color:#aac6f1}
#finova-language-switcher .fl-trigger:focus-visible,#finova-language-switcher .fl-option:focus-visible{outline:3px solid #a5c8ff;outline-offset:2px}
#finova-language-switcher .fl-flag{font-size:19px;line-height:1}
#finova-language-switcher .fl-name{font-size:12px;font-weight:700}
#finova-language-switcher .fl-code{font-size:10px;color:#667994;font-weight:600}
#finova-language-switcher .fl-chevron{width:13px;height:13px;margin-left:3px;transition:transform .18s;color:#617894}
#finova-language-switcher.fl-open .fl-chevron{transform:rotate(180deg)}
#finova-language-switcher .fl-menu{position:absolute;right:0;top:calc(100% + 8px);min-width:218px;padding:6px;border:1px solid #e1e9f3;border-radius:13px;background:#fff;box-shadow:0 14px 38px rgba(20,45,85,.17);display:none;z-index:1101}
#finova-language-switcher.fl-open .fl-menu{display:block}
#finova-language-switcher .fl-heading{padding:8px 10px 7px;color:#718199;font-size:10px;font-weight:800;letter-spacing:.08em;text-transform:uppercase}
#finova-language-switcher .fl-option{width:100%;display:flex;align-items:center;gap:11px;padding:10px;border:0;border-radius:9px;background:transparent;text-align:left;cursor:pointer;color:#20344e;font:inherit}
#finova-language-switcher .fl-option:hover{background:#f2f7ff}
#finova-language-switcher .fl-option[aria-selected="true"]{background:#eaf3ff;color:#1557a5}
#finova-language-switcher .fl-option-text{display:flex;flex:1;flex-direction:column;gap:2px}
#finova-language-switcher .fl-option-name{font-size:12px;font-weight:750}
#finova-language-switcher .fl-option-sub{font-size:10px;color:#78879a}
#finova-language-switcher .fl-check{color:#1f6ecb;font-size:16px;font-weight:800}
@media(max-width:480px){#finova-language-switcher .fl-trigger{gap:5px;padding:5px 8px}#finova-language-switcher .fl-name{display:none}#finova-language-switcher .fl-menu{min-width:205px}}
`;document.head.appendChild(style);
wrap.innerHTML=`<button type="button" class="fl-trigger" aria-haspopup="listbox" aria-expanded="false" aria-label="Pilih bahasa / Select language"><span class="fl-flag"></span><span class="fl-name"></span><span class="fl-code"></span><svg class="fl-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg></button><div class="fl-menu" role="listbox" aria-label="Bahasa / Language"><div class="fl-heading">Bahasa / Language</div><button type="button" class="fl-option" role="option" data-lang="id"><span class="fl-flag">🇮🇩</span><span class="fl-option-text"><span class="fl-option-name">Bahasa Indonesia</span><span class="fl-option-sub">Indonesia · ID</span></span><span class="fl-check" aria-hidden="true"></span></button><button type="button" class="fl-option" role="option" data-lang="en"><span class="fl-flag">🇬🇧</span><span class="fl-option-text"><span class="fl-option-name">English</span><span class="fl-option-sub">English · EN</span></span><span class="fl-check" aria-hidden="true"></span></button></div>`;
const trigger=wrap.querySelector('.fl-trigger');const options=[...wrap.querySelectorAll('.fl-option')];
function render(){wrap.querySelector('.fl-trigger .fl-flag').textContent=lang==='id'?'🇮🇩':'🇬🇧';wrap.querySelector('.fl-name').textContent=lang==='id'?'Indonesia':'English';wrap.querySelector('.fl-code').textContent=lang.toUpperCase();for(const option of options){const selected=option.dataset.lang===lang;option.setAttribute('aria-selected',String(selected));option.querySelector('.fl-check').textContent=selected?'✓':'';}}
function close(){wrap.classList.remove('fl-open');trigger.setAttribute('aria-expanded','false')}
trigger.addEventListener('click',()=>{const opening=!wrap.classList.contains('fl-open');wrap.classList.toggle('fl-open',opening);trigger.setAttribute('aria-expanded',String(opening));});
for(const option of options)option.addEventListener('click',()=>{lang=option.dataset.lang;try{localStorage.setItem(storageKey,lang)}catch(_){}document.documentElement.lang=lang;render();close();translateTree(document.body);window.dispatchEvent(new CustomEvent("finova:language-changed",{detail:{language:lang}}));trigger.focus()});
document.addEventListener('pointerdown',event=>{if(!wrap.contains(event.target))close()});document.addEventListener('keydown',event=>{if(event.key==='Escape')close()});
render();host.prepend(wrap);
}
let scheduled=false;const observer=new MutationObserver(()=>{if(scheduled)return;scheduled=true;queueMicrotask(()=>{scheduled=false;attachSwitcher();translateTree(document.body)})});
function init(){document.documentElement.lang=lang;attachSwitcher();translateTree(document.body);observer.observe(document.body,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:['placeholder','title','aria-label']});}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();