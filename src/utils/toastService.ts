// Expect - this keyword & optional message
export function successToast(self, msg = ""): void {
  self.$toast.add({
    severity: "success",
    summary: "Successful",
    detail: msg,
    life: 3000,
  })
}

export function errorToast(self, msg = "Something went wrong!"): void {
  self.$toast.add({
    severity: "error",
    summary: "Failed",
    detail: msg,
    life: 3000,
  })
}

export function infoToast(self, msg = ""): void {
  self.$toast.add({
    severity: "info",
    summary: "Info",
    detail: msg,
    life: 3000,
  })
}

export function warnToast(self, msg = ""): void {
  self.$toast.add({
    severity: "warn",
    summary: "Warning",
    detail: msg,
    life: 3000,
  })
}
