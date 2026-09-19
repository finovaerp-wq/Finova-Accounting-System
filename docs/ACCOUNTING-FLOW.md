# Alur Akuntansi FINOVA

## Tujuan

FINOVA berfokus pada proses finance dan accounting dengan GL Journal
sebagai pusat integrasi dan audit trail.

``` text
Master Data
   ↓
AP / AR / Fixed Asset / Manual Journal
   ↓
Payment / Depreciation / Posting
   ↓
GL Journal
   ↓
General Ledger
   ↓
Trial Balance
   ↓
Balance Sheet / Profit & Loss / Financial Statement
```

## Master Data

### Business Partner

-   AP menggunakan Vendor aktif.
-   AR menggunakan Customer aktif.
-   Partner inactive tidak digunakan untuk transaksi baru.

### Chart of Accounts

Posting menggunakan account aktif yang mengizinkan transaksi
(`allow_transaction = true`).

### Tax Master

Menentukan tax type/rate dan accounting mapping yang digunakan
transaksi.

### Term of Payment

Digunakan untuk due date dan aging.

### Accounting Period

Menjadi kontrol tanggal akuntansi transaksi.

## AP Invoice

``` text
Vendor Invoice
→ AP Header + Detail
→ validasi total/tax
→ validasi Accounting Period berdasarkan Date Received
→ proses complete/post sesuai workflow
→ generate GL Journal
→ source_module = AP
→ source_document_type = AP_INVOICE
```

Konvensi deskripsi source-generated journal harus tetap traceable dan
jurnal tidak boleh digandakan untuk source document yang sama.

## AP Payment

AP Payment diproses dari Account Payable.

``` text
AP Invoice
→ Payment
→ Payment Date
→ validasi Accounting Period
→ simpan payment
→ update outstanding/status AP
→ generate GL Journal Payment
→ source_module = AP
→ source_document_type = AP_PAYMENT
```

## AR Invoice

``` text
Customer Invoice
→ AR Header + Detail
→ validasi total/tax
→ validasi Accounting Period berdasarkan Invoice Date
→ proses complete/post sesuai workflow
→ generate GL Journal
→ source_module = AR
→ source_document_type = AR_INVOICE
```

## AR Payment

AR Payment diproses dari Account Receivable.

``` text
AR Invoice
→ Payment
→ Payment Date
→ validasi Accounting Period
→ simpan payment
→ update outstanding/status AR
→ generate GL Journal Payment
→ source_module = AR
→ source_document_type = AR_PAYMENT
```

## Manual GL Journal

Manual journal digunakan untuk transaksi yang tidak berasal dari source
module.

Dasar period: `Accounting Date`.

Journal harus balance sebelum posting. Status utama: - Draft - Posted -
Void

Posted merupakan status yang diakui untuk ledger/report sesuai aturan
laporan FINOVA. Void dipertahankan untuk audit trail dan tidak
diperlakukan sebagai transaksi posted.

## Fixed Asset

Fixed Asset mempunyai master category, master asset, depreciation
transaction, dan integrasi GL Journal.

``` text
Fixed Asset
→ Asset/Category setup
→ Depreciation process
→ trx_fixed_asset_depreciation
→ GL Journal
→ General Ledger
→ Financial Statements
```

Posting depreciation harus menjaga source reference agar journal dapat
ditelusuri kembali ke asset/transaksi depreciation.

## General Ledger

General Ledger mengambil movement dari journal yang telah memenuhi
status posting dan menyajikan debit/credit per account beserta source
transaksi.

## Trial Balance

Trial Balance mengagregasikan saldo GL. Total debit dan credit harus
dapat direkonsiliasi.

## Financial Statements

FINOVA saat ini mempunyai: - Balance Sheet - Profit & Loss - Financial
Statement

Laporan harus menggunakan saldo akuntansi yang valid dan
classification/hierarchy COA yang eksplisit.

## Aging

Aging Payable menggunakan outstanding AP dan Due Date.\
Aging Receivable menggunakan outstanding AR dan Due Date.

Payment yang telah mengurangi outstanding harus tercermin pada aging
sesuai status/balance transaksi.

## Cash Flow Forecast

Cash Flow Forecast merupakan module perencanaan/proyeksi dan bukan
pengganti pencatatan GL aktual. Data forecast harus tetap dibedakan dari
journal accounting aktual.

## Accounting Period Basis

``` text
AP Invoice       → Date Received
AR Invoice       → Invoice Date
Manual GL        → Accounting Date
AP Payment       → Payment Date
AR Payment       → Payment Date
```

Transaksi yang tanggal akuntansinya berada pada period yang tidak
diizinkan harus diblok sesuai rule Accounting Period.

## Multi-Company

Setiap transaksi/master tenant-aware harus mengikuti effective company
context. Database RLS dan tenant guard menjadi enforcement utama; filter
frontend hanya membantu UI.

## Audit Trail

Source-generated journal mempertahankan metadata jika tersedia:

``` text
source_module
source_document_type
source_document_id
source_invoice_no
source_po_no
description
journal_date
status
company_id
```

Tujuannya adalah traceability dari laporan/GL kembali ke transaksi
sumber.
