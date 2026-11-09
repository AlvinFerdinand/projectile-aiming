# Projectile Aiming

Game web berbasis HTML5 Canvas. Pemain menarik (drag) untuk menentukan sudut dan kekuatan lemparan, lalu berusaha mengenai target sebanyak mungkin dalam 60 detik.

## Cara Bermain

- Tekan di mana saja pada arena, tarik ke arah yang berlawanan dengan arah lemparan, lalu lepas.
- Panjang tarikan menentukan kekuatan (ditampilkan dalam persen), arah tarikan menentukan sudut.
- Setiap target yang terkena menambah skor dan memindahkan permainan ke level berikutnya dengan posisi target dan rintangan baru.
- Mulai level 2 target bergerak naik-turun, dan jumlah rintangan bertambah setiap dua level.

Kontrol yang sama berlaku untuk mouse dan layar sentuh.

## Menjalankan Secara Lokal

Project memakai ES Modules sehingga harus dibuka melalui web server, bukan langsung lewat `file://`.

```bash
python -m http.server 8000
```

Lalu buka `http://localhost:8000`.

## Struktur Kode

```
index.html          Halaman utama dan overlay menu
style.css           Layout responsif dan pengaturan sentuhan
src/
  main.js           Menyusun semua modul dan alur menu
  config.js         Seluruh konstanta gameplay dan fisika
  game.js           State permainan: aim, tembakan, skor, timer, level
  physics.js        Integrasi gerak dengan gravitasi dan sub-stepping
  collision.js      Deteksi tabrakan lingkaran dan persegi panjang
  shot.js           Hasil tembakan dan simulasi lintasan
  level.js          Generator level beserta validasi bahwa level dapat diselesaikan
  target.js         Entitas target yang dapat bergerak
  renderer.js       Seluruh proses menggambar ke canvas
  overlay.js        Panel DOM untuk layar mulai dan hasil
  core/
    game-loop.js    Game loop dengan fixed timestep
    viewport.js     Penskalaan resolusi logis ke ukuran layar
    drag-input.js   Input drag berbasis Pointer Events
  utils/
    math.js         Fungsi bantu matematika dan vektor
```

## Keputusan Teknis

- **Pemisahan logika dan tampilan.** `Game` tidak mengenal canvas maupun DOM. Input dikirim dalam koordinat dunia, rendering membaca state tanpa mengubahnya.
- **Fixed timestep (1/120 detik).** Fisika berjalan identik di layar 60 Hz maupun 120 Hz, dan hasil simulasi bersifat deterministik.
- **Sub-stepping pada integrasi.** Proyektil cepat tidak bergerak lebih dari 6 px di antara pengecekan tabrakan sehingga tidak bisa menembus rintangan tipis.
- **Satu integrator untuk semua simulasi.** Proyektil sungguhan, garis prediksi, dan validasi level memakai fungsi `advanceBody` yang sama sehingga prediksi selalu konsisten dengan hasil tembakan.
- **Validasi level.** Setiap level acak diuji dengan mencoba kombinasi sudut dan kekuatan. Level yang targetnya tidak dapat dikenai dibuang dan dibuat ulang.
- **Resolusi logis tetap (960×540).** Seluruh perhitungan memakai satuan dunia, lalu di-scale ke layar dengan memperhitungkan `devicePixelRatio`.
- **Pointer Events dan pointer capture.** Mouse, sentuhan, dan pena ditangani satu jalur kode. Drag tetap terbaca walaupun jari keluar dari canvas.
- **Satu proyektil dalam satu waktu.** Mencegah spam tembakan sehingga skor mencerminkan akurasi.

## Library Eksternal

Tidak ada. Seluruh kode ditulis dengan JavaScript murni.
