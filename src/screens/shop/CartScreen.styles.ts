import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  container: { flex: 1 },
  listContent: { paddingHorizontal: 15, paddingBottom: 200 },
  
  cartCard: { flexDirection: 'row', borderRadius: 16, marginBottom: 15, padding: 12, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 5, elevation: 2 },
  cartImgWrapper: { width: 80, height: 80, borderRadius: 12, justifyContent: 'center', alignItems: 'center', overflow: 'hidden' },
  cartImgPlaceholder: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  cartImg: { width: '100%', height: '100%', resizeMode: 'cover' },
  cartInfo: { flex: 1, marginLeft: 15, justifyContent: 'space-between' },
  cartHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  itemName: { fontSize: 16, fontWeight: 'bold', flex: 1, marginRight: 10 },
  trashBtn: { padding: 5, marginRight: -5, marginTop: -5 },
  itemArtist: { fontSize: 12, marginBottom: 8 },
  cartBottomRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  itemPrice: { fontSize: 18, fontWeight: '900' },
  qtyControls: { flexDirection: 'row', alignItems: 'center', borderRadius: 20, paddingHorizontal: 5, paddingVertical: 2 },
  qtyBtn: { width: 28, height: 28, justifyContent: 'center', alignItems: 'center', borderRadius: 14, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 1 },
  qtyText: { fontSize: 14, fontWeight: 'bold', marginHorizontal: 12 },
  
  // Footer
  footer: { position: 'absolute', bottom: 85, left: 0, right: 0, padding: 20, borderTopLeftRadius: 25, borderTopRightRadius: 25, shadowOffset: { width: 0, height: -5 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 20 },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  totalLabel: { fontSize: 14, fontWeight: '600' },
  itemCount: { fontSize: 12, marginTop: 2 },
  totalValue: { fontSize: 28, fontWeight: '900' },
  checkoutBtn: { borderRadius: 16, height: 55, justifyContent: 'center', alignItems: 'center', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 5, elevation: 5 },
  checkoutBtnText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  processingRow: { flexDirection: 'row', alignItems: 'center' },
  
  // Empty State
  emptyContainer: { alignItems: 'center', justifyContent: 'center', marginTop: 80 },
  emptyText: { fontSize: 16, textAlign: 'center', marginBottom: 30 },
  exploreBtn: { paddingHorizontal: 25, paddingVertical: 12, borderRadius: 25 },
  exploreBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  
  // Modal Overlay
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center', padding: 30 },
  
  // Processing Modal
  processingCard: { borderRadius: 30, padding: 40, alignItems: 'center', width: '100%', maxWidth: 320, shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.2, shadowRadius: 20, elevation: 15 },
  processingTitle: { fontSize: 20, fontWeight: '800', marginTop: 20 },
  processingSubtitle: { fontSize: 14, marginTop: 8, textAlign: 'center' },
  processingDots: { marginTop: 20 },

  // Success Modal  
  successCard: { borderRadius: 30, padding: 35, alignItems: 'center', width: '100%', maxWidth: 340, shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.2, shadowRadius: 20, elevation: 15 },
  successIconCircle: { width: 90, height: 90, borderRadius: 45, justifyContent: 'center', alignItems: 'center', marginBottom: 15 },
  successTitle: { fontSize: 24, fontWeight: '900', marginBottom: 5 },
  successSubtitle: { fontSize: 14, textAlign: 'center', marginBottom: 20, lineHeight: 20 },
  
  successDetails: { width: '100%', borderRadius: 16, padding: 16, marginBottom: 25 },
  successDetailRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 6 },
  successDetailText: { fontSize: 14, marginLeft: 10, fontWeight: '500' },
  successTotalRow: { borderTopWidth: 1, marginTop: 6, paddingTop: 12 },
  successTotalText: { fontSize: 16, marginLeft: 10, fontWeight: '900' },
  
  successBtn: { flexDirection: 'row', width: '100%', paddingVertical: 16, borderRadius: 14, justifyContent: 'center', alignItems: 'center', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 5, elevation: 5, marginBottom: 12 },
  successBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  successBtnSecondary: { paddingVertical: 12 },
  successBtnSecondaryText: { fontSize: 15, fontWeight: '600' }
});
