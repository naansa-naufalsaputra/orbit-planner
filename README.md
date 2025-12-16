# 🌌 Orbit Student Planner (AI-Powered)

![Orbit Dashboard](https://images.unsplash.com/photo-1481627834876-b7833e8f5570?q=80&w=2628&auto=format&fit=crop)

**Orbit** adalah aplikasi Student Planner modern yang ditenagai oleh AI (Google Gemini) untuk membantu mahasiswa mengatur jadwal kuliah, tugas, dan waktu belajar dengan lebih cerdas dan efisien.

## ✨ Fitur Utama

### 🧠 AI yang "Mengerti" Kamu
Orbit tidak hanya menyimpan tugas, tapi membantu kamu menyelesaikannya:
-   **Magic Task Generator**: Malas mengetik langkah tugas? Cukup ketik _"Buat tugas presentasi biologi"_, AI akan memecahnya menjadi checklist lengkap dengan tenggat waktu otomatis.
-   **Personalized Motivation**: Sapaan ramah dan kutipan motivasi unik setiap kali kamu membuka aplikasi, khusus untukmu.
-   **Smart Notes**: Fitur "Perbaiki Tata Bahasa" dan "Ringkas Catatan" bertenaga AI untuk membantumu belajar.

### 📅 Manajemen Waktu Cerdas
-   **Smart Dashboard**: Langsung tampilkan **Jadwal Hari Ini** begitu aplikasi dibuka. Tidak perlu mencari-cari manual.
-   **Focus Mode (Pomodoro)**: Timer 25 menit terintegrasi untuk sesi belajar fokus tanpa gangguan.
-   **Interactive Schedule**: Atur jadwal kuliah mingguan dengan antarmuka yang bersih dan mudah.

### 🎨 Desain Premium & Lokal
-   **Indonesian Language Support**: Sepenuhnya dalam Bahasa Indonesia yang natural.
-   **Modern UI**: Tampilan Dark Mode yang elegan, animasi halus, dan visual yang memanjakan mata.

## 🛠️ Teknologi

Dibuat dengan teknologi web modern:
-   **React + Vite**: Performa super cepat.
-   **Tailwind CSS**: Styling modern dan responsif.
-   **Firebase**: Database Realtime & Authentication.
-   **Google Gemini API**: Otak di balik fitur kecerdasan buatan.

## 🚀 Cara Menjalankan

1.  **Clone Repository**
    ```bash
    git clone https://github.com/naansa-naufalsaputra/orbit-planner.git
    cd orbit-planner
    ```

2.  **Install Dependencies**
    ```bash
    npm install
    ```

3.  **Setup Environment Variables**
    Buat file `.env` dan isi dengan konfigurasi Firebase & Gemini API key kamu:
    ```env
    VITE_GEMINI_API_KEY=your_gemini_key
    VITE_FIREBASE_API_KEY=your_firebase_key
    ...
    ```

4.  **Jalankan Aplikasi**
    ```bash
    npm run dev
    ```

## 📝 Lisensi

Project ini dibuat oleh **Naufal Saputra**. Silakan gunakan untuk tujuan edukasi.
