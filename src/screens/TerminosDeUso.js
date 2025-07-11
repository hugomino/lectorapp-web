import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import TopBar from '../components/TopBar';
import BottomSpacer from '../components/BottomSpacer';
import { useNavigation } from '@react-navigation/native';

export default function TerminosDeUso() {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <TopBar title="Términos de uso" onBack={() => navigation.navigate('Ajustes')} />

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.text}>
          Bienvenido a Lector, la aplicación para llevar el control de tus lecturas.
          Al utilizar esta aplicación, aceptas los siguientes términos y condiciones:
        </Text>

        <Text style={styles.subtitle}>1. Uso de la aplicación</Text>
        <Text style={styles.text}>
          Esta app está diseñada para ayudarte a registrar y gestionar tus hábitos de lectura.
          No está permitido hacer un uso fraudulento, automatizado o que afecte a la experiencia de otros usuarios.
        </Text>

        <Text style={styles.subtitle}>2. Propiedad intelectual</Text>
        <Text style={styles.text}>
          El diseño, nombre y funcionalidades de la app pertenecen a sus desarrolladores.
          No está permitido copiar, modificar o redistribuir la app sin autorización.
        </Text>

        <Text style={styles.subtitle}>3. Contenido generado por el usuario</Text>
        <Text style={styles.text}>
          Los usuarios pueden subir reseñas, imágenes de portada y valoraciones.
          Te comprometes a no subir contenido ofensivo, ilegal o que infrinja derechos de terceros.
        </Text>

        <Text style={styles.subtitle}>4. Enlaces externos</Text>
        <Text style={styles.text}>
          Algunos libros pueden incluir un botón para comprarlos en Amazon a través de un enlace de afiliado.
          Al pulsar ese botón, se te redirigirá fuera de la app.
          No nos hacemos responsables del contenido o funcionamiento de sitios externos.
        </Text>

        <Text style={styles.subtitle}>5. Limitación de responsabilidad</Text>
        <Text style={styles.text}>
          Esta aplicación se ofrece "tal cual". No garantizamos disponibilidad permanente, ausencia de errores o pérdidas de datos.
          No nos responsabilizamos de cualquier daño derivado del uso de la app.
        </Text>

        <Text style={styles.subtitle}>6. Cambios en los términos</Text>
        <Text style={styles.text}>
          Podemos actualizar estos términos ocasionalmente. Te notificaremos cualquier cambio importante a través de la app o del correo electrónico si fuera necesario.
        </Text>

        <Text style={styles.subtitle}>7. Contacto</Text>
        <Text style={styles.text}>
          Si tienes preguntas sobre estos términos, puedes escribirnos a contacto@lectorapp.es.
        </Text>

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
