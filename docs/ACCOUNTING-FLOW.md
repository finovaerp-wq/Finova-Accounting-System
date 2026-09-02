# Alur Akuntansi

## Tujuan

FINOVA adalah ERP yang berfokus pada proses keuangan dan akuntansi. Alur
utama yang digunakan adalah:

``` text
Master Data
   ↓
Transaksi AP / AR
   ↓
Pembayaran / Penyelesaian
   ↓
GL Journal
   ↓
General Ledger
   ↓
Trial Balance
   ↓
Laporan Keuangan
```

GL Journal menjadi pusat pencatatan dan jejak audit antara transaksi
operasional dan laporan akuntansi.

## Ketergantungan Master Data

### Business Partner

-   AP menggunakan Business Partner dengan tipe Vendor.
-   AR menggunakan Business Partner dengan tipe Customer.
-   Business Partner berstatus Inactive tidak boleh dipilih untuk
    transaksi baru.

### Chart of Accounts

Akun yang digunakan untuk posting transaksi harus berstatus aktif dan
mengizinkan transaksi.

### Tax Master

Tax Master menentukan jenis pajak, tarif pajak, dan akun akuntansi yang
digunakan pada transaksi AP/AR.

### Term of Payment

Term of Payment digunakan untuk perhitungan jatuh tempo dan aging.

## Alur AP Invoice

Secara konsep:

``` text
Vendor Invoice
→ AP Header + Detail
→ validasi total/pajak
→ proses complete/post
→ generate GL Journal
→ source_module = AP
→ source_document_type = AP_INVOICE
```

Konvensi deskripsi otomatis:

``` text
[AUTO] INV AP
<deskripsi header AP>
```

GL Journal tidak boleh dibuat dua kali apabila dokumen AP sudah memiliki
jurnal yang terhubung.

### Accounting Date AP Invoice

Accounting period AP Invoice ditentukan berdasarkan:

``` text
Date Received
```

Hanya Date Received yang berada pada accounting period berstatus `Open`
yang boleh diproses.

## Alur AP Payment (Di Dalam Account Payable)

AP Payment diproses langsung dari module Account Payable. Tidak ada lagi
module atau route AP Payment standalone.

Secara konsep:

``` text
AP Invoice
→ buka Payment dari Account Payable
→ input Payment Date
→ validasi accounting period
→ simpan pembayaran
→ kurangi outstanding payable
→ update status pembayaran AP
→ generate GL Journal pembayaran
→ source_module = AP
→ source_document_type = AP_PAYMENT
```

Accounting period AP Payment ditentukan berdasarkan:

``` text
Payment Date
```

Data transaksi payment, modal payment, service payment, dan integrasi GL
Journal tetap menjadi bagian dari proses Account Payable.

## Alur AR Invoice

Secara konsep:

``` text
Customer Invoice
→ AR Header + Detail
→ validasi total/pajak
→ proses complete/post
→ generate GL Journal
→ source_module = AR
→ source_document_type = AR_INVOICE
```

### Accounting Date AR Invoice

Accounting period AR Invoice ditentukan berdasarkan:

``` text
Invoice Date
```

Hanya Invoice Date yang berada pada accounting period berstatus `Open`
yang boleh diproses.

## Alur AR Payment (Di Dalam Account Receivable)

AR Payment diproses langsung dari module Account Receivable. Tidak ada
lagi module atau route AR Payment standalone.

Secara konsep:

``` text
AR Invoice
→ buka Payment dari Account Receivable
→ input Payment Date
→ validasi accounting period
→ simpan pembayaran
→ kurangi outstanding receivable
→ update status pembayaran AR
→ generate GL Journal pembayaran
→ source_module = AR
→ source_document_type = AR_PAYMENT
```

Accounting period AR Payment ditentukan berdasarkan:

``` text
Payment Date
```

Data transaksi payment, modal payment, service payment, dan integrasi GL
Journal tetap menjadi bagian dari proses Account Receivable.

## Dasar Accounting Period

FINOVA menggunakan dasar tanggal berikut:

``` text
Account Payable Invoice     → Date Received
Account Receivable Invoice  → Invoice Date
General Journal             → Accounting Date
AP Payment                  → Payment Date
AR Payment                  → Payment Date
```

Hanya transaksi yang tanggal akuntansinya berada pada periode berstatus
`Open` yang boleh diproses.

``` text
Tanggal Akuntansi Transaksi
        ↓
mst_accounting_period
        ↓
Status Periode
        │
        ├── Open       → BOLEH
        ├── Closed     → BLOK
        └── Belum Open → BLOK
```

Contoh apabila periode aktif adalah September 2026:

``` text
Agustus 2026   → Closed     → tidak boleh input/posting
September 2026 → Open       → boleh input/posting
Oktober 2026   → belum Open → tidak boleh input/posting
```

## Manual GL Journal

Manual GL Journal digunakan untuk pencatatan akuntansi yang tidak
berasal dari transaksi AP/AR.

Accounting period Manual GL Journal ditentukan berdasarkan:

``` text
Accounting Date
```

Journal harus balance sebelum posting.

Status jurnal:

-   Draft --- jurnal masih dapat dikerjakan sesuai aturan sistem.
-   Posted --- jurnal sudah diakui dalam pencatatan akuntansi.
-   Void --- jurnal dibatalkan tetapi tetap dipertahankan untuk audit
    trail.

## General Ledger

General Ledger mengambil pergerakan transaksi dari GL Journal yang telah
diposting dan menampilkan aktivitas Debit/Credit per akun beserta sumber
transaksinya.

## Trial Balance

Trial Balance mengagregasikan saldo GL berdasarkan akun dan
periode/tahun. Total Debit dan Credit harus dapat direkonsiliasi.

## Laporan Keuangan

Balance Sheet, Income Statement, dan Profit & Loss harus menggunakan
klasifikasi/hierarki Chart of Accounts serta saldo akuntansi yang telah
diposting.

## Aging

### Aging Payable

Menggunakan saldo AP yang belum lunas dan Due Date untuk mengelompokkan
kewajiban Vendor ke dalam aging bucket.

### Aging Receivable

Menggunakan saldo AR yang belum lunas dan Due Date untuk mengelompokkan
piutang Customer ke dalam aging bucket.

## Kebutuhan Audit Trail

Untuk setiap jurnal yang dibuat dari transaksi sumber, pertahankan
informasi berikut jika tersedia:

``` text
source_module
source_document_type
source_document_id
source_invoice_no
source_po_no
description
journal_date
status
```

Informasi tersebut memungkinkan transaksi pada GL ditelusuri kembali ke
dokumen AP/AR asalnya.
