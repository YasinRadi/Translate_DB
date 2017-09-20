'use strict'

const { Menu, dialog } = require('electron').remote
const FileHandler = require('./fileHandler')
const fh = new FileHandler()

const menu = Menu.buildFromTemplate([
  {
    label: 'File',
    submenu: [
      {
        label: 'Open Non translations file...',
        click: () => {
          fh.setOpeningFunction('non_tra')
        }
      },
      {
        label: 'Open Replace translations file...',
        click: () => {
          fh.setOpeningFunction('post_proc')
        }
      },
      {
        type: 'separator'
      },
      {
        label: 'Reload',
        accelerator: process.platform === 'darwin' ? 'Command+R' : 'Ctrl+R',
        role: 'reload'
      },
      {
        label: 'Exit',
        accelerator: process.platform === 'darwin' ? 'Command+Q' : 'Ctrl+Q',
        role: 'close'
      }
    ]
  },
  {
    label: 'Edit',
    submenu: [
      {
        role: 'undo'
      },
      {
        role: 'redo'
      },
      {
        type: 'separator'
      },
      {
        role: 'cut'
      },
      {
        role: 'copy'
      },
      {
        role: 'paste'
      },
      {
        role: 'pasteandmatchstyle'
      },
      {
        role: 'delete'
      },
      {
        role: 'selectall'
      }
    ]
  },
  {
    label: 'View',
    submenu: [
      {
        label: 'Toggle Developer Tools',
        accelerator: process.platform === 'darwin' ? 'Alt+Command+I' : 'Ctrl+Shift+I',
        click(item, focusedWindow) {
          if (focusedWindow) focusedWindow.webContents.toggleDevTools()
        }
      },
      {
        type: 'separator'
      },
      {
        role: 'resetzoom'
      },
      {
        role: 'zoomin'
      },
      {
        role: 'zoomout'
      },
      {
        type: 'separator'
      },
      {
        role: 'togglefullscreen'
      }
    ]
  }
])

Menu.setApplicationMenu(menu)

class MainMenu {}

module.exports = MainMenu