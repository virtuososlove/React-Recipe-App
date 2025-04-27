// Kullanıcı veri tipleri - Uygulama genelinde kullanılan kullanıcı veri yapılarını tanımlar

// Kullanıcı giriş bilgileri - Giriş formu için gerekli alanları tanımlar
export interface LoginCredentials {
  email: string;      // Kullanıcı email adresi
  password: string;   // Kullanıcı şifresi
}

// Kullanıcı tipi - Ana kullanıcı veri yapısını tanımlar
export interface User {
  id: string;         // Kullanıcı ID'si
  email: string;      // Kullanıcı email adresi
  username: string;   // Kullanıcı adı
  password: string;   // Kullanıcı şifresi (Not: Gerçek uygulamada hash'lenmiş olmalı)
  savedRecipes?: string[];  // Kaydedilen tariflerin ID'leri
  createdAt?: Date;   // Hesap oluşturulma tarihi
  updatedAt?: Date;   // Son güncelleme tarihi
} 