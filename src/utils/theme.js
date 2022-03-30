// Replace css file based on theme
export const setThemeURL = (theme) => {
  const lightURL =
    "/node_modules/primevue/resources/themes/mdc-light-indigo/theme.css"
  const darkURL = lightURL.replace("light", "dark")
  let themeElement = document.getElementById("theme-link")

  if (theme === "light") {
    themeElement?.setAttribute("href", darkURL)
  } else {
    themeElement?.setAttribute("href", lightURL)
  }
}
