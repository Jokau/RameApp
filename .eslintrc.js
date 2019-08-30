module.exports = {
  env: {
    node: true,
    browser: true,
    es6: true,
  },
  extends: [
    "airbnb"
  ],
  parser: "babel-eslint", 
  rules: {
    "no-use-before-define": "off",
    "react/jsx-filename-extension": "off",
    "react/prop-types": "off",
    "comma-dangle": "off",
    "semi": "off",
    "react/destructuring-assignment": "off"
  }
}
