import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import TopBar from '../components/TopBar';
import BottomSpacer from '../components/BottomSpacer';
import { useNavigation } from '@react-navigation/native';

export default function PoliticaPrivacidad() {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <TopBar title="Política de privacidad" onBack={() => navigation.navigate('Ajustes')} />

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.text}>
          Esta es la política de privacidad de LectorApp. A continuación se detallan las condiciones bajo las cuales se recopilan, utilizan y protegen los datos de los usuarios.
        </Text>

        <Text style={styles.subtitle}>1. Datos recogidos</Text>
        <Text style={styles.text}>
          Al registrarte, solicitamos tu correo electrónico, nombre de usuario y contraseña. Estos datos son necesarios para identificarte y mantener tu perfil.
        </Text>

        <Text style={styles.subtitle}>2. Contenido generado por el usuario</Text>
        <Text style={styles.text}>
          Puedes subir contenido como reseñas y portadas. Este contenido se almacena en Supabase y está vinculado a tu cuenta.
        </Text>

        <Text style={styles.subtitle}>3. Analítica y uso</Text>
        <Text style={styles.text}>
          Recopilamos información sobre tus hábitos de lectura, como libros leídos, páginas leídas o actividad. Esta información se usa únicamente para mejorar tu experiencia.
        </Text>

        <Text style={styles.subtitle}>4. Almacenamiento</Text>
        <Text style={styles.text}>
          Todos los datos se almacenan en Supabase, una plataforma segura para la gestión de bases de datos.
        </Text>

        <Text style={styles.subtitle}>5. Terceros</Text>
        <Text style={styles.text}>
          No compartimos tus datos con terceros. Si decides comprar un libro a través de Amazon, se abrirá un enlace externo pero no se transfiere información personal.
        </Text>

        <Text style={styles.subtitle}>6. Enlaces de afiliados</Text>
        <Text style={styles.text}>
          Usamos enlaces de afiliado de Amazon. Si haces una compra, podemos recibir una comisión. Esta compra se realiza en la plataforma de Amazon, fuera de LectorApp.
        </Text>

        <Text style={styles.subtitle}>7. Menores de edad</Text>
        <Text style={styles.text}>
          LectorApp está dirigida a todos los públicos. No hay restricciones de edad, pero no recomendamos su uso sin supervisión en menores de 13 años.
        </Text>

        <Text style={styles.subtitle}>8. Derechos del usuario</Text>
        <Text style={styles.text}>
          Puedes eliminar tu cuenta desde la app. Para ejercer cualquier otro derecho relacionado con tus datos, escríbenos a contacto@lectorapp.es.
        </Text>

        <Text style={styles.subtitle}>9. Responsable del tratamiento</Text>
        <Text style={styles.text}>
          El responsable del tratamiento de los datos es el equipo desarrollador de LectorApp.
        </Text>

        <Text style={styles.subtitle}>10. Cambios en esta política</Text>
        <Text style={styles.text}>
          Podemos actualizar esta política. Notificaremos cambios importantes dentro de la app.
        </Text>

        <Text style={[styles.text, { marginTop: 28, color: '#888', fontSize: 13 }]}>Última actualización: 30 de junio de 2025</Text>

        <View style={{ height: 40 }} />
      </ScrollView>

      <BottomSpacer height={24} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff'
  },
  content: {
    paddingHorizontal: 24,
    paddingVertical: 28
  },
  subtitle: {
    fontSize: 17,
    fontWeight: 'bold',
    marginTop: 26,
    marginBottom: 8,
    color: '#222'
  },
  text: {
    fontSize: 15,
    lineHeight: 22,
    color: '#444'
  }
});
