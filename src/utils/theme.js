export const setThemeURL = (theme) => {
  let rootElement = document.documentElement

  if (theme === "light") {
    rootElement.classList.add("t-light")
    rootElement.classList.remove("t-dark")
  } else {
    rootElement.classList.add("t-dark")
    rootElement.classList.remove("t-light")
  }
}
