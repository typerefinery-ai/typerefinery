// Styles
import "@mdi/font/css/materialdesignicons.css"
import "vuetify/styles"

// Vuetify
import { createVuetify } from "vuetify"

const greenTheme = {
  colors: {
    background: "#FFFFFF",
    surface: "#FFFFFF",
    secondary: "#03DAC6",
    "secondary-darken-1": "#018786",
    error: "#B00020",
    info: "#2196F3",
    success: "#4CAF50",
    warning: "#FB8C00",
    primary: "#c9dea9",
  },
  variables: {}, //ADD AN EMPTY OBJECT
}

const redTheme = {
  colors: {
    background: "#FFFFFF",
    surface: "#FFFFFF",
    secondary: "#03DAC6",
    "secondary-darken-1": "#018786",
    error: "#B00020",
    info: "#2196F3",
    success: "#4CAF50",
    warning: "#FB8C00",
    primary: "#f8cecc",
  },
  variables: {}, //ADD AN EMPTY OBJECT
}

export default createVuetify({
  defaultTheme: "light",
  theme: {
    themes: {
      greenTheme,
      redTheme,
    },
  },
})
// https://vuetifyjs.com/en/introduction/why-vuetify/#feature-guides
