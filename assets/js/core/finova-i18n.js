/* FINOVA bilingual presentation layer. Does not modify transaction data or existing CSS. */
(()=>{'use strict';
const dictionary={"Dashboard":"Dasbor","Audit Log":"Log Audit","User Management":"Manajemen Pengguna","Business Partner":"Mitra Bisnis","Chart Of Accounts":"Bagan Akun","Chart of Accounts":"Bagan Akun","Tax Master":"Master Pajak","Accounting Period":"Periode Akuntansi","Account Payable":"Invoice AP","Account Receivable":"Invoice AR","Aging Payable":"Umur Utang AP","Aging Receivable":"Umur Piutang AR","GL Journal":"Jurnal GL","Fixed Asset":"Aset Tetap","General Ledger":"Buku Besar","Trial Balance":"Neraca Saldo","Profit & Loss":"Laba Rugi","Profit and Loss":"Laba Rugi","Balance Sheet":"Neraca","Cash Flow":"Arus Kas","Cash Flow Forecast":"Proyeksi Arus Kas","Financial Reports":"Laporan Keuangan","Reports":"Laporan","Master Data":"Data Master","Settings":"Pengaturan","Company Settings":"Pengaturan Perusahaan","Company Context":"Konteks Perusahaan","Company":"Perusahaan","Profile":"Profil","My Profile":"Profil Saya","Logout":"Keluar","Log Out":"Keluar","Sign Out":"Keluar","Login":"Masuk","Sign In":"Masuk","Forgot Password?":"Lupa Kata Sandi?","Forgot Password":"Lupa Kata Sandi","Reset Password":"Atur Ulang Kata Sandi","Change Password":"Ubah Kata Sandi","Current Password":"Kata Sandi Saat Ini","New Password":"Kata Sandi Baru","Confirm Password":"Konfirmasi Kata Sandi","Password":"Kata Sandi","Email Address":"Alamat Email","Email":"Email","Username":"Nama Pengguna","Full Name":"Nama Lengkap","Name":"Nama","Role":"Peran","Status":"Status","Active":"Aktif","Inactive":"Tidak Aktif","Actions":"Tindakan","Action":"Tindakan","Search":"Cari","Search...":"Cari...","Filter":"Filter","Apply Filter":"Terapkan Filter","Clear Filter":"Hapus Filter","Reset Filter":"Atur Ulang Filter","Refresh":"Muat Ulang","Export":"Ekspor","Export Excel":"Ekspor Excel","Export PDF":"Ekspor PDF","Print":"Cetak","Download":"Unduh","Upload":"Unggah","Add":"Tambah","Add New":"Tambah Baru","Create":"Buat","Edit":"Ubah","Delete":"Hapus","Remove":"Hapus","Save":"Simpan","Save Changes":"Simpan Perubahan","Cancel":"Batal","Close":"Tutup","Submit":"Kirim","Confirm":"Konfirmasi","Yes":"Ya","No":"Tidak","OK":"OK","Back":"Kembali","Next":"Berikutnya","Previous":"Sebelumnya","View":"Lihat","View Detail":"Lihat Detail","Details":"Rincian","Description":"Deskripsi","Date":"Tanggal","Start Date":"Tanggal Mulai","End Date":"Tanggal Akhir","Due Date":"Tanggal Jatuh Tempo","Invoice Date":"Tanggal Invoice","Posting Date":"Tanggal Posting","Created At":"Dibuat Pada","Updated At":"Diperbarui Pada","Created By":"Dibuat Oleh","Updated By":"Diperbarui Oleh","Amount":"Jumlah","Total Amount":"Jumlah Total","Subtotal":"Subtotal","Total":"Total","Balance":"Saldo","Opening Balance":"Saldo Awal","Closing Balance":"Saldo Akhir","Debit":"Debit","Credit":"Kredit","Account":"Akun","Account Code":"Kode Akun","Account Name":"Nama Akun","Account Type":"Jenis Akun","Account Number":"Nomor Akun","Currency":"Mata Uang","Exchange Rate":"Kurs","Payment":"Pembayaran","Payment Date":"Tanggal Pembayaran","Payment Amount":"Jumlah Pembayaran","Payment Method":"Metode Pembayaran","Payment Status":"Status Pembayaran","Paid":"Lunas","Unpaid":"Belum Lunas","Partial Paid":"Dibayar Sebagian","Partial Payment":"Pembayaran Sebagian","Outstanding":"Belum Dibayar","Invoice Number":"Nomor Invoice","Invoice No":"No. Invoice","Invoice Detail":"Rincian Invoice","Invoice Details":"Rincian Invoice","Vendor":"Pemasok","Customer":"Pelanggan","Supplier":"Pemasok","Bank":"Bank","Bank Name":"Nama Bank","Bank Account":"Rekening Bank","Tax":"Pajak","Tax Name":"Nama Pajak","Tax Rate":"Tarif Pajak","Tax Amount":"Jumlah Pajak","Journal":"Jurnal","Journal Date":"Tanggal Jurnal","Journal Number":"Nomor Jurnal","Journal No":"No. Jurnal","Journal Summary":"Ringkasan Jurnal","Post":"Posting","Posted":"Sudah Diposting","Draft":"Draf","Void":"Batalkan","Voided":"Dibatalkan","Unpost":"Batalkan Posting","Period":"Periode","Open Period":"Buka Periode","Close Period":"Tutup Periode","Reopen Period":"Buka Kembali Periode","Open":"Terbuka","Closed":"Ditutup","Summary":"Ringkasan","Overview":"Ikhtisar","Transaction":"Transaksi","Transactions":"Transaksi","No data available":"Tidak ada data","No data found":"Data tidak ditemukan","No detail added.":"Belum ada rincian ditambahkan.","No detail added":"Belum ada rincian ditambahkan","Loading...":"Memuat...","Loading":"Memuat","Please wait...":"Mohon tunggu...","Signing In...":"Sedang masuk...","Unable to sign in.":"Tidak dapat masuk.","Fullscreen":"Layar Penuh","Open Navigation Menu":"Buka Menu Navigasi","Menu":"Menu","Home":"Beranda","Welcome":"Selamat Datang","All":"Semua","Select":"Pilih","Select Company":"Pilih Perusahaan","Select Status":"Pilih Status","Select Date":"Pilih Tanggal","Required":"Wajib","Optional":"Opsional","Notes":"Catatan","Remarks":"Keterangan","Code":"Kode","Type":"Jenis","Category":"Kategori","Quantity":"Kuantitas","Price":"Harga","Unit Price":"Harga Satuan","Reference":"Referensi","Document Number":"Nomor Dokumen","From":"Dari","To":"Sampai","Page":"Halaman","Rows per page":"Baris per halaman","Showing":"Menampilkan","of":"dari","Results":"Hasil","Success":"Berhasil","Error":"Kesalahan","Warning":"Peringatan","Information":"Informasi","Are you sure?":"Apakah Anda yakin?","Confirm Delete":"Konfirmasi Hapus","Save Password":"Simpan Kata Sandi","User":"Pengguna","Users":"Pengguna","Manager":"Manajer","Staff":"Staf","Super Admin":"Super Admin","Asset Management":"Manajemen Aset","Asset":"Aset","Assets":"Aset","Asset Code":"Kode Aset","Asset Name":"Nama Aset","Depreciation":"Penyusutan","Useful Life":"Masa Manfaat","Purchase Date":"Tanggal Pembelian","Purchase Price":"Harga Pembelian","Net Book Value":"Nilai Buku Bersih","Cash Inflow":"Arus Kas Masuk","Cash Outflow":"Arus Kas Keluar","Net Cash Flow":"Arus Kas Bersih","Income":"Pendapatan","Expense":"Beban","Revenue":"Pendapatan","Net Profit":"Laba Bersih","Gross Profit":"Laba Kotor","Liabilities":"Liabilitas","Equity":"Ekuitas","Total Assets":"Total Aset","Total Liabilities":"Total Liabilitas","Total Equity":"Total Ekuitas"};
const dashboardDictionary={"FINANCIAL OVERVIEW":"RINGKASAN KEUANGAN","Executive Financial Dashboard":"Dasbor Keuangan Eksekutif","Monitor financial position, performance, outstanding balances, and recent accounting activity from one dashboard.":"Pantau posisi keuangan, kinerja, saldo terutang, dan aktivitas akuntansi terbaru dalam satu dasbor.","Period":"Periode","Current Period":"Periode Berjalan","Total Asset":"Total Aset","Financial Position":"Posisi Keuangan","Total Liability":"Total Liabilitas","Net Profit (YTD)":"Laba Bersih (YTD)","Performance":"Kinerja","No movement":"Tidak ada perubahan","Net Margin":"Margin Bersih","Profitability":"Profitabilitas","Revenue based":"Berdasarkan pendapatan","Financial Performance Trend":"Tren Kinerja Keuangan","Revenue, expense, and profit movement by month":"Pergerakan pendapatan, beban, dan laba per bulan","Balance Sheet composition":"Komposisi neraca","Liability":"Liabilitas","Financial position overview":"Ringkasan posisi keuangan","Review the composition of assets, liabilities, and equity.":"Tinjau komposisi aset, liabilitas, dan ekuitas.","Balance Sheet Summary":"Ringkasan Neraca","Current financial position":"Posisi keuangan saat ini","Current":"Saat Ini","Resources owned":"Sumber daya yang dimiliki","Current obligations":"Kewajiban saat ini","Owner's interest":"Hak pemilik","Balance Difference":"Selisih Neraca","Asset vs liability and equity":"Aset dibanding liabilitas dan ekuitas","Profit & Loss Summary":"Ringkasan Laba Rugi","Year-to-date performance":"Kinerja tahun berjalan","Income generated":"Pendapatan yang dihasilkan","Operating cost":"Biaya operasional","Revenue minus expense":"Pendapatan dikurangi beban","Profitability ratio":"Rasio profitabilitas","Quick Insights":"Informasi Penting","Items requiring attention":"Hal yang memerlukan perhatian","Dashboard ready":"Dasbor siap digunakan","Financial insights will appear when accounting data is loaded.":"Informasi keuangan akan muncul setelah data akuntansi dimuat.","OPERATIONAL OVERVIEW":"RINGKASAN OPERASIONAL","Operational Snapshot":"Ringkasan Operasional","Current receivable, payable, journal, and business partner activity.":"Aktivitas piutang, utang, jurnal, dan mitra bisnis saat ini.","Draft Journal":"Jurnal Draft","Waiting for posting":"Menunggu posting","Active Business Partner":"Mitra Bisnis Aktif","Customer, Vendor, Employee":"Pelanggan, Pemasok, Karyawan","Recent Financial Activity":"Aktivitas Keuangan Terbaru","Latest transactions across accounting modules":"Transaksi terbaru dari seluruh modul akuntansi","Live":"Langsung","Document":"Dokumen","No financial activity":"Belum ada aktivitas keuangan","Recent transactions will appear here automatically.":"Transaksi terbaru akan muncul di sini secara otomatis.","System Information":"Informasi Sistem","Current accounting environment":"Lingkungan akuntansi saat ini","Current Time":"Waktu Saat Ini","Financial Period":"Periode Keuangan","Branch":"Cabang","Default Currency":"Mata Uang Utama","Year 2026":"Tahun 2026","0 overdue":"0 lewat jatuh tempo","Positive performance":"Kinerja positif","Negative performance":"Kinerja negatif","Draft journal pending":"Jurnal draft belum diposting"};
Object.assign(dictionary,dashboardDictionary);
Object.assign(dictionary,{"Confirm Logout":"Konfirmasi Keluar","Are you sure you want to logout?":"Apakah Anda yakin ingin keluar dari sistem?"});
const userManagementDictionary={"Master Data / User Management":"Data Master / Manajemen Pengguna","Add User":"Tambah Pengguna","Edit User":"Ubah Pengguna","View User":"Lihat Pengguna","User Information":"Informasi Pengguna","All Role":"Semua Peran","All Status":"Semua Status","Last Updated":"Terakhir Diperbarui","Search Full Name or Email...":"Cari nama lengkap atau email...","Logged in as":"Masuk sebagai","You have full User Management access.":"Anda memiliki akses penuh ke Manajemen Pengguna.","User Management is view only.":"Manajemen Pengguna hanya dapat dilihat.","Loading User Management...":"Memuat Manajemen Pengguna...","Displaying Record 0 - 0 of 0":"Menampilkan data 0 - 0 dari 0","Confirm Delete User":"Konfirmasi Hapus Pengguna","Are you sure you want to delete this user?":"Apakah Anda yakin ingin menghapus pengguna ini?","This will remove both the FINOVA profile and Supabase Auth account.":"Tindakan ini akan menghapus profil FINOVA dan akun Supabase Auth.","Minimum 8 characters. Used only when creating a new user.":"Minimal 8 karakter. Hanya digunakan saat membuat pengguna baru.","Temporary Password":"Kata Sandi Sementara","Reset Password":"Atur Ulang Kata Sandi","Show Password":"Tampilkan Kata Sandi","Hide Password":"Sembunyikan Kata Sandi","Re-enter new password":"Masukkan kembali kata sandi baru","New Password is required.":"Kata sandi baru wajib diisi.","Confirm Password is required.":"Konfirmasi kata sandi wajib diisi.","New Password and Confirm Password do not match.":"Kata sandi baru dan konfirmasi tidak cocok.","New Password must contain at least 8 characters.":"Kata sandi baru minimal 8 karakter.","Full Name is required.":"Nama lengkap wajib diisi.","Email is required.":"Email wajib diisi.","Role must be Manager or Staff.":"Peran harus Manager atau Staff.","User created successfully.":"Pengguna berhasil ditambahkan.","User updated successfully.":"Pengguna berhasil diperbarui.","User deleted successfully.":"Pengguna berhasil dihapus.","User password reset successfully.":"Kata sandi pengguna berhasil diatur ulang.","Failed to load users.":"Gagal memuat pengguna.","Failed to save user.":"Gagal menyimpan pengguna.","Failed to delete user.":"Gagal menghapus pengguna.","Failed to reset user password.":"Gagal mengatur ulang kata sandi pengguna.","Failed to initialize User Management.":"Gagal memulai Manajemen Pengguna.","User not found.":"Pengguna tidak ditemukan.","User UID was not found.":"ID pengguna tidak ditemukan.","Authentication session was not found.":"Sesi autentikasi tidak ditemukan.","FINOVA user profile was not found.":"Profil pengguna FINOVA tidak ditemukan.","An unexpected error occurred.":"Terjadi kesalahan yang tidak terduga.","Operation completed successfully.":"Proses berhasil diselesaikan.","You cannot delete your own login account.":"Anda tidak dapat menghapus akun login sendiri.","You cannot deactivate your own FINOVA account.":"Anda tidak dapat menonaktifkan akun FINOVA sendiri.","Only Manager can modify User Management.":"Hanya Manager yang dapat mengubah Manajemen Pengguna.","Only Manager can edit users with a valid Manager or Staff role.":"Hanya Manager yang dapat mengubah pengguna dengan peran Manager atau Staff yang valid.","Only Manager can delete users with a valid Manager or Staff role.":"Hanya Manager yang dapat menghapus pengguna dengan peran Manager atau Staff yang valid.","Only Manager can reset passwords for users with a valid Manager or Staff role.":"Hanya Manager yang dapat mengatur ulang kata sandi pengguna dengan peran Manager atau Staff yang valid.","Action":"Tindakan","Name:":"Nama:","Email:":"Email:","Displaying Record":"Menampilkan data","of":"dari"};
Object.assign(dictionary,userManagementDictionary);
const allModulesDictionary={"No.":"No.","No. Journal":"Nomor Jurnal","No. Invoice":"Nomor Invoice","PO No":"Nomor PO","Payment No":"Nomor Pembayaran","Reference No":"Nomor Referensi","Document No":"Nomor Dokumen","Journal No.":"Nomor Jurnal","Invoice No.":"Nomor Invoice","Find":"Cari","Find By":"Cari Berdasarkan","Keyword":"Kata Kunci","Download Excel":"Unduh Excel","Preview HTML":"Pratinjau HTML","Journal Preview":"Pratinjau Jurnal","Accounting Preview":"Pratinjau Akuntansi","Tax Account":"Akun Pajak","Tax Base":"DPP","Tax (+)":"Pajak (+)","Tax (-)":"Pajak (-)","No Tax":"Tanpa Pajak","No Tax (+) found from Invoice Details.":"Tidak ditemukan Pajak (+) dari Rincian Invoice.","No Tax (-) found from Invoice Details.":"Tidak ditemukan Pajak (-) dari Rincian Invoice.","No accounting preview available.":"Pratinjau akuntansi belum tersedia.","No forecast generated.":"Belum ada proyeksi yang dibuat.","No detail added.":"Belum ada rincian ditambahkan.","No data":"Tidak ada data","No records found":"Data tidak ditemukan","No records available":"Belum ada data","No transactions found":"Transaksi tidak ditemukan","No account found":"Akun tidak ditemukan","No journal found":"Jurnal tidak ditemukan","Record ID":"ID Data","Copy ID":"Salin ID","All Status":"Semua Status","All Role":"Semua Peran","All Roles":"Semua Peran","All Type":"Semua Jenis","All Types":"Semua Jenis","All Category":"Semua Kategori","All Period":"Semua Periode","All Data":"Semua Data","Show All Data":"Tampilkan Semua Data","Show All Outstanding":"Tampilkan Semua Tagihan Belum Lunas","Show":"Tampilkan","Select All":"Pilih Semua","Select Vendor":"Pilih Pemasok","Select Customer":"Pilih Pelanggan","Select Bank Account":"Pilih Rekening Bank","Select Account":"Pilih Akun","Select Period":"Pilih Periode","Select Role":"Pilih Peran","Select Type":"Pilih Jenis","Select Category":"Pilih Kategori","Select Invoice":"Pilih Invoice","Select Payment":"Pilih Pembayaran","Add User":"Tambah Pengguna","Edit User":"Ubah Pengguna","Delete User":"Hapus Pengguna","Add Business Partner":"Tambah Mitra Bisnis","Add Accounting Period":"Tambah Periode Akuntansi","Add Invoice Detail":"Tambah Rincian Invoice","Add Detail":"Tambah Rincian","Save Detail":"Simpan Rincian","Save Draft":"Simpan Draf","Save Payment":"Simpan Pembayaran","Add Tax":"Tambah Pajak","Add Invoice":"Tambah Invoice","Add Account":"Tambah Akun","Add Journal":"Tambah Jurnal","Add Asset":"Tambah Aset","Add Bank":"Tambah Bank","Header Info":"Informasi Header","Date Information":"Informasi Tanggal","Payment Information":"Informasi Pembayaran","Payment Summary":"Ringkasan Pembayaran","Outstanding Invoices":"Invoice Belum Lunas","Selected Invoices":"Invoice Terpilih","Selected Outstanding":"Tagihan Terpilih","Total Payment":"Total Pembayaran","Bank transaction information for this payment batch":"Informasi transaksi bank untuk kelompok pembayaran ini","Select one or more invoices to allocate this payment":"Pilih satu atau beberapa invoice untuk alokasi pembayaran ini","Summary of selected invoice allocations":"Ringkasan alokasi invoice yang dipilih","One GL Journal will be generated for this payment batch.":"Satu Jurnal GL akan dibuat untuk kelompok pembayaran ini.","One bank transaction can settle multiple invoices.":"Satu transaksi bank dapat melunasi beberapa invoice.","Loading outstanding invoices...":"Memuat invoice yang belum lunas...","Automatically generated from Invoice Details":"Dibuat otomatis dari Rincian Invoice","Preview journal entries based on Invoice Details, Tax (+), and Tax (-)":"Pratinjau jurnal berdasarkan Rincian Invoice, Pajak (+), dan Pajak (-)","Waiting for Transaction":"Menunggu Transaksi","Add Invoice Detail to generate the accounting preview.":"Tambahkan Rincian Invoice untuk membuat pratinjau akuntansi.","Remove Invoice Detail":"Hapus Rincian Invoice","Remove this invoice detail?":"Hapus rincian invoice ini?","You are about to remove:":"Anda akan menghapus:","This action cannot be undone.":"Tindakan ini tidak dapat dibatalkan.","Confirm Delete Chart Of Account":"Konfirmasi Hapus Bagan Akun","View Audit Trail":"Lihat Riwayat Audit","Total Debit":"Total Debit","Total Credit":"Total Kredit","Debit Account":"Akun Debit","Credit Account":"Akun Kredit","Debit:":"Debit:","Credit:":"Kredit:","Account Holder":"Pemilik Rekening","Parent Account":"Akun Induk","Line Amount":"Jumlah Baris","Qty":"Kuantitas","Rate":"Tarif","Difference":"Selisih","Complete":"Selesai","Current":"Saat Ini","Fiscal Year":"Tahun Fiskal","Year":"Tahun","Branch":"Cabang","Click":"Klik","Page":"Halaman","of":"dari","Displaying Record":"Menampilkan Data","Last Closed":"Terakhir Ditutup","Last Reopened":"Terakhir Dibuka Kembali","Invoice Date From":"Tanggal Invoice Dari","Invoice Date To":"Tanggal Invoice Sampai","Amount / Status":"Jumlah / Status","Bank Account No":"Nomor Rekening Bank","Bank Account Number":"Nomor Rekening Bank","Tax Code":"Kode Pajak","Tax Type":"Jenis Pajak","Tax Description":"Deskripsi Pajak","Journal Detail":"Rincian Jurnal","Journal Details":"Rincian Jurnal","Journal Entry":"Entri Jurnal","Journal Entries":"Entri Jurnal","Transaction Date":"Tanggal Transaksi","Transaction No":"Nomor Transaksi","Transaction Type":"Jenis Transaksi","Transaction Detail":"Rincian Transaksi","Transaction Details":"Rincian Transaksi","Document":"Dokumen","Document Date":"Tanggal Dokumen","Document Type":"Jenis Dokumen","Reference Date":"Tanggal Referensi","Bank Details":"Rincian Bank","Bank Information":"Informasi Bank","Bank Account Name":"Nama Rekening Bank","Payment Details":"Rincian Pembayaran","Payment History":"Riwayat Pembayaran","Payment Reference":"Referensi Pembayaran","Payment Allocation":"Alokasi Pembayaran","Allocated Amount":"Jumlah Dialokasikan","Remaining Amount":"Sisa Jumlah","Remaining Balance":"Sisa Saldo","Outstanding Balance":"Saldo Belum Lunas","Total Outstanding":"Total Belum Lunas","Invoice Amount":"Jumlah Invoice","Invoice Status":"Status Invoice","Invoice Type":"Jenis Invoice","Invoice Description":"Deskripsi Invoice","Invoice Information":"Informasi Invoice","Invoice Summary":"Ringkasan Invoice","Invoice List":"Daftar Invoice","Invoice Number":"Nomor Invoice","Vendor Name":"Nama Pemasok","Customer Name":"Nama Pelanggan","Business Partner Name":"Nama Mitra Bisnis","Business Partner Type":"Jenis Mitra Bisnis","Business Partner Code":"Kode Mitra Bisnis","Business Partner Details":"Rincian Mitra Bisnis","Contact Person":"Narahubung","Phone Number":"Nomor Telepon","Phone":"Telepon","Address":"Alamat","City":"Kota","Province":"Provinsi","Country":"Negara","Postal Code":"Kode Pos","Website":"Situs Web","Tax ID":"ID Pajak","NPWP Number":"Nomor NPWP","Default Bank":"Bank Utama","Default Account":"Akun Utama","Account Details":"Rincian Akun","Account Group":"Kelompok Akun","Account Class":"Kelas Akun","Account Category":"Kategori Akun","Account Balance":"Saldo Akun","Opening Date":"Tanggal Pembukaan","Closing Date":"Tanggal Penutupan","Period Status":"Status Periode","Period Name":"Nama Periode","Fiscal Period":"Periode Fiskal","Accounting Year":"Tahun Akuntansi","Start Period":"Periode Awal","End Period":"Periode Akhir","Journal Status":"Status Jurnal","Journal Type":"Jenis Jurnal","Journal Description":"Deskripsi Jurnal","Journal Reference":"Referensi Jurnal","Journal Lines":"Baris Jurnal","Posting Period":"Periode Posting","Posting Status":"Status Posting","Posting Date":"Tanggal Posting","Posting Reference":"Referensi Posting","Posted By":"Diposting Oleh","Void Reason":"Alasan Pembatalan","Reason":"Alasan","Remarks":"Keterangan","Memo":"Memo","Attachments":"Lampiran","Attachment":"Lampiran","Choose File":"Pilih Berkas","Upload File":"Unggah Berkas","View File":"Lihat Berkas","Delete File":"Hapus Berkas","Total Records":"Total Data","Total Transactions":"Total Transaksi","Total Invoices":"Total Invoice","Total Payments":"Total Pembayaran","Total Revenue":"Total Pendapatan","Total Expense":"Total Beban","Total Expenses":"Total Beban","Total Profit":"Total Laba","Net Income":"Laba Bersih","Gross Margin":"Margin Kotor","Net Margin":"Margin Bersih","Profit Margin":"Margin Laba","Financial Position":"Posisi Keuangan","Financial Performance":"Kinerja Keuangan","Financial Summary":"Ringkasan Keuangan","Financial Overview":"Ikhtisar Keuangan","Financial Statements":"Laporan Keuangan","Income Statement":"Laporan Laba Rugi","Statement of Financial Position":"Laporan Posisi Keuangan","Cash Flow Statement":"Laporan Arus Kas","Cash Flow Forecast":"Proyeksi Arus Kas","Trial Balance Report":"Laporan Neraca Saldo","General Ledger Report":"Laporan Buku Besar","Balance Sheet Report":"Laporan Neraca","Profit Loss Report":"Laporan Laba Rugi","Report Period":"Periode Laporan","Report Date":"Tanggal Laporan","As of Date":"Per Tanggal","From Date":"Dari Tanggal","To Date":"Sampai Tanggal","Date Range":"Rentang Tanggal","Apply":"Terapkan","Clear":"Bersihkan","Reset":"Atur Ulang","Generate":"Buat","Generate Report":"Buat Laporan","Run Report":"Jalankan Laporan","Preview":"Pratinjau","Print Preview":"Pratinjau Cetak","Export to Excel":"Ekspor ke Excel","Export to PDF":"Ekspor ke PDF","Download PDF":"Unduh PDF","Download CSV":"Unduh CSV","Download Report":"Unduh Laporan","Print Report":"Cetak Laporan","Refresh Data":"Muat Ulang Data","Reload":"Muat Ulang","Loading data...":"Memuat data...","Please select":"Silakan pilih","Please select an option":"Silakan pilih opsi","Required field":"Kolom wajib diisi","This field is required":"Kolom ini wajib diisi","Invalid date":"Tanggal tidak valid","Invalid amount":"Jumlah tidak valid","Invalid email":"Email tidak valid","Saved successfully":"Berhasil disimpan","Deleted successfully":"Berhasil dihapus","Updated successfully":"Berhasil diperbarui","Created successfully":"Berhasil dibuat","Failed to load data":"Gagal memuat data","Failed to save":"Gagal menyimpan","Failed to delete":"Gagal menghapus","Are you sure you want to delete?":"Apakah Anda yakin ingin menghapus?","Are you sure you want to continue?":"Apakah Anda yakin ingin melanjutkan?","Confirm Action":"Konfirmasi Tindakan","Confirm Delete":"Konfirmasi Penghapusan","Confirm Save":"Konfirmasi Penyimpanan","Confirm Posting":"Konfirmasi Posting","Confirm Void":"Konfirmasi Pembatalan","Yes, Delete":"Ya, Hapus","Yes, Continue":"Ya, Lanjutkan","Yes, Save":"Ya, Simpan","Yes, Post":"Ya, Posting","Yes, Void":"Ya, Batalkan","January":"Januari","February":"Februari","March":"Maret","April":"April","May":"Mei","June":"Juni","July":"Juli","August":"Agustus","September":"September","October":"Oktober","November":"November","December":"Desember","Monday":"Senin","Tuesday":"Selasa","Wednesday":"Rabu","Thursday":"Kamis","Friday":"Jumat","Saturday":"Sabtu","Sunday":"Minggu","Jan":"Jan","Feb":"Feb","Mar":"Mar","Apr":"Apr","Jun":"Jun","Jul":"Jul","Aug":"Agu","Sep":"Sep","Oct":"Okt","Nov":"Nov","Dec":"Des","User Name":"Nama Pengguna","User Role":"Peran Pengguna","User Status":"Status Pengguna","User Details":"Rincian Pengguna","User Information":"Informasi Pengguna","User List":"Daftar Pengguna","User Access":"Akses Pengguna","Access Level":"Tingkat Akses","Access Rights":"Hak Akses","Permission":"Izin Akses","Permissions":"Hak Akses","Last Login":"Login Terakhir","Last Updated":"Terakhir Diperbarui","Last Modified":"Terakhir Diubah","Created Date":"Tanggal Dibuat","Updated Date":"Tanggal Diperbarui","Search User":"Cari Pengguna","Search Users":"Cari Pengguna","Search by Name":"Cari Berdasarkan Nama","Search Full Name or Email...":"Cari nama lengkap atau email...","Logged in as":"Masuk sebagai","You have full User Management access.":"Anda memiliki akses penuh ke Manajemen Pengguna.","Master Data / User Management":"Data Master / Manajemen Pengguna","Asset Details":"Rincian Aset","Asset Information":"Informasi Aset","Asset Category":"Kategori Aset","Asset Type":"Jenis Aset","Asset Status":"Status Aset","Asset Location":"Lokasi Aset","Acquisition Date":"Tanggal Perolehan","Acquisition Cost":"Biaya Perolehan","Depreciation Method":"Metode Penyusutan","Accumulated Depreciation":"Akumulasi Penyusutan","Depreciation Expense":"Beban Penyusutan","Residual Value":"Nilai Residu","Salvage Value":"Nilai Sisa","Disposal Date":"Tanggal Pelepasan","Disposal Value":"Nilai Pelepasan","Book Value":"Nilai Buku","Asset Register":"Daftar Aset","Asset List":"Daftar Aset","Audit Trail":"Riwayat Audit","Audit Log Details":"Rincian Log Audit","Activity Log":"Log Aktivitas","Activity Date":"Tanggal Aktivitas","Performed By":"Dilakukan Oleh","Old Value":"Nilai Lama","New Value":"Nilai Baru","Changes":"Perubahan","Before":"Sebelum","After":"Sesudah","Filter By":"Filter Berdasarkan","Sort By":"Urutkan Berdasarkan","Ascending":"Menaik","Descending":"Menurun","All":"Semua","None":"Tidak Ada","Other":"Lainnya","Others":"Lainnya","Default":"Bawaan","Enabled":"Diaktifkan","Disabled":"Dinonaktifkan","Pending":"Menunggu","Approved":"Disetujui","Rejected":"Ditolak","Completed":"Selesai","Cancelled":"Dibatalkan","Processing":"Diproses","Available":"Tersedia","Unavailable":"Tidak Tersedia","Yes":"Ya"};
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
  "Tax Base": "DPP",
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
// Halaman login: terjemahan teks promosi, formulir, dan manfaat platform.
// Hanya teks antarmuka; tidak mengubah autentikasi atau nilai formulir.
Object.assign(dictionary, {
  'Smart Accounting':'Akuntansi Cerdas',
  'for Modern Business':'untuk Bisnis Modern',
  'FINOVA helps businesses manage accounting, finance, reporting and financial operations through one integrated cloud platform.':'FINOVA membantu bisnis mengelola akuntansi, keuangan, pelaporan, dan operasional keuangan melalui satu platform cloud yang terintegrasi.',
  'Welcome Back':'Selamat Datang Kembali',
  'Login to continue using':'Masuk untuk melanjutkan ke',
  'Remember Me':'Ingat Saya',
  'Enter your password':'Masukkan kata sandi Anda',
  'Show password':'Tampilkan kata sandi',
  'Real-time':'Waktu Nyata',
  'Financial Data':'Data Keuangan',
  'Secure':'Aman',
  'Cloud Platform':'Platform Cloud',
  'Integrated':'Terintegrasi',
  'Business Process':'Proses Bisnis',
  'Support':'Dukungan',
  'Business Growth':'Pertumbuhan Bisnis',
  'Unable to sign in.':'Tidak dapat masuk.',
  'Signing In...':'Sedang Masuk...',
  'Signing in...':'Sedang masuk...'
});
// Company Profile bilingual labels (presentation only; no changes to stored values).
Object.assign(dictionary,{"Company Profile":"Profil Perusahaan","Save Company Profile":"Simpan Profil","Company identity, legal information, bank accounts and AR invoice signatory":"Identitas, legalitas, rekening bank dan penandatangan Invoice AR","Identity and Contact":"Identitas dan Kontak","Company Code":"Kode Perusahaan","Company Name":"Nama Perusahaan","Legal Name":"Nama Legal","Company Address":"Alamat Perusahaan","Legal and Additional Information":"Legalitas dan Informasi Tambahan","Business Sector":"Bidang Usaha","Tax ID (16 digits)":"NPWP (16 digit)","City":"Kota","Province":"Provinsi","Postal Code":"Kode Pos","Country":"Negara","Taxable Entrepreneur (PKP)":"Pengusaha Kena Pajak (PKP)","Legal Address":"Alamat Legal","Operational Address":"Alamat Operasional","Document Branding":"Branding Dokumen","Document Header":"Kop / Header Dokumen","Document Footer":"Footer Dokumen","The logo uses the existing FINOVA logo_url configuration. Logo upload is disabled until Supabase Storage policies are verified.":"Logo menggunakan konfigurasi logo_url FINOVA yang sudah ada. Upload logo tidak diaktifkan sampai kebijakan Supabase Storage diverifikasi.","AR Invoice Signatory (Manual)":"Penandatangan Invoice AR (Manual)","Active User":"Pengguna Aktif","Position on Invoice":"Jabatan pada Invoice","The printed AR invoice provides blank space for a manual signature. No signature image is used.":"Cetakan Invoice AR menyediakan ruang kosong untuk tanda tangan manual. Tidak menggunakan gambar tanda tangan.","Company Bank Accounts":"Rekening Bank Perusahaan","Add Bank Account":"Tambah Rekening","Only one active account may be set as the default bank account.":"Hanya satu rekening aktif dapat ditetapkan sebagai rekening utama.","Accounting Settings (Read Only)":"Pengaturan Akuntansi (Baca Saja)","Loading settings...":"Memuat pengaturan...","— Select signatory —":"— Pilih penandatangan —","Account Number":"Nomor Rekening","Account Holder Name":"Atas Nama","Currency":"Mata Uang","Actions":"Aksi","Primary":"Utama","Inactive":"Nonaktif","Set as Primary":"Jadikan Utama","Delete":"Hapus","Company data not found":"Data perusahaan tidak ditemukan","Read-only access: only authorized Managers or Super Admins may edit the profile.":"Akses baca saja: hanya Manager atau Super Admin yang berwenang dapat mengubah profil.","Tax ID must contain 16 digits.":"NPWP harus 16 digit angka.","Company name is required.":"Nama perusahaan wajib diisi.","Company profile saved successfully.":"Profil perusahaan berhasil disimpan.","Save failed: ":"Gagal menyimpan: ","No active bank master data found.":"Master bank aktif tidak ditemukan.","Enter a bank ID from the list below:":"Masukkan ID bank dari daftar berikut:","Invalid bank ID.":"ID bank tidak valid.","Bank account number:":"Nomor rekening:","Account holder name:":"Atas nama rekening:","Account number and holder name are required.":"Nomor dan nama rekening wajib diisi.","Bank account added. Select Set as Primary if needed.":"Rekening ditambahkan. Pilih Jadikan Utama jika diperlukan.","Primary bank account updated.":"Rekening utama diperbarui.","Failed to change primary bank account: ":"Perubahan rekening utama gagal: ","Delete this company bank account?":"Hapus rekening bank perusahaan ini?","Bank account deleted successfully.":"Rekening berhasil dihapus.","Base currency: ":"Mata uang: ","Fiscal year starts in month: ":"Tahun fiskal mulai bulan: ","Time zone: ":"Zona waktu: "});
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
  "DPP": "Tax Base",
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
// DPP label in Invoice AP/AR tax (+/-) tables, without changing tax calculations.
Object.assign(dictionary, {
  'Tax Base':'DPP',
  'Dasar Pengenaan Pajak':'DPP',
  'Dasar Pengenaan P':'DPP',
  'DPP':'DPP'
});
Object.assign(reverse, {'DPP':'Tax Base'});

// GL Journal UI-only translations (preserve data and status values).
Object.assign(dictionary,{"General Journal": "Jurnal Umum", "Accounting / General Journal": "Akuntansi / Jurnal Umum", "Accounting Date From": "Tanggal Akuntansi Dari", "Accounting Date To": "Tanggal Akuntansi Sampai", "Journal Status": "Status Jurnal", "Show Draft Only": "Hanya Draf", "Show Posted Only": "Hanya Sudah Diposting", "Show Void Only": "Hanya Dibatalkan", "Search Journal No or Description...": "Cari nomor jurnal atau deskripsi...", "Journal Information": "Informasi Jurnal", "Journal Information Header": "Header Informasi Jurnal", "General Journal Header": "Informasi Utama Jurnal", "Journal transaction detail": "Rincian transaksi jurnal", "Journal transaction summary": "Ringkasan transaksi jurnal", "Accounting Date": "Tanggal Akuntansi", "Posting Period": "Periode Posting", "Record ID": "ID Data", "Add Journal": "Tambah Jurnal", "Add Line": "Tambah Baris", "Add Journal Detail": "Tambah Rincian Jurnal", "Add debit and credit transaction line": "Tambah baris transaksi debit dan kredit", "Select Chart of Account": "Pilih Akun", "-- Optional --": "-- Opsional --", "Save Line": "Simpan Baris", "Save & Post": "Simpan dan Posting", "No journal detail available.": "Belum ada rincian jurnal.", "Click Add Line to add journal detail.": "Klik Tambah Baris untuk menambahkan rincian jurnal.", "Journal will be saved as": "Jurnal akan disimpan sebagai", "until it is posted.": "hingga diposting.", "Items": "Baris", "Inv No": "No. Invoice", "PO No": "No. PO", "Desc": "Deskripsi", "Debits": "Debit", "Credits": "Kredit", "Created": "Dibuat", "Source": "Sumber", "AR Invoice": "Invoice AR", "AP Invoice": "Invoice AP", "Input journal description...": "Masukkan deskripsi jurnal...", "Enter journal description...": "Masukkan deskripsi jurnal...", "Total Line": "Total Baris", "Total Amount": "Jumlah Total", "No. Journal": "No. Jurnal", "Journal Summary": "Ringkasan Jurnal", "Draft": "Draf", "Posted": "Sudah Diposting", "Void": "Dibatalkan", "Save Draft": "Simpan Draf", "Journal Detail": "Rincian Jurnal"});
Object.assign(reverse,{"Jurnal Umum": "General Journal", "Akuntansi / Jurnal Umum": "Accounting / General Journal", "Tanggal Akuntansi Dari": "Accounting Date From", "Tanggal Akuntansi Sampai": "Accounting Date To", "Status Jurnal": "Journal Status", "Hanya Draf": "Show Draft Only", "Hanya Sudah Diposting": "Show Posted Only", "Hanya Dibatalkan": "Show Void Only", "Cari nomor jurnal atau deskripsi...": "Search Journal No or Description...", "Informasi Jurnal": "Journal Information", "Header Informasi Jurnal": "Journal Information Header", "Informasi Utama Jurnal": "General Journal Header", "Rincian transaksi jurnal": "Journal transaction detail", "Ringkasan transaksi jurnal": "Journal transaction summary", "Tanggal Akuntansi": "Accounting Date", "Periode Posting": "Posting Period", "ID Data": "Record ID", "Tambah Jurnal": "Add Journal", "Tambah Baris": "Add Line", "Tambah Rincian Jurnal": "Add Journal Detail", "Tambah baris transaksi debit dan kredit": "Add debit and credit transaction line", "Pilih Akun": "Select Chart of Account", "-- Opsional --": "-- Optional --", "Simpan Baris": "Save Line", "Simpan dan Posting": "Save & Post", "Belum ada rincian jurnal.": "No journal detail available.", "Klik Tambah Baris untuk menambahkan rincian jurnal.": "Click Add Line to add journal detail.", "Jurnal akan disimpan sebagai": "Journal will be saved as", "hingga diposting.": "until it is posted.", "Baris": "Items", "No. Invoice": "Inv No", "No. PO": "PO No", "Deskripsi": "Desc", "Debit": "Debits", "Kredit": "Credits", "Dibuat": "Created", "Sumber": "Source", "Invoice AR": "AR Invoice", "Invoice AP": "AP Invoice", "Masukkan deskripsi jurnal...": "Enter journal description...", "Total Baris": "Total Line", "Jumlah Total": "Total Amount", "No. Jurnal": "No. Journal", "Ringkasan Jurnal": "Journal Summary", "Draf": "Draft", "Sudah Diposting": "Posted", "Dibatalkan": "Void", "Simpan Draf": "Save Draft", "Rincian Jurnal": "Journal Detail"});

// Asset Management: UI-only bilingual labels. Preserve asset codes, enum values and accounting behavior.
const fixedAssetDictionary={
  "Fixed Daftar Aset": "Daftar Aset Tetap",
  "Fixed Asset Register": "Daftar Aset Tetap",
  "Accounting / Fixed Daftar Aset & Penyusutan": "Akuntansi / Daftar Aset Tetap & Penyusutan",
  "Accounting / Fixed Asset & Depreciation": "Akuntansi / Aset Tetap & Penyusutan",
  "Accounting / Fixed Asset Register & Depreciation": "Akuntansi / Daftar Aset Tetap & Penyusutan",
  "New Fixed Asset": "Tambah Aset Tetap",
  "Save Fixed Asset": "Simpan Aset Tetap",
  "Edit Fixed Asset": "Ubah Aset Tetap",
  "Delete Fixed Asset": "Hapus Aset Tetap",
  "Dispose Fixed Asset": "Pelepasan Aset Tetap",
  "Fixed Kategori Aset": "Kategori Aset Tetap",
  "Fixed Asset Category": "Kategori Aset Tetap",
  "Save Category": "Simpan Kategori",
  "Category Name": "Nama Kategori",
  "Useful Life (Months)": "Masa Manfaat (Bulan)",
  "Useful Life (Months) *": "Masa Manfaat (Bulan) *",
  "Useful Life (Months)*": "Masa Manfaat (Bulan)*",
  "Asset Account": "Akun Aset",
  "Accum. Dep.": "Akum. Penyusutan",
  "Accumulated Dep.": "Akumulasi Penyusutan",
  "Accumulated": "Akumulasi",
  "Accum. Depreciation": "Akumulasi Penyusutan",
  "Gain on Disposal": "Laba Pelepasan Aset",
  "Loss on Disposal": "Rugi Pelepasan Aset",
  "Asset No": "No. Aset",
  "Asset No.": "No. Aset",
  "Asset Name": "Nama Aset",
  "Asset No, Asset Name, Category or Location...": "No. Aset, Nama Aset, Kategori, atau Lokasi...",
  "Asset No, Asset Name, Category or Location": "No. Aset, Nama Aset, Kategori, atau Lokasi",
  "Acquisition": "Perolehan",
  "Acquisition Date": "Tanggal Perolehan",
  "Cost": "Biaya Perolehan",
  "Commercial Accum.": "Akumulasi Komersial",
  "Fiscal Accum.": "Akumulasi Fiskal",
  "Fiscal NBV": "Nilai Buku Fiskal",
  "Fiscal Group": "Kelompok Fiskal",
  "Fiscal Method": "Metode Fiskal",
  "Method": "Metode",
  "Life": "Masa Manfaat",
  "Location": "Lokasi",
  "Fiscal Register": "Daftar Fiskal",
  "Fiscal Fixed Daftar Aset": "Daftar Fiskal Aset Tetap",
  "Fiscal Fixed Asset Register": "Daftar Fiskal Aset Tetap",
  "Commercial vs Fiscal Penyusutan - Indonesia": "Penyusutan Komersial vs Fiskal - Indonesia",
  "Commercial vs Fiscal Depreciation - Indonesia": "Penyusutan Komersial vs Fiskal - Indonesia",
  "Fiscal values are maintained as a tax subledger and do not post depreciation journals to the Buku Besar.": "Nilai fiskal dicatat dalam buku pembantu pajak dan tidak membentuk jurnal penyusutan pada Buku Besar.",
  "Fiscal values are maintained as a tax subledger and do not post depreciation journals to the General Ledger.": "Nilai fiskal dicatat dalam buku pembantu pajak dan tidak membentuk jurnal penyusutan pada Buku Besar.",
  "Fiscal Penyusutan (Indonesia)": "Penyusutan Fiskal (Indonesia)",
  "Fiscal Depreciation (Indonesia)": "Penyusutan Fiskal (Indonesia)",
  "Fiscal Penyusutan": "Penyusutan Fiskal",
  "Fiscal Depreciation": "Penyusutan Fiskal",
  "Tax subledger only. Fiscal depreciation does not create or replace the commercial GL journal.": "Hanya untuk buku pembantu pajak. Penyusutan fiskal tidak membuat atau menggantikan jurnal GL komersial.",
  "Important: commercial depreciation remains the source of the GL journal. Fiscal depreciation is calculated separately for tax reconciliation.": "Penting: penyusutan komersial tetap menjadi dasar jurnal GL. Penyusutan fiskal dihitung terpisah untuk rekonsiliasi pajak.",
  "Important:": "Penting:",
  "Fiscal Classification": "Klasifikasi Fiskal",
  "Non-Building": "Bukan Bangunan",
  "Building": "Bangunan",
  "Fiscal Start": "Mulai Penyusutan Fiskal",
  "Fiscal Life (Months)": "Masa Manfaat Fiskal (Bulan)",
  "Fiscal Rate / Year (%)": "Tarif Fiskal per Tahun (%)",
  "Tax Reference": "Referensi Pajak",
  "Group 1 - 4 Years": "Kelompok 1 - 4 Tahun",
  "Group 2 - 8 Years": "Kelompok 2 - 8 Tahun",
  "Group 3 - 16 Years": "Kelompok 3 - 16 Tahun",
  "Group 4 - 20 Years": "Kelompok 4 - 20 Tahun",
  "Straight Line": "Garis Lurus",
  "Declining Balance": "Saldo Menurun",
  "Depreciation Start": "Mulai Penyusutan",
  "Proceeds / Selling Price": "Hasil Penjualan / Harga Jual",
  "Cash / Bank / Disposal Proceeds Account": "Akun Kas / Bank / Hasil Pelepasan",
  "Current Book Value:": "Nilai Buku Saat Ini:",
  "Current Book Value": "Nilai Buku Saat Ini",
  "Monthly depreciation:": "Penyusutan bulanan:",
  "Monthly depreciation": "Penyusutan Bulanan",
  "Book value:": "Nilai buku:",
  "Create Draft Penyusutan": "Buat Draf Penyusutan",
  "Create Draft Depreciation": "Buat Draf Penyusutan",
  "Create New Draft": "Buat Draf Baru",
  "Create New Draft Depreciation": "Buat Draf Penyusutan Baru",
  "Create New Draft Penyusutan": "Buat Draf Penyusutan Baru",
  "Depreciation Date": "Tanggal Penyusutan",
  "Penyusutan Date": "Tanggal Penyusutan",
  "Dispose & Create Journal": "Lepas Aset & Buat Jurnal",
  "Delete this Fixed Asset?": "Hapus aset tetap ini?",
  "Are you sure you want to delete this Fixed Asset?": "Apakah Anda yakin ingin menghapus aset tetap ini?",
  "Are you sure you want to delete this fixed asset?": "Apakah Anda yakin ingin menghapus aset tetap ini?",
  "Are you sure you want to delete this Fixed Aset?": "Apakah Anda yakin ingin menghapus aset tetap ini?",
  "Are you sure you want to delete this Aset Tetap?": "Apakah Anda yakin ingin menghapus aset tetap ini?",
  "Type COA code or account name...": "Ketik kode COA atau nama akun...",
  "Select Category": "Pilih Kategori",
  "Select Account": "Pilih Akun",
  "Search Asset": "Cari Aset",
  "Download Excel": "Unduh Excel",
  "Fiscal": "Fiskal",
  "Commercial": "Komersial",
  "Selisih": "Selisih",
  "Disposal": "Pelepasan",
  "Depreciation": "Penyusutan",
  "Fiscal Group 2": "Kelompok Fiskal 2",
  "Fiscal Group 3": "Kelompok Fiskal 3",
  "Asset No *": "No. Aset *",
  "Asset Name *": "Nama Aset *",
  "Category *": "Kategori *",
  "Code *": "Kode *",
  "Asset No*": "No. Aset*",
  "Asset Name*": "Nama Aset*",
  "Category*": "Kategori*",
  "Code*": "Kode*",
  "Asset No:": "No. Aset:",
  "Asset Name:": "Nama Aset:",
  "Category:": "Kategori:",
  "months": "bulan",
  "month": "bulan",
  "Important: commercial depreciation remains the source of the GL journal. Fiscal depreciation is calculated separately for tax reconciliation.": "Penting: penyusutan komersial tetap menjadi dasar jurnal GL. Penyusutan fiskal dihitung secara terpisah untuk rekonsiliasi pajak.",
  "commercial depreciation remains the source of the GL journal. Fiscal depreciation is calculated separately for tax reconciliation.": "penyusutan komersial tetap menjadi dasar jurnal GL. Penyusutan fiskal dihitung secara terpisah untuk rekonsiliasi pajak.",
  "Commercial depreciation remains the source of the GL journal. Fiscal depreciation is calculated separately for tax reconciliation.": "Penyusutan komersial tetap menjadi dasar jurnal GL. Penyusutan fiskal dihitung secara terpisah untuk rekonsiliasi pajak.",
  "Commercial depreciation remains the source of the GL Journal. Fiscal depreciation is calculated separately for tax reconciliation.": "Penyusutan komersial tetap menjadi dasar jurnal GL. Penyusutan fiskal dihitung secara terpisah untuk rekonsiliasi pajak.",
  "96 months": "96 bulan"
};
Object.assign(dictionary,fixedAssetDictionary);
Object.assign(reverse,Object.fromEntries(Object.entries(fixedAssetDictionary).map(([en,id])=>[id,en])));
Object.assign(reverse,{"Penyusutan":"Depreciation","Kategori Aset Tetap":"Fixed Asset Category","Daftar Aset Tetap":"Fixed Asset Register","No. Aset":"Asset No","Masa Manfaat (Bulan)":"Useful Life (Months)"});
// Preserve canonical English labels for the fixed-asset forms when switching back to EN.
Object.assign(reverse, {
  "No. Aset *":"Asset No *",
  "Nama Aset *":"Asset Name *",
  "Kategori *":"Category *",
  "Kode *":"Code *",
  "No. Aset*":"Asset No*",
  "Nama Aset*":"Asset Name*",
  "Kategori*":"Category*",
  "Kode*":"Code*",
  "96 bulan":"96 months",
  "Penting: penyusutan komersial tetap menjadi dasar jurnal GL. Penyusutan fiskal dihitung secara terpisah untuk rekonsiliasi pajak.":"Important: commercial depreciation remains the source of the GL journal. Fiscal depreciation is calculated separately for tax reconciliation."
});

// Report modules: UI text only. Never alter source account codes, report figures or stored select values.
const reportModuleDictionary={
  "Accounting / Buku Besar": "Akuntansi / Buku Besar",
  "Accounting / Neraca": "Akuntansi / Neraca",
  "Accounting / Laba Rugi": "Akuntansi / Laba Rugi",
  "Accounting / Neraca Saldo Year": "Akuntansi / Neraca Saldo Tahunan",
  "Finance / Weekly Proyeksi Arus Kas": "Keuangan / Proyeksi Arus Kas Mingguan",
  "Select COA": "Pilih COA",
  "Type Account Code or Account Name...": "Ketik kode akun atau nama akun...",
  "Search GL Journal Description...": "Cari deskripsi jurnal GL...",
  "Search Account Code or Account Name...": "Cari kode akun atau nama akun...",
  "Show All Accounts": "Tampilkan Semua Akun",
  "Show All Neraca Accounts": "Tampilkan Semua Akun Neraca",
  "Show All P&L Accounts": "Tampilkan Semua Akun Laba Rugi",
  "Beginning Year": "Saldo Awal Tahun",
  "ASSETS": "ASET",
  "REVENUE": "PENDAPATAN",
  "LIABILITIES": "LIABILITAS",
  "EXPENSES": "BEBAN",
  "EQUITY": "EKUITAS",
  "Jan-26": "Jan-26",
  "Aug-26": "Agu-26",
  "Oct-26": "Okt-26",
  "Dec-26": "Des-26",
  "Neraca Saldo Year": "Neraca Saldo Tahunan",
  "Trial Balance Year": "Neraca Saldo Tahunan",
  "Financial Statement": "Laporan Keuangan",
  "Generate complete financial reports for the selected reporting period.": "Buat laporan keuangan lengkap untuk periode pelaporan yang dipilih.",
  "Report Configuration": "Pengaturan Laporan",
  "Select the reporting period and comparative period for the financial statement.": "Pilih periode pelaporan dan periode pembanding untuk laporan keuangan.",
  "Reporting Period": "Periode Pelaporan",
  "Main financial statement period.": "Periode utama laporan keuangan.",
  "Comparative Period": "Periode Pembanding",
  "Period used for financial comparison.": "Periode yang digunakan untuk perbandingan keuangan.",
  "Statement Selection": "Pilihan Laporan Keuangan",
  "Select the financial reports to include in this financial statement.": "Pilih laporan yang akan disertakan dalam laporan keuangan ini.",
  "Statement of Changes in Equity": "Laporan Perubahan Ekuitas",
  "Assets, liabilities and equity as of the reporting period.": "Aset, liabilitas, dan ekuitas pada periode pelaporan.",
  "Revenue, expenses and profit for the reporting period.": "Pendapatan, beban, dan laba untuk periode pelaporan.",
  "Reconciliation of opening and closing equity.": "Rekonsiliasi ekuitas awal dan akhir.",
  "Cash and cash equivalents reconciliation.": "Rekonsiliasi kas dan setara kas.",
  "Notes to Laporan Keuangan": "Catatan atas Laporan Keuangan",
  "Notes to Financial Statements": "Catatan atas Laporan Keuangan",
  "Basis of preparation, policies and disclosures.": "Dasar penyusunan, kebijakan akuntansi, dan pengungkapan.",
  "Financial statements will be generated using posted accounting transactions only.": "Laporan keuangan hanya dibuat berdasarkan transaksi akuntansi yang sudah diposting.",
  "Weekly Proyeksi Arus Kas": "Proyeksi Arus Kas Mingguan",
  "Manual Forecast": "Proyeksi Manual",
  "New Manual Cash Forecast": "Tambah Proyeksi Kas Manual",
  "Start Week": "Minggu Mulai",
  "Number of Weeks": "Jumlah Minggu",
  "13 Weeks": "13 Minggu",
  "Generate Forecast": "Buat Proyeksi",
  "Auto: Aging AR/AP • Manual: Planning • Opening: Posted GL": "Otomatis: Umur AR/AP • Manual: Perencanaan • Saldo Awal: GL Terposting",
  "Treasury Forecast Control": "Pengaturan Proyeksi Kas",
  "Scenario, realization assumptions, minimum cash buffer, and available credit facility.": "Skenario, asumsi realisasi, batas minimum kas, dan fasilitas kredit yang tersedia.",
  "13-Week Treasury Ready": "Proyeksi Kas 13 Minggu Siap",
  "Scenario": "Skenario",
  "Base": "Dasar",
  "Optimistic": "Optimistis",
  "Pessimistic": "Pesimistis",
  "AR Realization (%)": "Realisasi AR (%)",
  "AP Payment (%)": "Pembayaran AP (%)",
  "Minimum Cash Buffer": "Batas Minimum Kas",
  "Available Credit Facility": "Fasilitas Kredit Tersedia",
  "Base + 100% AR/AP + zero buffer/facility keeps the original FINOVA forecast calculation unchanged.": "Skenario dasar + 100% AR/AP + tanpa batas minimum kas/fasilitas mempertahankan perhitungan proyeksi FINOVA semula.",
  "MINIMUM PROJECTED CASH": "KAS PROYEKSI MINIMUM",
  "LIQUIDITY HEADROOM": "RUANG LIKUIDITAS",
  "LOWEST HEADROOM": "RUANG LIKUIDITAS TERENDAH",
  "LIQUIDITY STATUS": "STATUS LIKUIDITAS",
  "SAFE": "AMAN",
  "No shortfall projected": "Tidak diproyeksikan terjadi kekurangan kas",
  "Ending cash + facility - minimum buffer": "Kas akhir + fasilitas - batas minimum kas",
  "OPENING CASH": "SALDO KAS AWAL",
  "EXPECTED CASH IN": "PERKIRAAN KAS MASUK",
  "EXPECTED CASH OUT": "PERKIRAAN KAS KELUAR",
  "ENDING CASH": "SALDO KAS AKHIR",
  "Posted GL Cash & Bank": "Kas dan Bank dari GL Terposting",
  "Aging AR + Manual Cash In": "Umur AR + Kas Masuk Manual",
  "Aging AP + Manual Cash Out": "Umur AP + Kas Keluar Manual",
  "After forecast period": "Setelah periode proyeksi",
  "Weekly Cash Position": "Posisi Kas Mingguan",
  "Generate forecast to view weekly cash position.": "Buat proyeksi untuk melihat posisi kas mingguan.",
  "AR = Auto Cash In   AP = Auto Cash Out   Manual = Planning": "AR = Kas Masuk Otomatis   AP = Kas Keluar Otomatis   Manual = Perencanaan",
  "AR = Auto Cash In": "AR = Kas Masuk Otomatis",
  "AP = Auto Cash Out": "AP = Kas Keluar Otomatis",
  "Manual = Planning": "Manual = Perencanaan",
  "Cash Position Trend": "Tren Posisi Kas",
  "Projected ending cash by week.": "Proyeksi saldo kas akhir per minggu.",
  "Liquidity Watch": "Pemantauan Likuiditas",
  "Weeks with projected negative ending cash.": "Minggu dengan proyeksi saldo kas akhir negatif.",
  "Forecast Detail": "Rincian Proyeksi",
  "Click a weekly forecast amount to inspect detail.": "Klik jumlah proyeksi mingguan untuk melihat rinciannya.",
  "Reference / Description": "Referensi / Deskripsi",
  "Forecast / Due Date": "Tanggal Proyeksi / Jatuh Tempo",
  "Select a week to view detail.": "Pilih minggu untuk melihat rincian.",
  "Planned Cash In and Cash Out entered manually. Records remain visible even when outside the selected weekly forecast period.": "Kas masuk dan kas keluar yang direncanakan dan diinput secara manual. Data tetap terlihat meskipun di luar periode proyeksi mingguan yang dipilih.",
  "Cash In:": "Kas Masuk:",
  "Cash Out:": "Kas Keluar:",
  "Forecast Date": "Tanggal Proyeksi",
  "No manual forecast.": "Belum ada proyeksi manual.",
  "No manual forecast": "Belum ada proyeksi manual",
  "Example: Payroll, Tax, Rent": "Contoh: Gaji, Pajak, Sewa",
  "Forecast description": "Deskripsi proyeksi",
  "Optional notes": "Catatan opsional",
  "Cash In": "Kas Masuk",
  "Cash Out": "Kas Keluar",
  "Manual Cash Forecast": "Proyeksi Kas Manual",
  "Forecast": "Proyeksi",
  "Reference / Deskripsi": "Referensi / Deskripsi",
  "Mitra Bisnis / Category": "Mitra Bisnis / Kategori",
  "4 Weeks": "4 Minggu",
  "8 Weeks": "8 Minggu",
  "26 Weeks": "26 Minggu",
  "52 Weeks": "52 Minggu",
  "Financial Statement / Report Configuration": "Laporan Keuangan / Pengaturan Laporan",
  "Accounting": "Akuntansi",
  "Finance": "Keuangan",
  "Select a week to view details.": "Pilih minggu untuk melihat rincian.",
  "Generate forecast to view weekly cash position": "Buat proyeksi untuk melihat posisi kas mingguan"
};
Object.assign(dictionary,reportModuleDictionary);
// Variasi kapitalisasi label kartu proyeksi; hanya teks tampilan, bukan nilai transaksi.
const cashCardLabels={
 'Minimum Projected Cash':'KAS PROYEKSI MINIMUM',
 'Liquidity Headroom':'RUANG LIKUIDITAS',
 'Lowest Headroom':'RUANG LIKUIDITAS TERENDAH',
 'Liquidity Status':'STATUS LIKUIDITAS',
 'Opening Cash':'SALDO KAS AWAL',
 'Expected Cash In':'PERKIRAAN KAS MASUK',
 'Expected Cash Out':'PERKIRAAN KAS KELUAR',
 'Ending Cash':'SALDO KAS AKHIR'
};
Object.assign(dictionary,cashCardLabels);

Object.assign(reverse,Object.fromEntries(Object.entries(reportModuleDictionary).map(([en,id])=>[id,en])));
// Canonical English labels for bilingual switching where translations overlap.
Object.assign(reverse,{"Laporan Keuangan":"Financial Statement","Proyeksi Manual":"Manual Forecast","Kas Masuk":"Cash In","Kas Keluar":"Cash Out","Neraca Saldo Tahunan":"Trial Balance Year","Catatan atas Laporan Keuangan":"Notes to Financial Statements"});
// Sidebar FINOVA: terjemahan label navigasi saja, tanpa mengubah route atau izin akses.
Object.assign(dictionary, {
  'Dashboard':'Dasbor',
  'Master Data':'Data Induk',
  'Data Master':'Data Induk',
  'Finance':'Keuangan',
  'Accounting':'Akuntansi',
  'Report':'Laporan',
  'Reports':'Laporan',
  'Financial Reports':'Laporan Keuangan',
  'User Management':'Manajemen Pengguna',
  'Business Partner':'Mitra Bisnis',
  'Chart of Accounts':'Bagan Akun',
  'Chart Of Accounts':'Bagan Akun',
  'Tax Master':'Master Pajak',
  'Accounting Period':'Periode Akuntansi',
  'Account Payable':'Invoice AP',
  'Account Receivable':'Invoice AR',
  'Aging Payable':'Umur Utang AP',
  'Aging Receivable':'Umur Piutang AR',
  'GL Journal':'Jurnal GL',
  'Fixed Asset':'Aset Tetap',
  'General Ledger':'Buku Besar',
  'Trial Balance':'Neraca Saldo'
});
Object.assign(reverse, {
  'Dasbor':'Dashboard',
  'Data Induk':'Master Data',
  'Keuangan':'Finance',
  'Akuntansi':'Accounting',
  'Laporan':'Report',
  'Laporan Keuangan':'Financial Reports',
  'Manajemen Pengguna':'User Management',
  'Mitra Bisnis':'Business Partner',
  'Bagan Akun':'Chart of Accounts',
  'Master Pajak':'Tax Master',
  'Periode Akuntansi':'Accounting Period',
  'Invoice AP':'Account Payable',
  'Invoice AR':'Account Receivable',
  'Umur Utang AP':'Aging Payable',
  'Umur Piutang AR':'Aging Receivable',
  'Jurnal GL':'GL Journal',
  'Aset Tetap':'Fixed Asset',
  'Buku Besar':'General Ledger',
  'Neraca Saldo':'Trial Balance'
});
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

// FINOVA: translate success feedback across modules without touching transaction handlers.
// Preserve source messages and restore them on language changes.
const finovaSuccessMessages = {"Fixed Asset successfully disposed and Draft GL Journal created.": "Aset tetap berhasil dilepas dan draf jurnal GL dibuat.", "Logo uploaded successfully and will appear on AR invoices.": "Logo berhasil diunggah dan akan tampil pada Invoice AR.", "Logo uploaded successfully. It will appear on AR invoices.": "Logo berhasil diunggah dan akan tampil pada Invoice AR.", "Draft GL Journal successfully created for depreciation.": "Draf jurnal GL untuk penyusutan berhasil dibuat.", "Account Receivable GL Journal successfully generated.": "Jurnal GL Invoice AR berhasil dibuat.", "Business Partner successfully updated. New code:": "Mitra bisnis berhasil diperbarui. Kode baru:", "Depreciation history successfully initialized.": "Riwayat penyusutan berhasil diinisialisasi.", "Depreciation history successfully deactivated.": "Riwayat penyusutan berhasil dinonaktifkan.", "AP Payment Batch Draft successfully cancelled.": "AP Payment Batch Draft berhasil dibatalkan", "Depreciation history initialized successfully.": "Riwayat penyusutan berhasil diinisialisasi.", "Account Receivable payment successfully saved.": "Pembayaran Invoice AR berhasil disimpan.", "Depreciation history deactivated successfully.": "Riwayat penyusutan berhasil dinonaktifkan.", "Depreciation history downloaded successfully.": "Riwayat penyusutan berhasil diunduh.", "Depreciation history successfully downloaded.": "Riwayat penyusutan berhasil diunduh.", "Account Receivable deactivated successfully.": "Invoice AR berhasil dinonaktifkan.", "Depreciation history completed successfully.": "Riwayat penyusutan berhasil diselesaikan.", "Depreciation history generated successfully.": "Riwayat penyusutan berhasil dibuat.", "Account Receivable successfully initialized.": "Invoice AR berhasil diinisialisasi.", "Depreciation history successfully completed.": "Riwayat penyusutan berhasil diselesaikan.", "Draft depreciation successfully initialized.": "Draf penyusutan berhasil diinisialisasi.", "Depreciation history successfully activated.": "Riwayat penyusutan berhasil diaktifkan.", "Draft depreciation initialized successfully.": "Draf penyusutan berhasil diinisialisasi.", "Draft depreciation successfully deactivated.": "Draf penyusutan berhasil dinonaktifkan.", "Account Receivable initialized successfully.": "Invoice AR berhasil diinisialisasi.", "Depreciation history successfully generated.": "Riwayat penyusutan berhasil dibuat.", "Account Receivable successfully deactivated.": "Invoice AR berhasil dinonaktifkan.", "Draft depreciation deactivated successfully.": "Draf penyusutan berhasil dinonaktifkan.", "Depreciation history activated successfully.": "Riwayat penyusutan berhasil diaktifkan.", "Depreciation history successfully reopened.": "Riwayat penyusutan berhasil dibuka kembali.", "Fixed Asset Excel initialized successfully.": "Excel aset tetap berhasil diinisialisasi.", "Account Receivable downloaded successfully.": "Invoice AR berhasil diunduh.", "Fixed Asset Excel deactivated successfully.": "Excel aset tetap berhasil dinonaktifkan.", "Draft depreciation successfully downloaded.": "Draf penyusutan berhasil diunduh.", "Depreciation history disposed successfully.": "Riwayat penyusutan berhasil dilepas.", "Depreciation history reposted successfully.": "Riwayat penyusutan berhasil diposting ulang.", "Accounting Period initialized successfully.": "Periode Akuntansi berhasil diinisialisasi.", "Draft depreciation downloaded successfully.": "Draf penyusutan berhasil diunduh.", "Accounting Period successfully deactivated.": "Periode Akuntansi berhasil dinonaktifkan.", "Depreciation history successfully disposed.": "Riwayat penyusutan berhasil dilepas.", "Account Receivable successfully downloaded.": "Invoice AR berhasil diunduh.", "Fixed Asset Excel successfully initialized.": "Excel aset tetap berhasil diinisialisasi.", "Accounting Period successfully initialized.": "Periode Akuntansi berhasil diinisialisasi.", "Depreciation history successfully reposted.": "Riwayat penyusutan berhasil diposting ulang.", "Fixed Asset Excel successfully deactivated.": "Excel aset tetap berhasil dinonaktifkan.", "Accounting Period deactivated successfully.": "Periode Akuntansi berhasil dinonaktifkan.", "Account Payable payment saved successfully.": "Pembayaran Invoice AP berhasil disimpan.", "Depreciation history reopened successfully.": "Riwayat penyusutan berhasil dibuka kembali.", "Chart Of Account deactivated successfully.": "Akun berhasil dinonaktifkan.", "Account Receivable completed successfully.": "Invoice AR berhasil diselesaikan.", "Draft depreciation successfully completed.": "Draf penyusutan berhasil diselesaikan.", "Business Partner initialized successfully.": "Mitra bisnis berhasil diinisialisasi.", "Depreciation history deleted successfully.": "Riwayat penyusutan berhasil dihapus.", "Account Receivable successfully generated.": "Invoice AR berhasil dibuat.", "Depreciation history created successfully.": "Riwayat penyusutan berhasil dibuat.", "Chart Of Account successfully deactivated.": "Akun berhasil dinonaktifkan.", "Accounting Period successfully downloaded.": "Periode Akuntansi berhasil diunduh.", "Draft depreciation activated successfully.": "Draf penyusutan berhasil diaktifkan.", "Draft depreciation successfully generated.": "Draf penyusutan berhasil dibuat.", "Account Receivable generated successfully.": "Invoice AR berhasil dibuat.", "Business Partner successfully initialized.": "Mitra bisnis berhasil diinisialisasi.", "Draft GL Journal deactivated successfully.": "Draf jurnal GL berhasil dinonaktifkan.", "Depreciation history updated successfully.": "Riwayat penyusutan berhasil diperbarui.", "Draft depreciation successfully activated.": "Draf penyusutan berhasil diaktifkan.", "Account Receivable activated successfully.": "Invoice AR berhasil diaktifkan.", "Accounting Period downloaded successfully.": "Periode Akuntansi berhasil diunduh.", "Account Receivable successfully activated.": "Invoice AR berhasil diaktifkan.", "Business Partner successfully deactivated.": "Mitra bisnis berhasil dinonaktifkan.", "Depreciation history successfully created.": "Riwayat penyusutan berhasil dibuat.", "Draft depreciation generated successfully.": "Draf penyusutan berhasil dibuat.", "Chart Of Account initialized successfully.": "Akun berhasil diinisialisasi.", "Fixed Asset Excel successfully downloaded.": "Excel aset tetap berhasil diunduh.", "Depreciation history successfully deleted.": "Riwayat penyusutan berhasil dihapus.", "Draft depreciation completed successfully.": "Draf penyusutan berhasil diselesaikan.", "Account Receivable successfully completed.": "Invoice AR berhasil diselesaikan.", "Draft GL Journal successfully initialized.": "Draf jurnal GL berhasil diinisialisasi.", "Fixed Asset Excel downloaded successfully.": "Excel aset tetap berhasil diunduh.", "Chart Of Account successfully initialized.": "Akun berhasil diinisialisasi.", "Business Partner deactivated successfully.": "Mitra bisnis berhasil dinonaktifkan.", "Depreciation history successfully updated.": "Riwayat penyusutan berhasil diperbarui.", "Draft GL Journal initialized successfully.": "Draf jurnal GL berhasil diinisialisasi.", "Draft GL Journal successfully deactivated.": "Draf jurnal GL berhasil dinonaktifkan.", "Draft depreciation disposed successfully.": "Draf penyusutan berhasil dilepas.", "Account Receivable successfully reposted.": "Invoice AR berhasil diposting ulang.", "Account Receivable successfully disposed.": "Invoice AR berhasil dilepas.", "Draft depreciation successfully reposted.": "Draf penyusutan berhasil diposting ulang.", "Company profile successfully deactivated.": "Profil perusahaan berhasil dinonaktifkan.", "Account Payable successfully initialized.": "Invoice AP berhasil diinisialisasi.", "Draft depreciation reposted successfully.": "Draf penyusutan berhasil diposting ulang.", "Draft GL Journal successfully downloaded.": "Draf jurnal GL berhasil diunduh.", "Accounting Period successfully generated.": "Periode Akuntansi berhasil dibuat.", "Business Partner downloaded successfully.": "Mitra bisnis berhasil diunduh.", "Accounting Period completed successfully.": "Periode Akuntansi berhasil diselesaikan.", "Account Receivable reposted successfully.": "Invoice AR berhasil diposting ulang.", "Company profile successfully initialized.": "Profil perusahaan berhasil diinisialisasi.", "Chart Of Account successfully downloaded.": "Akun berhasil diunduh.", "Fixed Asset Excel activated successfully.": "Excel aset tetap berhasil diaktifkan.", "Fixed Asset Excel successfully generated.": "Excel aset tetap berhasil dibuat.", "Manual Forecast deactivated successfully.": "Proyeksi manual berhasil dinonaktifkan.", "Manual Forecast successfully deactivated.": "Proyeksi manual berhasil dinonaktifkan.", "Accounting Period generated successfully.": "Periode Akuntansi berhasil dibuat.", "Manual Forecast successfully initialized.": "Proyeksi manual berhasil diinisialisasi.", "Depreciation history voided successfully.": "Riwayat penyusutan berhasil dibatalkan.", "Account Receivable disposed successfully.": "Invoice AR berhasil dilepas.", "Manual Forecast initialized successfully.": "Proyeksi manual berhasil diinisialisasi.", "Account Receivable reopened successfully.": "Invoice AR berhasil dibuka kembali.", "Fixed Asset Excel generated successfully.": "Excel aset tetap berhasil dibuat.", "Draft GL Journal downloaded successfully.": "Draf jurnal GL berhasil diunduh.", "Chart Of Account downloaded successfully.": "Akun berhasil diunduh.", "Draft depreciation successfully disposed.": "Draf penyusutan berhasil dilepas.", "Account Payable deactivated successfully.": "Invoice AP berhasil dinonaktifkan.", "Company profile initialized successfully.": "Profil perusahaan berhasil diinisialisasi.", "Business Partner successfully downloaded.": "Mitra bisnis berhasil diunduh.", "Depreciation history closed successfully.": "Riwayat penyusutan berhasil ditutup.", "Company profile deactivated successfully.": "Profil perusahaan berhasil dinonaktifkan.", "Fixed Asset Excel successfully completed.": "Excel aset tetap berhasil diselesaikan.", "Depreciation history successfully opened.": "Riwayat penyusutan berhasil dibuka.", "Depreciation history successfully voided.": "Riwayat penyusutan berhasil dibatalkan.", "Accounting Period activated successfully.": "Periode Akuntansi berhasil diaktifkan.", "Draft depreciation successfully reopened.": "Draf penyusutan berhasil dibuka kembali.", "Fixed Asset Excel completed successfully.": "Excel aset tetap berhasil diselesaikan.", "Account Payable initialized successfully.": "Invoice AP berhasil diinisialisasi.", "Depreciation history successfully posted.": "Riwayat penyusutan berhasil diposting.", "Accounting Period successfully completed.": "Periode Akuntansi berhasil diselesaikan.", "Depreciation history opened successfully.": "Riwayat penyusutan berhasil dibuka.", "Account Receivable successfully reopened.": "Invoice AR berhasil dibuka kembali.", "Fixed Asset Excel successfully activated.": "Excel aset tetap berhasil diaktifkan.", "Draft depreciation reopened successfully.": "Draf penyusutan berhasil dibuka kembali.", "Depreciation history successfully closed.": "Riwayat penyusutan berhasil ditutup.", "Accounting Period successfully activated.": "Periode Akuntansi berhasil diaktifkan.", "Depreciation history posted successfully.": "Riwayat penyusutan berhasil diposting.", "Account Payable successfully deactivated.": "Invoice AP berhasil dinonaktifkan.", "Company profile successfully downloaded.": "Profil perusahaan berhasil diunduh.", "Account Receivable updated successfully.": "Invoice AR berhasil diperbarui.", "Fixed Asset Excel successfully reopened.": "Excel aset tetap berhasil dibuka kembali.", "Draft depreciation updated successfully.": "Draf penyusutan berhasil diperbarui.", "Manual Forecast downloaded successfully.": "Proyeksi manual berhasil diunduh.", "Chart Of Account successfully completed.": "Akun berhasil diselesaikan.", "Account Receivable successfully created.": "Invoice AR berhasil dibuat.", "Chart Of Account completed successfully.": "Akun berhasil diselesaikan.", "Fixed Asset Excel disposed successfully.": "Excel aset tetap berhasil dilepas.", "Draft GL Journal successfully activated.": "Draf jurnal GL berhasil diaktifkan.", "Draft depreciation successfully deleted.": "Draf penyusutan berhasil dihapus.", "Business Partner successfully activated.": "Mitra bisnis berhasil diaktifkan.", "Account Payable successfully downloaded.": "Invoice AP berhasil diunduh.", "Draft GL Journal generated successfully.": "Draf jurnal GL berhasil dibuat.", "Company profile downloaded successfully.": "Profil perusahaan berhasil diunduh.", "Account Payable downloaded successfully.": "Invoice AP berhasil diunduh.", "Asset Category deactivated successfully.": "Kategori Aset berhasil dinonaktifkan.", "Draft depreciation successfully created.": "Draf penyusutan berhasil dibuat.", "Chart Of Account successfully generated.": "Akun berhasil dibuat.", "Fixed Asset Excel reposted successfully.": "Excel aset tetap berhasil diposting ulang.", "Accounting Period successfully reposted.": "Periode Akuntansi berhasil diposting ulang.", "Business Partner activated successfully.": "Mitra bisnis berhasil diaktifkan.", "Business Partner successfully completed.": "Mitra bisnis berhasil diselesaikan.", "Account Receivable created successfully.": "Invoice AR berhasil dibuat.", "Asset Category successfully initialized.": "Kategori Aset berhasil diinisialisasi.", "Accounting Period reposted successfully.": "Periode Akuntansi berhasil diposting ulang.", "Chart Of Account generated successfully.": "Akun berhasil dibuat.", "Business Partner successfully generated.": "Mitra bisnis berhasil dibuat.", "Asset Category successfully deactivated.": "Kategori Aset berhasil dinonaktifkan.", "Draft depreciation successfully updated.": "Draf penyusutan berhasil diperbarui.", "Asset Category initialized successfully.": "Kategori Aset berhasil diinisialisasi.", "Business Partner generated successfully.": "Mitra bisnis berhasil dibuat.", "Business Partner completed successfully.": "Mitra bisnis berhasil diselesaikan.", "Draft GL Journal successfully completed.": "Draf jurnal GL berhasil diselesaikan.", "Draft GL Journal activated successfully.": "Draf jurnal GL berhasil diaktifkan.", "Account Receivable successfully deleted.": "Invoice AR berhasil dihapus.", "Fixed Asset Excel successfully disposed.": "Excel aset tetap berhasil dilepas.", "Account Receivable deleted successfully.": "Invoice AR berhasil dihapus.", "Accounting Period successfully reopened.": "Periode Akuntansi berhasil dibuka kembali.", "Accounting Period successfully disposed.": "Periode Akuntansi berhasil dilepas.", "Draft depreciation deleted successfully.": "Draf penyusutan berhasil dihapus.", "Draft depreciation created successfully.": "Draf penyusutan berhasil dibuat.", "Depreciation history successfully saved.": "Riwayat penyusutan berhasil disimpan.", "Accounting Period reopened successfully.": "Periode Akuntansi berhasil dibuka kembali.", "Fixed Asset Excel reopened successfully.": "Excel aset tetap berhasil dibuka kembali.", "Chart Of Account successfully activated.": "Akun berhasil diaktifkan.", "Manual Forecast successfully downloaded.": "Proyeksi manual berhasil diunduh.", "Depreciation history saved successfully.": "Riwayat penyusutan berhasil disimpan.", "Accounting Period disposed successfully.": "Periode Akuntansi berhasil dilepas.", "Draft GL Journal completed successfully.": "Draf jurnal GL berhasil diselesaikan.", "Account Receivable successfully updated.": "Invoice AR berhasil diperbarui.", "Chart Of Account activated successfully.": "Akun berhasil diaktifkan.", "Fixed Asset Excel successfully reposted.": "Excel aset tetap berhasil diposting ulang.", "Draft GL Journal successfully generated.": "Draf jurnal GL berhasil dibuat.", "Draft GL Journal successfully disposed.": "Draf jurnal GL berhasil dilepas.", "Manual Forecast successfully activated.": "Proyeksi manual berhasil diaktifkan.", "Chart Of Account reposted successfully.": "Akun berhasil diposting ulang.", "Draft depreciation posted successfully.": "Draf penyusutan berhasil diposting.", "Fixed Asset Excel created successfully.": "Excel aset tetap berhasil dibuat.", "Manual Forecast successfully generated.": "Proyeksi manual berhasil dibuat.", "Draft depreciation voided successfully.": "Draf penyusutan berhasil dibatalkan.", "Accounting Period successfully created.": "Periode Akuntansi berhasil dibuat.", "Manual Forecast successfully completed.": "Proyeksi manual berhasil diselesaikan.", "Accounting Period updated successfully.": "Periode Akuntansi berhasil diperbarui.", "Draft GL Journal successfully reopened.": "Draf jurnal GL berhasil dibuka kembali.", "Business Partner reposted successfully.": "Mitra bisnis berhasil diposting ulang.", "Accounting Period created successfully.": "Periode Akuntansi berhasil dibuat.", "Chart Of Account disposed successfully.": "Akun berhasil dilepas.", "Company profile generated successfully.": "Profil perusahaan berhasil dibuat.", "Draft depreciation successfully closed.": "Draf penyusutan berhasil ditutup.", "Account Receivable successfully opened.": "Invoice AR berhasil dibuka.", "Asset Category successfully downloaded.": "Kategori Aset berhasil diunduh.", "Account Receivable posted successfully.": "Invoice AR berhasil diposting.", "Account Receivable successfully closed.": "Invoice AR berhasil ditutup.", "Fixed Asset Excel updated successfully.": "Excel aset tetap berhasil diperbarui.", "Manual Forecast completed successfully.": "Proyeksi manual berhasil diselesaikan.", "Draft depreciation successfully opened.": "Draf penyusutan berhasil dibuka.", "Business Partner disposed successfully.": "Mitra bisnis berhasil dilepas.", "Account Receivable voided successfully.": "Invoice AR berhasil dibatalkan.", "Account Receivable closed successfully.": "Invoice AR berhasil ditutup.", "Account Payable successfully generated.": "Invoice AP berhasil dibuat.", "Draft GL Journal reposted successfully.": "Draf jurnal GL berhasil diposting ulang.", "Account Payable successfully completed.": "Invoice AP berhasil diselesaikan.", "Company profile successfully completed.": "Profil perusahaan berhasil diselesaikan.", "Company profile successfully generated.": "Profil perusahaan berhasil dibuat.", "Fixed Asset Excel successfully deleted.": "Excel aset tetap berhasil dihapus.", "Depreciation history paid successfully.": "Riwayat penyusutan berhasil dibayar.", "Accounting Period successfully updated.": "Periode Akuntansi berhasil diperbarui.", "Draft GL Journal disposed successfully.": "Draf jurnal GL berhasil dilepas.", "Business Partner successfully disposed.": "Mitra bisnis berhasil dilepas.", "Business Partner reopened successfully.": "Mitra bisnis berhasil dibuka kembali.", "Chart Of Account successfully reposted.": "Akun berhasil diposting ulang.", "Accounting Period deleted successfully.": "Periode Akuntansi berhasil dihapus.", "Chart Of Account successfully reopened.": "Akun berhasil dibuka kembali.", "Draft depreciation opened successfully.": "Draf penyusutan berhasil dibuka.", "Account Payable activated successfully.": "Invoice AP berhasil diaktifkan.", "Account Payable completed successfully.": "Invoice AP berhasil diselesaikan.", "Draft GL Journal successfully reposted.": "Draf jurnal GL berhasil diposting ulang.", "Fixed Asset Excel deleted successfully.": "Excel aset tetap berhasil dihapus.", "Depreciation history successfully paid.": "Riwayat penyusutan berhasil dibayar.", "Account Payable successfully activated.": "Invoice AP berhasil diaktifkan.", "Fixed Asset Excel successfully created.": "Excel aset tetap berhasil dibuat.", "Fixed Asset Excel successfully updated.": "Excel aset tetap berhasil diperbarui.", "Accounting Period successfully deleted.": "Periode Akuntansi berhasil dihapus.", "Business Partner successfully reposted.": "Mitra bisnis berhasil diposting ulang.", "Company profile activated successfully.": "Profil perusahaan berhasil diaktifkan.", "Account Receivable opened successfully.": "Invoice AR berhasil dibuka.", "Account Receivable successfully voided.": "Invoice AR berhasil dibatalkan.", "Business Partner successfully reopened.": "Mitra bisnis berhasil dibuka kembali.", "Company profile successfully activated.": "Profil perusahaan berhasil diaktifkan.", "Draft depreciation closed successfully.": "Draf penyusutan berhasil ditutup.", "Manual Forecast generated successfully.": "Proyeksi manual berhasil dibuat.", "Chart Of Account successfully disposed.": "Akun berhasil dilepas.", "Asset Category downloaded successfully.": "Kategori Aset berhasil diunduh.", "Draft depreciation successfully posted.": "Draf penyusutan berhasil diposting.", "Chart Of Account reopened successfully.": "Akun berhasil dibuka kembali.", "Draft GL Journal reopened successfully.": "Draf jurnal GL berhasil dibuka kembali.", "Account Payable generated successfully.": "Invoice AP berhasil dibuat.", "Company profile completed successfully.": "Profil perusahaan berhasil diselesaikan.", "Draft depreciation successfully voided.": "Draf penyusutan berhasil dibatalkan.", "Manual Forecast activated successfully.": "Proyeksi manual berhasil diaktifkan.", "Account Receivable successfully posted.": "Invoice AR berhasil diposting.", "Bank account initialized successfully.": "Rekening bank berhasil diinisialisasi.", "Asset Category generated successfully.": "Kategori Aset berhasil dibuat.", "Fixed Asset Excel closed successfully.": "Excel aset tetap berhasil ditutup.", "Draft depreciation saved successfully.": "Draf penyusutan berhasil disimpan.", "Asset Category successfully generated.": "Kategori Aset berhasil dibuat.", "Company logo successfully deactivated.": "Logo perusahaan berhasil dinonaktifkan.", "Fixed Asset Excel voided successfully.": "Excel aset tetap berhasil dibatalkan.", "Business Partner updated successfully.": "Mitra bisnis berhasil diperbarui.", "Manual Forecast reopened successfully.": "Proyeksi manual berhasil dibuka kembali.", "Account Payable disposed successfully.": "Invoice AP berhasil dilepas.", "Draft depreciation successfully saved.": "Draf penyusutan berhasil disimpan.", "Draft GL Journal successfully deleted.": "Draf jurnal GL berhasil dihapus.", "Draft GL Journal deleted successfully.": "Draf jurnal GL berhasil dihapus.", "Business Partner created successfully.": "Mitra bisnis berhasil dibuat.", "Business Partner successfully created.": "Mitra bisnis berhasil dibuat.", "Asset Category completed successfully.": "Kategori Aset berhasil diselesaikan.", "Fixed Asset Excel successfully closed.": "Excel aset tetap berhasil ditutup.", "Asset Category successfully activated.": "Kategori Aset berhasil diaktifkan.", "Fixed Asset Excel posted successfully.": "Excel aset tetap berhasil diposting.", "Chart Of Account successfully deleted.": "Akun berhasil dihapus.", "Accounting Period successfully opened.": "Periode Akuntansi berhasil dibuka.", "Company profile successfully reposted.": "Profil perusahaan berhasil diposting ulang.", "Company profile reposted successfully.": "Profil perusahaan berhasil diposting ulang.", "Chart Of Account created successfully.": "Akun berhasil dibuat.", "Bank account successfully deactivated.": "Rekening bank berhasil dinonaktifkan.", "Business Partner successfully updated.": "Mitra bisnis berhasil diperbarui.", "Accounting Period closed successfully.": "Periode Akuntansi berhasil ditutup.", "Draft GL Journal created successfully.": "Draf jurnal GL berhasil dibuat.", "Chart Of Account deleted successfully.": "Akun berhasil dihapus.", "Chart Of Account successfully created.": "Akun berhasil dibuat.", "Business Partner deleted successfully.": "Mitra bisnis berhasil dihapus.", "Bank account deactivated successfully.": "Rekening bank berhasil dinonaktifkan.", "Accounting Period voided successfully.": "Periode Akuntansi berhasil dibatalkan.", "Account Receivable successfully saved.": "Invoice AR berhasil disimpan.", "Accounting Period opened successfully.": "Periode Akuntansi berhasil dibuka.", "Account Payable successfully reopened.": "Invoice AP berhasil dibuka kembali.", "Manual Forecast successfully reposted.": "Proyeksi manual berhasil diposting ulang.", "Company profile successfully reopened.": "Profil perusahaan berhasil dibuka kembali.", "Asset Category successfully completed.": "Kategori Aset berhasil diselesaikan.", "Fixed Asset Excel successfully posted.": "Excel aset tetap berhasil diposting.", "Accounting Period successfully voided.": "Periode Akuntansi berhasil dibatalkan.", "Accounting Period posted successfully.": "Periode Akuntansi berhasil diposting.", "Asset Category activated successfully.": "Kategori Aset berhasil diaktifkan.", "Fixed Asset Excel successfully voided.": "Excel aset tetap berhasil dibatalkan.", "Company profile reopened successfully.": "Profil perusahaan berhasil dibuka kembali.", "Company logo deactivated successfully.": "Logo perusahaan berhasil dinonaktifkan.", "Account Payable reposted successfully.": "Invoice AP berhasil diposting ulang.", "Accounting Period successfully closed.": "Periode Akuntansi berhasil ditutup.", "Draft GL Journal successfully updated.": "Draf jurnal GL berhasil diperbarui.", "Company profile successfully disposed.": "Profil perusahaan berhasil dilepas.", "Account Payable successfully reposted.": "Invoice AP berhasil diposting ulang.", "Draft GL Journal updated successfully.": "Draf jurnal GL berhasil diperbarui.", "Account Receivable saved successfully.": "Invoice AR berhasil disimpan.", "Account Payable reopened successfully.": "Invoice AP berhasil dibuka kembali.", "Draft GL Journal successfully created.": "Draf jurnal GL berhasil dibuat.", "Account Payable successfully disposed.": "Invoice AP berhasil dilepas.", "Fixed Asset Excel successfully opened.": "Excel aset tetap berhasil dibuka.", "Accounting Period successfully posted.": "Periode Akuntansi berhasil diposting.", "Manual Forecast successfully disposed.": "Proyeksi manual berhasil dilepas.", "Chart Of Account successfully updated.": "Akun berhasil diperbarui.", "Company profile disposed successfully.": "Profil perusahaan berhasil dilepas.", "Company logo initialized successfully.": "Logo perusahaan berhasil diinisialisasi.", "Manual Forecast reposted successfully.": "Proyeksi manual berhasil diposting ulang.", "Company logo successfully initialized.": "Logo perusahaan berhasil diinisialisasi.", "Bank account successfully initialized.": "Rekening bank berhasil diinisialisasi.", "Fixed Asset Excel opened successfully.": "Excel aset tetap berhasil dibuka.", "Chart Of Account updated successfully.": "Akun berhasil diperbarui.", "Business Partner successfully deleted.": "Mitra bisnis berhasil dihapus.", "Manual Forecast successfully reopened.": "Proyeksi manual berhasil dibuka kembali.", "Manual Forecast disposed successfully.": "Proyeksi manual berhasil dilepas.", "Company profile updated successfully.": "Profil perusahaan berhasil diperbarui.", "Manual Forecast created successfully.": "Proyeksi manual berhasil dibuat.", "Chart Of Account opened successfully.": "Akun berhasil dibuka.", "Asset Category reposted successfully.": "Kategori Aset berhasil diposting ulang.", "Draft GL Journal successfully voided.": "Draf jurnal GL berhasil dibatalkan.", "Fixed Asset Excel successfully saved.": "Excel aset tetap berhasil disimpan.", "Draft GL Journal posted successfully.": "Draf jurnal GL berhasil diposting.", "Chart Of Account successfully closed.": "Akun berhasil ditutup.", "Draft GL Journal voided successfully.": "Draf jurnal GL berhasil dibatalkan.", "Company logo successfully downloaded.": "Logo perusahaan berhasil diunduh.", "Business Partner opened successfully.": "Mitra bisnis berhasil dibuka.", "Company profile created successfully.": "Profil perusahaan berhasil dibuat.", "Chart Of Account successfully opened.": "Akun berhasil dibuka.", "Account Payable created successfully.": "Invoice AP berhasil dibuat.", "Account Payable successfully deleted.": "Invoice AP berhasil dihapus.", "Business Partner voided successfully.": "Mitra bisnis berhasil dibatalkan.", "Draft GL Journal successfully closed.": "Draf jurnal GL berhasil ditutup.", "Business Partner posted successfully.": "Mitra bisnis berhasil diposting.", "Fixed Asset Excel saved successfully.": "Excel aset tetap berhasil disimpan.", "Manual Forecast successfully created.": "Proyeksi manual berhasil dibuat.", "Fixed Asset successfully initialized.": "Aset tetap berhasil diinisialisasi.", "Asset Category successfully reopened.": "Kategori Aset berhasil dibuka kembali.", "Company logo downloaded successfully.": "Logo perusahaan berhasil diunduh.", "Account Receivable successfully paid.": "Invoice AR berhasil dibayar.", "Manual Forecast successfully updated.": "Proyeksi manual berhasil diperbarui.", "Bank account successfully downloaded.": "Rekening bank berhasil diunduh.", "Draft GL Journal successfully opened.": "Draf jurnal GL berhasil dibuka.", "Chart Of Account successfully posted.": "Akun berhasil diposting.", "Asset Category successfully disposed.": "Kategori Aset berhasil dilepas.", "Fixed Asset successfully deactivated.": "Aset tetap berhasil dinonaktifkan.", "Account Payable successfully updated.": "Invoice AP berhasil diperbarui.", "Company profile successfully deleted.": "Profil perusahaan berhasil dihapus.", "Account Payable successfully created.": "Invoice AP berhasil dibuat.", "Draft GL Journal successfully posted.": "Draf jurnal GL berhasil diposting.", "Manual Forecast updated successfully.": "Proyeksi manual berhasil diperbarui.", "Business Partner successfully posted.": "Mitra bisnis berhasil diposting.", "Chart Of Account closed successfully.": "Akun berhasil ditutup.", "Chart Of Account posted successfully.": "Akun berhasil diposting.", "Business Partner successfully opened.": "Mitra bisnis berhasil dibuka.", "Company profile successfully created.": "Profil perusahaan berhasil dibuat.", "Bank account downloaded successfully.": "Rekening bank berhasil diunduh.", "Chart Of Account successfully voided.": "Akun berhasil dibatalkan.", "Company profile deleted successfully.": "Profil perusahaan berhasil dihapus.", "Chart Of Account voided successfully.": "Akun berhasil dibatalkan.", "Business Partner successfully closed.": "Mitra bisnis berhasil ditutup.", "Asset Category disposed successfully.": "Kategori Aset berhasil dilepas.", "Account Receivable paid successfully.": "Invoice AR berhasil dibayar.", "Draft depreciation successfully paid.": "Draf penyusutan berhasil dibayar.", "Draft depreciation paid successfully.": "Draf penyusutan berhasil dibayar.", "Account Payable updated successfully.": "Invoice AP berhasil diperbarui.", "Asset Category successfully reposted.": "Kategori Aset berhasil diposting ulang.", "Asset Category reopened successfully.": "Kategori Aset berhasil dibuka kembali.", "Accounting Period saved successfully.": "Periode Akuntansi berhasil disimpan.", "Accounting Period successfully saved.": "Periode Akuntansi berhasil disimpan.", "Manual Forecast successfully deleted.": "Proyeksi manual berhasil dihapus.", "Account Payable deleted successfully.": "Invoice AP berhasil dihapus.", "Manual Forecast deleted successfully.": "Proyeksi manual berhasil dihapus.", "Fixed Asset deactivated successfully.": "Aset tetap berhasil dinonaktifkan.", "Fixed Asset initialized successfully.": "Aset tetap berhasil diinisialisasi.", "Draft GL Journal closed successfully.": "Draf jurnal GL berhasil ditutup.", "Business Partner closed successfully.": "Mitra bisnis berhasil ditutup.", "Business Partner successfully voided.": "Mitra bisnis berhasil dibatalkan.", "Draft GL Journal opened successfully.": "Draf jurnal GL berhasil dibuka.", "Company profile successfully updated.": "Profil perusahaan berhasil diperbarui.", "AP Payment deactivated successfully.": "Pembayaran AP berhasil dinonaktifkan.", "Bank account successfully generated.": "Rekening bank berhasil dibuat.", "Company profile successfully voided.": "Profil perusahaan berhasil dibatalkan.", "Asset Category created successfully.": "Kategori Aset berhasil dibuat.", "Company logo successfully completed.": "Logo perusahaan berhasil diselesaikan.", "Company profile closed successfully.": "Profil perusahaan berhasil ditutup.", "Bank account activated successfully.": "Rekening bank berhasil diaktifkan.", "AR Payment successfully initialized.": "Pembayaran AR berhasil diinisialisasi.", "Account Payable successfully opened.": "Invoice AP berhasil dibuka.", "GL Journal deactivated successfully.": "Jurnal GL berhasil dinonaktifkan.", "Manual Forecast successfully voided.": "Proyeksi manual berhasil dibatalkan.", "Account Payable successfully closed.": "Invoice AP berhasil ditutup.", "Fixed Asset downloaded successfully.": "Aset tetap berhasil diunduh.", "Company profile posted successfully.": "Profil perusahaan berhasil diposting.", "Company profile voided successfully.": "Profil perusahaan berhasil dibatalkan.", "Manual Forecast closed successfully.": "Proyeksi manual berhasil ditutup.", "AR Invoice deactivated successfully.": "Invoice AR berhasil dinonaktifkan.", "Accounting Period successfully paid.": "Periode Akuntansi berhasil dibayar.", "Asset Category successfully deleted.": "Kategori Aset berhasil dihapus.", "AR Payment deactivated successfully.": "Pembayaran AR berhasil dinonaktifkan.", "Company logo successfully activated.": "Logo perusahaan berhasil diaktifkan.", "Bank account successfully activated.": "Rekening bank berhasil diaktifkan.", "Asset Category updated successfully.": "Kategori Aset berhasil diperbarui.", "Bank account generated successfully.": "Rekening bank berhasil dibuat.", "GL Journal successfully deactivated.": "Jurnal GL berhasil dinonaktifkan.", "Company logo generated successfully.": "Logo perusahaan berhasil dibuat.", "Manual Forecast successfully opened.": "Proyeksi manual berhasil dibuka.", "Business Partner successfully saved.": "Mitra bisnis berhasil disimpan.", "AP Payment successfully deactivated.": "Pembayaran AP berhasil dinonaktifkan.", "Company profile successfully posted.": "Profil perusahaan berhasil diposting.", "Company logo completed successfully.": "Logo perusahaan berhasil diselesaikan.", "Company logo successfully generated.": "Logo perusahaan berhasil dibuat.", "Asset Category deleted successfully.": "Kategori Aset berhasil dihapus.", "Manual Forecast successfully closed.": "Proyeksi manual berhasil ditutup.", "GL Journal initialized successfully.": "Jurnal GL berhasil diinisialisasi.", "Account Payable closed successfully.": "Invoice AP berhasil ditutup.", "Bank account successfully completed.": "Rekening bank berhasil diselesaikan.", "Company profile opened successfully.": "Profil perusahaan berhasil dibuka.", "Business Partner saved successfully.": "Mitra bisnis berhasil disimpan.", "Manual Forecast opened successfully.": "Proyeksi manual berhasil dibuka.", "Chart Of Account successfully saved.": "Akun berhasil disimpan.", "Fixed Asset Excel paid successfully.": "Excel aset tetap berhasil dibayar.", "Manual Forecast successfully posted.": "Proyeksi manual berhasil diposting.", "Account Payable voided successfully.": "Invoice AP berhasil dibatalkan.", "AR Invoice successfully initialized.": "Invoice AR berhasil diinisialisasi.", "Account Payable successfully posted.": "Invoice AP berhasil diposting.", "AR Invoice initialized successfully.": "Invoice AR berhasil diinisialisasi.", "Bank account completed successfully.": "Rekening bank berhasil diselesaikan.", "Fixed Asset Excel successfully paid.": "Excel aset tetap berhasil dibayar.", "Draft GL Journal saved successfully.": "Draf jurnal GL berhasil disimpan.", "Company logo activated successfully.": "Logo perusahaan berhasil diaktifkan.", "AP Payment successfully initialized.": "Pembayaran AP berhasil diinisialisasi.", "Draft GL Journal successfully saved.": "Draf jurnal GL berhasil disimpan.", "Account Payable posted successfully.": "Invoice AP berhasil diposting.", "Asset Category successfully updated.": "Kategori Aset berhasil diperbarui.", "Manual Forecast posted successfully.": "Proyeksi manual berhasil diposting.", "Asset Category successfully created.": "Kategori Aset berhasil dibuat.", "GL Journal successfully initialized.": "Jurnal GL berhasil diinisialisasi.", "AR Payment initialized successfully.": "Pembayaran AR berhasil diinisialisasi.", "Accounting Period paid successfully.": "Periode Akuntansi berhasil dibayar.", "AR Invoice successfully deactivated.": "Invoice AR berhasil dinonaktifkan.", "Company profile successfully opened.": "Profil perusahaan berhasil dibuka.", "AR Payment successfully deactivated.": "Pembayaran AR berhasil dinonaktifkan.", "Fixed Asset successfully downloaded.": "Aset tetap berhasil diunduh.", "AP Payment initialized successfully.": "Pembayaran AP berhasil diinisialisasi.", "Company profile successfully closed.": "Profil perusahaan berhasil ditutup.", "Account Payable opened successfully.": "Invoice AP berhasil dibuka.", "Account Payable successfully voided.": "Invoice AP berhasil dibatalkan.", "Manual Forecast voided successfully.": "Proyeksi manual berhasil dibatalkan.", "Chart Of Account saved successfully.": "Akun berhasil disimpan.", "Manual Forecast successfully saved.": "Proyeksi manual berhasil disimpan.", "Asset Category successfully opened.": "Kategori Aset berhasil dibuka.", "Company profile successfully saved.": "Profil perusahaan berhasil disimpan.", "Operation successfully initialized.": "Operasi berhasil diinisialisasi.", "Business Partner paid successfully.": "Mitra bisnis berhasil dibayar.", "Fixed Asset completed successfully.": "Aset tetap berhasil diselesaikan.", "Asset Category successfully posted.": "Kategori Aset berhasil diposting.", "Company logo reposted successfully.": "Logo perusahaan berhasil diposting ulang.", "Bank account reposted successfully.": "Rekening bank berhasil diposting ulang.", "Chart Of Account successfully paid.": "Akun berhasil dibayar.", "Bank account successfully disposed.": "Rekening bank berhasil dilepas.", "Asset Category posted successfully.": "Kategori Aset berhasil diposting.", "Bank account reopened successfully.": "Rekening bank berhasil dibuka kembali.", "AR Payment successfully downloaded.": "Pembayaran AR berhasil diunduh.", "Asset Category closed successfully.": "Kategori Aset berhasil ditutup.", "Bank account successfully reopened.": "Rekening bank berhasil dibuka kembali.", "Company logo successfully reopened.": "Logo perusahaan berhasil dibuka kembali.", "Operation deactivated successfully.": "Operasi berhasil dinonaktifkan.", "Account Payable successfully saved.": "Invoice AP berhasil disimpan.", "Fixed Asset activated successfully.": "Aset tetap berhasil diaktifkan.", "Bank account successfully reposted.": "Rekening bank berhasil diposting ulang.", "Fixed Asset successfully activated.": "Aset tetap berhasil diaktifkan.", "AR Invoice successfully downloaded.": "Invoice AR berhasil diunduh.", "AR Invoice downloaded successfully.": "Invoice AR berhasil diunduh.", "Operation initialized successfully.": "Operasi berhasil diinisialisasi.", "AR Payment downloaded successfully.": "Pembayaran AR berhasil diunduh.", "Fixed Asset successfully generated.": "Aset tetap berhasil dibuat.", "Draft GL Journal paid successfully.": "Draf jurnal GL berhasil dibayar.", "Fixed Asset successfully completed.": "Aset tetap berhasil diselesaikan.", "Draft GL Journal successfully paid.": "Draf jurnal GL berhasil dibayar.", "Company logo successfully disposed.": "Logo perusahaan berhasil dilepas.", "Fixed Asset generated successfully.": "Aset tetap berhasil dibuat.", "Bank account disposed successfully.": "Rekening bank berhasil dilepas.", "Manual Forecast saved successfully.": "Proyeksi manual berhasil disimpan.", "Company logo disposed successfully.": "Logo perusahaan berhasil dilepas.", "AP Payment downloaded successfully.": "Pembayaran AP berhasil diunduh.", "Chart Of Account paid successfully.": "Akun berhasil dibayar.", "Asset Category successfully closed.": "Kategori Aset berhasil ditutup.", "Account Payable saved successfully.": "Invoice AP berhasil disimpan.", "Asset Category voided successfully.": "Kategori Aset berhasil dibatalkan.", "Asset Category opened successfully.": "Kategori Aset berhasil dibuka.", "Company profile saved successfully.": "Profil perusahaan berhasil disimpan.", "AP Payment successfully downloaded.": "Pembayaran AP berhasil diunduh.", "GL Journal successfully downloaded.": "Jurnal GL berhasil diunduh.", "Business Partner successfully paid.": "Mitra bisnis berhasil dibayar.", "Company logo reopened successfully.": "Logo perusahaan berhasil dibuka kembali.", "Company logo successfully reposted.": "Logo perusahaan berhasil diposting ulang.", "GL Journal downloaded successfully.": "Jurnal GL berhasil diunduh.", "Asset Category successfully voided.": "Kategori Aset berhasil dibatalkan.", "Operation successfully deactivated.": "Operasi berhasil dinonaktifkan.", "Bank account successfully created.": "Rekening bank berhasil dibuat.", "GL Journal activated successfully.": "Jurnal GL berhasil diaktifkan.", "AP Payment completed successfully.": "Pembayaran AP berhasil diselesaikan.", "Account Payable paid successfully.": "Invoice AP berhasil dibayar.", "Bank account deleted successfully.": "Rekening bank berhasil dihapus.", "AR Invoice successfully completed.": "Invoice AR berhasil diselesaikan.", "AP Payment successfully activated.": "Pembayaran AP berhasil diaktifkan.", "AR Payment successfully activated.": "Pembayaran AR berhasil diaktifkan.", "AR Payment successfully generated.": "Pembayaran AR berhasil dibuat.", "Asset Category successfully saved.": "Kategori Aset berhasil disimpan.", "Bank account successfully updated.": "Rekening bank berhasil diperbarui.", "AR Invoice successfully activated.": "Invoice AR berhasil diaktifkan.", "Fixed Asset reopened successfully.": "Aset tetap berhasil dibuka kembali.", "Company logo successfully updated.": "Logo perusahaan berhasil diperbarui.", "Fixed Asset disposed successfully.": "Aset tetap berhasil dilepas.", "AR Payment generated successfully.": "Pembayaran AR berhasil dibuat.", "AR Payment activated successfully.": "Pembayaran AR berhasil diaktifkan.", "Operation downloaded successfully.": "Operasi berhasil diunduh.", "AR Invoice generated successfully.": "Invoice AR berhasil dibuat.", "AP Payment activated successfully.": "Pembayaran AP berhasil diaktifkan.", "Company logo successfully deleted.": "Logo perusahaan berhasil dihapus.", "Bank account successfully deleted.": "Rekening bank berhasil dihapus.", "Company logo successfully created.": "Logo perusahaan berhasil dibuat.", "Fixed Asset successfully reposted.": "Aset tetap berhasil diposting ulang.", "Company logo created successfully.": "Logo perusahaan berhasil dibuat.", "Company profile paid successfully.": "Profil perusahaan berhasil dibayar.", "GL Journal generated successfully.": "Jurnal GL berhasil dibuat.", "AP Payment generated successfully.": "Pembayaran AP berhasil dibuat.", "Manual Forecast paid successfully.": "Proyeksi manual berhasil dibayar.", "GL Journal completed successfully.": "Jurnal GL berhasil diselesaikan.", "AR Invoice successfully generated.": "Invoice AR berhasil dibuat.", "Bank account created successfully.": "Rekening bank berhasil dibuat.", "Company logo updated successfully.": "Logo perusahaan berhasil diperbarui.", "GL Journal successfully completed.": "Jurnal GL berhasil diselesaikan.", "Fixed Asset successfully disposed.": "Aset tetap berhasil dilepas.", "Asset Category saved successfully.": "Kategori Aset berhasil disimpan.", "Operation successfully downloaded.": "Operasi berhasil diunduh.", "GL Journal successfully activated.": "Jurnal GL berhasil diaktifkan.", "Fixed Asset successfully reopened.": "Aset tetap berhasil dibuka kembali.", "AP Payment successfully completed.": "Pembayaran AP berhasil diselesaikan.", "Fixed Asset reposted successfully.": "Aset tetap berhasil diposting ulang.", "Manual Forecast successfully paid.": "Proyeksi manual berhasil dibayar.", "Bank account updated successfully.": "Rekening bank berhasil diperbarui.", "Company logo deleted successfully.": "Logo perusahaan berhasil dihapus.", "GL Journal successfully generated.": "Jurnal GL berhasil dibuat.", "Company profile successfully paid.": "Profil perusahaan berhasil dibayar.", "Account Payable successfully paid.": "Invoice AP berhasil dibayar.", "AP Payment successfully generated.": "Pembayaran AP berhasil dibuat.", "AR Payment completed successfully.": "Pembayaran AR berhasil diselesaikan.", "AR Payment successfully completed.": "Pembayaran AR berhasil diselesaikan.", "AR Invoice activated successfully.": "Invoice AR berhasil diaktifkan.", "AR Invoice completed successfully.": "Invoice AR berhasil diselesaikan.", "Bank account successfully opened.": "Rekening bank berhasil dibuka.", "AR Invoice disposed successfully.": "Invoice AR berhasil dilepas.", "Company logo closed successfully.": "Logo perusahaan berhasil ditutup.", "AR Payment disposed successfully.": "Pembayaran AR berhasil dilepas.", "GL Journal successfully disposed.": "Jurnal GL berhasil dilepas.", "Journal initialized successfully.": "Jurnal berhasil diinisialisasi.", "Bank account posted successfully.": "Rekening bank berhasil diposting.", "GL Journal reopened successfully.": "Jurnal GL berhasil dibuka kembali.", "Operation completed successfully.": "Operasi berhasil diselesaikan.", "Fixed Asset successfully updated.": "Aset tetap berhasil diperbarui.", "Company logo successfully opened.": "Logo perusahaan berhasil dibuka.", "GL Journal successfully reposted.": "Jurnal GL berhasil diposting ulang.", "Bank account opened successfully.": "Rekening bank berhasil dibuka.", "AP Payment disposed successfully.": "Pembayaran AP berhasil dilepas.", "Fixed Asset created successfully.": "Aset tetap berhasil dibuat.", "Company logo posted successfully.": "Logo perusahaan berhasil diposting.", "GL Journal successfully reopened.": "Jurnal GL berhasil dibuka kembali.", "Asset Category successfully paid.": "Kategori Aset berhasil dibayar.", "Company logo successfully posted.": "Logo perusahaan berhasil diposting.", "AR Payment reopened successfully.": "Pembayaran AR berhasil dibuka kembali.", "AR Payment successfully reopened.": "Pembayaran AR berhasil dibuka kembali.", "Operation activated successfully.": "Operasi berhasil diaktifkan.", "AP Payment reopened successfully.": "Pembayaran AP berhasil dibuka kembali.", "Fixed Asset updated successfully.": "Aset tetap berhasil diperbarui.", "Company logo successfully closed.": "Logo perusahaan berhasil ditutup.", "AP Payment successfully reposted.": "Pembayaran AP berhasil diposting ulang.", "Operation generated successfully.": "Operasi berhasil dibuat.", "Fixed Asset deleted successfully.": "Aset tetap berhasil dihapus.", "AR Invoice reposted successfully.": "Invoice AR berhasil diposting ulang.", "User password reset successfully.": "Kata sandi pengguna berhasil diatur ulang.", "Bank account voided successfully.": "Rekening bank berhasil dibatalkan.", "AR Invoice successfully disposed.": "Invoice AR berhasil dilepas.", "GL Journal disposed successfully.": "Jurnal GL berhasil dilepas.", "Asset Category paid successfully.": "Kategori Aset berhasil dibayar.", "Journal successfully initialized.": "Jurnal berhasil diinisialisasi.", "Operation successfully activated.": "Operasi berhasil diaktifkan.", "Journal deactivated successfully.": "Jurnal berhasil dinonaktifkan.", "Operation successfully completed.": "Operasi berhasil diselesaikan.", "Operation successfully generated.": "Operasi berhasil dibuat.", "AP Payment successfully disposed.": "Pembayaran AP berhasil dilepas.", "GL Journal reposted successfully.": "Jurnal GL berhasil diposting ulang.", "Company logo successfully voided.": "Logo perusahaan berhasil dibatalkan.", "AR Payment successfully reposted.": "Pembayaran AR berhasil diposting ulang.", "AR Invoice successfully reopened.": "Invoice AR berhasil dibuka kembali.", "Bank account successfully posted.": "Rekening bank berhasil diposting.", "Fixed Asset successfully created.": "Aset tetap berhasil dibuat.", "Fixed Asset successfully deleted.": "Aset tetap berhasil dihapus.", "AR Invoice reopened successfully.": "Invoice AR berhasil dibuka kembali.", "Bank account successfully voided.": "Rekening bank berhasil dibatalkan.", "Bank account closed successfully.": "Rekening bank berhasil ditutup.", "AR Invoice successfully reposted.": "Invoice AR berhasil diposting ulang.", "AR Payment reposted successfully.": "Pembayaran AR berhasil diposting ulang.", "AP Payment reposted successfully.": "Pembayaran AP berhasil diposting ulang.", "Company logo voided successfully.": "Logo perusahaan berhasil dibatalkan.", "Company logo opened successfully.": "Logo perusahaan berhasil dibuka.", "Bank account successfully closed.": "Rekening bank berhasil ditutup.", "AP Payment successfully reopened.": "Pembayaran AP berhasil dibuka kembali.", "AR Payment successfully disposed.": "Pembayaran AR berhasil dilepas.", "Journal successfully deactivated.": "Jurnal berhasil dinonaktifkan.", "Fixed Asset successfully closed.": "Aset tetap berhasil ditutup.", "AR Invoice successfully updated.": "Invoice AR berhasil diperbarui.", "GL Journal deleted successfully.": "Jurnal GL berhasil dihapus.", "Journal successfully downloaded.": "Jurnal berhasil diunduh.", "AR Payment created successfully.": "Pembayaran AR berhasil dibuat.", "AR Payment deleted successfully.": "Pembayaran AR berhasil dihapus.", "GL Journal created successfully.": "Jurnal GL berhasil dibuat.", "Operation reposted successfully.": "Operasi berhasil diposting ulang.", "AR Payment successfully updated.": "Pembayaran AR berhasil diperbarui.", "Operation successfully reposted.": "Operasi berhasil diposting ulang.", "AP Payment created successfully.": "Pembayaran AP berhasil dibuat.", "AR Payment successfully created.": "Pembayaran AR berhasil dibuat.", "Bank account added successfully.": "Rekening bank berhasil ditambahkan.", "AR Payment successfully deleted.": "Pembayaran AR berhasil dihapus.", "Fixed Asset voided successfully.": "Aset tetap berhasil dibatalkan.", "Operation reopened successfully.": "Operasi berhasil dibuka kembali.", "Bank account saved successfully.": "Rekening bank berhasil disimpan.", "GL Journal successfully created.": "Jurnal GL berhasil dibuat.", "AP Payment updated successfully.": "Pembayaran AP berhasil diperbarui.", "Fixed Asset opened successfully.": "Aset tetap berhasil dibuka.", "Company logo successfully saved.": "Logo perusahaan berhasil disimpan.", "AR Invoice updated successfully.": "Invoice AR berhasil diperbarui.", "AP Payment successfully updated.": "Pembayaran AP berhasil diperbarui.", "Journal downloaded successfully.": "Jurnal berhasil diunduh.", "GL Journal successfully updated.": "Jurnal GL berhasil diperbarui.", "Action deactivated successfully.": "Tindakan berhasil dinonaktifkan.", "Fixed Asset posted successfully.": "Aset tetap berhasil diposting.", "Operation disposed successfully.": "Operasi berhasil dilepas.", "AR Invoice successfully deleted.": "Invoice AR berhasil dihapus.", "Fixed Asset successfully voided.": "Aset tetap berhasil dibatalkan.", "Fixed Asset successfully opened.": "Aset tetap berhasil dibuka.", "Company logo saved successfully.": "Logo perusahaan berhasil disimpan.", "Action initialized successfully.": "Tindakan berhasil diinisialisasi.", "Bank account successfully saved.": "Rekening bank berhasil disimpan.", "Operation successfully reopened.": "Operasi berhasil dibuka kembali.", "GL Journal successfully deleted.": "Jurnal GL berhasil dihapus.", "Action successfully deactivated.": "Tindakan berhasil dinonaktifkan.", "AP Payment successfully deleted.": "Pembayaran AP berhasil dihapus.", "AR Invoice created successfully.": "Invoice AR berhasil dibuat.", "GL Journal updated successfully.": "Jurnal GL berhasil diperbarui.", "AR Payment updated successfully.": "Pembayaran AR berhasil diperbarui.", "Fixed Asset closed successfully.": "Aset tetap berhasil ditutup.", "AR Invoice successfully created.": "Invoice AR berhasil dibuat.", "AP Payment deleted successfully.": "Pembayaran AP berhasil dihapus.", "AR Invoice deleted successfully.": "Invoice AR berhasil dihapus.", "AP Payment successfully created.": "Pembayaran AP berhasil dibuat.", "Fixed Asset successfully posted.": "Aset tetap berhasil diposting.", "Operation successfully disposed.": "Operasi berhasil dilepas.", "Action successfully initialized.": "Tindakan berhasil diinisialisasi.", "AR Invoice successfully closed.": "Invoice AR berhasil ditutup.", "Operation successfully updated.": "Operasi berhasil diperbarui.", "AR Payment successfully opened.": "Pembayaran AR berhasil dibuka.", "Bank account successfully paid.": "Rekening bank berhasil dibayar.", "AP Payment opened successfully.": "Pembayaran AP berhasil dibuka.", "GL Journal closed successfully.": "Jurnal GL berhasil ditutup.", "Operation updated successfully.": "Operasi berhasil diperbarui.", "AR Invoice successfully voided.": "Invoice AR berhasil dibatalkan.", "AP Payment successfully opened.": "Pembayaran AP berhasil dibuka.", "Journal generated successfully.": "Jurnal berhasil dibuat.", "GL Journal successfully opened.": "Jurnal GL berhasil dibuka.", "Action downloaded successfully.": "Tindakan berhasil diunduh.", "Operation created successfully.": "Operasi berhasil dibuat.", "GL Journal successfully closed.": "Jurnal GL berhasil ditutup.", "AP Payment closed successfully.": "Pembayaran AP berhasil ditutup.", "AR Payment opened successfully.": "Pembayaran AR berhasil dibuka.", "Journal successfully completed.": "Jurnal berhasil diselesaikan.", "Operation successfully deleted.": "Operasi berhasil dihapus.", "Fixed Asset successfully saved.": "Aset tetap berhasil disimpan.", "Company logo paid successfully.": "Logo perusahaan berhasil dibayar.", "GL Journal opened successfully.": "Jurnal GL berhasil dibuka.", "AR Payment voided successfully.": "Pembayaran AR berhasil dibatalkan.", "AR Payment posted successfully.": "Pembayaran AR berhasil diposting.", "Operation deleted successfully.": "Operasi berhasil dihapus.", "AP Payment successfully closed.": "Pembayaran AP berhasil ditutup.", "AR Payment successfully posted.": "Pembayaran AR berhasil diposting.", "AR Invoice successfully posted.": "Invoice AR berhasil diposting.", "AR Invoice voided successfully.": "Invoice AR berhasil dibatalkan.", "AR Invoice posted successfully.": "Invoice AR berhasil diposting.", "GL Journal voided successfully.": "Jurnal GL berhasil dibatalkan.", "AP Payment successfully voided.": "Pembayaran AP berhasil dibatalkan.", "Journal successfully activated.": "Jurnal berhasil diaktifkan.", "GL Journal successfully voided.": "Jurnal GL berhasil dibatalkan.", "AR Invoice successfully opened.": "Invoice AR berhasil dibuka.", "Journal successfully generated.": "Jurnal berhasil dibuat.", "Journal completed successfully.": "Jurnal berhasil diselesaikan.", "Company logo successfully paid.": "Logo perusahaan berhasil dibayar.", "AP Payment voided successfully.": "Pembayaran AP berhasil dibatalkan.", "Fixed Asset saved successfully.": "Aset tetap berhasil disimpan.", "AR Invoice opened successfully.": "Invoice AR berhasil dibuka.", "Bank account paid successfully.": "Rekening bank berhasil dibayar.", "GL Journal successfully posted.": "Jurnal GL berhasil diposting.", "AR Payment successfully voided.": "Pembayaran AR berhasil dibatalkan.", "AR Invoice closed successfully.": "Invoice AR berhasil ditutup.", "Journal activated successfully.": "Jurnal berhasil diaktifkan.", "AP Payment successfully posted.": "Pembayaran AP berhasil diposting.", "Operation successfully created.": "Operasi berhasil dibuat.", "Action successfully downloaded.": "Tindakan berhasil diunduh.", "GL Journal posted successfully.": "Jurnal GL berhasil diposting.", "AP Payment posted successfully.": "Pembayaran AP berhasil diposting.", "AR Payment successfully closed.": "Pembayaran AR berhasil ditutup.", "AR Payment closed successfully.": "Pembayaran AR berhasil ditutup.", "GL Journal saved successfully.": "Jurnal GL berhasil disimpan.", "Action completed successfully.": "Tindakan berhasil diselesaikan.", "User initialized successfully.": "Pengguna berhasil diinisialisasi.", "AR Invoice saved successfully.": "Invoice AR berhasil disimpan.", "Journal disposed successfully.": "Jurnal berhasil dilepas.", "AP Payment saved successfully.": "Pembayaran AP berhasil disimpan.", "Operation opened successfully.": "Operasi berhasil dibuka.", "AR Payment saved successfully.": "Pembayaran AR berhasil disimpan.", "AP Payment successfully saved.": "Pembayaran AP berhasil disimpan.", "Journal successfully reopened.": "Jurnal berhasil dibuka kembali.", "Journal reopened successfully.": "Jurnal berhasil dibuka kembali.", "Operation successfully closed.": "Operasi berhasil ditutup.", "Action successfully activated.": "Tindakan berhasil diaktifkan.", "Operation successfully posted.": "Operasi berhasil diposting.", "Fixed Asset successfully paid.": "Aset tetap berhasil dibayar.", "Operation posted successfully.": "Operasi berhasil diposting.", "Action successfully completed.": "Tindakan berhasil diselesaikan.", "User successfully deactivated.": "Pengguna berhasil dinonaktifkan.", "GL Journal successfully saved.": "Jurnal GL berhasil disimpan.", "Operation closed successfully.": "Operasi berhasil ditutup.", "Action generated successfully.": "Tindakan berhasil dibuat.", "Operation voided successfully.": "Operasi berhasil dibatalkan.", "Fixed Asset paid successfully.": "Aset tetap berhasil dibayar.", "AR Payment successfully saved.": "Pembayaran AR berhasil disimpan.", "AR Invoice successfully saved.": "Invoice AR berhasil disimpan.", "Operation successfully voided.": "Operasi berhasil dibatalkan.", "Journal reposted successfully.": "Jurnal berhasil diposting ulang.", "Journal successfully disposed.": "Jurnal berhasil dilepas.", "Journal successfully reposted.": "Jurnal berhasil diposting ulang.", "Action successfully generated.": "Tindakan berhasil dibuat.", "Operation successfully opened.": "Operasi berhasil dibuka.", "User deactivated successfully.": "Pengguna berhasil dinonaktifkan.", "User successfully initialized.": "Pengguna berhasil diinisialisasi.", "Action activated successfully.": "Tindakan berhasil diaktifkan.", "Journal updated successfully.": "Jurnal berhasil diperbarui.", "GL Journal successfully paid.": "Jurnal GL berhasil dibayar.", "Tax initialized successfully.": "Pajak berhasil diinisialisasi.", "Action disposed successfully.": "Tindakan berhasil dilepas.", "AR Invoice paid successfully.": "Invoice AR berhasil dibayar.", "Journal deleted successfully.": "Jurnal berhasil dihapus.", "AR Payment paid successfully.": "Pembayaran AR berhasil dibayar.", "AP Payment paid successfully.": "Pembayaran AP berhasil dibayar.", "Journal successfully created.": "Jurnal berhasil dibuat.", "Action successfully disposed.": "Tindakan berhasil dilepas.", "User downloaded successfully.": "Pengguna berhasil diunduh.", "Journal successfully updated.": "Jurnal berhasil diperbarui.", "Action reopened successfully.": "Tindakan berhasil dibuka kembali.", "Action reposted successfully.": "Tindakan berhasil diposting ulang.", "Tax deactivated successfully.": "Pajak berhasil dinonaktifkan.", "Operation successfully saved.": "Operasi berhasil disimpan.", "Journal successfully deleted.": "Jurnal berhasil dihapus.", "Tax successfully deactivated.": "Pajak berhasil dinonaktifkan.", "AR Invoice successfully paid.": "Invoice AR berhasil dibayar.", "AR Payment successfully paid.": "Pembayaran AR berhasil dibayar.", "Action successfully reposted.": "Tindakan berhasil diposting ulang.", "AP Payment successfully paid.": "Pembayaran AP berhasil dibayar.", "User successfully downloaded.": "Pengguna berhasil diunduh.", "Action successfully reopened.": "Tindakan berhasil dibuka kembali.", "Tax successfully initialized.": "Pajak berhasil diinisialisasi.", "Journal created successfully.": "Jurnal berhasil dibuat.", "GL Journal paid successfully.": "Jurnal GL berhasil dibayar.", "Operation saved successfully.": "Operasi berhasil disimpan.", "User successfully activated.": "Pengguna berhasil diaktifkan.", "User generated successfully.": "Pengguna berhasil dibuat.", "Operation successfully paid.": "Operasi berhasil dibayar.", "Action successfully deleted.": "Tindakan berhasil dihapus.", "Action successfully created.": "Tindakan berhasil dibuat.", "Tax downloaded successfully.": "Pajak berhasil diunduh.", "Action successfully updated.": "Tindakan berhasil diperbarui.", "Action deleted successfully.": "Tindakan berhasil dihapus.", "Tax successfully downloaded.": "Pajak berhasil diunduh.", "Journal opened successfully.": "Jurnal berhasil dibuka.", "Journal successfully opened.": "Jurnal berhasil dibuka.", "Journal voided successfully.": "Jurnal berhasil dibatalkan.", "Action created successfully.": "Tindakan berhasil dibuat.", "Action updated successfully.": "Tindakan berhasil diperbarui.", "Journal closed successfully.": "Jurnal berhasil ditutup.", "Journal successfully posted.": "Jurnal berhasil diposting.", "User successfully completed.": "Pengguna berhasil diselesaikan.", "Journal successfully closed.": "Jurnal berhasil ditutup.", "User completed successfully.": "Pengguna berhasil diselesaikan.", "Journal successfully voided.": "Jurnal berhasil dibatalkan.", "Operation paid successfully.": "Operasi berhasil dibayar.", "User successfully generated.": "Pengguna berhasil dibuat.", "User activated successfully.": "Pengguna berhasil diaktifkan.", "Journal posted successfully.": "Jurnal berhasil diposting.", "Action closed successfully.": "Tindakan berhasil ditutup.", "Action successfully voided.": "Tindakan berhasil dibatalkan.", "Journal saved successfully.": "Jurnal berhasil disimpan.", "Tax successfully generated.": "Pajak berhasil dibuat.", "User successfully reposted.": "Pengguna berhasil diposting ulang.", "Action posted successfully.": "Tindakan berhasil diposting.", "Tax successfully completed.": "Pajak berhasil diselesaikan.", "Tax successfully activated.": "Pajak berhasil diaktifkan.", "Action opened successfully.": "Tindakan berhasil dibuka.", "Tax activated successfully.": "Pajak berhasil diaktifkan.", "User successfully reopened.": "Pengguna berhasil dibuka kembali.", "Tax generated successfully.": "Pajak berhasil dibuat.", "Journal successfully saved.": "Jurnal berhasil disimpan.", "User reposted successfully.": "Pengguna berhasil diposting ulang.", "Action successfully opened.": "Tindakan berhasil dibuka.", "User reopened successfully.": "Pengguna berhasil dibuka kembali.", "Tax completed successfully.": "Pajak berhasil diselesaikan.", "User disposed successfully.": "Pengguna berhasil dilepas.", "User successfully disposed.": "Pengguna berhasil dilepas.", "Action successfully closed.": "Tindakan berhasil ditutup.", "Action successfully posted.": "Tindakan berhasil diposting.", "Action voided successfully.": "Tindakan berhasil dibatalkan.", "Tax successfully reposted.": "Pajak berhasil diposting ulang.", "User created successfully.": "Pengguna berhasil dibuat.", "Journal paid successfully.": "Jurnal berhasil dibayar.", "Tax reposted successfully.": "Pajak berhasil diposting ulang.", "Tax reopened successfully.": "Pajak berhasil dibuka kembali.", "Tax successfully disposed.": "Pajak berhasil dilepas.", "User deleted successfully.": "Pengguna berhasil dihapus.", "Tax successfully reopened.": "Pajak berhasil dibuka kembali.", "User successfully deleted.": "Pengguna berhasil dihapus.", "Tax disposed successfully.": "Pajak berhasil dilepas.", "Journal successfully paid.": "Jurnal berhasil dibayar.", "User successfully updated.": "Pengguna berhasil diperbarui.", "Action successfully saved.": "Tindakan berhasil disimpan.", "User updated successfully.": "Pengguna berhasil diperbarui.", "Action saved successfully.": "Tindakan berhasil disimpan.", "User successfully created.": "Pengguna berhasil dibuat.", "Action paid successfully.": "Tindakan berhasil dibayar.", "User successfully posted.": "Pengguna berhasil diposting.", "Action successfully paid.": "Tindakan berhasil dibayar.", "Tax successfully deleted.": "Pajak berhasil dihapus.", "Tax successfully created.": "Pajak berhasil dibuat.", "User successfully closed.": "Pengguna berhasil ditutup.", "Tax successfully updated.": "Pajak berhasil diperbarui.", "Tax updated successfully.": "Pajak berhasil diperbarui.", "Tax created successfully.": "Pajak berhasil dibuat.", "User successfully voided.": "Pengguna berhasil dibatalkan.", "User opened successfully.": "Pengguna berhasil dibuka.", "User voided successfully.": "Pengguna berhasil dibatalkan.", "Tax deleted successfully.": "Pajak berhasil dihapus.", "User successfully opened.": "Pengguna berhasil dibuka.", "User closed successfully.": "Pengguna berhasil ditutup.", "User posted successfully.": "Pengguna berhasil diposting.", "Tax closed successfully.": "Pajak berhasil ditutup.", "Tax successfully voided.": "Pajak berhasil dibatalkan.", "Tax successfully opened.": "Pajak berhasil dibuka.", "User successfully saved.": "Pengguna berhasil disimpan.", "Tax voided successfully.": "Pajak berhasil dibatalkan.", "User saved successfully.": "Pengguna berhasil disimpan.", "Tax opened successfully.": "Pajak berhasil dibuka.", "Tax successfully closed.": "Pajak berhasil ditutup.", "Tax posted successfully.": "Pajak berhasil diposting.", "Tax successfully posted.": "Pajak berhasil diposting.", "User successfully paid.": "Pengguna berhasil dibayar.", "User paid successfully.": "Pengguna berhasil dibayar.", "Tax successfully saved.": "Pajak berhasil disimpan.", "Tax saved successfully.": "Pajak berhasil disimpan.", "Tax paid successfully.": "Pajak berhasil dibayar.", "Tax successfully paid.": "Pajak berhasil dibayar."};
const finovaSuccessReverse = Object.fromEntries(Object.entries(finovaSuccessMessages).map(([en,id])=>[id,en]));
function finovaTranslateSuccess(original){
 const raw=original.trim();
 const lookup=lang==='id'?finovaSuccessMessages:finovaSuccessReverse;
 let result=lookup[raw];
 if(result===undefined){
   // Support a dynamic accounting-period code and journal number while preserving IDs.
   let match=raw.match(/^Accounting Period (.+?) (closed|opened|reopened) successfully\.$/);
   if(lang==='id'&&match){const action={closed:'ditutup',opened:'dibuka',reopened:'dibuka kembali'};result=`Periode Akuntansi ${match[1]} berhasil ${action[match[2]]}.`;}
   match=raw.match(/^Periode Akuntansi (.+?) berhasil (ditutup|dibuka|dibuka kembali)\.$/);
   if(lang==='en'&&match){const action={'ditutup':'closed','dibuka':'opened','dibuka kembali':'reopened'};result=`Accounting Period ${match[1]} ${action[match[2]]} successfully.`;}
   match=raw.match(/^Draft GL Journal successfully created: (.+)$/);
   if(lang==='id'&&match)result=`Draf jurnal GL berhasil dibuat: ${match[1]}`;
   match=raw.match(/^Draf jurnal GL berhasil dibuat: (.+)$/);
   if(lang==='en'&&match)result=`Draft GL Journal successfully created: ${match[1]}`;
   match=raw.match(/^Business Partner successfully updated\. New code: (.+)$/);
   if(lang==='id'&&match)result=`Mitra bisnis berhasil diperbarui. Kode baru: ${match[1]}`;
   match=raw.match(/^Mitra bisnis berhasil diperbarui\. Kode baru: (.+)$/);
   if(lang==='en'&&match)result=`Business Partner successfully updated. New code: ${match[1]}`;
 }
 if(result===undefined)return null;
 return original.slice(0,original.indexOf(raw))+result+original.slice(original.indexOf(raw)+raw.length);
}
function translateOriginal(original){
 const successMessage=finovaTranslateSuccess(original);if(successMessage!==null)return successMessage;

 const dynamic=translateDashboardDynamic(original);if(dynamic!==null)return dynamic;
 const monthMatch=original.match(/^(\s*)(\d+)\s+(months?|bulan)(\s*)$/i);
 if(monthMatch){return monthMatch[1]+monthMatch[2]+(lang==='id'?' bulan':(Number(monthMatch[2])===1?' month':' months'))+monthMatch[4];}
 const key=normalized(original);
 // Category table renders useful life as "96 months"; translate the visible unit only.
 // Restrict this to fixed-asset category table cells, never input values or stored data.
 let exact=lang==='id'?dictionary[key]:(englishLabels[key]||reverse[key]);
 // Cash cards can be rendered with mixed casing by different module templates.
 // Limit case-insensitive matching to the eight known cash-card headings.
 if(exact===undefined){
  const cardKey=key.toUpperCase();
  const cashCards=['MINIMUM PROJECTED CASH','LIQUIDITY HEADROOM','LOWEST HEADROOM','LIQUIDITY STATUS','OPENING CASH','EXPECTED CASH IN','EXPECTED CASH OUT','ENDING CASH'];
  if(cashCards.includes(cardKey))exact=lang==='id'?dictionary[cardKey]:undefined;
 }
 if(exact!==undefined){const leading=original.match(/^\s*/)[0],trailing=original.match(/\s*$/)[0];return leading+exact+trailing}
 if(lang==='id'){
  const pagination=key.match(/^(?:Displaying Record|Records) (\d+) - (\d+) of (\d+)$/i);
  if(pagination)return original.replace(key,`Menampilkan data ${pagination[1]} - ${pagination[2]} dari ${pagination[3]}`);
 }else{
  const pagination=key.match(/^Menampilkan data (\d+) - (\d+) dari (\d+)$/i);
  if(pagination)return original.replace(key,`Displaying Record ${pagination[1]} - ${pagination[2]} of ${pagination[3]}`);
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
const isLoginPage=!!document.querySelector('.login-wrapper');
const host=isLoginPage?document.body:(document.querySelector('.finova-topbar-right')||document.querySelector('.login-header')||document.querySelector('header')||document.querySelector('.finova-sidebar'));if(!host)return;
const wrap=document.createElement('div');wrap.id='finova-language-switcher';wrap.setAttribute('data-finova-i18n-ignore','');
const style=document.createElement('style');style.textContent=`
#finova-language-switcher{position:relative;display:inline-flex;align-items:center;flex-shrink:0;font-family:inherit;z-index:1100}
#finova-language-switcher *{box-sizing:border-box}
#finova-language-switcher .fl-trigger{display:flex;align-items:center;gap:9px;min-height:37px;padding:5px 10px;border:1px solid #dce5f0;border-radius:11px;background:#fff;color:#183153;box-shadow:0 2px 9px rgba(28,65,117,.055);font:600 12px/1.3 inherit;cursor:pointer;white-space:nowrap;transition:background .16s,border-color .16s,box-shadow .16s}
#finova-language-switcher .fl-trigger:hover{background:#f5f9ff;border-color:#aac6f1}
#finova-language-switcher .fl-trigger:focus-visible,#finova-language-switcher .fl-option:focus-visible{outline:3px solid #a5c8ff;outline-offset:2px}
#finova-language-switcher .fl-flag{display:inline-flex;align-items:center;justify-content:center;flex-shrink:0;width:24px;height:17px;line-height:1}#finova-language-switcher .fl-flag svg{display:block;width:24px;height:16px;border-radius:2px;box-shadow:0 0 0 1px rgba(15,36,67,.15)}
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
${isLoginPage?`
/* Dropdown bahasa berada di luar panel login, di kanan atas viewport. */
#finova-language-switcher{position:fixed;top:24px;right:24px;z-index:12000}
#finova-language-switcher .fl-menu{right:0;left:auto}
@media(max-width:600px){#finova-language-switcher{top:12px;right:12px}}
`:''}
`;document.head.appendChild(style);
function flagSvg(code){
 if(code==='id')return '<svg viewBox="0 0 24 16" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Bendera Indonesia"><path fill="#fff" d="M0 0h24v16H0z"/><path fill="#e31b23" d="M0 0h24v8H0z"/></svg>';
 return '<svg viewBox="0 0 60 40" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="United Kingdom flag"><rect width="60" height="40" fill="#012169"/><path d="M0 0 60 40M60 0 0 40" stroke="#fff" stroke-width="9"/><path d="M0 0 60 40M60 0 0 40" stroke="#c8102e" stroke-width="4"/><path d="M30 0v40M0 20h60" stroke="#fff" stroke-width="13"/><path d="M30 0v40M0 20h60" stroke="#c8102e" stroke-width="7"/></svg>';
}
wrap.innerHTML=`<button type="button" class="fl-trigger" aria-haspopup="listbox" aria-expanded="false" aria-label="Pilih bahasa / Select language"><span class="fl-flag"></span><span class="fl-name"></span><span class="fl-code"></span><svg class="fl-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg></button><div class="fl-menu" role="listbox" aria-label="Bahasa / Language"><div class="fl-heading">Bahasa / Language</div><button type="button" class="fl-option" role="option" data-lang="id"><span class="fl-flag">${flagSvg("id")}</span><span class="fl-option-text"><span class="fl-option-name">Bahasa Indonesia</span><span class="fl-option-sub">Indonesia · ID</span></span><span class="fl-check" aria-hidden="true"></span></button><button type="button" class="fl-option" role="option" data-lang="en"><span class="fl-flag">${flagSvg("en")}</span><span class="fl-option-text"><span class="fl-option-name">English</span><span class="fl-option-sub">English · EN</span></span><span class="fl-check" aria-hidden="true"></span></button></div>`;
const trigger=wrap.querySelector('.fl-trigger');const options=[...wrap.querySelectorAll('.fl-option')];
function render(){wrap.querySelector('.fl-trigger .fl-flag').innerHTML=flagSvg(lang);wrap.querySelector('.fl-name').textContent=lang==='id'?'Indonesia':'English';wrap.querySelector('.fl-code').textContent=lang.toUpperCase();for(const option of options){const selected=option.dataset.lang===lang;option.setAttribute('aria-selected',String(selected));option.querySelector('.fl-check').textContent=selected?'✓':'';}}
function close(){wrap.classList.remove('fl-open');trigger.setAttribute('aria-expanded','false')}
trigger.addEventListener('click',()=>{const opening=!wrap.classList.contains('fl-open');wrap.classList.toggle('fl-open',opening);trigger.setAttribute('aria-expanded',String(opening));});
for(const option of options)option.addEventListener('click',()=>{lang=option.dataset.lang;try{localStorage.setItem(storageKey,lang)}catch(_){}document.documentElement.lang=lang;render();close();translateAll();window.dispatchEvent(new CustomEvent("finova:language-changed",{detail:{language:lang}}));trigger.focus()});
document.addEventListener('pointerdown',event=>{if(!wrap.contains(event.target))close()});document.addEventListener('keydown',event=>{if(event.key==='Escape')close()});
render();host.prepend(wrap);
}
// Performance: translate only nodes changed by the application, not the whole document.
// Disconnect during our own text/attribute writes to prevent recursive observer work.
const observerOptions={subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:['placeholder','title','aria-label']};
const pendingRoots=new Set();
let scheduled=false;
function translateAll(){
 observer.disconnect();
 try{attachSwitcher();translateTree(document.body)}
 finally{observer.observe(document.body,observerOptions)}
}
function flushTranslations(){
 scheduled=false;
 if(!pendingRoots.size)return;
 const roots=Array.from(pendingRoots);pendingRoots.clear();
 observer.disconnect();
 try{
  if(!document.getElementById('finova-language-switcher'))attachSwitcher();
  for(const root of roots){
   if(root!==document.body && !root.isConnected)continue;
   if(root.nodeType===1 && root.closest('#finova-language-switcher'))continue;
   // Skip a child when its ancestor is already being translated.
   if(roots.some(other=>other!==root && other.nodeType===1 && other.contains(root)))continue;
   translateTree(root);
  }
 }finally{observer.observe(document.body,observerOptions)}
}
const observer=new MutationObserver(records=>{
 for(const record of records){
  if(record.type==='childList'){
   for(const node of record.addedNodes){
    if(node.nodeType===1||node.nodeType===3)pendingRoots.add(node);
   }
  }else if(record.type==='characterData'){
   pendingRoots.add(record.target);
  }else if(record.type==='attributes'){
   pendingRoots.add(record.target);
  }
 }
 if(pendingRoots.size && !scheduled){scheduled=true;requestAnimationFrame(flushTranslations)}
});
function init(){document.documentElement.lang=lang;attachSwitcher();translateTree(document.body);observer.observe(document.body,observerOptions);}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();