// utils/orderHelper.ts

export const getOrderStatusInfo = (status: string) => {
  // Normalize status biar gak case-sensitive
  const s = status ? status.toUpperCase() : '';

  switch (s) {
    case 'PENDING':
      return {
        title: "Menunggu Kapster",
        desc: "Sistem sedang mencari kapster terdekat untuk pesanan lu.",
        icon: "🕒",
        color: "#d97706"
      };
    case 'BARBER_ASSIGNED':
      return {
        title: "Kapster Meluncur",
        desc: "Abang barber sedang OTW ke lokasi lu. Ditunggu ya!",
        icon: "🚴",
        color: "#0284c7"
      };
    case 'IN_PROGRESS':
      return {
        title: "Sedang Bekerja",
        desc: "Proses cukur rambut sedang berlangsung di lokasi.",
        icon: "✂️",
        color: "#9333ea"
      };
    case 'COMPLETED':
      return {
        title: "Pesanan Selesai",
        desc: "Terima kasih sudah menggunakan BarberOnCall!",
        icon: "✅",
        color: "#2b9348"
      };
    default:
      return {
        title: "Status Tidak Diketahui",
        desc: "Informasi status tidak tersedia.",
        icon: "❓",
        color: "#666666"
      };
  }
};