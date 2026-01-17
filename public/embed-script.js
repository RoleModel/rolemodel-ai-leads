;(function () {
  'use strict'

  console.log('[RoleModel Embed] Script loaded')

  // Configuration with fallbacks
  var config = {
    chatbotId: 'a0000000-0000-0000-0000-000000000001',
    containerId: 'rolemodel-ai-widget',
    buttonColor: '#000000',
    primaryColor: '#007BFF',
    baseUrl: 'https://rolemodel-ai-leads.vercel.app',
  }

  // Try to get script element using multiple methods
  var currentScript = null

  try {
    currentScript = document.currentScript
  } catch (e) {}

  if (!currentScript) {
    try {
      var scripts = document.getElementsByTagName('script')
      for (var i = scripts.length - 1; i >= 0; i--) {
        if (scripts[i].src && scripts[i].src.indexOf('embed-script') !== -1) {
          currentScript = scripts[i]
          break
        }
      }
    } catch (e) {}
  }

  if (!currentScript) {
    try {
      currentScript = document.querySelector('script[data-chatbot-id]')
    } catch (e) {}
  }

  // Extract config from script attributes
  if (currentScript) {
    if (currentScript.getAttribute('data-chatbot-id')) {
      config.chatbotId = currentScript.getAttribute('data-chatbot-id')
    }
    if (currentScript.getAttribute('data-container-id')) {
      config.containerId = currentScript.getAttribute('data-container-id')
    }
    if (currentScript.src) {
      try {
        var url = new URL(currentScript.src)
        config.baseUrl = url.origin
      } catch (e) {}
    }
  }

  // Override with window globals
  if (window.ROLEMODEL_CHATBOT_ID) config.chatbotId = window.ROLEMODEL_CHATBOT_ID
  if (window.ROLEMODEL_CONTAINER_ID) config.containerId = window.ROLEMODEL_CONTAINER_ID
  if (window.ROLEMODEL_BASE_URL) config.baseUrl = window.ROLEMODEL_BASE_URL

  var containerId = config.containerId
  var buttonColor = config.buttonColor
  var primaryColor = config.primaryColor
  var WIDGET_URL = config.baseUrl + '/widget/' + config.chatbotId

  // Fetch widget configuration from API
  function fetchWidgetConfig(callback) {
    var xhr = new XMLHttpRequest()
    xhr.open(
      'GET',
      config.baseUrl + '/api/widget-config?chatbotId=' + config.chatbotId,
      true
    )
    xhr.onreadystatechange = function () {
      if (xhr.readyState === 4) {
        if (xhr.status === 200) {
          try {
            var response = JSON.parse(xhr.responseText)
            if (response.config) {
              if (response.config.buttonColor) {
                buttonColor = response.config.buttonColor
              }
              if (response.config.primaryColor) {
                primaryColor = response.config.primaryColor
              }
              console.log(
                '[RoleModel Embed] Using admin colors:',
                buttonColor,
                primaryColor
              )
            }
          } catch (e) {
            console.log('[RoleModel Embed] Could not parse config response')
          }
        }
        callback()
      }
    }
    xhr.send()
  }

  // Inject styles dynamically with fetched colors
  function injectStyles() {
    var styleId = containerId + '-styles'
    if (document.getElementById(styleId)) return

    var css =
      '#' +
      containerId +
      ' {' +
      'position: fixed !important;' +
      'bottom: 90px !important;' +
      'right: 20px !important;' +
      'width: 400px !important;' +
      'height: 600px !important;' +
      'border: none !important;' +
      'border-radius: 12px !important;' +
      'box-shadow: 0 8px 24px rgba(0,0,0,0.15) !important;' +
      'overflow: hidden !important;' +
      'z-index: 2147483646 !important;' +
      'background: white !important;' +
      'transition: opacity 0.2s, transform 0.2s, width 0s, height 0s !important;' +
      '}' +
      '#' +
      containerId +
      '.hidden {' +
      'opacity: 0 !important;' +
      'visibility: hidden !important;' +
      'width: 0 !important;' +
      'height: 0 !important;' +
      'transform: scale(0.95) !important;' +
      'pointer-events: none !important;' +
      'transition: opacity 0.2s, transform 0.2s, width 0s 0.2s, height 0s 0.2s !important;' +
      '}' +
      '#' +
      containerId +
      '-iframe {' +
      'width: 100% !important;' +
      'height: 100% !important;' +
      'border: none !important;' +
      '}' +
      '#' +
      containerId +
      '-toggle {' +
      'position: fixed !important;' +
      'bottom: 20px !important;' +
      'right: 20px !important;' +
      'width: 56px !important;' +
      'height: 56px !important;' +
      'border-radius: 50% !important;' +
      'background-color: ' +
      buttonColor +
      ' !important;' +
      'box-shadow: 0 4px 12px rgba(0,0,0,0.15) !important;' +
      'border: none !important;' +
      'cursor: pointer !important;' +
      'display: flex !important;' +
      'align-items: center !important;' +
      'justify-content: center !important;' +
      'color: white !important;' +
      'z-index: 2147483647 !important;' +
      'transition: transform 0.2s !important;' +
      '}' +
      '#' +
      containerId +
      '-toggle:hover {' +
      'transform: scale(1.05) !important;' +
      '}' +
      '#' +
      containerId +
      '-toggle svg {' +
      'width: 24px !important;' +
      'height: 24px !important;' +
      '}' +
      '@media (max-width: 768px) {' +
      '#' +
      containerId +
      ' {' +
      'width: 100% !important;' +
      'height: calc(100% - 80px) !important;' +
      'bottom: 80px !important;' +
      'right: 0 !important;' +
      'border-radius: 0 !important;' +
      '}' +
      '}'

    var style = document.createElement('style')
    style.id = styleId
    style.type = 'text/css'
    if (style.styleSheet) {
      style.styleSheet.cssText = css
    } else {
      style.appendChild(document.createTextNode(css))
    }

    var head = document.head || document.getElementsByTagName('head')[0]
    if (head) {
      head.appendChild(style)
    }
  }

  // SVG icons
  var chatIcon =
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>'
  var closeIcon =
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>'

  var isOpen = false

  // Create widget container
  function createWidget() {
    // Check if container already exists
    if (document.getElementById(containerId)) {
      console.log('[RoleModel Embed] Widget already exists')
      return
    }

    // Create container
    var container = document.createElement('div')
    container.id = containerId
    container.classList.add('hidden')

    // Create iframe
    var iframe = document.createElement('iframe')
    iframe.id = containerId + '-iframe'
    iframe.src = WIDGET_URL
    iframe.setAttribute('allow', 'microphone')
    iframe.setAttribute('loading', 'lazy')

    container.appendChild(iframe)
    document.body.appendChild(container)

    // Listen for close message from iframe
    window.addEventListener('message', function (event) {
      if (event.origin !== config.baseUrl) return
      if (event.data && event.data.type === 'WIDGET_CLOSE') {
        window.RoleModelAIWidget.hide()
      }
    })

    // Create toggle button
    var toggleBtn = document.createElement('button')
    toggleBtn.id = containerId + '-toggle'
    toggleBtn.setAttribute('type', 'button')
    toggleBtn.innerHTML = chatIcon
    toggleBtn.onclick = function () {
      isOpen = !isOpen
      if (isOpen) {
        container.classList.remove('hidden')
        toggleBtn.innerHTML = closeIcon
      } else {
        container.classList.add('hidden')
        toggleBtn.innerHTML = chatIcon
      }
    }
    document.body.appendChild(toggleBtn)

    console.log('[RoleModel Embed] Widget initialized')
  }

  // Initialize
  function init() {
    fetchWidgetConfig(function () {
      injectStyles()

      if (document.body) {
        createWidget()
      } else if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', createWidget)
      } else {
        var attempts = 0
        var checkBody = setInterval(function () {
          attempts++
          if (document.body) {
            clearInterval(checkBody)
            createWidget()
          } else if (attempts > 100) {
            clearInterval(checkBody)
            console.error('[RoleModel Embed] Could not find document.body')
          }
        }, 50)
      }
    })
  }

  init()

  // Export API for controlling the widget
  window.RoleModelAIWidget = {
    show: function () {
      var container = document.getElementById(containerId)
      var toggleBtn = document.getElementById(containerId + '-toggle')
      if (container) {
        container.classList.remove('hidden')
        isOpen = true
        if (toggleBtn) toggleBtn.innerHTML = closeIcon
      }
    },
    hide: function () {
      var container = document.getElementById(containerId)
      var toggleBtn = document.getElementById(containerId + '-toggle')
      if (container) {
        container.classList.add('hidden')
        isOpen = false
        if (toggleBtn) toggleBtn.innerHTML = chatIcon
      }
    },
    toggle: function () {
      if (isOpen) {
        this.hide()
      } else {
        this.show()
      }
    },
  }
})()
