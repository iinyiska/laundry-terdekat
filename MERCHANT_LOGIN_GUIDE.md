# Merchant Login Guide 🔐

## Cara Login sebagai Merchant

### Step 1: Ubah Role User menjadi Merchant
1. Login sebagai **Admin** di [/admin](https://laundry-terdekat.vercel.app/admin)
2. Password: `admin123laundry`
3. Klik tab **Users**
4. Pilih user yang mau dijadikan merchant
5. Ubah dropdown role dari **Customer** → **Merchant**
6. Role langsung tersimpan (auto-save, tidak ada tombol save)

### Step 2: Login sebagai Merchant
1. Logout dari admin (jika masih login)
2. Buka [/login](https://laundry-terdekat.vercel.app/login)
3. Login dengan email & password merchant
4. **Otomatis redirect** ke `/merchant/dashboard` ✅

---

## Role-Based Redirect

Setelah login, sistem akan redirect otomatis berdasarkan role:

| Role | Redirect URL | Akses |
|:-----|:------------|:------|
| **Admin** | `/admin` | Full access (manage users, orders, settings) |
| **Merchant** | `/merchant/dashboard` | Manage assigned orders only |
| **Customer** | `/` (Homepage) | Create orders, view own orders |

---

## Access Control

### Merchant Dashboard (`/merchant/dashboard`)
- ✅ **Bisa diakses:** Merchant & Admin
- ❌ **Tidak bisa diakses:** Customer

**Jika customer coba akses:**
1. Muncul notifikasi: "⚠️ Akses ditolak! Hanya Merchant & Admin yang bisa akses halaman ini."
2. Setelah 2 detik, otomatis redirect ke homepage

### Admin Panel (`/admin`)
- ✅ **Bisa diakses:** Admin dengan password
- ❌ **Tidak bisa diakses:** Merchant & Customer

---

## Testing Flow

### Test 1: Login sebagai Admin
```
1. Buka /login
2. Email: iinyiska@gmail.com (atau yoswicaksono@gmail.com)
3. Password: [password akun]
4. Klik "Masuk"
5. ✅ Redirect ke /admin
```

### Test 2: Login sebagai Merchant
```
1. Di Admin Panel → Tab Users
2. Ubah role user X ke "Merchant"
3. Logout
4. Login dengan akun user X
5. ✅ Redirect ke /merchant/dashboard
```

### Test 3: Customer Coba Akses Merchant Dashboard
```
1. Login sebagai customer
2. Manual buka URL: /merchant/dashboard
3. ❌ Muncul notifikasi "Akses ditolak"
4. ✅ Redirect ke homepage setelah 2 detik
```

---

## Merchant Dashboard Features

Setelah login sebagai merchant, kamu bisa:

### 📊 Dashboard Tab
- Lihat stats: Pesanan Aktif, Selesai, Pendapatan, Hari Ini
- Quick Actions: Pesanan Baru, Siap Antar, Refresh
- Recent Orders preview

### 📦 Orders Tab
- Filter by status (10 status options)
- Update order status (dropdown)
- WhatsApp direct link ke customer
- Detail lengkap: Customer, Address, Items, Notes

### 📈 Stats Tab
- Total orders & revenue
- Average order value
- Status distribution chart
- Cancellation rate

### 👤 Profile Tab
- Merchant info (Name, Email, Phone)
- Rating display
- Total orders handled
- Edit profile button

---

## Troubleshooting

### ❓ Login tapi tidak redirect ke merchant dashboard
**Solusi:**
1. Cek role di Admin Panel → Tab Users
2. Pastikan role = "Merchant" (bukan "Customer")
3. Logout dan login ulang

### ❓ Muncul "Akses ditolak" saat buka merchant dashboard
**Solusi:**
1. Role masih "Customer"
2. Minta admin ubah role ke "Merchant"
3. Logout dan login ulang

### ❓ Tidak ada pesanan di merchant dashboard
**Solusi:**
1. Pesanan harus di-assign ke merchant dulu
2. Admin Panel → Tab Orders → Pilih order → Assign to Merchant
3. Setelah di-assign, pesanan muncul di merchant dashboard

---

## Admin: Cara Assign Order ke Merchant

1. Login sebagai admin
2. Tab **Orders**
3. Klik order yang mau di-assign
4. Dropdown **"Assign to Merchant"**
5. Pilih merchant
6. Status otomatis berubah ke "Confirmed"
7. Merchant bisa lihat order di dashboard mereka

---

## Summary

✅ **Admin** → Full control (manage users, orders, settings)  
✅ **Merchant** → Manage assigned orders only  
✅ **Customer** → Create & view own orders  

**Login URL:** [https://laundry-terdekat.vercel.app/login](https://laundry-terdekat.vercel.app/login)

**Merchant Dashboard:** [https://laundry-terdekat.vercel.app/merchant/dashboard](https://laundry-terdekat.vercel.app/merchant/dashboard)
