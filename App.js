import React from 'react'

import {
  ActivityIndicator,
  Alert,
  PermissionsAndroid,
  Platform,
  Text,
  View,
} from 'react-native'

import { themeColorMain, texts } from "./util/styles"
import Navigation from './Navigation'

/**
 * BT Rame App (Android only)
 * Bluetooth LE notification reading
 * Follows specific bytes format : 
 *     [data length (0)][data type (1)][data value sign(2)][ASCII data value(3-8)][sequence number (9-12)]
 * 
 * based on BLE react-native-ble-plx : https://polidea.github.io/react-native-ble-plx/
 * icons from https://materialdesignicons.com/
 * 
 * @author Joël Kaufmann
 */
export default class App extends React.Component {

  componentDidMount() {
    // check permissions
    if (Platform.OS === 'android') {
      PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION,
        PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE
      ])
        .then((result) => {
          if (result['android.permission.ACCESS_COARSE_LOCATION'] !== 'granted'
            || result['android.permission.WRITE_EXTERNAL_STORAGE'] !== 'granted') {
            Alert.alert(
              'Permissions requises',
              'Impossible d\'utiliser l\'application sans avoir accordé les permissions.',
              [{ text: 'OK', onPress: null }],
              { cancelable: false },
            )
          }
        })
    }
  }

  render() {
    return (<Navigation />)
  }
}
