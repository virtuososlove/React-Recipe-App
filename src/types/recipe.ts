// Tarif veri tipleri - Uygulama genelinde kullanılan tarif veri yapılarını tanımlar

// Malzeme tipi - Tariflerde kullanılan malzemeleri tanımlar
export interface Ingredient {
  name: string;        // Malzeme adı
  amount: number;      // Miktar
  unit: string;        // Ölçü birimi
  image: string;       // Malzeme görseli
}

// Kategori tipi - Tarif kategorilerini tanımlar
export interface Category {
  id: string;         // Kategori ID'si
  name: string;       // Kategori adı
  image: string;      // Kategori görseli
}

// Tarif tipi - Ana tarif veri yapısını tanımlar
export interface Recipe {
  id: string;         // Tarif ID'si
  name: string;       // Tarif adı
  image: string;      // Tarif görseli
  category: string;   // Tarif kategorisi
  author: string;     // Tarif yazarı
  servings: number;   // Porsiyon sayısı
  prepTime: number;   // Hazırlama süresi (dakika)
  cookTime: number;   // Pişirme süresi (dakika)
  ingredients: Ingredient[];  // Malzeme listesi
  instructions: string[];     // Yapılış adımları
  tags: string[];            // Etiketler
} 