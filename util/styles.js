import { StyleSheet } from 'react-native'

const themeColorMain = '#42604C'

const texts = StyleSheet.create({
  textTitle: {
    alignSelf: 'center',
    fontSize: 28,
    color: "#42604C"
  },
  textMedium: {
    marginLeft: 4,
    fontSize: 18,
    color: "#42604C"
  },
})

const buttons = StyleSheet.create({
  buttonView: {
    margin: 4,
    padding: 4,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderRadius: 4,
    borderWidth: 0.5,
    borderColor: '#42604C',
  },
  smallButtonView: {
    padding: 2,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 4,
    borderWidth: 0.5,
    borderColor: '#42604C',
  }
})

const lists = StyleSheet.create({
  listItem: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderRadius: 4,
    borderWidth: 0.5,
    borderColor: '#42604C',
    paddingTop: 8,
    paddingBottom: 8,
  }
})

export { themeColorMain, texts, buttons, lists }
