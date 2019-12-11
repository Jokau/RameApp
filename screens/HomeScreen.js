import React from 'react'
import Svg, { Path, Rect } from 'react-native-svg'
import { BleManager } from 'react-native-ble-plx'

import {
  ActivityIndicator,
  Alert,
  Button,
  FlatList,
  Modal,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'

import { buttons, lists, texts } from '../util/styles'

/**
 * App HomeScreen
 * Scans and shows devices to connect to
 */
export default class HomeScreen extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      modalVisible: false,
      devices: [],
      runningInformation: 'Recherche d\'appareils à proximité...',
    }
  }
  componentDidMount() {
    this.setState({ manager: new BleManager()})
  }
  
  componentWillUnmount() {
    // remove BLE services before closing
    if (this.state.manager) {
      this.state.manager.destroy()
    }
  }

  /**
   * BLE : scan devices 
   */
  scanAndDisplaySelectDevices() {
    this.setState({ modalVisible: true }) // Open device list pop-up
    this.state.manager.startDeviceScan(null, null, (error, device) => {
      if (device && !this.state.devices.find(d => d.id === device.id)) {
        // new device found, add to list
        this.setState(state => ({ devices: state.devices.concat([device]) }))
      }
      if (error) {
        this.setState({ modalVisible: false })
        Alert.alert(
          'Services indisponibles',
          'Vérifiez que le Bluetooth et le service de localisation sont activés et que les permissions ont été accordées.',
          [{ text: 'OK' }],
          { cancelable: true },
        )
        return
      }
    })
  }

  /**
   * UI Modal : scanned devices list
   * On pressed item, go to Running Screen
   */
  drawModal() {
    return (
      <Modal
        visible={this.state.modalVisible}
        transparent
        onRequestClose={() => {
          this.state.manager.stopDeviceScan()
          console.log('Stop scan back pressed')
          this.setState({ modalVisible: false, devices: [] })
        }}
        animationType="slide"
      >
        <View style={{ flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
          <View style={{ flex: 1, marginTop: 48, marginBottom: 48, marginLeft: 16, marginRight: 16, padding: 16, flexDirection: 'column', justifyContent: 'flex-start', backgroundColor: 'white' }}>
            <View style={{ flex: 1, flexDirection: 'column', justifyContent: 'flex-start' }}>
              <Text style={{ fontSize: 18, color: '#42604C' }}>Choisir un appareil</Text>
              <FlatList
                style={{ flex: 1, marginTop: 8 }}
                data={this.state.devices}
                ListEmptyComponent={() => {
                  return (
                    <View style={{ flex: 1, flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'center' }}>
                      <ActivityIndicator size='large' color='#42604C' />
                      <Text>{this.state.runningInformation}</Text>
                    </View>
                  )
                }}
                renderItem={({ item }) => {
                  return (
                    <View flexDirection="row" justifyContent="space-between" alignItems="center" style={{ marginBottom: 4 }}>
                      <TouchableOpacity style={lists.listItem} onPress={() => { console.log("DEVICE HOME", item); this.props.navigation.replace('Running', { device: item })}} >
                        <Text style={texts.textMedium}>{item.localName}</Text>
                        <Text style={texts.textMedium}>{item.id}</Text>
                      </TouchableOpacity>
                    </View>)
                }}
              />
            </View>
            <Button title="Annuler" color="#42604C" onPress={() => {
              console.log('Stop scan button')
              this.state.manager.stopDeviceScan()
              this.setState({ modalVisible: false, devices: [] })
            }} />
          </View>
        </View>
      </Modal>
    )
  }

  /**
   * UI Button : Select devices
   */
  drawSelectDeviceButton() {
    return (
      <TouchableOpacity onPress={() => this.scanAndDisplaySelectDevices()}>
        <View style={buttons.buttonView}>
          <Text style={texts.textMedium}>Choisir un appareil</Text>
          <Svg height="56" width="56" viewBox="0 0 24 24">
            <Rect
              width="12.0"
              height="12.0"
              x="2.0"
              y="10.0"
              fill="white"
              stroke="#42604C"
            />
            <Path
              d="M 7.884473,16.493668 C 7.129344,17.253072 6.374215,18.012438 5.619086,18.771842 5.521156,18.671313 5.423227,18.570396 5.325296,18.469866 6.153143,17.63749 6.981013,16.805115 7.808881,15.972739 6.95505,15.102946 6.039365,14.189099 5.344178,13.457641 c 0.08155,-0.117219 0.172792,-0.182428 0.275147,-0.29072 0.749675,0.757309 1.499351,1.514656 2.249027,2.271964 0.01363,-1.326638 0.02722,-2.653316 0.04085,-3.979954 0.87665,0.804506 1.753278,1.609052 2.629907,2.413598 -0.70652,0.698931 -1.413018,1.397902 -2.119518,2.096872 l 2.119261,2.09761 c -0.846258,0.782111 -1.695875,1.561311 -2.551964,2.332515 l -0.0981,0.07375 c -0.0015,-1.384162 -0.0028,-2.560317 -0.0043,-3.979606 z M 9.88876,18.054319 C 9.34413,17.473694 8.904871,17.054304 8.296924,16.454077 c -0.0086,1.007739 -9.55e-4,2.047035 0.0383,3.03754 0.562836,-0.478892 1.01598,-0.918699 1.553536,-1.437298 z m 0,-4.169797 c 0,-0.03493 -1.495779,-1.417154 -1.55352,-1.437415 -0.06072,1.076325 -0.0383,1.845743 -0.0383,3.037541 0.539997,-0.523297 1.071248,-1.061498 1.591836,-1.600126 z"
              fill="none"
              strokeWidth="0.5"
              stroke="#42604C"
            />
            <Path
              d="M 12.914533,5.4017801 A 5.6836872,5.6836872 0 0 1 18.59822,11.085467"
              fill="none"
              stroke="#42604C"
            />
            <Path
              d="m 12.901425,1.8888559 a 9.2097197,9.2097197 0 0 1 9.209719,9.2097201"
              fill="none"
              stroke="#42604C"
            />
          </Svg>
        </View>
      </TouchableOpacity>
    )
  }

  /**
  * UI image : Rame SVG
  */
  drawRame() {
    return (
      <View style={{ flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'center', marginBottom: 16 }}>
        <Svg height="240" width="240" viewBox="0 0 24 24">
          <Path
            fill="#42604C"
            d="m 1.5307906,23.969071 a 0.32507538,0.32526752 0 0 1 -0.181438,-0.143723 c -0.03402,-0.05673 -0.07182,-0.105901 -0.08316,-0.105901 -0.01134,0 -0.29483595,-0.272317 -0.63125095,-0.605148 -0.604792,-0.590021 -0.612352,-0.605149 -0.627472,-0.775347 -0.0189,-0.170199 -0.01134,-0.181545 0.136078,-0.317704 0.238137,-0.215584 0.317516,-0.253406 0.551873,-0.283663 0.204117,-0.02269 0.35909495,-0.08699 0.44981295,-0.185327 a 1.4325997,1.4334464 0 0 1 0.491393,-0.302574 c 0.151198,-0.0038 0.362875,-0.04917 0.343975,-0.07564 -0.0076,-0.01513 0.0378,-0.05295 0.113399,-0.08321 1.587577,-1.403189 3.228074,-3.120299 4.687133,-4.572656 A 401.71002,401.94745 0 0 0 13.002926,10.266234 C 13.569918,9.7518572 14.083991,9.1315796 14.526244,8.5491238 14.904239,8.0347472 15.168835,7.5771034 15.456111,7.0929843 15.588409,6.8660534 15.675348,6.6429048 15.781186,6.4197561 15.962624,6.0339737 16.21588,5.640627 16.401098,5.3191416 16.612775,4.9825276 16.839571,4.6875175 17.066368,4.3811613 17.349864,3.9878145 17.6636,3.6436361 18.759784,2.5051998 19.137779,2.1194173 20.4721,0.69731755 20.664877,0.48173325 c 0.08316,-0.094555 0.177658,-0.1739803 0.207897,-0.1739803 0.02646,0 0.0945,-0.045386 0.151198,-0.094555 0.09828,-0.098337 0.230577,-0.1399407 0.631251,-0.1966734 0.177657,-0.026475 0.226797,-0.022693 0.260816,0.022693 0.02268,0.030257 0.09828,0.060515 0.166318,0.075644 0.109618,0.018911 0.264596,0.1588516 1.001686,0.89637675 0.982786,0.9909313 0.944986,0.9304164 0.895847,1.467486 -0.04914,0.5143765 -0.151198,0.6278419 -2.336007,2.6740012 -0.317515,0.3403962 -0.70307,0.6618816 -1.035705,0.964456 -0.302396,0.3101388 -0.986566,0.7942579 -1.462839,1.1876047 -0.275936,0.2080199 -0.464934,0.3252675 -0.687951,0.4803369 -0.306175,0.2042378 -0.627471,0.3517428 -0.960106,0.5295053 -0.264596,0.1021189 -0.355315,0.1664159 -0.589672,0.2760992 -0.377994,0.1701963 -0.729529,0.4009093 -1.065944,0.605147 -0.241917,0.1588516 -0.438474,0.313921 -0.619912,0.4538617 -3.080656,2.7836847 -6.0857134,5.9077657 -8.8526344,8.6914507 -1.262502,1.270812 -2.317107,2.326041 -2.339787,2.344952 l -1.115084,1.123307 a 0.27971603,0.27988135 0 0 0 -0.08316,0.170198 2.2037087,2.2050112 0 0 1 -0.366654,0.873684 1.0508251,1.0514462 0 0 0 -0.257037,0.616496 c -0.0038,0.158851 -0.226797,0.465208 -0.359095,0.491683 l -0.143638,0.03404 c -0.03024,0.01135 -0.113398,0 -0.177657,-0.02269 z"
          />
        </Svg>
      </View>
    )
  }

  /* TODO For futur use : setting naviation button
  UI : Setting button
  drawSettingsButton() {
    return (
      <TouchableOpacity onPress={() => null}>
        <View style={buttons.buttonView}>
          <Text style={texts.textMedium}>Paramètres</Text>
          <Svg height="64" width="64" viewBox="0 0 24 24">
            <Path
              d="M12,15.5A3.5,3.5 0 0,1 8.5,12A3.5,3.5 0 0,1 12,8.5A3.5,3.5 0 0,1 15.5,12A3.5,3.5 0 0,1 12,15.5M19.43,12.97C19.47,12.65 19.5,12.33 19.5,12C19.5,11.67 19.47,11.34 19.43,11L21.54,9.37C21.73,9.22 21.78,8.95 21.66,8.73L19.66,5.27C19.54,5.05 19.27,4.96 19.05,5.05L16.56,6.05C16.04,5.66 15.5,5.32 14.87,5.07L14.5,2.42C14.46,2.18 14.25,2 14,2H10C9.75,2 9.54,2.18 9.5,2.42L9.13,5.07C8.5,5.32 7.96,5.66 7.44,6.05L4.95,5.05C4.73,4.96 4.46,5.05 4.34,5.27L2.34,8.73C2.21,8.95 2.27,9.22 2.46,9.37L4.57,11C4.53,11.34 4.5,11.67 4.5,12C4.5,12.33 4.53,12.65 4.57,12.97L2.46,14.63C2.27,14.78 2.21,15.05 2.34,15.27L4.34,18.73C4.46,18.95 4.73,19.03 4.95,18.95L7.44,17.94C7.96,18.34 8.5,18.68 9.13,18.93L9.5,21.58C9.54,21.82 9.75,22 10,22H14C14.25,22 14.46,21.82 14.5,21.58L14.87,18.93C15.5,18.67 16.04,18.34 16.56,17.94L19.05,18.95C19.27,19.03 19.54,18.95 19.66,18.73L21.66,15.27C21.78,15.05 21.73,14.78 21.54,14.63L19.43,12.97Z"
              fill='white'
              strokeWidth="1"
              stroke="#42604C"
            />
          </Svg>
        </View>
      </TouchableOpacity>
    )
  }*/

  render() {
    return (
      <View style={{ flex: 1, flexDirection: 'column', padding: 8, justifyContent: 'space-between' }}>
        {this.drawModal()}
        <View>
          <Text style={[texts.textTitle, { marginBottom: 32 }]}>Rame connectée - HEIG-VD</Text>
        </View>
        {this.drawRame()}
        <View>
          {this.drawSelectDeviceButton()}
          {/*this.drawSettingsButton()*/}
        </View>
      </View>
    )
  }
}
