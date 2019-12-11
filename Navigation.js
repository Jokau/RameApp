import HomeScreen from "./screens/HomeScreen"
import RunningScreen from "./screens/RunningScreen"
import { createAppContainer } from "react-navigation"
import { createStackNavigator } from "react-navigation-stack"

/**
 * App Navigation between screens
 */
const Navigation = createStackNavigator(
  {
    Home: {
      screen: HomeScreen,
      navigationOptions: {
        header: null,
      },
    },
    Running: {
      screen: RunningScreen,
      navigationOptions: {
        header: null,
      },
    },
  },
)

export default createAppContainer(Navigation)
