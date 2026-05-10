import { StyleSheet, Dimensions } from 'react-native';

export default StyleSheet.create({
  mainContainer: { flex: 1, backgroundColor: 'transparent' },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  errorText: { fontSize: 18, color: '#666', marginTop: 10 },
  scrollContent: { paddingBottom: 110 },
  
  imageContainer: { width: '100%', height: 350, position: 'relative' },
  productImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  imagePlaceholder: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  
  infoContainer: { padding: 25, borderTopLeftRadius: 35, borderTopRightRadius: 35, marginTop: -35, shadowColor: '#000', shadowOffset: {width: 0, height: -3}, shadowOpacity: 0.05, shadowRadius: 10, elevation: 10 },
  
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 15 },
  title: { fontSize: 28, fontWeight: '800', marginBottom: 8, lineHeight: 34 },
  ratingOverviewRow: { flexDirection: 'row', alignItems: 'center' },
  ratingText: { fontSize: 15, fontWeight: '500' },
  favBtnLg: { borderRadius: 28, width: 56, height: 56, justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 8, elevation: 5 },
  
  metaRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 25 },
  price: { fontSize: 30, fontWeight: '900' },
  categoryBadge: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
  categoryText: { fontWeight: 'bold', fontSize: 14 },
  
  artesanoCardMini: { flexDirection: 'row', alignItems: 'center', padding: 15, borderRadius: 16, borderWidth: 1, marginBottom: 25 },
  artesanoAvatarMini: { width: 46, height: 46, borderRadius: 23, justifyContent: 'center', alignItems: 'center', marginRight: 15, borderWidth: 1, overflow: 'hidden' },
  artesanoImgMini: { width: '100%', height: '100%', resizeMode: 'cover' },
  artesanoInfoMini: { flex: 1 },
  artesanoMiniTitle: { fontSize: 12, marginBottom: 2 },
  artesanoMiniName: { fontSize: 16, fontWeight: 'bold' },
  
  sectionTitle: { fontSize: 20, fontWeight: '800', marginBottom: 12, marginTop: 15 },
  description: { fontSize: 16, lineHeight: 26, marginBottom: 25 },
  
  adminControls: { padding: 20, borderRadius: 16, borderWidth: 1, marginBottom: 25 },
  adminTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 15, flexDirection: 'row', alignItems: 'center' },
  adminBtns: { gap: 12 },
  editBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 14, borderRadius: 12 },
  deleteBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 14, borderRadius: 12 },
  adminBtnText: { color: '#fff', fontWeight: 'bold', marginLeft: 10, fontSize: 16 },
  
  bottomBar: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 15, paddingBottom: 25, flexDirection: 'row', alignItems: 'center', borderTopWidth: 1, shadowColor: '#000', shadowOffset: {width: 0, height: -5}, shadowOpacity: 0.08, shadowRadius: 10, elevation: 20 },
  qtyControls: { flexDirection: 'row', alignItems: 'center', borderRadius: 25, paddingHorizontal: 15, height: 50, marginRight: 15, borderWidth: 1 },
  qtyBtn: { width: 30, height: 30, justifyContent: 'center', alignItems: 'center' },
  qtyText: { fontSize: 18, fontWeight: '900', marginHorizontal: 15 },
  addToCartBtn: { flex: 1, height: 50, borderRadius: 25, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', shadowOffset: {width: 0, height: 3}, shadowOpacity: 0.3, shadowRadius: 5, elevation: 5 },
  addToCartText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  toastContainer: { position: 'absolute', top: 60, alignSelf: 'center', paddingHorizontal: 20, paddingVertical: 12, borderRadius: 25, flexDirection: 'row', alignItems: 'center', shadowColor: '#000', shadowOffset: {width: 0, height: 4}, shadowOpacity: 0.3, shadowRadius: 5, elevation: 10, zIndex: 999 },
  toastText: { color: '#fff', fontSize: 15, fontWeight: 'bold' },
  
  reportBtnLink: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 10, padding: 10 },
  reportBtnText: { marginLeft: 8, fontSize: 13, textDecorationLine: 'underline' },

  // Carousel & Fullscreen Styles
  paginationDots: { position: 'absolute', bottom: 50, alignSelf: 'center', flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.4)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 10 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: 'rgba(0,0,0,0.2)', marginHorizontal: 3 },
  activeDot: { width: 14 },
  
  fullscreenContainer: { flex: 1, backgroundColor: '#000', justifyContent: 'center', alignItems: 'center' },
  closeFullscreen: { position: 'absolute', top: 50, right: 20, zIndex: 10, padding: 10 },
  fullscreenImageWrapper: { width: Dimensions.get('window').width, height: '100%', justifyContent: 'center', alignItems: 'center' },
  fullscreenImage: { width: '100%', height: '80%', resizeMode: 'contain' },
  fullscreenFooter: { position: 'absolute', bottom: 50, width: '100%', alignItems: 'center' },
  fullscreenCount: { color: '#fff', fontSize: 16, fontWeight: 'bold' }
});
