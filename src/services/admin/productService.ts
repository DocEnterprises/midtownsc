import { Product } from '../../components/admin/types';
import { db } from "../../lib/firebase"; // adjust the path to your firebase config
import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";

const productsRef = collection(db, "products");

export const productService = {
  getProducts: async (): Promise<Product[]> => {
    const snapshot = await getDocs(productsRef);
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Product[];
  },

  addProduct: async (product: Omit<Product, "id">): Promise<Product> => {
    const docRef = await addDoc(productsRef, product);
    return {
      id: docRef.id,
      ...product,
    };
  },

  updateProduct: async (
    id: string,
    updates: Partial<Product>
  ): Promise<Product> => {
    const productDoc = doc(db, "products", id);
    await updateDoc(productDoc, updates);
    return {
      ...(updates as Product),
    };
  },

  deleteProduct: async (id: string): Promise<void> => {
    const productDoc = doc(db, "products", id);
    await deleteDoc(productDoc);
  },

  getProductById: async (id: string): Promise<Product | null> => {
    const productDoc = doc(db, "products", id);
    const snapshot = await getDoc(productDoc);
    if (snapshot.exists()) {
      return {
        id: snapshot.id,
        ...snapshot.data(),
      } as Product;
    }
    return null;
  },
};
