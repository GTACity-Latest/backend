const CONFIG = {
  ERROR: '!{red}[Hata]{white} ',
  red: '!{red}',
  chatProx: 20,
  adminProx: 55,
  exitProx: 40,
  doProx: 20,
  meProx: 20,
  ameTime: 9000, // Miliseconds
  oocProx: 30,
  whisperProx: 2,
  cashProx: 2,
  shoutProx: 40,
  orange: '!{#FFB14E}',
  LSPD: '!{#ff8447}',
  staffr: '!{#ff5454}',
  staffB: '!{#00C1FF}',
  server: '!{#dc143c}GTACity:{white} ',
  green: '!{#78cc78}',
  blue: '!{#6dbce6}',
  grey: '!{#00000}',
  faction: '!{#ffbf47}',
  vip: '!{#FFD700}[Vip]!{white} ',
  credits: '!{#FFD700}[Credits]!{white} ',
  noauth: 'Bu komutu kullanmaya yetkin yetmiyor!',
  lbue: '!{#00C1FF}',
  ac: '!{#de3333}[CityAC]!{white} ',
  me: '!{#dc7dff}',
  longdo: '!{#A781FF}', // #b1a1ff
  staff: '!{#b1a1ff}Personel{white}{#ff5454} ',
  staffChat: '!{#b1a1ff}[Personel Sohbeti]{white} ',
  ppink: '!{#b1a1ff}',
  pmrp: '!{#ca75ff}[GTACity Roleplay]{#ffffff} ',
  report: '!{#00C1FF}[Şikayet Sistemi]{white} ',
  gold: '!{#FFD700}',
  lpink: '!{#dc143c}',
  info: '!{#c7ff5e}[Bilgi]{white} ',
  question: '!{#6dbce6}[Soru Sistemi]{white} ',
  consoleWhite: '\x1b[0m',
  consoleRed: '\x1b[38;5;9m',
  consoleYellow: '\x1b[33m',
  consoleGreen: '\x1b[32m',
  consoleYellow: '\x1b[33m',
  consoleBlue: '\x1b[34m',
  consolePurple: '\x1b[38;5;105m',
  consoleTurq: '\x1b[38;5;45m',
  consoleMagenta: '\u001b[35;1m',
  consoleSeq: '\x1b[38;5;14m'
}

mp.chat = {

  sendMsg: (player, message) => {
    player.call('chat:Msg', [`${message}`])
  },

  staffMsg: (player, msg) => {
    player.outputChatBox(`!{#dc143c}[Personel]{white} ${msg}`)
  },

  server: (player, msg) => {
    player.outputChatBox(`!{#dc143c}[Sunucu]{white} ${msg}`)
  },

  aPush: (player, msg) => {
    player.outputChatBox(`!{#dc143c}[Personel] ${msg}`)
  },

  err: (player, msg) => {
    player.call('requestBrowser', ['gui.notify.clearAll();']);
    player.call('requestBrowser', [`gui.notify.showNotification("${msg}", 5700)`]);
  },

  info: (player, msg) => {
    player.outputChatBox(`!{#dc143c}[Bilgi] ${msg}`)
  },

  ac: (player, msg) => {
    player.outputChatBox(`!{#dc143c}[Hile Koruması]{white} ${msg}`)
  },

  question: (player, msg) => {
    player.outputChatBox(`!{#dc143c}[Soru]{white} ${msg}`)
  },

  quit: (player, msg) => {
    player.outputChatBox(`!{#dc143c}[Çıkış]{white} ${msg}`)
  },

  success: (player, msg) => {
    player.call('requestBrowser', [`gui.notify.success("${msg}", 6500)`]);
  },

  report: (player, msg) => {
    player.outputChatBox(`!{#dc143c}[Şikayet]!{white} ${msg}`)
  },

  pmgrey: (player, msg) => {
    player.outputChatBox(`!{grey}[PM] ${msg}`)
  },

  pmgreen: (player, msg) => {
    player.outputChatBox(`!{#dc143c}[PM] ${msg}`)
  }

}

exports.CONFIG = CONFIG;
