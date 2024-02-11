const path = require("path")
module.exports = {
  version: "1.1",
  title: "Fooocus",
  description: "Minimal Stable Diffusion UI",
  icon: "icon.jpeg",
  menu: async (kernel) => {

    // exception handling for windows amd
    let windowsAmd = (kernel.gpu === "amd" && kernel.platform === "win32")
    let extraFlags = (windowsAmd ? " --directml --disable-in-browser" : " --disable-in-browser")

    // windows AMD => directml
    let windowsAMD = (kernel.platform === "win32" && kernel.gpu === "amd")
    let directml = (windowsAMD ? "--directml " : "")
    console.log({ windowsAMD, directml })

    let accelerated

    if (kernel.platform === "darwin") {
      accelerated = kernel.arch === "arm64" // m1/m2/m3
    } else {
      accelerated = ["nvidia", "amd"].includes(kernel.gpu)  // gpu is amd/nvidia
    }

    let alwaysCPU = (accelerated ? "" : "--always-cpu ")

    let installing = kernel.running(__dirname, "install.json")
    let installed = await kernel.exists(__dirname, "app", "env")
    if (installing) {
      return [{ icon: "fa-solid fa-plug", text: "Installing...", href: "install.json" }]
    } else if (installed) {
      let running = kernel.running(__dirname, "start.json")
      if (running) {
        let memory = kernel.memory.local[path.resolve(__dirname, "start.json")]
        if (memory && memory.url) {
          return [
            { icon: "fa-solid fa-rocket", text: "Web UI", href: memory.url },
            { icon: "fa-solid fa-terminal", text: "Terminal", href: "start.json" },
            { icon: "fa-solid fa-rotate", text: "Update", href: "update.json" },
          ]
        } else {
          return [
            { icon: "fa-solid fa-terminal", text: "Terminal", href: "start.json" },
            { icon: "fa-solid fa-rotate", text: "Update", href: "update.json" },
          ]
        }
      } else {
        return [{
          icon: "fa-solid fa-power-off",
          text: "Start",
          menu: [
            { icon: "fa-solid fa-terminal", text: "Default Mode", href: "start.json", params: { flags: `${alwaysCPU}${directml}--preset default${extraFlags}` } },
            { icon: "fa-solid fa-terminal", text: "Anime Mode", href: "start.json", params: { flags: `${alwaysCPU}${directml}--preset anime${extraFlags}` } },
            { icon: "fa-solid fa-terminal", text: "Realistic Mode", href: "start.json", params: { flags: `${alwaysCPU}${directml}--preset realistic${extraFlags}` } },
            { icon: "fa-solid fa-terminal", text: "SAI Mode", href: "start.json", params: { flags: `${alwaysCPU}${directml}--preset sai${extraFlags}` } },
            { icon: "fa-solid fa-terminal", text: "LCM Mode", href: "start.json", params: { flags: `${alwaysCPU}${directml}--preset lcm${extraFlags}` } },
          ]
        }, {
          icon: "fa-solid fa-rotate", text: "Update", href: "update.json"
        }, {
          icon: "fa-solid fa-plug", text: "Reinstall", href: "install.json"
       }, {
          icon: "fa-solid fa-circle-xmark", text: "Reset", href: "reset.json", confirm: "Are you sure you wish to reset the app?"
        }]
      }
    } else {
      return [
        { icon: "fa-solid fa-plug", text: "Install", href: "install.json" },
        { icon: "fa-solid fa-rotate", text: "Update", href: "update.json" }
      ]
    }
  }
}
