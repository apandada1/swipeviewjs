var swipe = {
  touchStartPos: 0,
  lastXPos: 0,
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

    swipe.headerEl.children[0].children[swipe.index].className += ' active'

    for (var i=0; i<swipe.headerEl.children[0].children.length; i++) {
      swipe.headerEl.children[0].children[i].addEventListener('touchstart', swipe.navigate(i))
    }

    window.addEventListener('resize', swipe.setSizes)
  },
  setSizes: function() {
    // don't do anything if person is in the middle of a swipe
    // it's get jerky and yuck
    if (swipe.lock === null) {
      swipe.slideNumber = swipe.contentEl.children.length -1
      swipe.slideWidth = swipe.contentEl.children[0].offsetWidth
      swipe.contentEl.setAttribute('style', 'transform: translate3d(-'+swipe.index*swipe.slideWidth+'px,0,0)')
      var swipeBar = swipe.headerEl.querySelector('.swipe-bar')
      swipeBar.setAttribute('style', 'width:' + swipe.headerEl.children[0].children[0].offsetWidth + 'px;transform:translate3d('+swipe.index*swipe.headerEl.children[0].children[0].offsetWidth + 'px,0,0)')
    }
  },
  navigate: function(pane) {
    return function() {
      // remove old classes
      swipe.headerEl.children[0].children[swipe.index].className = swipe.headerEl.children[0].children[swipe.index].className.replace(' active', '')
      var swipeBar = swipe.headerEl.querySelector('.swipe-bar')
      swipeBar.className = swipeBar.className.replace(' swipe-animate', '')
      swipe.contentEl.className = swipe.contentEl.className.replace(' swipe-animate', '')

      swipe.index = pane

      // animate everything
      swipe.contentEl.className = swipe.contentEl.className + ' swipe-animate'
      swipe.contentEl.setAttribute('style', 'transform: translate3d(-'+swipe.index*swipe.slideWidth+'px,0,0)')
      swipe.headerEl.children[0].children[swipe.index].className += ' active'
      swipeBar.className = swipeBar.className + ' swipe-animate'
      swipeBar.setAttribute('style', 'width:' + swipe.headerEl.children[0].children[0].offsetWidth + 'px;transform:translate('+swipe.index*swipe.headerEl.children[0].children[0].offsetWidth + 'px)')
    }
  },
  contentTouchStart: function(event) {
    // This is a hack to detect flicks  
    swipe.longTouch = false
    setTimeout(function() {
      swipe.longTouch = true
    }, 250)
    swipe.touchStartPos = event.touches[0].pageX
    swipe.lastXPos = event.touches[0].pageX
    swipe.lastYPos = event.touches[0].pageY
    swipe.contentEl.className = swipe.contentEl.className.replace(' swipe-animate', '')
    var swipeBar = swipe.headerEl.querySelector('.swipe-bar')
    swipeBar.className = swipeBar.className.replace(' swipe-animate', '')
  },
  contentTouchMove: function(event) {
    swipe.lastXPos = event.touches[0].pageX
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
      var slideWidth = swipe.index*swipe.headerEl.children[0].children[0].offsetWidth + (((swipe.touchStartPos - event.touches[0].pageX)/swipe.slideWidth)*swipe.headerEl.children[0].children[0].offsetWidth)
      swipe.headerEl
        .querySelector('.swipe-bar')
        .setAttribute('style', 'width:' + swipe.headerEl.children[0].children[0].offsetWidth + 'px;transform:translate('+ slideWidth + 'px)')
    }
  },
  contentTouchEnd: function(event) {
    if (swipe.lock === 'y') {
      swipe.lock = null
      return
    }
    swipe.headerEl.children[0].children[swipe.index].className = swipe.headerEl.children[0].children[swipe.index].className.replace(' active', '')
    var absMove = Math.abs(swipe.index * swipe.slideWidth - swipe.moveX)
    if (absMove > swipe.slideWidth/2 || swipe.longTouch === false) {
      // rejects touches that don't really move
      if (Math.abs(swipe.touchStartPos - swipe.lastXPos) > 3) {
        // determines which way the swipe was
        if (swipe.moveX > swipe.index * swipe.slideWidth && swipe.index < swipe.slideNumber) {
          swipe.index++
        } else if (swipe.moveX < swipe.index * swipe.slideWidth && swipe.index > 0) {
          swipe.index--
        }
      }
    }
    swipe.contentEl.className = swipe.contentEl.className + ' swipe-animate'
    swipe.contentEl.setAttribute('style', 'transform: translate3d(-'+swipe.index*swipe.slideWidth+'px,0,0)')
    swipe.lock = null
    swipe.headerEl.children[0].children[swipe.index].className += ' active'
    var swipeBar = swipe.headerEl.querySelector('.swipe-bar')
    swipeBar.className = swipeBar.className + ' swipe-animate'
    swipeBar.setAttribute('style', 'width:' + swipe.headerEl.children[0].children[0].offsetWidth + 'px;transform:translate3d('+swipe.index*swipe.headerEl.children[0].children[0].offsetWidth + 'px,0,0)')
  }
}
if (typeof exports !== 'undefined') {
  if (typeof module !== 'undefined' && module.exports) {
    exports = module.exports = swipe;
  }
  exports.swipe = swipe;
} else {
  window.swipe = swipe;
}