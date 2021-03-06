/**
 * Created by Yasin Radi <yasin.ben.hamman@gmail.com>
 */
'use strict'

const { Menu, dialog } = require('electron').remote
const FileHandler = require('./fileHandler')
const fh = new FileHandler()

/**
 * Create menu from template in object[] shape
 */
const menu = Menu.buildFromTemplate([
  {
    label: 'File',
    submenu: [
      {
        label: 'Open non translation file...',
        accelerator: process.platform === 'darwin' ? 'Command+T' : 'Ctrl+T',
        click: () => {
          fh.setOpeningFunction('non_tra')
        }
      },
      {
        label: 'Open replace translation file...',
        accelerator: process.platform === 'darwin' ? 'Command+R' : 'Ctrl+R',
        click: () => {
          fh.setOpeningFunction('post_proc')
        }
      },
      {
        type: 'separator'
      },
      {
        label: 'Reload',
        accelerator: process.platform === 'darwin' ? 'Command+D' : 'Ctrl+D',
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

// Application menu setting
Menu.setApplicationMenu(menu)

class MainMenu {}

module.exports = MainMenu