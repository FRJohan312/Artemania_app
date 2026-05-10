import React from 'react';
import { View, Text, StyleSheet, Modal, ScrollView, TouchableOpacity } from 'react-native';
import { useTheme } from '../context/ConfigContext';

interface TermsModalProps {
  visible: boolean;
  onClose: (accepted: boolean) => void;
}

export default function TermsModal({ visible, onClose }: TermsModalProps) {
  const { colors } = useTheme();

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>Términos y Condiciones</Text>
          <ScrollView style={[styles.termsScroll, { backgroundColor: colors.background, borderColor: colors.border }]} contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={true}>
            <Text style={[styles.termsLongText, { color: colors.textSecondary }]}>
              <Text style={{ fontSize: 22, fontWeight: '900', color: colors.primary }}>
                🎨 Bienvenido a Artemanía
              </Text>

              {'\n\n'}

              <Text style={{ fontWeight: 'bold', textDecorationLine: 'underline', color: colors.textPrimary }}>
                1. Aceptación de los términos
              </Text>
              {'\n'}
              Al crear una cuenta o utilizar la plataforma, aceptas cumplir estos{' '}
              <Text style={{ fontWeight: 'bold' }}>Términos y Condiciones</Text> y nuestra{' '}
              <Text style={{ fontWeight: 'bold' }}>Política de Privacidad</Text>.
              El uso continuo de Artemanía constituye una aceptación legal y vinculante de todas las normas aquí descritas.

              {'\n\n'}

              <Text style={{ fontWeight: 'bold', textDecorationLine: 'underline', color: colors.textPrimary }}>
                2. Naturaleza de la plataforma
              </Text>
              {'\n'}
              Artemanía es un{' '}
              <Text style={{ fontWeight: 'bold' }}>marketplace comunitario</Text> y una{' '}
              <Text style={{ fontWeight: 'bold' }}>red social artística</Text> diseñada para conectar artesanos, artistas y compradores.

              {'\n\n'}

              <Text style={{ fontWeight: 'bold', color: colors.primary }}>
                ⚠️ Importante:
              </Text>{' '}
              Artemanía actúa únicamente como intermediario digital entre usuarios.

              {'\n\n'}

              <Text style={{ fontWeight: 'bold', textDecorationLine: 'underline', color: colors.textPrimary }}>
                3. Tipos de usuarios
              </Text>

              {'\n\n'}

              <Text style={{ fontWeight: 'bold', color: colors.primary }}>
                👨‍🎨 Artesanos
              </Text>
              {'\n'}
              • Crear tiendas virtuales.
              {'\n'}
              • Publicar productos y obras.
              {'\n'}
              • Gestionar ventas y estadísticas.
              {'\n'}
              • Compartir tutoriales y clases.

              {'\n\n'}

              <Text style={{ fontWeight: 'bold', color: colors.primary }}>
                🛍️ Clientes
              </Text>
              {'\n'}
              • Explorar productos.
              {'\n'}
              • Comprar y guardar favoritos.
              {'\n'}
              • Seguir artistas.
              {'\n'}
              • Publicar reseñas y comentarios.

              {'\n\n'}

              <Text style={{ fontWeight: 'bold', color: colors.primary }}>
                🛡️ Administradores
              </Text>
              {'\n'}
              • Moderar contenido.
              {'\n'}
              • Revisar reportes.
              {'\n'}
              • Suspender cuentas que incumplan las normas.

              {'\n\n'}

              <Text style={{ fontWeight: 'bold', textDecorationLine: 'underline', color: colors.textPrimary }}>
                4. Normas de la comunidad
              </Text>
              {'\n'}
              Te comprometes a utilizar Artemanía de forma{' '}
              <Text style={{ fontWeight: 'bold' }}>ética, respetuosa y legal</Text>.

              {'\n\n'}

              <Text style={{ fontWeight: 'bold', color: '#ff6b6b' }}>
                🚫 Está prohibido:
              </Text>
              {'\n'}
              • Publicar contenido ofensivo o discriminatorio.
              {'\n'}
              • Compartir material ilegal o fraudulento.
              {'\n'}
              • Infringir derechos de autor.
              {'\n'}
              • Acosar o amenazar a otros usuarios.
              {'\n'}
              • Compartir spam o contenido engañoso.

              {'\n\n'}

              Estas normas aplican a publicaciones, mensajes, imágenes, comentarios y reseñas.

              {'\n\n'}

              <Text style={{ fontWeight: 'bold', textDecorationLine: 'underline', color: colors.textPrimary }}>
                5. Mercado y transacciones
              </Text>
              {'\n'}
              Artemanía facilita la conexión entre compradores y vendedores, pero la responsabilidad sobre:

              {'\n'}
              • Productos
              {'\n'}
              • Envíos
              {'\n'}
              • Garantías
              {'\n'}
              • Calidad
              {'\n'}
              • Tiempos de entrega

              {'\n\n'}

              recae exclusivamente en el{' '}
              <Text style={{ fontWeight: 'bold' }}>artesano vendedor</Text>.

              {'\n\n'}

              <Text style={{ fontWeight: 'bold', color: '#ff6b6b' }}>
                ⚠️ Artemanía no se hace responsable
              </Text>{' '}
              por pérdidas, daños, retrasos o disputas comerciales entre usuarios.

              {'\n\n'}

              <Text style={{ fontWeight: 'bold', textDecorationLine: 'underline', color: colors.textPrimary }}>
                6. Contenido generado por el usuario
              </Text>
              {'\n'}
              Los usuarios conservan los derechos sobre sus imágenes, publicaciones y reseñas.

              {'\n\n'}

              Al subir contenido, autorizas a Artemanía a:
              {'\n'}
              • Mostrarlo dentro de la plataforma.
              {'\n'}
              • Almacenarlo de forma segura.
              {'\n'}
              • Utilizarlo para el funcionamiento normal del servicio.

              {'\n\n'}

              <Text style={{ fontWeight: 'bold' }}>
                Tú eres responsable del contenido que publicas.
              </Text>

              {'\n\n'}

              <Text style={{ fontWeight: 'bold', textDecorationLine: 'underline', color: colors.textPrimary }}>
                7. Chat, publicaciones y reseñas
              </Text>
              {'\n'}
              La plataforma permite interacción mediante:
              {'\n'}
              • Chat integrado.
              {'\n'}
              • Comentarios.
              {'\n'}
              • Publicaciones en el muro.
              {'\n'}
              • Reseñas con imágenes.

              {'\n\n'}

              Todo contenido debe mantener un ambiente{' '}
              <Text style={{ fontWeight: 'bold' }}>seguro y respetuoso</Text> para la comunidad.

              {'\n\n'}

              <Text style={{ fontWeight: 'bold', textDecorationLine: 'underline', color: colors.textPrimary }}>
                8. Sistema de reportes y moderación
              </Text>
              {'\n'}
              Los usuarios pueden reportar contenido inapropiado o comportamientos abusivos.

              {'\n\n'}

              Artemanía se reserva el derecho de:
              {'\n'}
              • Eliminar publicaciones.
              {'\n'}
              • Restringir funciones.
              {'\n'}
              • Suspender temporalmente cuentas.
              {'\n'}
              • Bloquear permanentemente usuarios.

              {'\n\n'}

              <Text style={{ fontWeight: 'bold', color: '#ff6b6b' }}>
                🚨 El incumplimiento de las normas puede resultar en la suspensión inmediata de la cuenta.
              </Text>

              {'\n\n'}

              <Text style={{ fontWeight: 'bold', textDecorationLine: 'underline', color: colors.textPrimary }}>
                9. Privacidad y datos personales
              </Text>
              {'\n'}
              Artemanía recopila información como:
              {'\n'}
              • Nombre y correo electrónico.
              {'\n'}
              • Dirección de envío.
              {'\n'}
              • Imágenes subidas por usuarios.
              {'\n'}
              • Palabras secretas cifradas para recuperación de cuentas.

              {'\n\n'}

              <Text style={{ fontWeight: 'bold' }}>
                Tu información será utilizada únicamente para el funcionamiento y seguridad de la plataforma.
              </Text>

              {'\n\n'}

              <Text style={{ fontWeight: 'bold', textDecorationLine: 'underline', color: colors.textPrimary }}>
                10. Propiedad intelectual
              </Text>
              {'\n'}
              El nombre Artemanía, su diseño, logotipo, interfaz y funcionalidades están protegidos por leyes de propiedad intelectual.

              {'\n\n'}

              <Text style={{ fontWeight: 'bold' }}>
                No está permitida su reproducción sin autorización previa.
              </Text>

              {'\n\n'}

              <Text style={{ fontWeight: 'bold', textDecorationLine: 'underline', color: colors.textPrimary }}>
                11. Suspensión de cuenta
              </Text>
              {'\n'}
              Artemanía podrá suspender o eliminar cuentas que:
              {'\n'}
              • Incumplan estos términos.
              {'\n'}
              • Realicen actividades fraudulentas.
              {'\n'}
              • Perjudiquen a otros usuarios o a la comunidad.

              {'\n\n'}

              <Text style={{ fontWeight: 'bold', textDecorationLine: 'underline', color: colors.textPrimary }}>
                12. Modificaciones de los términos
              </Text>
              {'\n'}
              Artemanía podrá actualizar estos términos en cualquier momento. Los cambios entrarán en vigencia desde su publicación en la plataforma.

              {'\n\n'}

              <Text style={{ fontWeight: 'bold', textDecorationLine: 'underline', color: colors.textPrimary }}>
                13. Contacto
              </Text>
              {'\n'}
              Para dudas o solicitudes relacionadas con estos términos, podrás comunicarte mediante los canales oficiales de soporte de Artemanía.

              {'\n\n'}

              <Text style={{ fontWeight: '900', color: colors.primary, fontSize: 16 }}>
                💜 Gracias por formar parte de Artemanía.
              </Text>
            </Text>
          </ScrollView>

          <View style={styles.modalActions}>
            <TouchableOpacity
              style={[styles.modalBtn, { backgroundColor: colors.background, borderColor: colors.border }]}
              onPress={() => onClose(false)}
            >
              <Text style={[styles.modalBtnText, { color: colors.textSecondary }]}>No aceptar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalBtn, { backgroundColor: colors.primary, borderColor: colors.primary }]}
              onPress={() => onClose(true)}
            >
              <Text style={[styles.modalBtnText, { color: '#fff' }]}>Aceptar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
  modalContent: { borderRadius: 20, padding: 25, borderWidth: 1, maxHeight: '85%' },
  modalTitle: { fontSize: 22, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  termsScroll: { borderWidth: 1, borderRadius: 12, padding: 15, marginBottom: 20 },
  termsLongText: { fontSize: 14, lineHeight: 24 },
  modalActions: { flexDirection: 'row', gap: 15 },
  modalBtn: { flex: 1, paddingVertical: 16, borderRadius: 12, alignItems: 'center', borderWidth: 1 },
  modalBtnText: { fontSize: 16, fontWeight: 'bold' }
});
