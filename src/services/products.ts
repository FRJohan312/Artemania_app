// Gestión de obras y productos en la base de datos

export const createProduct = async (data: any) => {
  try {
    const docRef = await addDoc(collection(db, 'productos'), { ...data, estado: 'activo' });
    invalidateCache('products');
    return { success: true, id: docRef.id };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

export const getProduct = async (id: string, refresh = false) => {
  const cacheKey = `product:${id}`;
  const cached = fromCache(cacheKey, refresh);
  if (cached) return cached;

  try {
    const docSnap = await getDoc(doc(db, 'productos', id));
    if (docSnap.exists()) {
      const result = { data: { id: docSnap.id, ...docSnap.data() }, error: null };
      toCache(cacheKey, result);
      return result;
    }
    return { data: null, error: 'Producto no encontrado' };
  } catch (error: any) {
    return { data: null, error: error.message };
  }
};

export const getProducts = async (artesanoId?: string, includePrivate = false, refresh = false) => {
  const cacheKey = `products:${artesanoId || 'all'}:${includePrivate}`;
  // TTL medio: los productos cambian con moderación, 1h es un buen balance
  const cached = fromCache(cacheKey, refresh, CACHE_TIMES.MEDIUM);
  if (cached) return cached;

  try {
    const q = artesanoId
      ? query(collection(db, 'productos'), where('artesanoId', '==', artesanoId))
      : query(collection(db, 'productos'));

    const querySnapshot = await getDocs(q);
    let products = querySnapshot.docs.map(d => ({ id: d.id, ...d.data() }));

    if (!artesanoId) {
      // Filtramos productos para el marketplace, mostrando solo los activos
      products = products.filter((p: any) => !p.estado || p.estado === 'activo');
    } else if (!includePrivate) {
      // Filtramos para perfiles públicos, solo los productos activos
      products = products.filter((p: any) => !p.estado || p.estado === 'activo');
    } else {
      // Filtramos para gestión propia, ocultando los que el artesano haya marcado como no visibles
      products = products.filter((p: any) => !p.ocultoPorArtesano);
    }

    const result = { data: products, error: null };
    toCache(cacheKey, result);
    return result;
  } catch (error: any) {
    return { data: null, error: error.message };
  }
};

export const updateProduct = async (productId: string, data: any) => {
  try {
    await setDoc(doc(db, 'productos', productId), data, { merge: true });
    invalidateCache('products');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

export const deleteProduct = async (productId: string) => {
  try {
    const productRef = doc(db, 'productos', productId);
    const productSnap = await getDoc(productRef);
    const productData = productSnap.data();

    const batch = writeBatch(db);

    // Limpiamos los datos del producto y sus fotos
    batch.delete(productRef);

    // Borramos también las reseñas que tuviera
    const reviewsSnap = await getDocs(query(collection(db, 'resenas'), where('productId', '==', productId)));
    reviewsSnap.forEach(d => batch.delete(d.ref));

    // Lo sacamos de las listas de favoritos de los usuarios
    const favoritesSnap = await getDocs(collection(db, 'favoritos'));
    favoritesSnap.forEach(favDoc => {
      const data = favDoc.data();
      if (data.productos && Array.isArray(data.productos)) {
        if (data.productos.some((p: any) => p.id === productId)) {
          batch.update(favDoc.ref, { productos: data.productos.filter((p: any) => p.id !== productId) });
        }
      }
    });

    // Y lo quitamos de los carritos que lo tuvieran pendiente
    const cartsSnap = await getDocs(collection(db, 'carritos'));
    cartsSnap.forEach(cartDoc => {
      const data = cartDoc.data();
      if (data.productos && Array.isArray(data.productos)) {
        if (data.productos.some((p: any) => p.id === productId)) {
          const newProductos = data.productos.filter((p: any) => p.id !== productId);
          const newTotal = newProductos.reduce(
            (sum: number, item: any) => sum + Number(item.precio) * (item.cantidad || 1),
            0
          );
          batch.update(cartDoc.ref, { productos: newProductos, total: newTotal });
        }
      }
    });

    await batch.commit();

    // Por último, borramos los archivos físicos de las imágenes en la nube
    if (productData?.imagen) await deleteImageAsync(productData.imagen);
    if (productData?.imagenes?.length) {
      await Promise.all(productData.imagenes.map((url: string) => deleteImageAsync(url)));
    }

    invalidateCache('products');
    invalidateCache('reviews');
    invalidateCache(`reviews:${productId}`);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};
