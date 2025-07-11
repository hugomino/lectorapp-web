// src/navigation/AppStack.js
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import AppTabs from './AppTabs';
import AddReadingScreen from '../screens/AddReadingScreen';
import AddReadingDetailScreen from '../screens/AddReadingDetailScreen';
import UpdatePageModal from '../screens/UpdatePageModal';
import MarkFinishedModal from '../screens/MarkFinishedModal';
import Ajustes from '../screens/Ajustes';
import FichaLibroScreen from '../screens/FichaLibroScreen';
import FichaAutorScreen from '../screens/FichaAutorScreen';
import ValorarLibroScreen from '../screens/ValorarLibroScreen';
import PantallaValoracionPendiente from '../screens/PantallaValoracionPendiente';
import AddBookScreen from '../screens/AddBookScreen';
import ConfirmAddBookScreen from '../screens/ConfirmAddBookScreen';
import EliminarLecturaActual from '../screens/EliminarLecturaActual';
import EliminarLibroTerminado from '../screens/EliminarLibroTerminado';
import ValoracionesDetalle from '../screens/ValoracionesDetalle';
import PoliticaPrivacidad from '../screens/PoliticaPrivacidad';
import TerminosDeUso from '../screens/TerminosDeUso';
import SoporteCategoria from '../screens/SoporteCategoria';
import EnviarSugerencia from '../screens/EnviarSugerencia';
import LecturasTerminadas from '../screens/LecturasTerminadas';

const Stack = createNativeStackNavigator();

export default function AppStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MainTabs" component={AppTabs} />
      <Stack.Screen name="AddReading" component={AddReadingScreen} />
      <Stack.Screen name="AddReadingDetail" component={AddReadingDetailScreen} />
      <Stack.Screen name="UpdatePageModal" component={UpdatePageModal} />
      <Stack.Screen name="MarkFinishedModal" component={MarkFinishedModal} />
      <Stack.Screen name="Ajustes" component={Ajustes} />
      <Stack.Screen name="FichaLibro" component={FichaLibroScreen} />
      <Stack.Screen name="FichaAutor" component={FichaAutorScreen} />
      <Stack.Screen name="ValorarLibro" component={ValorarLibroScreen} />
      <Stack.Screen name="PantallaValoracionPendiente" component={PantallaValoracionPendiente} />
      <Stack.Screen name="AddBook" component={AddBookScreen} />
      <Stack.Screen name="ConfirmAddBook" component={ConfirmAddBookScreen} />
      <Stack.Screen name="EliminarLecturaActual" component={EliminarLecturaActual} />
      <Stack.Screen name="EliminarLibroTerminado" component={EliminarLibroTerminado} />
      <Stack.Screen name="ValoracionesDetalle" component={ValoracionesDetalle} />
      <Stack.Screen name="PoliticaPrivacidad" component={PoliticaPrivacidad} />
      <Stack.Screen name="TerminosDeUso" component={TerminosDeUso} />
      <Stack.Screen name="SoporteCategoria" component={SoporteCategoria} />
      <Stack.Screen name="EnviarSugerencia" component={EnviarSugerencia} />
      <Stack.Screen name="LecturasTerminadas" component={LecturasTerminadas} />
    </Stack.Navigator>
  );
}
