document.addEventListener('DOMContentLoaded', function(event) {
  swipe.bind(document.getElementById('container'))
  swipe.setSizes()
})

var swipe = {
  touchStartPos: 0,
  lastYPos: 0,
  moveX: 0,
  index: 0,
  slideNumber: 0,
  slideWidth: 0,
  containerEl: null,
  headerEl: null,
  contentEl: null,
  lock: null,
  longTouch: false,

  // in react or probably anything else, you would just bind
  // all these events using JSX, rather than this function
  bind: function(elem) {
    swipe.containerEl = elem
    swipe.headerEl =  elem.querySelector('.swipe-header')
    swipe.contentEl = elem.querySelector('.swipe-content')

    swipe.contentEl.addEventListener('touchstart', swipe.contentTouchStart)
    swipe.contentEl.addEventListener('touchmove', swipe.contentTouchMove)
    swipe.contentEl.addEventListener('touchend', swipe.contentTouchEnd)
    swipe.contentEl.addEventListener('touchcancel', swipe.contentTouchEnd)

    window.addEventListener('resize', swipe.setSizes)
  },
  setSizes: function() {
    swipe.slideNumber = swipe.contentEl.children.length -1
    swipe.slideWidth = swipe.contentEl.children[0].offsetWidth
  },
  contentTouchStart: function(event) {
    // This is a hack to detect flicks  
    swipe.longTouch = false
    setTimeout(function() {
      swipe.longTouch = true
    }, 250)
    swipe.touchStartPos = event.touches[0].pageX
    swipe.lastYPos = event.touches[0].pageY
    swipe.contentEl.className = swipe.contentEl.className.replace(' swipe-animate', '')
  },
  contentTouchMove: function(event) {
    swipe.moveX = swipe.index * swipe.slideWidth + (swipe.touchStartPos - event.touches[0].pageX)
    if (swipe.lock === null) {
      var thresh = 7
      if (swipe.lastYPos > event.touches[0].pageY + thresh || swipe.lastYPos < event.touches[0].pageY - thresh) {
        swipe.lock = 'y'
      } else {
        swipe.lock = 'x'
      }
    }
    if (swipe.lock === 'x') {
      event.preventDefault()
      if (swipe.moveX < 0 || swipe.moveX > swipe.slideWidth * swipe.slideNumber) {
        return  
      }
      swipe.contentEl.setAttribute('style', 'transform: translate3d(-'+swipe.moveX+'px,0,0)')
    }
  },
  contentTouchEnd: function(event) {
    if (swipe.lock === 'y') {
      swipe.lock = null
      return
    }
    var absMove = Math.abs(swipe.index * swipe.slideWidth - swipe.moveX)
    if (absMove > swipe.slideWidth/2 || swipe.longTouch === false) {
      if (swipe.moveX > swipe.index * swipe.slideWidth && swipe.index < swipe.slideNumber) {
        swipe.index++
      } else if (swipe.moveX < swipe.index * swipe.slideWidth && swipe.index > 0) {
        swipe.index--
      }
    }
    swipe.contentEl.className = swipe.contentEl.className + ' swipe-animate'
    swipe.contentEl.setAttribute('style', 'transform: translate3d(-'+swipe.index*swipe.slideWidth+'px,0,0)')
    swipe.lock = null
  }
}
