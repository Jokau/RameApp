import React from 'react'
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'

import { BleManager } from "react-native-ble-plx"
import Svg, { Path, Text as SVGText } from 'react-native-svg'
import { BarChart, Grid, YAxis } from 'react-native-svg-charts'

import { buttons, texts } from '../util/styles'
import * as specs from '../util/specifications'
import * as helpers from '../util/helpers'

const Buffer = require('buffer/').Buffer

/**
 * App Running screen with charts and data
 */
export default class RunningScreen extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      currentDevice: null,
      connected: false,
      running: false,

      oldData: [0, 0, 0, 0],
      currentData: [0],
      devices: [],
      dataHistory: [],

      runningInformation: 'Connexion à l\'appareil...',
    }
  }

  componentDidMount() {
    const device = this.props.navigation.getParam('device', null)
    if (!device) {
      this.showErrorDialog('Erreur de connexion', 'Appareil perdu ou impossible de s\'y connecter. Veuillez réessayer.', false)
    } else {
      this.setState(
        { manager: new BleManager() },
        () => this.startTrackingDevice(device)
      )
    }
  }

  componentWillUnmount() {
    // remove BLE services before closing
    if (this.state.manager) {
      this.state.manager.destroy()
    }
  }

  /**
   * BLE : start monitoring data
   */
  monitorCharacteristic() {
    const { currentDevice, characteristicToMonitor } = this.state
    try {
      const subscription = currentDevice.monitorCharacteristicForService(characteristicToMonitor.serviceUUID, characteristicToMonitor.uuid, (error, characteristic) => {
        if (error) { return }
        // console.log('VALUE ARRAY', Buffer.from(characteristic.value, 'base64'))
        const data = this.extractData(Buffer.from(characteristic.value, 'base64'))
        // console.log('DATA', data)
        const { oldData, currentData } = this.state
        if (data) {
          const { value } = data
          oldData.push(currentData[0]) // add current data
          oldData.shift()              // remove oldest
          this.setState(
            {
              oldData,
              currentData: [value]
            }
          )
          data['timestamp'] = new Date()
          this.state.dataHistory.unshift(data)
        }
      })
      this.setState({ subscription, running: true, })
    } catch (error) {
      console.log(error.message)
      this.showErrorDialog('Erreur de connexion à l\'appareil', 'Le monitoring n\'est plus accessible sur l\'appareil, veuillez relancer le tracking', true)
    }
  }

  /**
   * Extracts data from bytes received according to util/specifications.
   * @param {*} dataByteArray array of received bytes
   */
  extractData(dataByteArray) {
    if (!dataByteArray || dataByteArray.length !== dataByteArray[specs.SIZE_BYTE] || dataByteArray.length !== specs.DATA_LENTGH) {
      console.log('Data size error', "doesn't match specs")
      return null
    } else {
      let i = specs.VALUE_INT_START
      let intValue = '0'
      for (i; i <= specs.VALUE_INT_END; i++) {
        intValue *= 10
        intValue += helpers.asciiToDec(dataByteArray[i])
      }
      let decValue = 0
      i = specs.VALUE_DEC_END
      for (i; i >= specs.VALUE_DEC_START; i--) {
        decValue += helpers.asciiToDec(dataByteArray[i])
        decValue /= 10
      }
      let value = intValue + decValue
      if (specs.codeToDataType[dataByteArray[specs.SIGN_BYTE]] === '-') {
        value = -value
      }
      let type = specs.codeToDataType[dataByteArray[specs.TYPE_BYTE]]
      let seqNb = (dataByteArray[specs.SEQ_NB_START] << 8) + dataByteArray[specs.SEQ_NB_END]
      return { type, value, seqNb }
    }
  }

  /**
   * BLE : connect to specific device if still present
   * @param {*} selectedDevice device to connect
   */
  startTrackingDevice(selectedDevice) {
    // start BLE scan and look for the selected device to ensure that the device is still present
    this.setState({ currentDevice: null })
    this.state.manager.startDeviceScan(selectedDevice.serviceUUIDs, null, (error, device) => {
      if (device.id === selectedDevice.id) {
        this.setState({ currentDevice: device })
        this.state.manager.stopDeviceScan() // selected device found
        // connect and look for services and characteristics
        device.connect()
          .then((device) => {
            this.setState({ runningInformation: 'Recherche des services et caractéristiques...' })
            return device.discoverAllServicesAndCharacteristics()
          })
          .then((device) => {
            return this.state.manager.servicesForDevice(device.id)
          })
          .then((services) => {
            this.setState({ runningInformation: 'Recherche d\'un service à notifications' })
            for (let serviceNb in services) {
              services[serviceNb].characteristics()
                .then((characteristics) => {
                  for (let characteristicNb in characteristics) {
                    const currentCharacteristic = characteristics[characteristicNb]
                    if (currentCharacteristic.isNotifiable) {
                      console.log('Service', currentCharacteristic.serviceUUID, '\nCharacteristics', currentCharacteristic.uuid)
                      this.setState({ connected: true, running: true, characteristicToMonitor: currentCharacteristic })
                      this.monitorCharacteristic()
                    }
                  }
                })
            }
          })
          .catch((error) => {
            console.log(error.message)
            this.showErrorDialog('Erreur de connexion', 'Erreur de transmission avec le périphérique. Veuillez réessayer.', false)
          })
      }
    })
  }

  /**
   * BLE : stop monitoring data
   */
  stopTrackingDevice() {
    const { subscription } = this.state
    if (subscription) {
      subscription.remove()
      this.setState({ running: false })
    }
  }

  /**
   * Displays data charts and values
   */
  renderInterface() {
    // Charts
    const { oldData, currentData } = this.state
    const allData = oldData.concat(currentData[0])
    const bounds = Math.max.apply(null, allData.map(x => Math.abs(x)))
    const Labels = ({ x, y, bandwidth, data }) => (
      data.map((value, index) => (
        <SVGText
          key={index}
          x={x(index) + (bandwidth / 2)}
          y={value > 0 ? y(value) - 10 : y(value) + 10}
          fontSize={14}
          fill={'black'}
          alignmentBaseline={'middle'}
          textAnchor={'middle'}
        >
          {value}
        </SVGText>
      ))
    )
    const LabelsFaded = ({ x, y, bandwidth, data }) => (
      data.map((value, index) => (
        <SVGText
          key={index}
          x={x(index) + (bandwidth / 2)}
          y={value > 0 ? y(value) - 10 : y(value) + 10}
          fontSize={14}
          fill={'gray'}
          alignmentBaseline={'middle'}
          textAnchor={'middle'}
        >
          {value}
        </SVGText>
      ))
    )
    const contentInset = { top: 24, bottom: 24 }
    return (
      <View style={{ flex: 1, flexDirection: 'column' }} >
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', width: '100%', paddingHorizontal: 8, paddingTop: 8 }}>
          <TouchableOpacity onPress={() => { this.goBack() }}>
            <Svg height="32" width="32" viewBox="0 0 24 24">
              <Path
                d="M2,12A10,10 0 0,1 12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22A10,10 0 0,1 2,12M18,11H10L13.5,7.5L12.08,6.08L6.16,12L12.08,17.92L13.5,16.5L10,13H18V11Z"
                fill='white'
                stroke='#42604C'
                strokeWidth="0.5"
              />
            </Svg>
          </TouchableOpacity>
          <Text style={texts.textTitle}>{this.state.currentDevice.localName}</Text>
          <View />
        </View>
        <View style={{ flexDirection: 'row', height: '40%', width: '100%', paddingHorizontal: 4, paddingTop: 4 }} >
          <View style={{ flexDirection: 'row', justifyContent: 'flex-end', height: '100%', width: '8%', paddingRight: 2 }} >
            <YAxis
              data={allData}
              contentInset={contentInset}
              svg={{ fontSize: 10, fill: 'grey' }}
              min={-bounds}
              max={bounds}
            />
          </View>
          <View style={{ flexDirection: 'row', height: '100%', width: '90%' }} >
            <BarChart
              style={{ flex: 4 }}
              data={oldData}
              svg={{ fill: 'rgba(0, 165, 0, 0.4)' }}
              contentInset={contentInset}
              spacing={0.2}
              gridMin={-bounds}
              gridMax={bounds}
            >
              <Grid direction={Grid.Direction.HORIZONTAL} />
              <LabelsFaded />
            </BarChart>
            <BarChart
              style={{ flex: 1 }}
              data={currentData}
              svg={{ fill: 'rgba(0, 165, 0, 1)' }}
              contentInset={contentInset}
              spacing={0.2}
              gridMin={-bounds}
              gridMax={bounds}
              animate
            >
              <Grid direction={Grid.Direction.HORIZONTAL} />
              <Labels />
            </BarChart>
          </View>
        </View>
        <Text style={[texts.textMedium, { alignSelf: 'center' }]}>Dernière valeur reçue</Text>
        <Text style={[texts.textMedium, { alignSelf: 'center', marginBottom: 8 }]}>{currentData}</Text>
        {this.drawButtonInterface()}
        <Text style={[texts.textMedium, { alignSelf: 'center' }]}>Toutes les valeurs</Text>
        <View flexDirection="row" style={{ paddingHorizontal: 8 }}>
          <Text style={{ flex: 1 }}>n° seq</Text>
          <Text style={{ flex: 2 }}>horodatage</Text>
          <Text style={{ flex: 1 }}>type</Text>
          <Text style={{ flex: 1 }}>valeur</Text>
        </View>
        <View style={{ flex: 1 }}>
          <FlatList
            keyExtractor={(item, index) => item.seqNb.toString().concat(item.timestamp.toString())}
            data={this.state.dataHistory}
            ListEmptyComponent={() => {
              return (
                <View style={{ flex: 1, flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'center' }}>
                  <Text>Aucun historique</Text>
                </View>
              )
            }}
            renderItem={({ item }) => {
              return (
                <View flexDirection="row" style={{ flex: 1, marginHorizontal: 8, marginBottom: 4 }}>
                  <Text style={{ flex: 1, color: 'gray' }}> {item.seqNb}</Text>
                  <Text style={{ flex: 2, color: 'gray' }}> {helpers.dateToString(item.timestamp)}</Text>
                  <Text style={{ flex: 1, color: 'gray' }}> {item.type}</Text>
                  <Text style={{ flex: 1, color: 'gray' }}> {item.value}</Text>
                </View>)
            }}
          />
        </View>
      </View>
    )
  }

  /**
   * UI: Control buttons
   */
  drawButtonInterface() {
    return (
      <View style={{ flexDirection: 'row', width: '100%', height: 34, justifyContent: 'space-around', marginVertical: 8 }}>
        {/* Start/Stop */}
        <TouchableOpacity style={buttons.smallButtonView} onPress={() => { this.state.running ? this.stopTrackingDevice() : this.monitorCharacteristic() }}>
          <Svg height="32" width="32" viewBox="0 0 24 24">
            <Path
              d={this.state.running ? "M18,18H6V6H18V18Z" : "M8,5.14V19.14L19,12.14L8,5.14Z"}
              fill='#42604C'
            />
          </Svg>
        </TouchableOpacity>
        {/* Wipe */}
        <TouchableOpacity style={buttons.smallButtonView} onPress={() => this.wipeData()}>
          <Svg height="32" width="32" viewBox="0 0 24 24">
            <Path
              d="M16.24,3.56L21.19,8.5C21.97,9.29 21.97,10.55 21.19,11.34L12,20.53C10.44,22.09 7.91,22.09 6.34,20.53L2.81,17C2.03,16.21 2.03,14.95 2.81,14.16L13.41,3.56C14.2,2.78 15.46,2.78 16.24,3.56M4.22,15.58L7.76,19.11C8.54,19.9 9.8,19.9 10.59,19.11L14.12,15.58L9.17,10.63L4.22,15.58Z"
              fill="#42604C"
            />
          </Svg>
        </TouchableOpacity>
        {/* Save to file */}
        <TouchableOpacity style={buttons.smallButtonView} onPress={() => helpers.saveData(this.state.dataHistory)}>
          <Svg height="32" width="32" viewBox="0 0 24 24">
            <Path
              d="M15,9H5V5H15M12,19A3,3 0 0,1 9,16A3,3 0 0,1 12,13A3,3 0 0,1 15,16A3,3 0 0,1 12,19M17,3H5C3.89,3 3,3.9 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V7L17,3Z"
              fill="#42604C"
            />
          </Svg>
        </TouchableOpacity>
      </View>
    )
  }

  /**
   * UI : dialog error
   * Goes back to Home upon OK pressed
   * @param {string} title title to show
   * @param {string} message message to show
   * @param {boolean} cancellable dilog cancellable, i.e. allow user to stay on the screen
   */
  showErrorDialog(title, message, cancellable) {
    if (cancellable) {
      Alert.alert(
        title,
        message,
        [{ text: 'Menu principal', onPress: () => this.goBack() }, { text: 'Annuler', style: 'cancel' }],
        { cancellable: true },
      )
    } else {
      Alert.alert(
        title,
        message,
        [{ text: 'OK', onPress: () => this.goBack() }],
        { cancelable: false },
      )
    }
  }

  /**
   * Return to home screen
   */
  goBack() {
    this.stopTrackingDevice()
    this.props.navigation.replace('Home') // error => go back to home screen
  }

  /**
   * Clean all data received so far
   */
  wipeData() {
    this.setState({
      currentData: [0],
      oldData: [0, 0, 0, 0],
      dataHistory: [],
    })
  }


  render() {
    if (!this.state.connected) {
      // Loading screen when not connected
      return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size='large' color='#42604C' />
          <Text style={[texts.textMedium, { marginTop: 16 }]}>Connexion à l'appareil...</Text>
        </View>
      )
    }
    return (this.renderInterface())
  }

}