import { Alert } from 'react-native'

const RNFS = require('react-native-fs')

/**
 * ascii value to number
 * @param {*} ascii 
 */
function asciiToDec(ascii) {
  return ascii - 48
}

/**
 * Date formatter
 * @param {*} date date to format
 * @param {boolean} isFileName file title format needed
 */
function dateToString(date, isFileName = false) {
  const year = date.getFullYear()
  const month = parseInt(date.getMonth() + 1, 10) > 9 ? date.getMonth() + 1 : '0'.concat(date.getMonth() + 1)
  const day = parseInt(date.getDate(), 10) > 9 ? date.getDate() : '0'.concat(date.getDate())
  const hour = parseInt(date.getHours(), 10) > 9 ? date.getHours() : '0'.concat(date.getHours())
  const min = parseInt(date.getMinutes(), 10) > 9 ? date.getMinutes() : '0'.concat(date.getMinutes())
  const sec = parseInt(date.getSeconds(), 10) > 9 ? date.getSeconds() : '0'.concat(date.getSeconds())

  if (isFileName) {
    return `${year}_${month}_${day}-${hour}h${min}m${sec}s`
  } else {
    return `${day}/${month}/${year} ${hour}:${min}:${sec}`
  }
}

/**
 * Write all received data to file
 */
function saveData(dataHistory){
  const filename = 'rame_data_'.concat(dateToString(new Date(), true)).concat('.csv')
  const path = RNFS.ExternalDirectoryPath + '/' + filename

  let dataTowrite = ''
  dataHistory.forEach((data) => {
    dataTowrite += (data.seqNb + ',' + dateToString(data.timestamp).replace(' ', ',') + ',' + data.type + ',' + data.value + '\n')
  })

  RNFS.writeFile(path + filename, dataTowrite, 'utf8')
    .then((success) => {
      Alert.alert(
        'Fichier enregistré',
        `Un fichier a été généré à l\'emplacement: ${path}`,
        [{ text: 'OK' }],
        { cancelable: true },
      )
    })
    .catch((err) => {
      console.log(err.message)
      Alert.alert(
        'Enregistrement impossible',
        `Erreur lors de l'écriture du fichier: ${path}`,
        [{ text: 'OK' }],
        { cancelable: true },
      )
    })
}

export { asciiToDec, dateToString, saveData }
